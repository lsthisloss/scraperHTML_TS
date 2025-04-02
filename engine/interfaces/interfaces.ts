export interface ISerializer<T> {
    serialize(item: T, directory: string): Promise<void>;
}

export interface IHttpClient {
    get(url: string): Promise<string>;
}

export interface IHtmlParser {
    parse(html: string): cheerio.Root; 
}

export interface IFileManager {
    createDirectory(path: string): Promise<void>;
    writeFile(path: string, data: string): Promise<void>;
    readFile(path: string): Promise<string>;
    fileExists(path: string): Promise<boolean>;
}

export interface IFileDownloader {
    downloadFile(link: string, outputPath: string): Promise<void>;
}

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

export interface ICatalogService {
    fetchHtml(url: string): Promise<string>;
    parseHtml(html: string): Promise<cheerio.Root>;
    downloadFile(link: string, outputPath: string): Promise<void>;
    fileExists(filePath: string): Promise<boolean>;
    serializeCatalog(catalog: ICatalog, directory: string): Promise<void>;
    createDirectory(path: string): Promise<void>;
}