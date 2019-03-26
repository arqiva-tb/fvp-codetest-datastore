import {
    ICrid,
    ICridType,
    IBroadcastProgram,
    IProgramType,
    IRecord,
} from "../Datastore/IMdsTypes";
import {
    IBroadcastEvent,
    IProgramInformation,
    ITvaMain,
} from "../Tva/ITvaTypes";
import {ITvaParser} from "../Parser/Parser";
import {AbstractProgramParser} from "./AbstractProgramParser";
import moment from "moment";

export class BroadcastEventParser extends AbstractProgramParser implements ITvaParser {

    public parse(tva: ITvaMain): IRecord[] {
        const programInformation: IProgramInformation[] = this.getProgramInformation(tva);
        if (programInformation.length === 0) {
            return [];
        }

        const broadcastEvents: IBroadcastEvent[] = this.getBroadcastEvents(tva);

        const programs: IRecord[] = [];

        broadcastEvents.forEach((be) => {
            const record = {
                pk: be.ProgramURL[0],
                sk: IProgramType.BCAST_0a03_TVA,

                gsi1pk: this.calculateSecondaryId(be, tva),

                gsiBucket: 1,
                gsi2sk: this.calculateImageKey(tva),
                gsi3sk: this.calculateContentRef(be, tva),
                gsi4sk: `${this.getStartTime(be)}`,
                gsi5sk: `${this.getEndTime(be)}`,

                titles: this.getTitles(tva),
                crids: this.getCrids(be, tva),

                startTime: this.getStartTime(be),
                endTime: this.getEndTime(be),
            } as IBroadcastProgram;

            programs.push(record);
        });

        return programs;
    }

    private getBroadcastEvents(tva: ITvaMain): IBroadcastEvent[] {
        try {
            return tva
                .ProgramDescription[0]
                .ProgramLocationTable[0]
                .BroadcastEvent || [];
        } catch (e) {
            // No broadcast events
            return [];
        }
    }

    private calculateSecondaryId(be: IBroadcastEvent, tva: ITvaMain) {
        return be.$.serviceIDRef;
    }

    private calculateContentRef(be: IBroadcastEvent, tva: ITvaMain): string {
        const groups = tva.ProgramDescription[0].GroupInformationTable[0].GroupInformation;
        const cridMap = new Map<string, string>(
            groups.map((group) => [group.GroupType[0].$.value, group.$.groupId] as [string, string]),
        );

        return cridMap.get("brand") + "#"
            + cridMap.get("series") + "#"
            + cridMap.get("programConcept") + "";
    }

    private getCrids(be: IBroadcastEvent, tva: ITvaMain): Map<ICridType, ICrid> {
        const crids: Map<ICridType, ICrid> = new Map();

        // TODO: InstanceDescription -> OtherIdentifier
        crids.set(ICridType.TVA, be.Program[0].$.crid);
        crids.set(ICridType.DVB, be.ProgramURL[0]);

        return crids;
    }

    private getStartTime(be: IBroadcastEvent): number {
        const start = moment.utc(be.PublishedStartTime[0]);

        return start.unix();
    }

    private getEndTime(be: IBroadcastEvent): number {
        const start = moment.utc(be.PublishedStartTime[0]);
        const duration = moment.duration(be.PublishedDuration[0]);
        const end = start.add(duration);

        return end.unix();
    }
}
