import { ISerializer, IFileManager } from '../interfaces/interfaces';
import * as path from 'path';
import { FileManager } from './FileManager';

export class Serializer<T> implements ISerializer<T> {
    private _fileManager: IFileManager;

    constructor() {
        this._fileManager = new FileManager();
    }

    async serialize(item: T, directory: string): Promise<void> {
        const filePath = path.join(directory, 'data.json');

        try {
            const fileExists = await this._fileManager.fileExists(filePath);
            if (!fileExists) {
                await this._fileManager.writeFile(filePath, JSON.stringify([], null, 2));
            }

            const existingDataString = await this._fileManager.readFile(filePath);
            const existingData = JSON.parse(existingDataString);

            const updatedData = [...existingData, item];

            await this._fileManager.writeFile(filePath, JSON.stringify(updatedData, null, 2));
        } catch (error) {
            console.error(`Failed to serialize item to file: ${filePath}`, error);
            throw error;
        }
    }
}