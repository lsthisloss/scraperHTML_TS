import { promises as fs } from 'fs';
import { IFileManager } from '../interfaces/IFileManager';
import { Logger } from '../utils/logger';

export class FileManager implements IFileManager {
    async createDirectory(path: string): Promise<void> {
        try {
            await fs.mkdir(path, { recursive: true });
        } catch (error) {
            Logger.error(`Failed to create directory at path: ${path}`, error);
            throw error;
        }
    }

    async writeFile(path: string, data: string): Promise<void> {
        try {
            await fs.writeFile(path, data);
        } catch (error) {
            Logger.error(`Failed to write file at path: ${path}`, error);
            throw error;
        }
    }
}