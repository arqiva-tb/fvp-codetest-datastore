import { mocHttpEvent } from './../Resources/Api/mock.data';
import { Context } from 'aws-lambda';
import { Api } from '../../src/Lambda/Api';
import AWSMock from "aws-sdk-mock";
import AWS from 'aws-sdk';
import { expect } from "chai";
import { DynamoDBDatastore } from '../../src/Datastore/Datastore';
import { schedulesTestCases } from '../Resources/Api/test.cases';
import { dynamoDBMockData } from '../Resources/Api/mock.data';

AWSMock.setSDKInstance(AWS);

describe("API::onHttpGetSchedules", function onHttpGetSchedulesTest() {
    // Go through each test case
    schedulesTestCases.forEach((testCase) => {
        const dataStore = new DynamoDBDatastore(new AWS.DynamoDB());
        const api = new Api(dataStore);
        AWSMock.mock("DynamoDB", "query",  (params: any, cb: any) => {
            const data = dynamoDBMockData ;
            cb(null, {Items: data});
        });
        it(`${testCase.title}`, (done) => {
            api.onHttpGetSchedules(mocHttpEvent(testCase.startTime), {} as Context, (error: any, response: any) => {
                expect(response.statusCode).to.eq(testCase.statusCode);
                const body = JSON.parse(response.body);
                if (testCase.error) {
                    expect(body.errorMessage).to.eq(testCase.errorMessage);
                }
                else {
                    expect(body.length).to.eq(testCase.outputLength);
                }
                done();
            })
        });
    });
});