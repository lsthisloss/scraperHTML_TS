import { CatalogScraper } from './engine/CatalogScraper';
import { Logger } from './utils/logger';

const directoryPath: string = './downloads';
const catalogUrl: string = 'https://www.tus.si/aktualno/katalogi-in-revije/';

/**
 * CatalogScraper:
 * - Implements the ICatalogScraper interface, which defines catalog-specific methods.
 * - Extends the BaseScraper class, inheriting shared functionality.
 */

async function main(): Promise<void> {
    try {
        Logger.enable();
        const Scraper = new CatalogScraper(catalogUrl, directoryPath, true);
        await Scraper.run();
    } catch (error) {
        Logger.error(`An error occurred:`, error);
    }
}

main();