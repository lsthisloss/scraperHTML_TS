import { AxiosResponse } from "axios";

export interface Catalog {
    name: string;
    link: string;
    validity: string;
}

export interface IScraper<T> {
    url: string;
    html: string;
    parsedContent: T[];
    count: Number;
    directory: string;

    fetchContent(): Promise<void>
    scrape(): Promise<void>;
    serialize(): Promise<void>;
    download(): Promise<void>;
}