import { CatalogScraper } from './classes/CatalogScraper';
import { Logger } from './utils/logger';

async function main(): Promise<void> {
    let directoryPath = './downloads';
    let catalogUrl = 'https://www.tus.si/aktualno/katalogi-in-revije/';
    try {
        Logger.enable();

        const scraper = new CatalogScraper(
            catalogUrl,
            directoryPath,
            true
        );
        await scraper.run()
    } catch (error) {
        Logger.error('An error occurred:', error);
    }
}

main();