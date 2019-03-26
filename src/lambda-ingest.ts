import {APIGatewayProxyEvent, Callback, Context, Handler, S3Event} from "aws-lambda";
import {DynamoDB, S3} from "aws-sdk";

import {Ingest} from "./Lambda/Ingest";

const s3 = new S3({apiVersion: "2006-03-01"});

const db = new DynamoDB();

const errorBucket = process.env.failedPayloadsBucketName as string;

const ingest = new Ingest(s3, db, errorBucket);

const onS3Put: Handler = (event: S3Event, context: Context, callback: Callback) => {
    ingest.onS3Put(event, context, callback);
};

const onHttpPost: Handler = (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    ingest.onHttpPost(event, context, callback);
};

export {onS3Put, onHttpPost};
