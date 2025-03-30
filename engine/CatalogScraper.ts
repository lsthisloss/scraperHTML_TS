import { promises as fs } from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { downloadPdfWithProgress } from './pdfProcessor';
import { Catalog, IScraper } from '../interfaces/interfaces';
import { filesDirectoryCount } from '../utils/utils';
import { createDirectory } from '../utils/utils';

export class CatalogScraper implements IScraper<Catalog> {

    private _url: string;
    private _directoryPath: string;
    private _catalogs: Catalog[] = [];
    private _html: string = '';
    private isDebugEnabled: boolean = true; 

    set url(url: string) { this._url = url; }
    set directory(directoryPath: string) { this._directoryPath = directoryPath; }
    set parsedContent(catalogs: Catalog[]) { this._catalogs = catalogs; }
    set html(html: string) { this._html = html; }

    get url(): string { return this._url; }
    get directory(): string { return this._directoryPath; }
    get parsedContent(): Catalog[] { return this._catalogs; }
    get html(): string { return this._html; }
    get counter(): number { return this._catalogs.length; }
    get catalogs(): Catalog[] { return this._catalogs; }

    enableDebug(): void { this.isDebugEnabled = true;}
    disableDebug(): void {  this.isDebugEnabled = false; }
    private log(...args: any[]): void { if (this.isDebugEnabled) { console.log(...args); } }
    private error(...args: any[]): void { if (this.isDebugEnabled) { console.error(...args); }}

    constructor(url: string, directoryPath: string, isDebugEnabled: boolean = true) {
        this.isDebugEnabled = isDebugEnabled;
        this._catalogs = [];
        this._html = '';
        this._url = url;
        this._directoryPath = directoryPath;
    }

    async run(): Promise<void> {
        try {
            await this.init();
            await this.fetchContent();
            await this.scrape();
            await this.serialize();
            await this.download();
            const totalPdfFiles = await filesDirectoryCount(this.directory, `.pdf`);
            if (totalPdfFiles === this.counter) {
                this.log(`Work is done!`);
            }
            else {
                this.log(`Some of catalogs were not downloaded`);
            }
        } catch (error) {
            this.error(`Error in run method:`, error);
        }
    }

    async init(): Promise<void> {
        try {
            await createDirectory(this.directory);
            this.log(`Directory ${this.directory} created successfully.`);
        } catch (error) {
            this.error(`Failed to create directory:`, error);
        }
    }

    async fetchContent(): Promise<void> {
        try {
            const response = await axios.get(this.url, { timeout: 30000 });
            this.html = response.data; 
        } catch (error) {
            this.error(`Error fetching content from URL:`, error);
            throw error;
        }
    }

    async scrape(): Promise<void> {
        try {
            this.parsedContent = this.parseCatalogs(this.html);
            this.log(`Total catalogs found: ${this.counter}`);
        } catch (error) {
            this.error(`Error during scraping:`, error);
        }
    }

    async serialize(): Promise<void> {
        try {
            const cataloguesJson = JSON.stringify(this.parsedContent, null, 2); 
            const filePath = `${this.directory}/catalogs.json`; 
            await fs.writeFile(filePath, cataloguesJson); 
            this.log(`Successfully saved to catalogs.json`);
        } catch (error) {
            this.error(`Failed to save catalogues to file:`, error);
            throw error;
        }
    }

    async download(): Promise<void> {
        const fileCount = await filesDirectoryCount(this.directory, `.pdf`);
        if (fileCount > 0) {
            this.log(`Found ${fileCount} existing PDF files in the directory.`);
            return;
        }
        if (this.counter === 0) {
            this.log(`No catalogs to download.`);
            return;
        }
    
        for (const catalog of this.parsedContent) {
            try {
                if (!catalog.name) {
                    this.log(`No name found for catalog`);
                    continue;
                }
                if (!catalog.validity) {
                    this.log(`No validity found for ${catalog.name}`);
                    continue;
                }
                if (!catalog.link) {
                    this.log(`No link found for ${catalog.name}`);
                    continue;
                }
                if (catalog.link.startsWith('/')) {
                    catalog.link = `https://www.tus.si${catalog.link}`;
                }
                this.log(`Downloading ${catalog.name}.pdf ...`);
                const filename = `${this.directory}/${catalog.name}.pdf`;
                await downloadPdfWithProgress(catalog.link, filename);
            } catch (error) {
                this.error(`Failed to download ${catalog.name}:`, error);
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
            this.error(`Error parsing catalogs:`, error);
            return [];
        }
    }
}