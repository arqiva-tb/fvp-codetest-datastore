import AWS from "aws-sdk";
import {Callback, Context, S3Event} from "aws-lambda";

export class Application {
    private s3: AWS.S3;
    private db: AWS.DynamoDB;

    constructor(s3: AWS.S3, db: AWS.DynamoDB) {
        this.s3 = s3;
        this.db = db;
    }

    /**
     * A Application that responds to object put events on an S3 bucket
     *
     * @param event
     * @param context
     * @param callback
     */
    public onS3Put(event: S3Event, context: Context, callback: Callback): void {
        console.debug("Received event", JSON.stringify(event, null, 2));

    }
}
