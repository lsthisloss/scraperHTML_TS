import axios from 'axios';
import * as cheerio from 'cheerio';
import { saveCataloguesToFile } from './utils/utils';
import { downloadPdf } from './utils/pdfProcessor';
import { filesCount } from './utils/utils';
import { Logger } from './utils/logger';
import { Catalog } from './utils/interfaces';

export class CatalogScraper {
    private url: string;
    private directoryPath: string;

    constructor(url: string, directoryPath: string) {
        this.url = url;
        this.directoryPath = directoryPath;
    }

    async scrape(): Promise<void> {
        try {
            const html = await this.fetchCatalogs();
            const catalogs = this.parseCatalogs(html);

            await saveCataloguesToFile({ catalogues: catalogs }, 'catalogues.json');
            Logger.log(`Total catalogs: ${catalogs.length}`);

            await this.downloadCatalogs(catalogs);

            const totalPdfFiles = await filesCount(this.directoryPath);
            Logger.log(`Total PDF files downloaded: ${totalPdfFiles} out of ${catalogs.length}`);
        } catch (error) {
            Logger.error(`Error during scraping:`, error);
        }
    }

    private async fetchCatalogs(): Promise<string> {
        try {
            const response = await axios.get(this.url, { timeout: 30000 });
            return response.data; 
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

    private async downloadCatalogs(catalogs: Catalog[]): Promise<void> {
        for (const catalog of catalogs) {
            try {
                Logger.log(`Downloading ${catalog.name} ...`);
                const filename = `${this.directoryPath}/${catalog.name}.pdf`;
                await downloadPdf(catalog.link, filename);
            } catch (error) {
                Logger.error(`Failed to download ${catalog.name}:`, error);
            }
        }
    }
}