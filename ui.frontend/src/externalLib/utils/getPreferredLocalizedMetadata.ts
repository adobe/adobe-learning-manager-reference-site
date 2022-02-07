
const DEFAULT_LOCALE = "en-US";

export function getPreferredLocalizedMetadata<T>(localizedMetadata: T[], locale: string): T {

    if (!localizedMetadata) {
        //TO DO: need to hanlde this 
        return {} as T
    }
    let data = localizedMetadata.find(
        (item: any) => item.locale === locale
    );

    return (
        data ||
        localizedMetadata.find(
            (item: any) => item.locale === DEFAULT_LOCALE
        )! ||
        localizedMetadata[0]
    );
}