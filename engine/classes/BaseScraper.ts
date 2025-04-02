import { IScraper } from '../interfaces/interfaces';

export abstract class BaseScraper<T> implements IScraper<T> {
    private _url: string;
    private _directoryPath: string;
    private _debug: boolean;
    private _content: T[] = []; 
    private _html: string = '';

    constructor(url: string, directoryPath: string, debug: boolean = true) {

        this._url = url;
        this._directoryPath = directoryPath;
        this._debug = debug;
    }

    set content(content: T[]) { this._content = content; }
    set html(html: string) { this._html = html; }
    set url(url: string) { this._url = url; }
    set directory(directoryPath: string) { this._directoryPath = directoryPath; }
    set debug(debug: boolean) { this._debug = debug; }

    get content(): T[] { return this._content; }
    get html(): string { return this._html; }
    get url(): string { return this._url; }
    get directory(): string { return this._directoryPath; }
    get debug(): boolean { return this._debug; }

    log(...args: any[]): void { if (this._debug) { console.log(...args); } }
    error(message: string, ...error: any[]): void { 
        if (this._debug) { 
            const firstError = error[0] instanceof Error 
                ? error[0] 
                : new Error(error[0] ? String(error[0]) : message);
    
            console.error(message, firstError);
            throw firstError;
        }
    }}
