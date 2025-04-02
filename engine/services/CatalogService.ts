import { IHttpClient, IFileManager, IHtmlParser, ISerializer, ICatalog, ICatalogService } from '../interfaces/interfaces';
import { FileDownloader } from './FileDownloader';
import { Serializer } from './Serializer';
import { HtmlParser } from './HtmlParser';
import { FileManager } from './FileManager';
import { HttpClient } from './HttpClient';

export class CatalogService implements ICatalogService {
    private _httpClient: IHttpClient;
    private _fileManager: IFileManager;
    private _htmlParser: IHtmlParser;
    private _fileDownloader: FileDownloader;
    private _serializer: ISerializer<ICatalog>;

    constructor() {
        this._httpClient = new HttpClient();
        this._fileManager = new FileManager();
        this._htmlParser = new HtmlParser();
        this._fileDownloader = new FileDownloader();
        this._serializer = new Serializer<ICatalog>();
    }

    async fetchHtml(url: string): Promise<string> {
        return this._httpClient.get(url);
    }

    parseHtml(html: string): Promise<cheerio.Root> {
        return Promise.resolve(this._htmlParser.parse(html));
    }

    async downloadFile(link: string, outputPath: string): Promise<void> {
        await this._fileDownloader.downloadFile(link, outputPath);
    }

    async fileExists(filePath: string): Promise<boolean> {
        return this._fileManager.fileExists(filePath);
    }

    async serializeCatalog(catalog: ICatalog, directory: string): Promise<void> {
        await this._serializer.serialize(catalog, directory);
    }
    async createDirectory(path: string): Promise<void> {
        await this._fileManager.createDirectory(path);
    }
}