import { ICatalog } from '../interfaces/interfaces';
import { IServiceProvider } from '../interfaces/services.interfaces';
import { IHttpClient, IFileManager, IHtmlParser, ISerializer} from '../interfaces/services.interfaces';
import { Serializer } from './Serializer';
import { HtmlParser } from './HtmlParser';
import { FileManager } from './FileManager';
import { HttpClient } from './HttpClient';

export class ServiceProvider<T extends ICatalog> implements IServiceProvider<T> {
    private _httpClient: IHttpClient;
    private _fileManager: IFileManager;
    private _htmlParser: IHtmlParser;
    private _serializer: ISerializer<ICatalog>;

    constructor() {
        this._httpClient = new HttpClient();
        this._fileManager = new FileManager();
        this._htmlParser = new HtmlParser();
        this._serializer = new Serializer<ICatalog>();
    }

    async fetchHtml(url: string): Promise<string> {
        return this._httpClient.get(url);
    }

    parseHtml(html: string): Promise<cheerio.Root> {
        return Promise.resolve(this._htmlParser.parse(html));
    }

    async downloadFile(link: string, outputPath: string): Promise<void> {
        await this._fileManager.downloadFile(link, outputPath);
    }

    async fileExists(filePath: string): Promise<boolean> {
        return this._fileManager.fileExists(filePath);
    }

    async serializeToFile(item: T, directory: string): Promise<void> {
        await this._serializer.serialize(item, directory);
    }

    async createDirectory(path: string): Promise<void> {
        await this._fileManager.createDirectory(path);
    }
}