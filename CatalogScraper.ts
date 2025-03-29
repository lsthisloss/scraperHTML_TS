import { promises as fs } from 'fs';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { downloadPdf } from './utils/pdfProcessor';
import { filesCount } from './utils/utils';
import { Logger } from './utils/logger';
import { Catalog } from './utils/interfaces';

export class CatalogScraper {
    private url: string;
    private directoryPath: string;
    private catalogs: Catalog[] = []; 
    private set setCatalogs(catalogs: Catalog[]) {
        this.catalogs = catalogs;
    }
    private get getCatalogs(): Catalog[] {
        return this.catalogs;
    }
    get getCatalogsCount(): Number {
        return this.catalogs.length;
    }
    get getDirectoryPath(): string {
        return this.directoryPath;
    }

    constructor(url: string, directoryPath: string) {
        this.url = url;
        this.directoryPath = directoryPath;
    }

    async scrapeCatalogs(): Promise<void> {
        try {
            const catalogs = await this.fetchCatalogs();
            this.setCatalogs = catalogs;

        } catch (error) {
            Logger.error(`Error during scraping:`, error);
        }
    }
    
    private async fetchCatalogs(): Promise<Catalog[]> {
        try {
            const response = await axios.get(this.url, { timeout: 30000 });
            const html = response.data;
            return this.parseCatalogs(html); 
        } catch (error) {
            Logger.error(`Error fetching catalogs:`, error);
            throw error;
        }
    }

    private parseCatalogs(html: string): Catalog[] {
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
    }

    async downloadCatalogs(): Promise<void> {
        for (const catalog of this.getCatalogs) {
            try {
                Logger.log(`Downloading ${catalog.name} ...`);
                const filename = `${this.directoryPath}/${catalog.name}.pdf`;
                await downloadPdf(catalog.link, filename);
            } catch (error) {
                Logger.error(`Failed to download ${catalog.name}:`, error);
            }
        }
    }

    async saveCatalogsToFile(): Promise<void> {
        try {
            const cataloguesJson = JSON.stringify(this.getCatalogs, null, 2);
            const filePath = `${this.directoryPath}/catalogs.json`;
            await fs.writeFile(filePath, cataloguesJson); 
        } catch (error) {
            Logger.error(`Failed to save catalogues to file:`, error);
            throw error;
        }
    }
    
}