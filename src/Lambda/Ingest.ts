import AWS from "aws-sdk";
import {APIGatewayProxyEvent, APIGatewayProxyResult, Callback, Context, S3Event} from "aws-lambda";

import {DynamoDBDatastore} from "../Datastore/Datastore";
import {Ingester} from "../Ingester/Ingester";
import {IFile, TvaDocumentParser} from "../Parser/Parser";
import {S3File} from "./S3File";
import {File} from "./File";
import {BroadcastEventParser} from "../Parser/BroadcastEventParser";
import {OndemandProgramParser} from "../Parser/OndemandProgramParser";
import {BrandParser} from "../Parser/BrandParser";
import {SeriesParser} from "../Parser/SeriesParser";
import {UuidGenerator} from "../Uuid/UuidGenerator";

export class Ingest {
    private s3: AWS.S3;
    private datastore: DynamoDBDatastore;
    private parser: TvaDocumentParser;
    private ingester: Ingester;
    private errorBucket: string;
    private uuidGenerator: UuidGenerator;

    constructor(s3: AWS.S3, db: AWS.DynamoDB, errorBucket: string) {
        this.s3 = s3;
        this.datastore = new DynamoDBDatastore(db);
        this.parser = new TvaDocumentParser([
            new BroadcastEventParser(),
            new OndemandProgramParser(),
            new BrandParser(),
            new SeriesParser(),
        ]);
        this.ingester = new Ingester(this.parser, this.datastore);
        this.errorBucket = errorBucket;
        this.uuidGenerator = new UuidGenerator();
    }

    /**
     * A Application that responds to object put events on an S3 bucket
     *
     * @param event
     * @param context
     * @param callback
     */
    public onS3Put(event: S3Event, context: Context, callback: Callback): void {
        const location = {
            Bucket: event.Records[0].s3.bucket.name,
            Key: event.Records[0].s3.object.key,
        };
        const request = this.s3.getObject(location, (getObjectError: any, data: any) => {
            if (getObjectError) {
                console.error("Could not retrieve object", location, getObjectError);
                callback(undefined, {
                    statusCode: 500,
                    body: {
                        e: getObjectError,
                        message: "onS3Put() failed. GetObject failed.",
                    },
                });

                return;
            }

            // TODO: Move this method to a factory
            S3File.fromGetObjectResponse(data)
                .then((file) => this.ingester.ingest(file))
                .then((records) => {
                    callback(undefined, {
                        statusCode: 200,
                        body: {
                            persisted: records,
                        },
                    });
                })
                .catch((ingestError) => {
                    console.error(`Handler. Error. Returning HTTP 500.`, ingestError);
                    callback(undefined, {
                        statusCode: 500,
                        body: {
                            e: ingestError,
                            message: "onS3Put() failed. Ingest failed.",
                        },
                    });
                });
        });
        request.send();
    }

    public onHttpPost(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {
        // TODO: I think the return type of the API gateway lambdas needs to change.
        // see https://stackoverflow.com/questions/53976371

        if (event.httpMethod !== "POST" && event.httpMethod !== "PUT") {
            callback(undefined, this.getIngestStatusResponse("failed", undefined, 400));

            return;
        }

        if (!event.body || event.body.length === 0) {
            callback(undefined, this.getIngestStatusResponse("failed", undefined, 400));

            return;
        }

        let originalKey = "";
        if (event.httpMethod === "PUT" && event.pathParameters) {
            originalKey = event.pathParameters.guid || "";
        }

        const payload: File = new File(event.body || "");
        this.ingester
            .ingest(payload)
            .then((records) => {
                callback(undefined, this.getIngestStatusResponse("committed"));
            })
            .catch((ingestError) => {
                console.error(`Error processing event. Returning HTTP 500.`, event, ingestError);
                this.copyFileToFailedBucket(payload, this.parseUserName(event), originalKey);

                callback(undefined, this.getIngestErrorResponse(ingestError));
            });

        return;
    }

    private getIngestStatusResponse(state: string, transactionId?: string, statusCode = 200): APIGatewayProxyResult {
        transactionId = transactionId || (new Date()).getTime().toString();

        /* tslint:disable:max-line-length */
        return {
            statusCode,
            headers: {
                "Content-Type": "application/xml",
            },
            body: `<?xml version="1.0" encoding="UTF-8"?>
<StatusReport xmlns="http://refdata.freeview.co.uk/schemas/StatusReport/2014-07-15" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <TransactionReport transactionId="https://example.com/api/transaction/${transactionId}" state="${state}"></TransactionReport>
</StatusReport>`,
        };
        /* tslint:enable:max-line-length */
    }

    private getIngestErrorResponse(error: Error): APIGatewayProxyResult {
        const transactionId = (new Date()).getTime().toString();

        /* tslint:disable:max-line-length */
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/xml",
            },
            body: `<?xml version="1.0" encoding="UTF-8"?>
<StatusReport xmlns="http://refdata.freeview.co.uk/schemas/StatusReport/2014-07-15" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <TransactionReport transactionId="https://example.com/api/transaction/${transactionId}" state="failed"></TransactionReport>
    <Errors>
    <![CDATA[
${JSON.stringify(error, null, 2)}
    ]]>
    </Errors>
    <Stack>
    <![CDATA[
${JSON.stringify(error.stack, null, 2)}
    ]]>
    </Stack>
</StatusReport>`,
        };
        /* tslint:enable:max-line-length */
    }

    private copyFileToFailedBucket(file: IFile, userName: string, originalKey: string) {
        const failedFilename = this.getFailedFilename(userName, originalKey);
        const params = {
            Bucket: this.errorBucket,
            Key: failedFilename,
            Body: file.getContent(),
        };
        this.s3.putObject(params, (error: any, data: any) => {
            if (error) {
                console.error(`Failed moving failed payload to error bucket: ${error.message}`);
            } else {
                console.log(`Moved failed payload to error bucket as ${failedFilename}`);
            }
        });
    }

    private getFailedFilename(userName: string, originalKey: string) {
        const date = new Date().toISOString().split("T")[0];
        let fileName =  Math.floor(Date.now() / 1000) + "_";
        fileName += (originalKey.length > 0) ? originalKey : this.uuidGenerator.generateUUID();
        fileName += ".xml";

        return `${date}/${userName}/${fileName}`;
    }

    private parseUserName(event: APIGatewayProxyEvent) {
        const authCredentials = Buffer.from(event.headers.Authorization.replace("Basic ", ""), "base64").toString();

        return authCredentials.split(":")[0];
    }
}
