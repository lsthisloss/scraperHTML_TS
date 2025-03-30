export interface IHtmlParser<T> {
    parse(html: string): T[];
}