import { CatalogScraper } from './engine/classes/CatalogScraper';
import { HttpClient } from './engine/services/HttpClient';
import { FileManager } from './engine/services/FileManager';
import { HtmlParser } from './engine/services/HtmlParser';
import { Logger } from './engine/utils/logger';

const directoryPath = './downloads';
const catalogUrl = 'https://www.tus.si/aktualno/katalogi-in-revije/';

async function main(): Promise<void> {
    try {
        Logger.enable();

        const httpClient = new HttpClient();
        const fileManager = new FileManager();
        const htmlParser = new HtmlParser();

        const scraper = new CatalogScraper(
            catalogUrl,
            directoryPath,
            true,
            httpClient,
            fileManager,
            htmlParser
        );
        scraper.run()
    } catch (error) {
        Logger.error('An error occurred:', error);
    }
}

main();