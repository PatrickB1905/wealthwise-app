import { ENV } from '@shared/lib/env';
import { createHttpClient } from '@shared/lib/http';
import type { AxiosInstance } from 'axios';

type HttpClientFactory = (baseURL: string) => AxiosInstance;

export function createNewsClient(
  baseURL: string,
  factory: HttpClientFactory = createHttpClient,
): AxiosInstance {
  return factory(baseURL);
}

const NewsAPI = createNewsClient(ENV.NEWS_API_URL);

export default NewsAPI;
