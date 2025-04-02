import { BaseScraper } from './BaseScraper';
import { IHttpClient } from '../interfaces/IHttpClient';
import { IFileManager } from '../interfaces/IFileManager';
import { IHtmlParser } from '../interfaces/IHtmlParser';
import { ICatalog } from '../interfaces/ICatalog';
import { downloadPdfWithProgress } from '../utils/pdfProcessor';
import * as path from 'path';

export class CatalogScraper extends BaseScraper<ICatalog> {
    private _httpClient: IHttpClient;
    private _fileManager: IFileManager;
    private _htmlParser: IHtmlParser<ICatalog>;
    private _failedDownloads: ICatalog[] = [];
    
    set httpClient(httpClient: IHttpClient) { this._httpClient = httpClient; }
    set fileManager(fileManager: IFileManager) { this._fileManager = fileManager; }
    set htmlParser(htmlParser: IHtmlParser<ICatalog>) { this._htmlParser = htmlParser; }
    set failedDownloads(failedDownloads: ICatalog[]) { this._failedDownloads = failedDownloads; }
    
    get httpClient(): IHttpClient { return this._httpClient; }
    get fileManager(): IFileManager { return this._fileManager; }
    get htmlParser(): IHtmlParser<ICatalog> { return this._htmlParser; }
    get failedDownloads(): ICatalog[] { return this._failedDownloads; }

    constructor(
        url: string,
        directoryPath: string,
        debug: boolean,
        httpClient: IHttpClient,
        fileManager: IFileManager,
        htmlParser: IHtmlParser<ICatalog>
    ) {
        super(url, directoryPath, debug);
        this._httpClient = httpClient;
        this._fileManager = fileManager;
        this._htmlParser = htmlParser;
    }


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
        this.html = await this._httpClient.get(this.url);
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
            this.log(`Total catalogs found: ${this.content.length}`);           
            await this.download();
            if (this.failedDownloads.length > 0) {
                this.log(`Retrying ${this.failedDownloads.length} failed downloads...`);
                await this.retry(this.failedDownloads);
            }
            this.log(`Downloaded: ${this.counter - this.failedDownloads.length} catalogs.`);
            this.log(`All catalogs have been processed.`);
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
            const $ = this._htmlParser.parse(this.html); 
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
        } catch (error) {
            this.error(`Error scraping catalogs:`, error);
        }
    }

    async serialize(catalog: ICatalog): Promise<void> {
        const catalogsFilePath = path.join(this.directory, 'catalogs.json');
    
        try {
            const fileExists = await this.fileManager.fileExists(catalogsFilePath);
            if (!fileExists) {
                await this.fileManager.writeFile(catalogsFilePath, JSON.stringify([], null, 2));
            }

            let existingDataString = await this.fileManager.readFile(catalogsFilePath);
            const existingData = JSON.parse(existingDataString);
    
            const newEntry = {
                ...catalog,
                lastParsed: new Date().toISOString(),
            };
    
            const updatedData = [...existingData, newEntry];
    
            await this.fileManager.writeFile(catalogsFilePath, JSON.stringify(updatedData, null, 2));
        } catch (error) {
            this.error(`Failed to serialize catalog "${catalog.name}" to file: ${catalogsFilePath}`, error);
        }
    }

    async download(catalogs: ICatalog[] = this.content): Promise<void> {
        if (catalogs.length === 0) {
            this.log('No catalogs to download.');
            return;
        }
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
                await downloadPdfWithProgress(catalog.link, filePath)
                this.serialize(catalog);
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
