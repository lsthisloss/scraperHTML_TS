import * as cheerio from 'cheerio';
import { IHtmlParser } from '../interfaces/IHtmlParser';

export class HtmlParser implements IHtmlParser<cheerio.Root> {
    parse(html: string): cheerio.Root {
        if (!html) {
            throw new Error('HTML content is empty');
        }
        if (typeof html !== 'string') {
            throw new Error('HTML content is not a string');
        }
        return cheerio.load(html); 
    }
}