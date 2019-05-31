import { IImageType, ILaunchUrl, IImage } from '../Datastore/IMdsTypes';
import { IBroadcastProgram, ICridType } from '../Datastore/IMdsTypes';
import { ITitle } from './../Tva/ITvaTypes';
import { DataHandler } from '../Datastore/DataHandler';
import { HttpStatusCodes } from '../enum/HttpStatusCode';
import {APIGatewayProxyEvent, Callback, Context} from "aws-lambda";
import { IDatastore } from "../Datastore/Datastore";
import { Errors } from '../enum/Errors';
import moment = require('moment');

const defaultTimeFrameValue = 6;


/**
 * An interface representing schedule format
 */
export interface ISchedule{
    program_id: string;
    titles: ITitle[],
    launchUrls: ILaunchUrl[],
    images: IImage[],
    startTime: string,
    endTime: string,
}


/**
 * This class will be used to handle Get Schedules Requests.
 */
export class Api {
    
    private dataHandler: DataHandler;
    private timeFrameInHours: number = process.env.timeFrameInHours ? parseInt(process.env.timeFrameInHours, 10) : defaultTimeFrameValue;
    private cachedValues: Map<string, any> = new Map();

    constructor(dataStore: IDatastore) {
        // We interact with the data source through the datahandler (Strategy pattern)
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
        let body = null;
        try {
            // Read the start time 
            const startTime = event.queryStringParameters ? event.queryStringParameters.start_time : null;
            // validate the read time
            if(!startTime || !this.validateStartTime(startTime)) {
                // Invalid start time, set the status code then throw an error
                statusCode = HttpStatusCodes.InvalidRequest;
                throw new Error(startTime ? Errors.InvalidStartTime : Errors.StartTimeRequied);
            }
            // Check whether the records have been recently cached
            body = this.cachedValues.get(startTime); 
            // Get the records from the datasource if it is not cached
            if (!body) {
                // Convert the start time to number
                const startTimeNumeric =  parseInt(startTime, 10);
                // calculate the end time as the start time plus the time frame
                const endTime= startTimeNumeric + this.timeFrameInHours * 3600;
                // Query the records from the datasource
                const rawRecords = await this.dataHandler.queryByTimeFrame(startTimeNumeric, endTime);
                // Map the records to the required format
                body = this.mapRawRecords(rawRecords);
                statusCode = HttpStatusCodes.Success;
                this.cachedValues.set(startTime, body);
            }

        }
        catch(error) {
            body = {
               errorMessage: error.message
            };
        }
        finally {
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
     * @returns ISchedule[]
     */
    private mapRawRecords(rawRecords: IBroadcastProgram[]): ISchedule[] {
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
            } as ISchedule
        })
    }

}
