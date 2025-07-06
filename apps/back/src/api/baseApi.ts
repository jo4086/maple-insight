import axios from 'axios';

import { getHomepageConfig } from '../config';

export const nexonConfig = getHomepageConfig('nexon');

const baseUrl = nexonConfig.baseUrl;
const apiKey = nexonConfig.apiKey;

export const nexonBaseApi = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  headers: {
    accept: 'application/json',
    'x-nxopen-api-key': apiKey,
  },
});
