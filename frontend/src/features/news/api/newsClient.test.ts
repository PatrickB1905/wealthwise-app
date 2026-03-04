import { describe, expect, it, jest } from '@jest/globals';
import type { AxiosInstance } from 'axios';
import { createNewsClient } from './newsClient';

describe('newsClient', () => {
  it('creates a news client using the provided baseURL', () => {
    const httpClient = { get: jest.fn() } as unknown as AxiosInstance;

    const factory: (baseURL: string) => AxiosInstance = jest.fn(() => httpClient);

    const created = createNewsClient('http://news-service.local/api', factory);

    expect(factory).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledWith('http://news-service.local/api');
    expect(created).toBe(httpClient);
  });
});
