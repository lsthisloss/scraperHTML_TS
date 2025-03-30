import * as cheerio from 'cheerio';
import { IHtmlParser } from '../interfaces/IHtmlParser';
import { ICatalog } from './../interfaces/IScraper';

export class HtmlParser implements IHtmlParser<ICatalog> {
    parse(html: string): ICatalog[] {
        const $ = cheerio.load(html);
        const catalogs: ICatalog[] = [];
        $('.catalogues-grid .list-item').each((index, element) => {
            const catalog: ICatalog = {
                name: $(element).find('h3').text().trim(),
                link: $(element).find('.pdf').attr('href') || '',
                validity: $(element).find('p').text().trim(),
            };
            catalogs.push(catalog);
        });
        return catalogs;
    }
}