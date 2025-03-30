export interface Catalog {
    name: string;
    link: string;
    validity: string;
}

export interface IScraper<T> {
    url: string;
    directory: string;
    content: T[];
    html: string;
    counter: number;
    
    enableDebug(): void;
    disableDebug(): void;
    run(): Promise<void>;
    init(): Promise<void>;
    fetchContent(): Promise<string>
    scrape(html: string): Promise<void>;
    serialize(): Promise<void>;
    download(): Promise<void>;
}
