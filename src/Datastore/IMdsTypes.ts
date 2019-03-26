import {
    IAvAttributes, IBroadcastEvent, IOnDemandProgram,
    ITvaInformation,
} from "../Tva/ITvaTypes";

export interface IRecord {
    pk: IPrimaryKey;
    sk: IRecordType;

    gsi1pk?: string;
    gsi1sk?: string;

    gsiBucket?: number;
    gsi2sk?: string;
    gsi3sk?: string;
    gsi4sk?: string;
    gsi5sk?: string;
    gsi6sk?: string;

    tva?: ITvaInformation;
}

export type IPrimaryKey = string;
export type IRecordType = IServiceType | IProgramType | IGroupType;

export type ITitle = string;
export enum ITitleLength {
    Short = "SHORT",
    Medium = "MEDIUM",
    Long = "LONG",
}

export type ISynopsis = string;
export enum ISynopsisLength {
    Short = "SHORT",
    Medium = "MEDIUM",
    Long = "LONG",
}

export type IImageKey = string;
export enum IImageType {
    Default = "DEFAULT",
}

export interface IImage {
    type: IImageType;
    key: IImageKey;
}

export interface ILaunchUrl {
    href: string;
    contentType: string;
}

export interface IService extends IRecord {
    TYPE: IServiceType;

    pk: ICrid;
    sk: IServiceType;

    crid: ICrid;
    serviceId?: number;

    titles: Map<ITitleLength, ITitle>;
    synopses?: Map<ISynopsisLength, ISynopsis>;

    imgKey?: IImageKey;
    imgTypes?: IImageType[];
}

export type ICrid = string;
export enum ICridType {
    DVB = "DVB",
    TVA = "TVA",
    PCRID = "PCRID",
}

export enum IServiceType {
    SRV_APP = "SRV_APP",
    SRV_DVB = "SRV_DVB",
    SRV_OWN = "SRV_OWN",
}

export interface IProgram extends IRecord {
    pk: ICrid;
    sk: IProgramType;

    titles: Map<ITitleLength, ITitle>;
    synopses?: ISynopsis[];

    imgKey?: IImageKey;
    imgTypes?: IImageType[];

    crids: Map<ICridType, ICrid>;
    avAttribs: IAvAttributes;
    launchUrls: Map<string, ILaunchUrl>;

    odp?: IOnDemandProgram;
    be?: IBroadcastEvent;
}

export interface IBroadcastProgram extends IProgram {
    startTime: number;
    endTime: number;
}

export enum IProgramType {
    BCAST_0a02_CSI    = "BCAST_0a02_CSI",
    BCAST_0a03_CSI    = "BCAST_0a03_CSI",
    EITPF             = "EITPF",
    BCAST_0a03_TVA    = "BCAST_0a03_TVA",
    BCAST_0a03_MERGED = "BCAST_0a03_MERGED",
    ONDEMAND          = "ONDEMAND",
}

export interface IGroup extends IRecord {
    pk: ICrid;
    sk: IGroupType;

    titles: Map<ITitleLength, ITitle>;
    synopses: Map<ISynopsisLength, ISynopsis>;

    imgKey?: IImageKey;
    imgTypes?: IImageType[];
}

export enum IGroupType {
    BRAND = "BRAND",
    SERIES = "SERIES",
    COLLECTION = "COLLECTION",
    RECOMMENDATIONS = "RECOMMENDATIONS",
}
