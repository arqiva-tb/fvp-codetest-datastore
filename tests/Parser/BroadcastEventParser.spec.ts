import {expect} from "chai";
import fs from "fs";
import xml2js from "xml2js";

import {BroadcastEventParser} from "../../src/Parser/BroadcastEventParser";
import {ITvaMainDocument} from "../../src/Tva/ITvaTypes";
import {IProgramType, IRecord} from "../../src/Datastore/IMdsTypes";
import {flattenMaps} from "../Resources/Utilities/flatten";

/**
 * See tests/Resources/... for test examples.
 */
const examples = [
    {input: "programs/1/input.xml", output: "programs/1/output.json"},
    {input: "programs/2/input.xml", output: "programs/2/output.json"},
    {input: "programs/3/input.xml", output: "programs/3/output.json"},
    {input: "programs/4/input.xml", output: "programs/4/output.json"},
];

describe(`The BroadcastEventParser extracts the correct records`, () => {
    const parser = new BroadcastEventParser();

    examples.forEach((example) => {
        const input = fs.readFileSync(`tests/Resources/${example.input}`).toString();
        const output = JSON.parse(fs.readFileSync(`tests/Resources/${example.output}`).toString());
        const expected = output.persisted.filter((record: IRecord) => record.sk === IProgramType.BCAST_0a03_TVA);

        it(`(${example.input})`, (done) => {
            xml2js.parseString(input, (err, document: ITvaMainDocument) => {
                if (err) {
                    throw err;
                }

                const results = parser.parse(document.TVAMain);
                const flat = flattenMaps(results);

                expect(flat).to.deep.equal(expected);

                done();
            });
        });
    });
});
