import {DynamoDB} from "aws-sdk";
import {IRecord, IBroadcastProgram} from "./IMdsTypes";
import { resolve } from "path";

export interface IDatastore {
    persist(records: IRecord[]): Promise<IRecord[]>;
    queryByTimeFrame(startTime: number, endTime: number): Promise<IBroadcastProgram[]>;
}

/**
 * This class provides a simple mechanism for persisting/quering MDS IRecords to Dynamo.
 */
export class DynamoDBDatastore implements IDatastore {

    private client: DynamoDB;
    private batchPutSize: number = 25;
    private tableName: string = process.env.tableName || "fvp-datastore-test-dev-table";
    private startTimeIndex: string = process.env.startTimeIndex || "GS7";

    constructor(db: DynamoDB) {
        this.client = db;
        db.query()
    }

    /**
     * Attempt to persist the records, and return all that were persisted.
     *
     * @param records
     */
    public persist(records: IRecord[]): Promise<IRecord[]> {
        return new Promise((resolve, reject) => {
            const inFlight: Array<PromiseLike<DynamoDB.BatchWriteItemOutput>> = [];
            let sent: IRecord[] = [];
            const slices: IRecord[][] = [];

            while (records.length > 0) {
                const slice = records.splice(0, this.batchPutSize);
                slices.push(slice);
                sent = sent.concat(slice);
                console.debug(`Persisting slice of ${slice.length} records`);
                const request = this.persistSlice(slice);
                inFlight.push(request);
            }

            console.debug(`Waiting on ${inFlight.length} promises to resolve for ${sent.length} items`);
            Promise
                .all(inFlight)
                /**
                 * Inspect each response to ensure we don't have any failures.
                 */
                .then((results: DynamoDB.BatchWriteItemOutput[]) => {
                    console.debug(`All ${inFlight.length} promises for ${sent.length} items resolved`);

                    const unprocessed: DynamoDB.WriteRequests = [];
                    results.forEach((output: DynamoDB.BatchWriteItemOutput) => {
                        unprocessed.concat(output.UnprocessedItems && output.UnprocessedItems[this.tableName]
                            ? output.UnprocessedItems[this.tableName]
                            : []);
                    });

                    if (unprocessed.length === 0) {
                        console.debug("BatchWriteRequests: All items persisted", unprocessed);
                        resolve(sent);
                    } else if (unprocessed.length < sent.length) {
                        console.error("BatchWriteRequests: Some items were not persisted", unprocessed);
                        resolve(sent);
                    } else {
                        console.error("BatchWriteRequests: No items were not persisted", unprocessed);
                        reject(new Error("No records were persisted"));
                    }
                })
                .catch((e) => {
                    console.error(e);
                    reject(e);
                });
        });
    }

    /**
     * Query records from DynamoDb with startTime in the provided time frame.
     *
     * @param startTime
     * @param endTime
     */
    queryByTimeFrame(startTime: number, endTime: number): Promise<IBroadcastProgram []> {
        // Build query params
        const params = {
            ExpressionAttributeValues: {
                ":s": { N: startTime.toString() },
                ":e": { N: endTime.toString() },
                ":g": { N: "1" },
            },
            KeyConditionExpression: "gsiBucket = :g and startTime BETWEEN :s and  :e",
            TableName: this.tableName,
            IndexName: this.startTimeIndex,
        };
        return  new Promise((resolve, reject) => {
            this.client.query(params, function(err, data) {
                if (err) {
                    console.error("Failed to query from DynamoDB, error: ", err);
                    reject(err);
                } else {
                    // Remove the type from the items 
                    const mappedItems: IBroadcastProgram[] = (data.Items || []).map(item => {
                        return DynamoDB.Converter.unmarshall(item) as IBroadcastProgram;
                    });
                    resolve(mappedItems);
                }
            });
        });
    }

    /**
     * Take a subset of records and persist them using BatchWriteItem
     *
     * @param slice
     */
    private persistSlice(slice: IRecord[]): PromiseLike<DynamoDB.BatchWriteItemOutput> {
        const operations: DynamoDB.WriteRequest[] = [];

        slice.forEach((record: any | IRecord) => {
            for (const property in record) {
                if (record.hasOwnProperty(property)) {
                    record[property] = this.simplify(record[property]);
                }
            }
            const marshalled = DynamoDB.Converter.marshall(record);
            operations.push({PutRequest: {Item: marshalled}});
        });

        const requestItems: DynamoDB.BatchWriteItemRequestMap = {};
        requestItems[this.tableName] = operations;

        const slicePromise = new Promise<DynamoDB.BatchWriteItemOutput>((resolve, reject) => {
            this.client.batchWriteItem({RequestItems: requestItems}, (err, data) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        return slicePromise;
    }

    /**
     * Decomposes complex types to simple objects, so that DynamoDB.Converter.marshall
     * can convert them for persisting.
     *
     * @param map
     */
    private simplify(map: Map<any, any> | any): any {
        if (!(map instanceof Map)) {
            return map;
        }

        const body: any = {};
        map.forEach((value: any, key: any) => {
            body[key] = this.simplify(value);
        });

        return body;
    }
}
