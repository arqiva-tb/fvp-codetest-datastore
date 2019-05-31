import { DynamoDBDatastore } from './Datastore/Datastore';
import {APIGatewayProxyEvent, Callback, Context, Handler} from "aws-lambda";
import {DynamoDB} from "aws-sdk";

import {Api} from "./Lambda/Api";

const dataStore = new DynamoDBDatastore(new DynamoDB());
const api = new Api(dataStore);

export const onHttpGetSchedules: Handler = (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    api.onHttpGetSchedules(event, context, callback);
};
