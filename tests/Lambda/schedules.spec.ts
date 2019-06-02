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
    // Mock DynamoDB query
    AWSMock.mock("DynamoDB", "query",  function(params: any, cb: any)  {
        const data = dynamoDBMockData ;
        cb(null, {Items: data});
    });
    const dataStore = new DynamoDBDatastore(new AWS.DynamoDB());
    const api = new Api(dataStore);  
    // Restore DynamoDb after the last test case in this block
    after(()=>{
       AWSMock.restore("DynamoDB");
    });

    // Go through each test case
    schedulesTestCases.forEach((testCase) => {
        it(`${testCase.title}`, (done) => {
            api.onHttpGetSchedules(mocHttpEvent(testCase.startTime), {} as Context, (error: any, response: any) => {
                expect(response.statusCode).to.eq(testCase.statusCode);
                const body = JSON.parse(response.body);
                if (testCase.error) {
                    expect(body.errorDescription).to.eq(testCase.errorMessage);  
                }
                else {
                    expect(body.events.length).to.eq(testCase.outputLength);
                }
                done();
            })
        })
    });
});