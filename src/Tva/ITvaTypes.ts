export interface ITvaMainDocument {
    TVAMain: ITvaMain;
}
export interface ITvaMain {
    ProgramDescription: IProgramDescription[];
}
export interface IProgramDescription {
    ServiceInformationTable: IServiceInformationTable[];
    ProgramInformationTable: IProgramInformationTable[];
    GroupInformationTable: IGroupInformationTable[];
    ProgramLocationTable: IProgramLocationTable[];
}

export type ITvaInformation = IServiceInformation | IProgramInformation ; // | OnDemandProgram | BroadcastEvent;

export interface IServiceInformationTable {
    $: IXmlLangAttribute;
    ServiceInformation: IServiceInformation[];
}
export interface IServiceInformation {
    $: IServiceIdAttribute & IXsiTypeAttribute;
    Name: string[];
    Owner: string;
    RelatedMaterial: IRelatedMaterial[];
    ServiceGenre: IServiceGenre[];
    ServiceURL: string;
}
export interface IServiceIdAttribute {
    serviceId: string;
}

export interface IProgramInformationTable {
    $: IXmlLangAttribute;
    ProgramInformation: IProgramInformation[];
}
export interface IProgramInformation {
    $: IProgramIdAttribute & IXmlLangAttribute;
    BasicDescription: IBasicDescription[];
    DerivedFrom: IDerivedFrom[];
}
export interface IProgramIdAttribute {
    programId: string;
}

export interface IBasicDescription {
    $: IXsiTypeAttribute;
    ParentalGuidance: IParentalGuidance[];
    Duration: IDuration[];
    Title: Array<ITitle | string>;
    Genre: IGenre[];
    RelatedMaterial: IRelatedMaterial[];
    Synopsis: ISynopsis[];
}

export interface ITitle {
    _?: string;
    $: ITypeAttribute & IXmlLangAttribute;
}

export interface ISynopsis {
    _?: string;
    $: ILengthAttribute;
}

export interface IGenre {
    $: ITypeAttribute & IHrefAttribute;
}

export interface IParentalGuidance {
    "mpeg7:ParentalRating": IParentalRating[];
}
export interface IParentalRating {
    $: IHrefAttribute;
}

export type IDuration = string;

export interface IDerivedFrom {
    $: ICridAttribute;
}

export interface IGroupInformationTable {
    GroupInformation: IGroupInformation[];
}
export interface IGroupInformation {
    $: IGroupIdAttribute & IServiceIdRefAttribute & IXmlLangAttribute;
    GroupType: IGroupType[];
    BasicDescription: IBasicDescription[];
    MemberOf?: IMemberOf[];
}
export interface IGroupIdAttribute {
    groupId: string;
}
export interface IServiceIdRefAttribute {
    serviceIDRef: string;
}
export interface IGroupType {
    $: IValueAttribute & IXsiTypeAttribute;
}

export interface IRelatedMaterial {
    $: IXsiTypeAttribute;
    HowRelated: IHowRelated[];
    MediaLocator: IMediaLocator[];
    Format?: IFormat[];
}
export interface IHowRelated {
    $: IHrefAttribute;
}
export interface IMediaLocator {
    MediaUri: IMediaUri[] | string[];
}
export interface IMediaUri {
    $: IContentTypeAttribute;
    _: string;
}
export interface IFormat {
    $: IHrefAttribute;
}

export interface IMemberOf {
    $: ICridAttribute & IXsiTypeAttribute;
}

export interface IServiceGenre {
    $: IHrefAttribute & ITypeAttribute;
}

export interface IProgramLocationTable {
    BroadcastEvent?: IBroadcastEvent[];
    OnDemandProgram?: IOnDemandProgram[];
}
export interface IBroadcastEvent {
    $: IServiceIdRefAttribute & IXmlLangAttribute;
    Program: IProgram[];
    ProgramURL: string[];
    InstanceMetadataId: string[];
    PublishedStartTime: string[];
    PublishedDuration: string[];
}
export interface IOnDemandProgram {
    $: IServiceIdRefAttribute & IXmlLangAttribute;
    Program: IProgram[];
    ProgramURL: IProgramURL[];
    InstanceMetadataId: IInstanceMetadataId[];
    InstanceDescription: IInstanceDescription[];
    PublishedDuration: string[];
    StartOfAvailability: string[];
    EndOfAvailability: string[];
    Free: IFree[];
    AuxiliaryURL: IAuxiliaryURL[];
}
export interface IProgram {
    $: ICridAttribute;
}
export interface IProgramURL {
    $: IContentTypeAttribute;
    _: string;
}
export interface IAuxiliaryURL {
    $: IContentTypeAttribute;
    _: string;
}
export type IInstanceMetadataId = string;
export interface IInstanceDescription {
    Genre: IGenre[];
    AVAttributes: IAvAttributes[];
}
export interface IFree {
    $: IValueAttribute;
}
export interface IAvAttributes {
    AudioAttributes: IAudioAttributes[];
    VideoAttributes: IVideoAttributes[];
}
export interface IAudioAttributes {
    MixType: IMixType[];
    AudioLanguage: IAudioLanguage[];
}
export interface IVideoAttributes {
    HorizontalSize: string[];
    VerticalSize: string[];
    AspectRatio: string[];
}
export interface IMixType {
    $: IHrefAttribute;
}
export interface IAudioLanguage {
    $: { purpose: string };
    _: string;
}

// General bits
export interface IXmlLangAttribute {
    "xml:lang": string;
}
export interface IXsiTypeAttribute {
    "xsi:type": string;
}
export interface IHrefAttribute {
    href: string;
}
export interface ITypeAttribute {
    type: string;
}
export interface IValueAttribute {
    value: string;
}
export interface ILengthAttribute {
    length: string;
}
export interface IContentTypeAttribute {
    contentType: string;
}
export interface ICridAttribute {
    crid: string;
}
