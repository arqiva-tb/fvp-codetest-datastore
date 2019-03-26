import {ITvaParser} from "./Parser";
import {AbstractGroupParser} from "./AbstractGroupParser";
import {IGroupType} from "../Datastore/IMdsTypes";

export class BrandParser extends AbstractGroupParser implements ITvaParser {
    protected SUPPORTED_TYPE: IGroupType = IGroupType.BRAND;
}
