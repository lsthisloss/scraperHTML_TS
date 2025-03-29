import { CatalogScraper } from './CatalogScraper';
import { createDirectory, filesCount } from './utils/utils';
import { Logger } from './utils/logger';

Logger.enable();

const directoryPath: string = './downloads';
const catalogUrl: string = 'https://www.tus.si/aktualno/katalogi-in-revije/';

async function main(): Promise<void> {
    try {
        await createDirectory(directoryPath);
        const Scraper = new CatalogScraper(catalogUrl, directoryPath);

        await Scraper.scrapeCatalogs();
        Logger.log(`Total catalogs found: ${Scraper.getCatalogsCount}`);
        await Scraper.saveCatalogsToFile();
        Logger.log(`Successfully saved to ${Scraper.getDirectoryPath}/catalogs.json`);
        await Scraper.downloadCatalogs();
        
        const totalPdfFiles = await filesCount(Scraper.getDirectoryPath);
        Logger.log(`Total PDF files downloaded: ${totalPdfFiles} out of ${Scraper.getCatalogsCount}`);
        if (totalPdfFiles === Scraper.getCatalogsCount) {
            Logger.log(`Work is done!`);
        }
        else {
            Logger.log(`Some of catalogs were not downloaded`);
        }
    } catch (error) {
        Logger.error(`An error occurred in main():`, error);
    }
}

main();