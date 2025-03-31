export interface IScraper<T> {
    url: string;
    directory: string;
    content: T[];
    html: string;
    counter: number;
    enableDebug(): void;
    disableDebug(): void;
}
