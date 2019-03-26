import {IRecord} from "src/Datastore/IMdsTypes";

export function flattenMaps(records: IRecord[]) {
    records.map((record: any | IRecord) => {
        for (const property in record) {
            if (record.hasOwnProperty(property)) {
                record[property] = flattenMap(record[property]);
            }
        }
        return record;
    });

    return JSON.parse(JSON.stringify(records));
}

function flattenMap(map: Map<any, any> | any): any {
    if (!(map instanceof Map)) {
        return map;
    }

    const body: any = {};
    map.forEach((value: any, key: any) => {
        body[key] = flattenMap(value);
    });

    return body;
}
