import { BaseScraper } from './BaseScraper';
import { IHttpClient } from '../interfaces/IHttpClient';
import { IFileManager } from '../interfaces/IFileManager';
import { IHtmlParser } from '../interfaces/IHtmlParser';
import { ICatalog } from '../interfaces/ICatalog';
import { downloadPdfWithProgress } from '../utils/pdfProcessor';
import * as path from 'path';

export class CatalogScraper extends BaseScraper<ICatalog> {
    private httpClient: IHttpClient;
    private fileManager: IFileManager;
    private htmlParser: IHtmlParser<ICatalog>;
    private _failedDownloads: ICatalog[] = [];
    
    constructor(
        url: string,
        directoryPath: string,
        isDebugEnabled: boolean,
        httpClient: IHttpClient,
        fileManager: IFileManager,
        htmlParser: IHtmlParser<ICatalog>
    ) {
        super(url, directoryPath, isDebugEnabled);
        this.httpClient = httpClient;
        this.fileManager = fileManager;
        this.htmlParser = htmlParser;
    }
    get failedDownloads(): ICatalog[] { return this._failedDownloads; }
    set failedDownloads(failedDownloads: ICatalog[]) { this._failedDownloads = failedDownloads; }

    async init(): Promise<void> {
        try {
            await this.fileManager.createDirectory(this.directory);
            this.log(`Directory ${this.directory} created successfully.`);
        } catch (error) {
            this.error(`Failed to initialize directory: ${this.directory}`, error);
        }
    }

    async fetchContent(): Promise<void> {
        try {
        this.html = await this.httpClient.get(this.url);
        this.log(`Fetched content from ${this.url}`);
        }
        catch (error) {
            this.error(`Failed to fetch content from ${this.url}`, error);
        }
    }

    async run(): Promise<void> {
        try {
            await this.init();
            await this.fetchContent();
            await this.scrape();   
            await this.download();
            if (this.failedDownloads.length > 0) {
                this.log(`Retrying ${this.failedDownloads.length} failed downloads...`);
                await this.retry(this.failedDownloads);
            }
            this.log(`All catalogs have been processed.`);
            this.log(`Downloaded: ${this.counter - this.failedDownloads.length} catalogs successfully.`);
            if (this.failedDownloads.length > 0) {
                this.log(`Failed to download ${this.failedDownloads.length} catalogs.`);
            }
            this.log(`Scraping process finished.`);
        } catch (error) {
            this.error('An error occurred during the scraping process:', error);
        }
    }

    async scrape(): Promise<void> {
        try {
            const $ = this.htmlParser.parse(this.html); 
            const catalogs: ICatalog[] = [];
        
            $('.catalogues-grid .list-item').each((index: number, element: cheerio.Element) => {
                const catalog: ICatalog = {
                    name: $(element).find('h3').text().trim(),
                    link: $(element).find('.pdf').attr('href') || '',
                    validity: $(element).find('p').text().trim(),
                    lastParsed: new Date(),
                };
                catalogs.push(catalog);
            });
            this.content = catalogs; 
            this.log(`Total catalogs found: ${this.content.length}`);
        } catch (error) {
            this.error(`Error scraping catalogs:`, error);
        }
    }

    async serialize(catalog: ICatalog): Promise<void> {
        const catalogsFilePath = path.join(this.directory, 'catalogs.json');
    
        try {
            const fileExists = await this.fileManager.fileExists(catalogsFilePath);
            let existingDataString = '[]'; 

            if (fileExists) {
                existingDataString = await this.fileManager.readFile(catalogsFilePath);
            } else {
                this.log(`File ${catalogsFilePath} does not exist. Creating a new one.`);
            }
            const existingData = JSON.parse(existingDataString);
    
            const newEntry = {
                ...catalog,
                lastParsed: new Date().toISOString(),
            };
    
            const updatedData = [...existingData, newEntry];
    
            await this.fileManager.writeFile(catalogsFilePath, JSON.stringify(updatedData, null, 2));
            this.log(`Successfully appended catalog "${catalog.name}" to catalogs.json.`);
        } catch (error) {
            this.error(`Failed to serialize catalog "${catalog.name}" to file: ${catalogsFilePath}`, error);
        }
    }

    async download(catalogs: ICatalog[] = this.content): Promise<void> {
    
        for (const catalog of catalogs) {
            try {
                if (!catalog.link) {
                    this.log(`No link found for ${catalog.name}`);
                    this.failedDownloads.push(catalog);
                    continue;
                }
                if (catalog.link.startsWith('/')) {
                    catalog.link = `https://www.tus.si${catalog.link}`;
                }
    
                let filename = `${catalog.name}.pdf`;
                let filePath = path.join(this.directory, filename);
    
                while (await this.fileManager.fileExists(filePath)) {
                    const randomSuffix = Math.random().toString(36).substring(5, 10);
                    filename = `${catalog.name}_${randomSuffix}.pdf`;
                    filePath = path.join(this.directory, filename);
                }
                catalog.filename = filename;
    
                this.log(`Downloading ${filename} ...`);
                await downloadPdfWithProgress(catalog.link, filePath).then(async () => {
                    this.log(`Downloaded ${filename} successfully.`);
                    await this.serialize(catalog);
                }).catch((error) => {
                    this.error(`Failed to download ${filename}:`, error);
                    this.failedDownloads.push(catalog);
                });
            } catch (error) {
                this.error(`Failed to download catalog "${catalog.name}":`, error);
                this.failedDownloads.push(catalog);
            }
        }
    }
    
    async retry(failedDownloads: ICatalog[]): Promise<void> {
        if (failedDownloads.length === 0) {
            this.log('No failed downloads to retry.');
            return;
        }
    
        this.log(`Retrying download for ${failedDownloads.length} failed catalogs...`);
        this.download(failedDownloads);
    }
}


