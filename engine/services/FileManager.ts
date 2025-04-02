import { promises as fs } from 'fs';
import { IFileManager } from '../interfaces/interfaces';
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

    async readFile(path: string): Promise<string> {
        try {
            return await fs.readFile(path, 'utf-8');
        } catch (error) {
            Logger.error(`Failed to read file at path: ${path}`, error);
            throw error;
        }
    }

    async fileExists(path: string): Promise<boolean> {
        try {
            await fs.access(path);
            return true;
        } catch {
            return false;
        }
    }
    
}