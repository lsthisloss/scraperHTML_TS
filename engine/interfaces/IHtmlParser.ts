export interface IHtmlParser<T> {
    parse(html: string): cheerio.Root; 
}