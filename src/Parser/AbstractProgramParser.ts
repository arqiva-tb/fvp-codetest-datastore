import {IImage, IImageType, ITitle, ITitleLength} from "../Datastore/IMdsTypes";
import {
    IBasicDescription,
    IGroupInformation,
    IMediaUri,
    IOnDemandProgram,
    IProgramInformation,
    ITvaMain,
    ITitle as IMdsTitle,
} from "../Tva/ITvaTypes";

export abstract class AbstractProgramParser {

    protected getProgramInformation(tva: ITvaMain): IProgramInformation[] {
        try {
            return tva
                .ProgramDescription[0]
                .ProgramInformationTable[0]
                .ProgramInformation || [];
        } catch (e) {
            // No program information
            return [];
        }
    }

    protected getOndemandPrograms(tva: ITvaMain): IOnDemandProgram[] {
        try {
            return tva
                .ProgramDescription[0]
                .ProgramLocationTable[0]
                .OnDemandProgram || [];
        } catch (e) {
            // No odps
            return [];
        }
    }

    protected calculateImageKey(tva: ITvaMain): string {
        const pi = this.getProgramInformation(tva);

        // TODO: ?Create an image parser to resolve the best image?
        try {
            const groups = tva.ProgramDescription[0].GroupInformationTable[0].GroupInformation;
            const imageMap = new Map<string, IImage>(
                groups.map((group) => [
                    group.GroupType[0].$.value,
                    this.getImageFromGroup(group),
                ] as [string, IImage]),
            );
            const image = imageMap.get("episode") || imageMap.get("programConcept");

            return image && image.key || "";
        } catch (e) {
            return "";
        }
    }

    protected getTitles(tva: ITvaMain): Map<ITitleLength, ITitle> {
        const titles: Map<ITitleLength, ITitle> = new Map();

        const pi = this.getProgramInformation(tva);
        // TODO: Create a title parser to resolve the best title.
        const groups = tva.ProgramDescription[0].GroupInformationTable[0].GroupInformation;
        const titleMap = new Map<string, string>(
            groups.map((group) => [
                group.GroupType[0].$.value,
                this.getTitlesFromBasicDescription(group.BasicDescription[0]),
            ] as [string, string]),
        );

        titles.set(ITitleLength.Long, titleMap.get("episode") || titleMap.get("programConcept") || "");

        return titles;
    }

    protected getImages(tva: ITvaMain): Map<IImageType, IImage> {
        const images: Map<IImageType, IImage> = new Map();

        try {
            const groups = tva.ProgramDescription[0].GroupInformationTable[0].GroupInformation;
            const imageMap = new Map<string, IImage>(
                groups.map((group) => [
                    group.GroupType[0].$.value,
                    this.getImageFromGroup(group),
                ] as [string, IImage]),
            );

            const image = imageMap.get("episode") || imageMap.get("programConcept");
            if (image) {
                images.set(IImageType.Default, image);
            }

            return images;
        } catch (e) {
            return images;
        }
    }

    protected getImageFromGroup(group: IGroupInformation): IImage | undefined {
        try {
            const rm = group.BasicDescription[0].RelatedMaterial;
            const images: Array<IImage | null> = rm.map((r) => {
                if (r.HowRelated[0].$.href === "urn:tva:metadata:cs:HowRelatedCS:2012:19") {
                    const uri: IMediaUri | string = r.MediaLocator[0].MediaUri[0];
                    return {
                        type: IImageType.Default,
                        key: uri,
                    } as IImage;
                } else {
                    return null;
                }
            });

            return images[0] || undefined;
        } catch (e) {
            return undefined;
        }
    }

    protected getGroup(groupType: string, tva: ITvaMain): IGroupInformation | undefined {
        try {
            const groups = tva.ProgramDescription[0].GroupInformationTable[0].GroupInformation;
            const groupMap = new Map<string, IGroupInformation>(
                groups.map((group) => [
                    group.GroupType[0].$.value,
                    group,
                ] as [string, IGroupInformation]),
            );

            return groupMap.get(groupType);
        } catch (e) {
            return undefined;
        }
    }

    private getTitlesFromBasicDescription(desc: IBasicDescription): string {
        if (typeof desc.Title[0] === "string") {
            return desc.Title[0] as string;
        }

        let concatenated = "";
        const descTitles: Array<IMdsTitle | string> = desc.Title;
        descTitles.forEach((title) => {
            if (typeof title === "string") {
                concatenated += title + " ";
            } else if (title && title._) {
                concatenated += title._ + " ";
            }
        });

        return concatenated.trim();
    }
}
