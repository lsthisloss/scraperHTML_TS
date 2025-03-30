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
    enableDebug(): void;
    disableDebug(): void;
    run(): Promise<void>;
    init(): Promise<void>;
    fetchContent(): Promise<void>
    scrape(): Promise<void>;
    serialize(): Promise<void>;
    download(): Promise<void>;
}