import { IScraper } from '../interfaces/IScraper';

export abstract class BaseScraper<T> implements IScraper<T> {
    private _url: string;
    private _directoryPath: string;
    private _isDebugEnabled: boolean;
    private _content: T[] = []; 
    private _html: string = '';

    constructor(url: string, directoryPath: string, isDebugEnabled: boolean = true) {

        this._url = url;
        this._directoryPath = directoryPath;
        this._isDebugEnabled = isDebugEnabled;
    }

    set content(content: T[]) { this._content = content; }
    set html(html: string) { this._html = html; }
    set url(url: string) { this._url = url; }
    set directory(directoryPath: string) { this._directoryPath = directoryPath; }
    set isDebugEnabled(isDebugEnabled: boolean) { this._isDebugEnabled = isDebugEnabled; }

    get content(): T[] { return this._content; }
    get html(): string { return this._html; }
    get url(): string { return this._url; }
    get directory(): string { return this._directoryPath; }
    get counter(): number { return this._content.length; }
    get isDebugEnabled(): boolean { return this._isDebugEnabled; }

    enableDebug(): void { this._isDebugEnabled = true; }
    disableDebug(): void {  this._isDebugEnabled = false; }
    log(...args: any[]): void { if (this._isDebugEnabled) { console.log(...args); } }
    error(...args: any[]): void { if (this._isDebugEnabled) { console.error(...args); throw this.error; }}
}