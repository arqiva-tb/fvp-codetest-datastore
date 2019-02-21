/**
 * Represents an S3 object Event
 */
export class S3Event {
    public Records: any[] = [];

    constructor(fileName: string = "file.xml", eventName: string = "ObjectCreated:Put") {
        this.Records.push({
            eventVersion: "2.0",
            eventTime: "1970-01-01T00:00:00.000Z",
            requestParameters: {
                sourceIPAddress: "127.0.0.1",
            },
            s3: {
                configurationId: "testConfigRule",
                object: {
                    eTag: "0123456789abcdef0123456789abcdef",
                    sequencer: "0A1B2C3D4E5F678901",
                    key: fileName,
                    size: 41400,
                    versionId: "1234",
                },
                bucket: {
                    arn: "arn://bucket",
                    name: "bucket",
                    ownerIdentity: {
                        principalId: "9508-2598-7512",
                    },
                },
                s3SchemaVersion: "1.0",
            },
            responseElements: {
                "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH",
                "x-amz-request-id": "EXAMPLE123456789",
            },
            awsRegion: "us-east-1",
            eventName,
            userIdentity: {
                principalId: "EXAMPLE",
            },
            eventSource: "aws:s3",
        });
    }
}