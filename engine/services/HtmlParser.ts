import * as cheerio from 'cheerio';
import { IHtmlParser } from '../interfaces/interfaces';
import { Logger } from '../utils/logger';

export class HtmlParser implements IHtmlParser {
    parse(html: string): cheerio.Root {
        try {
        if (!html) {
            throw new Error('HTML content is empty');
        }
        if (typeof html !== 'string') {
            throw new Error('HTML content is not a string');
        }
        return cheerio.load(html); }
        catch (error) {
            Logger.error('Error parsing HTML:', error);
            throw error;
        }
    }
}