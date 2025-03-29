import axios from 'axios';
import { promises as fs } from 'fs';

export async function downloadPdf(url: string, filename: string): Promise<void> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        await fs.writeFile(filename, response.data);
    } catch (error: any) {
        console.error(`Failed to download PDF from ${url}: ${error.message}`);
    }
}