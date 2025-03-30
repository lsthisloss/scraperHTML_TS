import axios from 'axios';
import { IHttpClient } from '../interfaces/IHttpClient';

export class HttpClient implements IHttpClient {
    async get(url: string): Promise<string> {
        const response = await axios.get(url, { timeout: 30000 });
        return response.data;
    }
}