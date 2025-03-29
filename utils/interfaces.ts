export interface Catalog {
    name: string;
    link: string;
    validity: string;
}

export interface IScraper<T> {
    url: string;
    html: string;
    parsedContent: T[];
    count: number;
    directory: string;

    fetchContent(): Promise<void>
    scrape(): Promise<void>;
    serialize(): Promise<void>;
    download(): Promise<void>;
}