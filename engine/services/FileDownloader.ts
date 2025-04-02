import axios from 'axios';
import * as fs from 'fs';
import { Logger } from '../utils/logger';
import { IFileDownloader } from '../interfaces/interfaces'; 

export class FileDownloader implements IFileDownloader {

    async downloadFile(url: string, outputPath: string): Promise<void> {
        try {
            const writer = fs.createWriteStream(outputPath);

            const response = await axios.get(url, {
                responseType: 'stream',
            });

            const total = parseInt(response.headers['content-length'] || '0', 10);
            let loaded = 0;
    
            response.data.on('data', (chunk: Buffer) => {
                loaded += chunk.length;
                const percentage = total ? ((loaded / total) * 100).toFixed(2) : 'Unknown';
                const formattedSize = total ? `${(total / 1024).toFixed(2)} KB` : 'Unknown';
                const filename = outputPath.split('/').pop() || 'file';
                process.stdout.write(`\rDownloading ${filename}: ${loaded} of ${formattedSize} (${percentage}%)`);
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