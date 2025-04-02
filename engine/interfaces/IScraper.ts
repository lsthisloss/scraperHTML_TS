export interface IScraper<T> {
    url: string;
    directory: string;
    content: T[];
    html: string;
    counter: number;
    debug: boolean;
    log(...args: any[]): void;
    error(message: string, ...error: any[]): void;
}
