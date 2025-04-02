export interface ISerializer<T> {
    serialize(item: T, directory: string): Promise<void>;
}

export interface IHttpClient {
    get(url: string): Promise<string>;
}

export interface IHtmlParser {
    parse(html: string): cheerio.Root; 
}

export interface IFileManager {
    createDirectory(path: string): Promise<void>;
    writeFile(path: string, data: string): Promise<void>;
    readFile(path: string): Promise<string>;
    fileExists(path: string): Promise<boolean>;
    downloadFile(url: string, outputPath: string): Promise<void>;
}

export interface IServiceProvider<T> {
    fetchHtml(url: string): Promise<string>;
    parseHtml(html: string): Promise<cheerio.Root>;
    downloadFile(link: string, outputPath: string): Promise<void>;
    fileExists(filePath: string): Promise<boolean>;
    serializeToFile(item: T, directory: string): Promise<void>;
    createDirectory(path: string): Promise<void>;
}