import {ITvaParser} from "./Parser";
import {AbstractGroupParser} from "./AbstractGroupParser";
import {IGroupType} from "../Datastore/IMdsTypes";

export class SeriesParser extends AbstractGroupParser implements ITvaParser {
    protected SUPPORTED_TYPE: IGroupType = IGroupType.SERIES;
}
