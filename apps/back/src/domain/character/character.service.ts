import { nexonBaseApi } from '../../api/baseApi';

const getCharacterOCID = async (nick: string) => {
  try {
    const response = await nexonBaseApi.get('/id', {
      params: {
        character_name: nick,
      },
    });
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

const getStatInfo = async (ocid: string) => {
  try {
    const response = await nexonBaseApi.get('/character/basic', {
      params: { ocid },
    });

    return response.data;
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

export const getInfo = async (nick: string) => {
  const { ocid } = await getCharacterOCID(nick);

  return await getStatInfo(ocid);
};

export default { getCharacterOCID, getInfo };
