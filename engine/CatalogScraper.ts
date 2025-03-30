import * as cheerio from 'cheerio';
import { promises as fs } from 'fs';
import { downloadPdfWithProgress } from './pdfProcessor';
import { Catalog } from '../interfaces/interfaces';
import { filesDirectoryCount } from '../utils/utils';
import { BaseScraper } from './BaseScraper';

export class CatalogScraper extends BaseScraper<Catalog> {
    async scrape(html: string): Promise<void> {
        try {
            this.content = this.parseCatalogs(html);
            this.log(`Total catalogs found: ${this.content.length}`);
        } catch (error) {
            this.error(`Error during scraping:`, error);
            throw error;
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

    async serialize(): Promise<void> {
        try {
            const cataloguesJson = JSON.stringify(this.content, null, 2);
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
                this.error(`Failed to download ${catalog.name}:`, error);
            }
        }
    }

    async run(): Promise<void> {
        try {
            await this.init();
            const html = await this.fetchContent();
            await this.scrape(html);
            await this.serialize();
            await this.download();
            this.log('Scraping completed successfully!');
        } catch (error) {
            this.error('An error occurred during the scraping process:', error);
        }
    }
}