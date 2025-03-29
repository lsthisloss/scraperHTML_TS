import { CatalogScraper } from './CatalogScraper';
import { createDirectory, filesCount } from './utils/utils';
import { Logger } from './utils/logger';

const directoryPath: string = './downloads';
const catalogUrl: string = 'https://www.tus.si/aktualno/katalogi-in-revije/';
Logger.enable();
async function main(): Promise<void> {
    try {
        await createDirectory(directoryPath);
        const Scraper = new CatalogScraper(catalogUrl, directoryPath);
        
        Logger.log(`Starting the scraper...`);
        await Scraper.fetchContent();
        await Scraper.scrape();
        Logger.log(`Total catalogs found: ${Scraper.count}`);

        await Scraper.serialize();
        Logger.log(`Successfully saved to catalogs.json`);

        await Scraper.download();
        const totalPdfFiles = await filesCount(directoryPath);
        Logger.log(`Total PDF files downloaded: ${totalPdfFiles} out of ${Scraper.count}`);
        
        if (totalPdfFiles === Scraper.count) {
            Logger.log(`Work is done!`);
        }
        else {
            Logger.log(`Some of catalogs were not downloaded`);
        }

    } catch (error) {
        Logger.error(`An error occurred:`, error);
    }
}

main();