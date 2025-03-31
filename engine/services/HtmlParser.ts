import * as cheerio from 'cheerio';
import { IHtmlParser } from '../interfaces/IHtmlParser';

export class HtmlParser implements IHtmlParser<cheerio.Root> {
    parse(html: string): cheerio.Root {
        return cheerio.load(html); 
    }
}