import { promises as fs } from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { downloadPdfWithProgress } from './utils/pdfProcessor';
import { Logger } from './utils/logger';
import { Catalog, IScraper } from './utils/interfaces';

export class CatalogScraper implements IScraper<Catalog> {
    private _url: string;
    private _directoryPath: string;
    private _catalogs: Catalog[] = [];
    private _html: string = '';

    set url(url: string) { this._url = url; }
    set directory(directoryPath: string) { this._directoryPath = directoryPath; }
    set parsedContent(catalogs: Catalog[]) { this._catalogs = catalogs; }
    set html(html: string) { this._html = html; }

    get url(): string { return this._url; }
    get directory(): string { return this._directoryPath; }
    get parsedContent(): Catalog[] { return this._catalogs; }
    get html(): string { return this._html; }
    get counter(): number { return this._catalogs.length; }

    constructor(url: string, directoryPath: string) {
        this._url = url;
        this._directoryPath = directoryPath;
    }

    async fetchContent(): Promise<void> {
        try {
            const response = await axios.get(this.url, { timeout: 30000 });
            this.html = response.data; 
        } catch (error) {
            Logger.error(`Error fetching content from URL:`, error);
            throw error;
        }
    }

    async scrape(): Promise<void> {
        try {
            this.parsedContent = this.parseCatalogs(this.html);
        } catch (error) {
            Logger.error(`Error during scraping:`, error);
        }
    }

    async serialize(): Promise<void> {
        try {
            const cataloguesJson = JSON.stringify(this.parsedContent, null, 2); 
            const filePath = `${this.directory}/catalogs.json`; 
            await fs.writeFile(filePath, cataloguesJson); 
        } catch (error) {
            Logger.error(`Failed to save catalogues to file:`, error);
            throw error;
        }
    }

    async download(): Promise<void> {
        for (const catalog of this.parsedContent) {
            try {
                if (!catalog.link) {
                    Logger.log(`No link found for ${catalog.name}`);
                    continue;
                }
                Logger.log(`Downloading ${catalog.name}.pdf ...`);
                const filename = `${this.directory}/${catalog.name}.pdf`;
                await downloadPdfWithProgress(catalog.link, filename);
            } catch (error) {
                Logger.error(`Failed to download ${catalog.name}:`, error);
            }
        }
    }
  
    private parseCatalogs(html: string): Catalog[] {
        try {
            const $ = cheerio.load(html);
            const catalogs: Catalog[] = [];
    
            $('.catalogues-grid .list-item').each((index, element) => {
                const catalog: Catalog = {
                    name: $(element).find('h3').text().trim(),
                    link: $(element).find('.pdf').attr('href') || '',
                    validity: $(element).find('p').text().trim(),
                };
                if (catalog.name && catalog.link && catalog.validity) {
                    catalogs.push(catalog);
                }
            });
    
            return catalogs;
        } catch (error) {
            Logger.error(`Error parsing catalogs:`, error);
            return []; 
        }
    }
}