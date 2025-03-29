import { promises as fs } from 'fs';

export async function createDirectory(path: string): Promise<void> {
    try {
        await fs.mkdir(path, { recursive: true });
    } catch (error: any) {
        console.error(`Failed to create directory: ${error.message}`);
    }
}

export async function filesCount(directoryPath: string): Promise<number> {
    try {
        const files = await fs.readdir(directoryPath);
        const pdfFiles = files.filter(file => file.endsWith('.pdf'));
        return pdfFiles.length;
    } catch (error: any) {
        console.error(`Failed to read directory: ${error.message}`);
        return 0;
    }
}

export async function saveCataloguesToFile(catalogues: object, filePath: string): Promise<void> {
    try {
        const cataloguesJson = JSON.stringify(catalogues, null, 2);
        await fs.writeFile(filePath, cataloguesJson);
        console.log(`Catalogs successfully saved to ${filePath}`);
    } catch (error) {
        console.error(`Failed to save catalogues to file:`, error);
        throw error;
    }
}