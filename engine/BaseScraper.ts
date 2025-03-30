import axios from 'axios';
import { createDirectory } from '../utils/utils';
import { IScraper } from '../interfaces/interfaces';

export abstract class BaseScraper<T> implements IScraper<T> {
    private _url: string;
    private _directoryPath: string;
    private _isDebugEnabled: boolean;
    protected _content: T[] = []; 
    private _html: string = '';
    private _counter: number = 0;

    constructor(url: string, directoryPath: string, isDebugEnabled: boolean = true) {
        this._url = url;
        this._directoryPath = directoryPath;
        this._isDebugEnabled = isDebugEnabled;
    }

    set content(content: T[]) { this._content = content; }
    set html(html: string) { this._html = html; }
    set url(url: string) { this._url = url; }
    set directory(directoryPath: string) { this._directoryPath = directoryPath; }
    set counter(counter: number) { this._counter = counter; }
    set isDebugEnabled(isDebugEnabled: boolean) { this._isDebugEnabled = isDebugEnabled; }

    get content(): T[] { return this._content; }
    get html(): string { return this._html; }
    get url(): string { return this._url; }
    get directory(): string { return this._directoryPath; }
    get counter(): number { return this._counter; }
    get isDebugEnabled(): boolean { return this._isDebugEnabled; }

    enableDebug(): void { this.isDebugEnabled = true;}
    disableDebug(): void {  this.isDebugEnabled = false; }
    log(...args: any[]): void { if (this.isDebugEnabled) { console.log(...args); } }
    error(...args: any[]): void { if (this.isDebugEnabled) { console.error(...args); }}


    async fetchContent(): Promise<string> {
        try {
            const response = await axios.get(this.url, { timeout: 30000 });
            this.log(`Fetched content from ${this.url}`);
            return response.data;
        } catch (error) {
            this.error(`Error fetching content from URL:`, error);
            throw error;
        }
    }

    async init(): Promise<void> {
        try {
            await createDirectory(this.directory);
            this.log(`Directory ${this.directory} created successfully.`);
        } catch (error) {
            this.error(`Failed to create directory:`, error);
            throw error;
        }
    }

    abstract scrape(html: string): Promise<void>;
    abstract serialize(): Promise<void>;
    abstract download(): Promise<void>;
    abstract run(): Promise<void>;
}