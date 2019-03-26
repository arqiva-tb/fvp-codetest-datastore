import {APIGatewayProxyEvent, Callback, Context, Handler} from "aws-lambda";
import {DynamoDB} from "aws-sdk";

import {Api} from "./Lambda/Api";

const db = new DynamoDB();

const api = new Api(db);

export const onHttpGetSchedules: Handler = (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    api.onHttpGetSchedules(event, context, callback);
};
