import { ICatalog } from "./ICatalog";
import { IScraper } from "./IScraper";
import { IHttpClient } from "./IHttpClient";
import { IFileManager } from "./IFileManager";
import { IHtmlParser } from "./IHtmlParser";

export interface ICatalogScraper extends IScraper<ICatalog> {
    httpClient: IHttpClient;
    fileManager: IFileManager;
    htmlParser: IHtmlParser<cheerio.Root>;
    failedDownloads: ICatalog[];
    init(): Promise<void>; 
    fetchContent(): Promise<string>;
    scrape(html: string): Promise<void>;
    parseCatalogs(html: string): ICatalog[]; 
    serialize(): Promise<void>; 
    download(): Promise<void>; 
    run(): Promise<void>; 
}
