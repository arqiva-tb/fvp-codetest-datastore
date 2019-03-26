import S3 = require("aws-sdk/clients/s3");
import {Readable} from "stream";

import {File} from "./File";

export class S3File extends File {

    public static fromGetObjectResponse(response: S3.Types.GetObjectOutput): Promise<S3File> {

        return new Promise<S3File>((resolve, reject) => {
            if (!response.Body) {
                return reject("Object has no body");
            }
            resolve(new S3File(response.Body.toString()));
        });
    }

    private static toString(readStream: Readable): Promise<string> {
        let content = "";

        return new Promise<string>((resolve) => {
            readStream.on("data", (chunk: string) => {
                content += chunk;
            });
            readStream.on("end", () => {
                resolve(content);
            });
        });
    }
}
