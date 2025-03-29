export interface Catalog {
    name: string;
    link: string;
    validity: string;
}

export interface IScraper<T> {
    url: string;
    directory: string;
    parsedContent: T[];
    html: string;
    counter: number;
    fetchContent(): Promise<void>
    scrape(): Promise<void>;
    serialize(): Promise<void>;
    download(): Promise<void>;
}