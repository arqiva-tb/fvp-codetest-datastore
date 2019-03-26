import {expect} from "chai";
import fs from "fs";
import xml2js from "xml2js";

import {SeriesParser} from "../../src/Parser/SeriesParser";
import {ITvaMainDocument} from "../../src/Tva/ITvaTypes";
import {IGroupType, IRecord} from "../../src/Datastore/IMdsTypes";
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

describe(`The SeriesParser extracts the correct records`, () => {
    const parser = new SeriesParser();

    examples.forEach((example) => {
        const input = fs.readFileSync(`tests/Resources/${example.input}`).toString();
        const output = JSON.parse(fs.readFileSync(`tests/Resources/${example.output}`).toString());

        const expected = output.persisted.filter((record: IRecord) => record.sk === IGroupType.SERIES);

        it(`(${example.input})`, (done) => {
            xml2js.parseString(input, (err, document: ITvaMainDocument) => {
                if (err) {
                    throw err;
                }

                const results = parser.parse(document.TVAMain);
                const flat = JSON.stringify(flattenMaps(results), null, 2);

                expect(flat).to.equal(JSON.stringify(expected, null, 2));

                done();
            });
        });
    });
});
