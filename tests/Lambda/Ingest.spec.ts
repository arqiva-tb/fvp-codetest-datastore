
import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";

import {BatchWriteItemOutput} from "aws-sdk/clients/dynamodb";
import {GetObjectOutput} from "aws-sdk/clients/s3";
import {APIGatewayEvent, Callback, Context, S3Event} from "aws-lambda";

import {expect} from "chai";
import fs from "fs";

import {Ingest} from "../../src/Lambda/Ingest";

AWSMock.setSDKInstance(AWS);

function createMockS3Event(input: string, output: string): S3Event {
    const event: S3Event = JSON.parse(fs.readFileSync(input).toString());

    AWSMock.mock("S3", "getObject",  (params: any, cb: any) => {
        const data = Buffer.from(fs.readFileSync(output));
        cb(null, {Body: data} as GetObjectOutput);
    });

    return event;
}

/**
 * See tests/Resources/... for test examples.
 */
const mockEvent = "tests/Resources/Application/s3event.json";
const examples = [
    {input: "programs/1/input.xml", output: "programs/1/output.json"},
    {input: "programs/2/input.xml", output: "programs/2/output.json"},
    {input: "programs/3/input.xml", output: "programs/3/output.json"},
    {input: "programs/4/input.xml", output: "programs/4/output.json"},
];

describe(`handler.onS3Put fetches a payload and persists the correct entities`, () => {
    examples.forEach((example) => {
        const input = `tests/Resources/${example.input}`;
        const expected = JSON.parse(fs.readFileSync(`tests/Resources/${example.output}`).toString());

        it(`(${example.input} -> ${example.output})`, (done) => {
            const event = createMockS3Event(mockEvent, input);

            AWSMock.mock("DynamoDB", "batchWriteItem", (params: any, cb: any) => {
                const resp: BatchWriteItemOutput = {UnprocessedItems: {}};
                cb(null, resp);
            });

            const s3Mock = new AWS.S3();
            const dbMock = new AWS.DynamoDB();
            const sut = new Ingest(s3Mock, dbMock, "fvp-failed-payloads");

            const entityAssertions: Callback = (err, response): any => {
                expect(response.statusCode).to.equal(200);

                const persisted = response.body.persisted;
                expect(persisted).to.deep.equal(expected.persisted);

                AWSMock.restore("S3");
                AWSMock.restore("DynamoDB");

                done();
            };

            sut.onS3Put(event, {} as Context, entityAssertions);
        });
    });

    it("should save the payload to the error bucket if it fails to ingest", (done) => {
        const event = JSON.parse(
            Buffer.from(fs.readFileSync("tests/Resources/http_post_event.json")).toString(),
        ) as APIGatewayEvent;

        AWSMock.mock("DynamoDB", "batchWriteItem", (params: any, cb: any) => {
            cb({name: "Failed", message: "Failed to write batch"}, null);
        });

        AWSMock.mock("S3", "putObject", (params: any, cb: any) => {
            cb(null, {});
        });

        const s3Mock = new AWS.S3();
        const dbMock = new AWS.DynamoDB();
        const sut = new Ingest(s3Mock, dbMock, "fvp-failed-payloads");

        const entityAssertions: Callback = (err, response): any => {
            expect(response.statusCode).to.equal(500);
            AWSMock.restore("S3");
            AWSMock.restore("DynamoDB");

            done();
        };
        sut.onHttpPost(event, {} as Context, entityAssertions);
    });
});
