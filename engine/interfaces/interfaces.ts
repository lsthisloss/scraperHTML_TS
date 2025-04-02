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
    counter: number;
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

export interface IServiceProvider<T> {
    fetchHtml(url: string): Promise<string>;
    parseHtml(html: string): Promise<cheerio.Root>;
    downloadFile(link: string, outputPath: string): Promise<void>;
    fileExists(filePath: string): Promise<boolean>;
    serializeToFile(item: T, directory: string): Promise<void>;
    createDirectory(path: string): Promise<void>;
}