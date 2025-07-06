import { apiClient } from './apiClient';

export const searchCharacter = async (nick: string) => {
  try {
    const response = await apiClient.get('/character', {
      params: { nick },
    });

    return response.data;
  } catch (error) {
    console.error(`API Request Error: ${error.message}`);
    throw error;
  }
};
