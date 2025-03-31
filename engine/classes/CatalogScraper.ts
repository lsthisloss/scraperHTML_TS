import { BaseScraper } from './BaseScraper';
import { IHttpClient } from '../interfaces/IHttpClient';
import { IFileManager } from '../interfaces/IFileManager';
import { IHtmlParser } from '../interfaces/IHtmlParser';
import { ICatalog } from '../interfaces/ICatalog';
import { filesDirectoryCount } from '../utils/utils';
import { downloadPdfWithProgress } from '../utils/pdfProcessor';

export class CatalogScraper extends BaseScraper<ICatalog> {
    private httpClient: IHttpClient;
    private fileManager: IFileManager;
    private htmlParser: IHtmlParser<ICatalog>;

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

    async init(): Promise<void> {
        try {
            await this.fileManager.createDirectory(this.directory);
            this.log(`Directory ${this.directory} created successfully.`);
        } catch (error) {
            this.error(`Failed to initialize directory: ${this.directory}`, error);
            throw error;
        }
    }
    
    async serialize(): Promise<void> {
        try {
            const filePath = `${this.directory}/catalogs.json`;
            const data = JSON.stringify(this.content, null, 2);
            await this.fileManager.writeFile(filePath, data);
            this.log(`Successfully saved to ${filePath}`);
        } catch (error) {
            this.error(`Failed to serialize data to file: ${this.directory}/catalogs.json`, error);
        }
    }

    async fetchContent(): Promise<string> {
        try {
        const html = await this.httpClient.get(this.url);
        this.error(`Fetched content from ${this.url}`);
        return html;
        }
        catch (error) {
            this.error(`Failed to fetch content from ${this.url}`, error);
            throw error;
        }
    }

    async run(): Promise<void> {
        try {
            await this.init();
            const html = await this.fetchContent();
            await this.scrape(html);
            await this.serialize();
            await this.download();
            const fileCount = await filesDirectoryCount(this.directory, '.pdf');
            if (fileCount == this.counter) {
                this.log('Work is done!');
            }
            else {
                this.log('Work is not done!');
                this.log(`Expected ${this.counter} files, but found ${fileCount}.`);
            }
        } catch (error) {
            this.error('An error occurred during the scraping process:', error);
        }
    }

    async scrape(html: string): Promise<void> {
        try {
        const $ = this.htmlParser.parse(html); 
        const catalogs: ICatalog[] = [];
    
        $('.catalogues-grid .list-item').each((index: number, element: cheerio.Element) => {
            const catalog: ICatalog = {
                name: $(element).find('h3').text().trim(),
                link: $(element).find('.pdf').attr('href') || '',
                validity: $(element).find('p').text().trim(),
            };
            catalogs.push(catalog);
        });
        this.content = catalogs; 
        this.log(`Total catalogs found: ${this.content.length}`);
        } catch (error) {
            this.error(`Error scraping catalogs:`, error);
            throw error;    
        }
    }

    async download(): Promise<void> {
        const fileCount = await filesDirectoryCount(this.directory, `.pdf`);
        if (fileCount > 0) {
            this.log(`Found ${fileCount} existing PDF files in the directory.`);
            return;
        }
        if (this.content.length === 0) {
            this.log(`No catalogs to download.`);
            return;
        }
        for (const catalog of this.content) {
            try {               
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
                this.log(`Failed to download ${catalog.name}:`, error);
            }
        }
    }
}