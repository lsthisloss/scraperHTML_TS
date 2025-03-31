import { ICatalog } from "./ICatalog";
import { IScraper } from "./IScraper";

export interface ICatalogScraper extends IScraper<ICatalog> {
    init(): Promise<void>; 
    fetchContent(): Promise<string>;
    scrape(html: string): Promise<void>;
    parseCatalogs(html: string): ICatalog[]; 
    serialize(): Promise<void>; 
    download(): Promise<void>; 
    run(): Promise<void>; 
}
