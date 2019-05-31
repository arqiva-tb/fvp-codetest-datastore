import { Errors } from '../../../src/enum/Errors';
import { HttpStatusCodes } from '../../../src/enum/HttpStatusCode';
export const schedulesTestCases = [
    {   title: "start_time is missing.",
        startTime: null, 
        error: true, 
        statusCode: HttpStatusCodes.InvalidRequest, 
        errorMessage: Errors.StartTimeRequied 
    },
    {   title: "start_time is not a number.",
        startTime: "sssss", 
        error: true,
        statusCode: HttpStatusCodes.InvalidRequest,
        errorMessage: Errors.InvalidStartTime 
    },
    { 
        title: "start_time is not multiples of 6 hours.",
        startTime: "33333",
        error: true,
        statusCode: HttpStatusCodes.InvalidRequest,
        errorMessage: Errors.InvalidStartTime 
    },
    { 
        title: "Valid start_time", 
        startTime: "21600", 
        error: false, 
        statusCode: HttpStatusCodes.Success, 
        outputLength: 2
    }
];