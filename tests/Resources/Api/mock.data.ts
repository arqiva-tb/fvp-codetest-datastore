import { APIGatewayProxyEvent, APIGatewayEventRequestContext } from 'aws-lambda';
export const dynamoDBMockData = [{ 
        gsiBucket: { N: '1' },
        gsi2sk:{ S: 'http://edna.example.com/example/assets/images/default/example/1920x1080.jpg' },
        startTime: { N: '1550637900' },
        gsi3sk: { S: 'crid://www.example.tv/brand/3271776213#crid://www.example.tv/series/21034#crid://www.example.tv/programme/21034/C5210340016' },
        endTime: { N: '1550639400' },
        crids: { M: [Object] },
        sk: { S: 'BCAST_0a03_TVA' },
        titles: { M: [Object] },
        pk: { S: 'dvb://233a..2134;C62A' },
        gsi1pk: { S: 'http://www.example.com/vp/dtt/service/linear/8500' },
        gsi4sk: { S: '1550637900' },
        gsi5sk: { S: '1550639400' } 
    },
    { 
        gsiBucket: { N: '1' },
        gsi2sk: { S:'http://edna.example.com/example/assets/images/default/example/1920x1080.jpg' },
        startTime: { N: '1550637900' },
        gsi3sk: { S:'crid://www.example.tv/brand/3271776213#crid://www.example.tv/series/21034#crid://www.example.tv/programme/21034/C5210340016' },
        endTime: { N: '1550639400' },
        crids: { M: [Object] },
        sk: { S: 'BCAST_0a03_TVA' },
        titles: { M: [Object] },
        pk: { S: 'dvb://233a..4540;C62A' },
        gsi1pk: { S: 'http://www.example.com/vp/dtt/service/linear/17728' },
        gsi4sk: { S: '1550637900' },
        gsi5sk: { S: '1550639400' } 
    }];

export const mocHttpEvent = (startTime: string| null) : APIGatewayProxyEvent => { return {
    body: '',
    headers: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    path: '',
    pathParameters: {},
    queryStringParameters: startTime ? {"start_time": startTime } : {},
    stageVariables: {},
    requestContext: {} as APIGatewayEventRequestContext,
    resource: '' 
}};