import { CatalogScraper } from './CatalogScraper';
import { createDirectory } from './utils/utils';
import { Logger } from './utils/logger';

Logger.enable();

const directoryPath: string = './Catalogues';
const catalogUrl: string = 'https://www.tus.si/aktualno/katalogi-in-revije/';

async function main(): Promise<void> {
    try {
        await createDirectory(directoryPath);
        const scraper = new CatalogScraper(catalogUrl, directoryPath);
        await scraper.scrape();
        Logger.log(`Work is done!`);
    } catch (error) {
        Logger.error(`An error occurred in main():`, error);
    }
}

main();