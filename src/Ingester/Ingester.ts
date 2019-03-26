import {IDatastore} from "../Datastore/Datastore";
import {IRecord} from "../Datastore/IMdsTypes";
import {IFile, IParser} from "../Parser/Parser";

export class Ingester {

    private parser: IParser;
    private store: IDatastore;

    constructor(parser: IParser, store: IDatastore) {
        this.parser = parser;
        this.store = store;
    }

    public ingest(file: IFile): Promise<IRecord[]> {
        return new Promise((resolve, reject) => {
            this.parser
                .parse(file)
                .then((records: IRecord[]) => this.store.persist(records))
                .then((persisted: IRecord[]) => resolve(persisted))
                .catch((err: Error) => {
                    console.error(err);
                    reject(err);
                });
        });
    }
}
