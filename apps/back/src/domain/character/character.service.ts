import { nexonBaseApi } from '../../api/baseApi';
import { renameBasicApiResponse } from '@maple/types';

export const getCharacterOCID = async (nick: string) => {
  try {
    const response = await nexonBaseApi.get('/id', {
      params: {
        character_name: nick,
        // date: '2025-07-10',
      },
    });
    // console.clear();
    // console.log(response.data);

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API Request Error:`, error.message);
      throw new Error(error.message || '캐릭터 ocid 조회 중 오류 발생');
    } else {
      console.error(`API Request Error:`, error);
      throw new Error('캐릭터 ocid 조회 중 오류 발생');
    }
  }
};

const getStatInfo = async (ocid: string, date: string | null) => {
  try {
    const response = await nexonBaseApi.get('/character/basic', {
      params: { ocid, date },
    });

    const formatedData = renameBasicApiResponse(response.data);
    const {
      guild: _guild,
      image_url: _image_url,
      gender: _gender,
      class_level: _class_level,
      // created_at: _created_at,
      ...rest
    } = formatedData;
    console.log(rest);

    return rest;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`API Request Error:`, error.message);
      throw new Error(error.message || '캐릭터 기본정보 조회 중 오류 발생');
    } else {
      console.error(`API Request Error:`, error);
      throw new Error('캐릭터 기본정보 조회 중 오류 발생');
    }
  }
};

export const getInfo = async (nick: string, date: string | null) => {
  const { ocid } = await getCharacterOCID(nick);

  return await getStatInfo(ocid, date);
};

export default { getCharacterOCID, getInfo };
