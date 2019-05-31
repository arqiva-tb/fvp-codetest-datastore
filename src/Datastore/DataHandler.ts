import { IRecord, IBroadcastProgram } from 'src/Datastore/IMdsTypes';
import { IDatastore } from './Datastore';

/**
 * This class provides a simple mechanism for handling operations with a provided datasource.
 * The Strategy Pattern lets you separate your the details of your datastore from you business logic.
 */
export class DataHandler {
    
    constructor(private dataStoreStrategy: IDatastore) {}

    async queryByTimeFrame(startTime: number, endTime: number): Promise<IBroadcastProgram[]> {
        return this.dataStoreStrategy.queryByTimeFrame(startTime, endTime);
    }

};
