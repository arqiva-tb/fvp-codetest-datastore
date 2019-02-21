import {Callback, Context, Handler, S3Event} from "aws-lambda";
import {DynamoDB, S3} from "aws-sdk";

import {Application} from "./Lambda/Application";

const s3 = new S3();
const db = new DynamoDB({endpoint: "http://localhost:8000"});

/**
 * Initialise the application with the above local DyanamoDB connection.
 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html
 */
const application = new Application(s3, db);

const onS3Put: Handler = async (event: S3Event, context: Context, callback: Callback) => {

};

export {onS3Put};
