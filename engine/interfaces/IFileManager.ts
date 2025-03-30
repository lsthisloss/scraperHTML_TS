export interface IFileManager {
    createDirectory(path: string): Promise<void>;
    writeFile(path: string, data: string): Promise<void>;
}