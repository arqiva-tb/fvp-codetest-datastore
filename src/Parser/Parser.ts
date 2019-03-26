import xml2js from "xml2js";

import {IRecord} from "../Datastore/IMdsTypes";
import { ITvaMain, ITvaMainDocument} from "../Tva/ITvaTypes";

export interface IParser {
    parse(file: IFile): Promise<IRecord[]>;
}

export interface ITvaParser {
    parse(payload: ITvaMain): IRecord[];
}

export interface IFile {
    getContent(): string;
}

export class TvaDocumentParser implements IParser {

    private tvaParsers: ITvaParser[] = [];

    constructor(tvaParsers: ITvaParser[]) {
        this.tvaParsers = tvaParsers;
    }

    public parse(file: IFile): Promise<IRecord[]> {
        return new Promise<IRecord[]>((resolve, reject) => {
            this.getDataResolver(file, resolve, reject);
        });
    }

    private getDataResolver(
        file: IFile,
        resolve: (value?: IRecord[] | PromiseLike<IRecord[]>) => void,
        reject: (reason?: any) => void,
    ) {
        xml2js.parseString(file.getContent(), (err, document: ITvaMainDocument) => {
            if (err) {
                console.error(err);
                reject(err);

                return;
            }

            const records: IRecord[] = [];

            try {
                this.tvaParsers.forEach((parser) => {
                    parser.parse(document.TVAMain).forEach((record) => {
                        records.push(record);
                    });
                });
            } catch (e) {
                console.error(e);
                reject(e);

                return;
            }

            resolve(records);
        });
    }
}
