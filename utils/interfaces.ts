export interface Catalog {
    name: string;
    link: string;
    validity: string;
}

export interface IScraper {
    catalogs: Catalog[];
    getCatalogsCount: Number;
    getDirectoryPath: string;

    scrapeCatalogs(): Promise<void>;
    downloadCatalogs(): Promise<void>;
    saveCatalogsToFile(): Promise<void>;
}