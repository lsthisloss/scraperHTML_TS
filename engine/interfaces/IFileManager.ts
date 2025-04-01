export interface IFileManager {
    createDirectory(path: string): Promise<void>;
    writeFile(path: string, data: string): Promise<void>;
    readFile(path: string): Promise<string>;
    fileExists(path: string): Promise<boolean>;
}