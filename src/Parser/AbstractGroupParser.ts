import {IGroup, IGroupType, IRecord, ISynopsis, ISynopsisLength} from "../Datastore/IMdsTypes";
import {IGroupInformation, ITvaMain} from "../Tva/ITvaTypes";
import {ITvaParser} from "../Parser/Parser";
import {AbstractProgramParser} from "./AbstractProgramParser";

export abstract class AbstractGroupParser extends AbstractProgramParser implements ITvaParser {

    protected abstract SUPPORTED_TYPE: IGroupType;

    public parse(tva: ITvaMain): IRecord[] {
        const group: IGroupInformation | undefined = this.getGroup(this.getTvaGroupType(this.SUPPORTED_TYPE), tva);
        if (!group) {
            return [];
        }

        const brands: IGroup[] = [{
            pk: group.$.groupId,
            sk: this.SUPPORTED_TYPE,

            gsiBucket: 1,
            gsi2sk: this.calculateImageKey(tva),

            titles: this.getTitles(tva),
            synopses: this.getSynopses(group),
        }];

        return brands;
    }

    protected getSynopses(group: IGroupInformation): Map<ISynopsisLength, ISynopsis> {
        const synopses: Map<ISynopsisLength, ISynopsis> = new Map();

        try {
            group.BasicDescription[0].Synopsis.forEach((synopsis) => {
                if (synopsis._ && synopsis._.length > 0) {
                    synopses.set(this.getSynopsisLength(synopsis.$.length), synopsis._);
                }
            });
        } catch (e) {
            // No synopses
        }

        return synopses;
    }

    private getSynopsisLength(length: string): ISynopsisLength {
        switch (length) {
            case "short": return ISynopsisLength.Short;
            case "medium": return ISynopsisLength.Medium;
            case "long": return ISynopsisLength.Long;
        }

        throw new Error(`Invalid synopsis length "${length}"`);
    }

    private getTvaGroupType(mdsType: IGroupType) {
        switch (mdsType) {
            case IGroupType.BRAND: return "brand";
            case IGroupType.SERIES: return "series";
        }

        throw new Error(`Invalid group type "${mdsType}"`);
    }
}
