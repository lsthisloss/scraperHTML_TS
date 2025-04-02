import { promises as fs } from 'fs';
import * as fsSync from 'fs';
import { IFileManager } from '../interfaces/services.interfaces';
import { Logger } from '../utils/logger';
import axios from 'axios';

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

    async downloadFile(url: string, outputPath: string): Promise<void> {
        try {
            const writer = fsSync.createWriteStream(outputPath);
            const filename = outputPath.split('/').pop() || 'file';

            const response = await axios.get(url, {
                responseType: 'stream',
            });

            const total = parseInt(response.headers['content-length'] || '0', 10);
            let loaded = 0;
            Logger.log(`Downloading ${filename}`);
    
            response.data.on('data', (chunk: Buffer) => {
                loaded += chunk.length;
                const percentage = total ? ((loaded / total) * 100).toFixed(2) : 'Unknown';
                const formattedSize = total ? `${(total / 1024000).toFixed(2)} MB` : 'Unknown';
                const formattedRemain = total ? `${(loaded / 1024000).toFixed(2)} MB` : 'Unknown';
                process.stdout.write(`\r${formattedRemain} of ${formattedSize} (${percentage}%)`);
            });
    
            response.data.pipe(writer);
    
            return new Promise((resolve, reject) => {
                writer.on('finish', () => {
                    process.stdout.write('\n');
                    resolve();
                });
                writer.on('error', (error) => {
                    Logger.error(`Failed to write file to ${outputPath}:`, error);
                    reject(error);
                });
            });

        } catch (error) {
            Logger.error(`Failed to download file from ${url}:`, error);
            throw error;
        }
    }
   
}