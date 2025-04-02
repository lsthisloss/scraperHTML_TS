import { BaseScraper } from './BaseScraper';
import { ICatalogScraper, ICatalog } from '../interfaces/interfaces';
import { ServiceProvider } from '../services/ServiceProvider';

export class CatalogScraper extends BaseScraper<ICatalog> implements ICatalogScraper {
    private _catalogService: ServiceProvider<ICatalog>;
    private _failedDownloads: ICatalog[] = [];

    constructor(url: string, directoryPath: string, debug: boolean) {
        super(url, directoryPath, debug);
        this._catalogService = new ServiceProvider();
    }

    async init(): Promise<void> {
        try {
            await this._catalogService.createDirectory(this.directory);
            this.log(`Directory ${this.directory} created successfully.`);
        } catch (error) {
            this.error(`Failed to initialize directory: ${this.directory}`, error);
        }
    }

    async run(): Promise<void> {
        try {
            await this.init();
            await this.fetchContent();
            await this.scrape();
            await this.downloadCatalog();

            if (this._failedDownloads.length > 0) {
                this.log(`Retrying ${this._failedDownloads.length} failed downloads...`);
                await this.retry(this._failedDownloads);
            }

            this.log(`Scraping process completed successfully.`);
        } catch (error) {
            this.error('An error occurred during the scraping process:', error);
        }
    }

    async retry(failedDownloads: ICatalog[]): Promise<void> {
        const remainingFailures: ICatalog[] = [];
        for (const catalog of failedDownloads) {
            try {
                let outputPath = `${this.directory}/${catalog.name.replace(/\s+/g, '_')}.pdf`;

                while (await this._catalogService.fileExists(outputPath)) {
                    const randomSuffix = Math.random().toString(36).substring(5, 10);
                    const baseName = catalog.name.replace(/\s+/g, '_');
                    outputPath = `${this.directory}/${baseName}_${randomSuffix}.pdf`;
                }

                await this._catalogService.downloadFile(catalog.link, outputPath);
                this.log(`Retried and downloaded catalog: ${catalog.name}`);
            } catch (error) {
                remainingFailures.push(catalog);
                this.error(`Failed to retry download for catalog: ${catalog.name}`, error);
            }
        }

        this._failedDownloads = remainingFailures;
        if (remainingFailures.length > 0) {
            this.log(`Failed to download ${remainingFailures.length} catalogs after retrying.`);
        }
    }

    async fetchContent(): Promise<string> {
        try {
            const html = await this._catalogService.fetchHtml(this.url);
            this.log(`Fetched content from ${this.url}`);
            this.html = html;
            return html;
        } catch (error) {
            this.error(`Failed to fetch content from ${this.url}`, error);
            throw error;
        }
    }

    async scrape(): Promise<void> {
        try {
            const $ = await this._catalogService.parseHtml(this.html);
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

    async downloadCatalog(catalogs: ICatalog[] = this.content): Promise<void> {
        for (const catalog of catalogs) {
            try {
                let outputPath = `${this.directory}/${catalog.name.replace(/\s+/g, '_')}.pdf`;

                while (await this._catalogService.fileExists(outputPath)) {
                    const randomSuffix = Math.random().toString(36).substring(5, 10);
                    const baseName = catalog.name.replace(/\s+/g, '_');
                    outputPath = `${this.directory}/${baseName}_${randomSuffix}.pdf`;
                }
                await this._catalogService.downloadFile(catalog.link, outputPath);
                await this._catalogService.serializeToFile(catalog, this.directory);
            } catch (error) {
                this._failedDownloads.push(catalog);
                this.error(`Failed to download catalog: ${catalog.name}`, error);
            }
        }
    }
}