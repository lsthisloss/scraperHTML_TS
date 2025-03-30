import { promises as fs } from 'fs';
import { IFileManager } from '../interfaces/IFileManager';

export class FileManager implements IFileManager {
    async createDirectory(path: string): Promise<void> {
        await fs.mkdir(path, { recursive: true });
    }

    async writeFile(path: string, data: string): Promise<void> {
        await fs.writeFile(path, data);
    }
}
