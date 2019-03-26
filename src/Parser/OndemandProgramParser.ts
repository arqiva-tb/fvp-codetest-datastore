import {
    ICrid,
    ICridType,
    ILaunchUrl,
    IProgram,
    IProgramType,
    IRecord,
} from "../Datastore/IMdsTypes";
import {
    IOnDemandProgram,
    IProgramInformation,
    ITvaMain,
} from "../Tva/ITvaTypes";
import {ITvaParser} from "../Parser/Parser";
import {AbstractProgramParser} from "./AbstractProgramParser";
import {IAvAttributes} from "../Tva/ITvaTypes";

export class OndemandProgramParser extends AbstractProgramParser implements ITvaParser {

    public parse(tva: ITvaMain): IRecord[] {
        const programInformation: IProgramInformation[] = this.getProgramInformation(tva);
        if (programInformation.length === 0) {
            return [];
        }

        const odps: IOnDemandProgram[] = this.getOndemandPrograms(tva);

        const programs: IRecord[] = [];

        odps.forEach((odp) => {
            const record = {
                pk: odp.Program[0].$.crid,
                sk: IProgramType.ONDEMAND,

                gsi1pk: this.calculateSecondaryId(odp),

                gsiBucket: 1,
                gsi2sk: this.calculateImageKey(tva),
                gsi3sk: this.calculateContentRef(tva),

                titles: this.getTitles(tva),
                crids: this.getCrids(odp),
                avAttribs: this.getAvAttribute(odp),
                launchUrls: this.getLaunchUrls(odp),
                images: this.getImages(tva),

                startTime: this.getStartTime(odp),
            } as IProgram;

            programs.push(record);
        });

        return programs;
    }

    private getAvAttribute(odp: IOnDemandProgram): IAvAttributes | undefined {
        try {
            return odp.InstanceDescription[0].AVAttributes[0] || undefined;
        } catch (e) {
            // e is through because one of the above attributes is null when referenced
            // No AV attributes available.
            return undefined;
        }
    }

    private calculateSecondaryId(odp: IOnDemandProgram) {
        return odp.$.serviceIDRef;
    }

    private calculateContentRef(tva: ITvaMain): string {
        const groups = tva.ProgramDescription[0].GroupInformationTable[0].GroupInformation;
        const cridMap = new Map<string, string>(
            groups.map((group) => [group.GroupType[0].$.value, group.$.groupId] as [string, string]),
        );

        return cridMap.get("brand") + "#"
            + cridMap.get("series") + "#"
            + cridMap.get("episode") || cridMap.get("programConcept") + "";
    }

    private getCrids(odp: IOnDemandProgram): Map<ICridType, ICrid> {
        const crids: Map<ICridType, ICrid> = new Map();

        crids.set(ICridType.TVA, odp.Program[0].$.crid);

        return crids;
    }

    private getLaunchUrls(odp: IOnDemandProgram): Map<string, ILaunchUrl> {
        const urls: Map<string, ILaunchUrl> = new Map();

        urls.set("program", {
            href: odp.ProgramURL[0]._,
            contentType: odp.ProgramURL[0].$.contentType,
        });
        urls.set("template", {
            href: odp.AuxiliaryURL[0]._,
            contentType: odp.AuxiliaryURL[0].$.contentType,
        });

        return urls;
    }

    private getStartTime(odp: IOnDemandProgram): number {
        return (Date.parse(odp.StartOfAvailability[0]) / 1000);
    }
}
