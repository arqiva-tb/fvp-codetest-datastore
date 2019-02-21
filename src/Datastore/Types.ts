import {ITvaInformation} from "src/Tva/Types";

export interface IRecord {
    pk: IPrimaryKey;
    sk: IRecordType;

    tva?: ITvaInformation;

    /**
     * The program crid comes either from Program elements, or from
     * the programId attribute of the ProgramInformation element.
     *
     * eg: <Program crid="crid://example.com/2-4774-0009"/>
     * eg: <ProgramInformation xml:lang="en" programId="crid://www.example.tv/V4277B8">
     */
    programCrid: string;

    /**
     * The program title is found in the group that has the GroupType with value="programConcept"
     *
     * eg: <Title type="main" xml:lang="en"><![CDATA[Clutter & Red Flag Compilation]]></Title>
     */
    programTitle?: string;

    /**
     * The image is the URL in the MediaUri of a related material with a HowRelated of
     * href="urn:tva:metadata:cs:HowRelatedCS:2012:19"
     *
     * eg: <MediaUri>http://edna.example.com/example/assets/images/default/example/1920x1080.jpg</MediaUri>
     */
    programImage?: string;

    /**
     * eg: <ProgramURL>dvb://233a..2134;C62A</ProgramURL>
     */
    broadcastUrl?: string;

    /**
     * eg: <PublishedDuration>PT0H10M0S</PublishedDuration>
     */
    broadcastDuration?: string;

    /**
     * eg: <PublishedStartTime>2019-02-21T06:15:00Z</PublishedStartTime>
     */
    broadcastStart?: string;

    /**
     * eg: <ProgramURL contentType="..."><![CDATA[https://auth.example.com/...]]></ProgramURL>
     */
    ondemandUrl?: string;

    /**
     * eg: <PublishedDuration>PT0H10M0S</PublishedDuration>
     */
    ondemandDuration?: string;

    /**
     * eg: <StartOfAvailability>2019-02-21T06:15:00Z</StartOfAvailability>
     */
    ondemandAvailabilityStart?: string;

    /**
     * eg: <EndOfAvailability>2019-05-06T05:20:00Z</EndOfAvailability>
     */
    ondemandAvailabilityEnd?: string;
}

export type IPrimaryKey = string;
export enum IRecordType {
    PROGRAM_INFORMATION,
    BROADCAST_EVENT,
    ONDEMAND_PROGRAM,
}
