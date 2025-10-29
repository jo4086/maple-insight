import type { EnvMapType, Homepage } from './config.type';
import { getValidatedApiKeys } from './config.validator';

const requiredAPIKeyMap: EnvMapType = {
  nexon: 'NEXON_API_KEY',
};

export const config = {
  apiKey: getValidatedApiKeys(requiredAPIKeyMap),
};

const homepageConfigMap: Record<Homepage, { baseUrl: string; apiKey: string }> = {
  nexon: {
    baseUrl: 'https://open.api.nexon.com/maplestory/v1',
    apiKey: process.env.NEXON_API_KEY || '',
  },
  example: {
    baseUrl: 'https://api.example.com',
    apiKey: process.env.EXAMPLE_API_KEY || '',
  },
  test: {
    baseUrl: 'https://api.test.com',
    apiKey: process.env.TEST_API_KEY || '',
  },
};

export function getHomepageConfig(homepage: Homepage) {
  return homepageConfigMap[homepage];
}
