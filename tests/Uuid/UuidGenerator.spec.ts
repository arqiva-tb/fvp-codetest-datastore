import {UuidGenerator} from "../../src/Uuid/UuidGenerator";
import {expect} from "chai";

describe('UuidGenerator builds UUIDs correctly', () => {
    it('should build an RFC compliant v4 UUID', function () {
        let sut = new UuidGenerator();
        let res = sut.generateUUID();
        let regex = new RegExp(/[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}/i);
        expect(regex.test(res)).to.equal(true);
    });
});
