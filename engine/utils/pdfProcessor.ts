import axios from 'axios';
import * as fs from 'fs';
import { Logger } from './logger';

export async function downloadPdfWithProgress(url: string, outputPath: string): Promise<void> {
    try {
        const writer = fs.createWriteStream(outputPath);

        const response = await axios.get(url, {
            responseType: 'stream',
            onDownloadProgress: (progressEvent) => {
                const total = progressEvent.total || 0; 
                const loaded = progressEvent.loaded;  
                const percentage = total ? ((loaded / total) * 100).toFixed(2) : 'Unknown';
                if (Logger.isDebugEnabled()) {
                    process.stdout.write(`\r${loaded} of ${total} bytes (${percentage}%)`);
                }
            },
        });

        response.data.pipe(writer);
        
        return new Promise((resolve, reject) => {
            writer.on('finish', () => {
                process.stdout.write('\n');
                resolve();
            });
            writer.on('error', reject);
        });
    } catch (error) {
        Logger.error(`Failed to download file from ${url}:`, error);
        throw error;
    }
}