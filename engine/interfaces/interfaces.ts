export interface ICatalog {
    name: string;
    link: string;
    validity: string;
    filename?: string;
    lastParsed: Date;
}

export interface IScraper<T> {
    url: string;
    directory: string;
    content: T[];
    html: string;
    debug: boolean;
    log(...args: any[]): void;
    error(message: string, ...error: any[]): void;
}

export interface ICatalogScraper extends IScraper<ICatalog> {
    init(): Promise<void>; 
    fetchContent(): Promise<string>;
    scrape(html: string): Promise<void>;
    downloadCatalog(catalogs: ICatalog[]): Promise<void>; 
    run(): Promise<void>; 
    retry(catalogs: ICatalog[]): Promise<void>;
}