import AWS from "aws-sdk";
import {APIGatewayProxyEvent, Callback, Context} from "aws-lambda";

import {DynamoDBDatastore} from "../Datastore/Datastore";

export class Api {
    private datastore: DynamoDBDatastore;

    constructor(db: AWS.DynamoDB) {
        this.datastore = new DynamoDBDatastore(db);
    }

    public onHttpGetSchedules(event: APIGatewayProxyEvent, context: Context, callback: Callback): void {

        // TODO

        callback(undefined, {
            statusCode: 200,
            headers: {"Content-Type": "application/json"},
            body: "TODO",
        });
    }
}
