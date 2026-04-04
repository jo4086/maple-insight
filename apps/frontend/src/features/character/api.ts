import type { SearchNickResponse } from './types';

import { apiClient } from '@/api/client';
import { handleApiError } from '@/api/handleApiError';

export async function searchNick(nick: string) {
  try {
    const response = await apiClient.get('/character/search', {
      params: { nick },
    });

    const data: SearchNickResponse = response.data.data;
    console.log('basic: ', data.basic);
    // console.log('symbol: ', data['symbol-equipment']);
    // console.log('set-effect: ', data['set-effect']);
    // console.log('beauty: ', data['beauty-equipment']);
    // console.log('android: ', data['android-equipment']);
    // console.log('pet: ', data['pet-equipment']);
    // console.log('skill: ', data['skill']);
    // console.log('link-skill:', data['link-skill']);
    // console.log('vmatrix: ', data['vmatrix']);
    // console.log('hexamatrix: ', data['hexamatrix']);
    console.log('hexa-stat: ', data['hexamatrix-stat']);
    console.log('dojang: ', data['dojang']);
    console.log('other-stat: ', data['other-stat']);
    console.log('special-ring :', data['ring-reserve-skill-equipment']);

    return data;
    // return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
