import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";
import {Callback, Context} from "aws-lambda";
import {GetObjectOutput} from "aws-sdk/clients/s3";
import {PutItemOutput} from "aws-sdk/clients/dynamodb";

import {expect} from "chai";
import fs from "fs";
import {Application} from "../../src/Lambda/Application";
import {IRecord} from "../../src/Datastore/Types";
import {S3Event} from "./S3Event";

AWSMock.setSDKInstance(AWS);

function createMockS3Event(input: string, output: string): S3Event {
    const event: S3Event = new S3Event(input);

    AWSMock.mock("S3", "getObject",  (params: any, cb: any) => {
        const data = Buffer.from(fs.readFileSync(output));
        cb(null, {Body: data} as GetObjectOutput);
    });

    return event;
}

describe("handler.onS3Put", () => {
    it("should fetch payload, persist a program and return 200", (done) => {
        const event = createMockS3Event(
            "filename.xml",
            "examples/11187466-3384-11e9-95a3-005056891988.xml",
        );

        let persistedItem: IRecord | null = null;
        AWSMock.mock("DynamoDB", "putItem", (params: any, cb: any) => {
            persistedItem = params;
            cb(null, {} as PutItemOutput);
        });

        const s3Mock = new AWS.S3();
        const dbMock = new AWS.DynamoDB();
        const sut = new Application(s3Mock, dbMock);

        const entityAssertions: Callback = (err, response): any => {

            // tslint:disable:max-line-length
            expect(persistedItem).to.deep.equal({
                // TODO
            });

            AWSMock.restore("S3");
            AWSMock.restore("DynamoDB");

            done();
        };

        sut.onS3Put(event, {} as Context, entityAssertions);
    });

});
