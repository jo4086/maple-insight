import axios, { type AxiosInstance } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://172.30.1.85:8001';

type ClientType = 'api' | 'upload';

const instanceMap: Record<ClientType, AxiosInstance> = {
  api: axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
    },
  }),

  upload: axios.create({
    baseURL: BASE_URL,
    withCredentials: false,
  }),
};

export const clients = (type: ClientType): AxiosInstance => {
  return instanceMap[type];
};
