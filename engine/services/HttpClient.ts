import axios from 'axios';
import axiosRetry from 'axios-retry';
import { IHttpClient } from '../interfaces/IHttpClient';
import { Logger } from '../utils/logger';

export class HttpClient implements IHttpClient {
    constructor() {
        axiosRetry(axios, {
            retries: 5,
            retryDelay: (retryCount) => {
                Logger.log(`Retry attempt #${retryCount}`);
                return retryCount * 1000;
            },
            retryCondition: (error) => {
                return axiosRetry.isNetworkOrIdempotentRequestError(error);
            },
        });
    }

    async get(url: string): Promise<string> {
        try {
            const response = await axios.get(url, {
                timeout: 30000,
                responseType: 'text',
                maxRedirects: 5,
            });

            if (response.status !== 200) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.data) {
                throw new Error('Response data is empty');
            }

            return response.data;
        } catch (error) {
            Logger.error(`Failed to fetch data from ${url}:`, error);
            throw error;
        }
    }
}