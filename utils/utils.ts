import { promises as fs } from 'fs';
import { Logger } from './logger';


export async function createDirectory(path: string): Promise<void> {
    try {
        await fs.mkdir(path, { recursive: true });
    } catch (error: any) {
        Logger.error(`Failed to create directory: ${error.message}`);
    }
}

export async function filesCount(directoryPath: string): Promise<number> {
    try {
        const files = await fs.readdir(directoryPath);
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        return pdfFiles.length;
    } catch (error: any) {
        Logger.error(`Failed to read directory: ${error.message}`);
        return 0;
    }
}

