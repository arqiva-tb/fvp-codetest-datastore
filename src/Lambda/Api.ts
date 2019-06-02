import { HttpStatusCodes } from '../Enum/HttpStatusCode';
import { IImageType, ILaunchUrl, IImage } from '../Datastore/IMdsTypes';
import { IBroadcastProgram, ICridType } from '../Datastore/IMdsTypes';
import { ITitle } from '../Tva/ITvaTypes';
import { DataHandler } from '../Datastore/DataHandler';
import { APIGatewayProxyEvent, Callback, Context } from "aws-lambda";
import { IDatastore } from '../Datastore/Datastore';
import { Errors } from '../enum/Errors';
import * as moment from "moment";

const defaultTimeFrameValue = 6;

/**
 * An interface representing the program object 
 */
export interface IProgram {
    program_id: string;
    titles: ITitle[],
    launchUrls: ILaunchUrl[],
    images: IImage[],
    startTime: string,
    endTime: string,
}

/**
 * An interface representing the error to be returned in the response 
 */
export interface IError { 
    errorDescription: string;
}

/**
 * This class will be used to handle Get Schedules Requests.
 */
export class Api {
    /** We interact with the data source through the datahandler (Strategy pattern)*/
    private dataHandler: DataHandler;
    /** The time frame to be used in the query programs from the data*/
    private timeFrameInHours: number = process.env.timeFrameInHours ? parseInt(process.env.timeFrameInHours, 10) : defaultTimeFrameValue;
    /** We minimize calls to DataStore by caching data queried previously, 
     * this is useful only when lambda is not in cold start */
    private cachedValues: Map<string, IProgram[]> = new Map();

    /** Constructor */
    constructor(dataStore: IDatastore) {    
        this.dataHandler = new DataHandler(dataStore);
    }

    /**
     * Get Scheduler Handler, it includes the business logic for handling such requests.
     * 
     * @param event
     * @param context
     * @param callback
     */
    public async onHttpGetSchedules(event: APIGatewayProxyEvent, context: Context, callback: Callback): Promise<void> {
        // Initializa some variables
        let statusCode: HttpStatusCodes = HttpStatusCodes.InternalServerError;
        let result: IProgram[] | IError | undefined = undefined;
        try {
            // Read the start time 
            const startTime = event.queryStringParameters ? event.queryStringParameters.start_time : null;
            // validate the read time
            if(!startTime || !this.validateStartTime(startTime)) {
                // Invalid start time, set the status code then throw an error
                statusCode = HttpStatusCodes.InvalidRequest;
                throw new Error(startTime ? Errors.InvalidStartTime : Errors.StartTimeRequied);
            }
            // Check whether the records have been recently queried
            result = this.cachedValues.get(startTime); 
            // Get the records from the datasource if it is not cached
            if (!result) {
                // Convert the start time to a number
                const startTimeNumeric =  parseInt(startTime, 10);
                // calculate the end time as the start time plus the time frame
                const endTime= startTimeNumeric + this.timeFrameInHours * 3600;
                // Query the records from the datasource
                const rawRecords = await this.dataHandler.queryByTimeFrame(startTimeNumeric, endTime);
                // Map the records to the required format
                result = this.mapRawRecords(rawRecords);
                // Update the ched values
                this.cachedValues.set(startTime, result);
            }  
            // Set the status code to success
            statusCode = HttpStatusCodes.Success; 
        }
        catch(error) {
            // Check whether it is an internal server error
            const isInternalServerError = (statusCode === HttpStatusCodes.InternalServerError);
            console.error(error);
            result = {
               errorDescription: isInternalServerError ? Errors.InternalServerError : error.message
            } as IError;
        }
        finally {
            const body = statusCode != HttpStatusCodes.Success ? result : {
                success: true,
                events: result
            };
            callback(null, {
                statusCode,
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body),
            });
        }
    }

    /**
     * It checks whether the start time is a valid timestamp,
     * it also checks whether it is multiple of the timeframe set in the environment.
     * 
     * @param startTime
     * @returns boolean
     */
    private validateStartTime(startTime: string): boolean {
            // convert from string to a number
            const startTimeNum = parseInt(startTime, 10);
            // It is valid as long as it is a positive number multiples of (timeFrameInHours * 60 * 60), 
            // where n is number of hours
            return  typeof startTimeNum == "number"  && startTimeNum > 0 &&
                    !(startTimeNum % (this.timeFrameInHours * 3600)) ;
    }

    /**
     * It maps the raw data fetched from DynamoDB into a format we need to return in the respons.
     * 
     * @param rawRecords
     * @returns IProgram[]
     */
    private mapRawRecords(rawRecords: IBroadcastProgram[]): IProgram[] {
        return rawRecords.map(item => {
            return {
                program_id: item.pk,
                titles: Object.values(item.titles||{}),
                launchUrls: Object.entries(item.crids).map(pair => {
                    return { href: pair[0], contentType: pair[1] }
                }),
                images: [{
                    type:  IImageType.Default,
                    key: item.gsi2sk
                }],
                startTime: moment.unix(item.startTime).utc().format(),
                endTime: moment.unix(item.endTime).utc().format(),
            } as IProgram
        })
    }
}
