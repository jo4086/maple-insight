interface FetchCharacterIdProp {
  type: 'character' | 'union' | 'guild' | 'account';
  value: string;
}

async function fetchCharacterID(data: FetchCharacterIdProp) {}

/*
async function fetchCharacterData(data: { ocid: string; type: string; date?: string }) {
  try {
    const exDate = data.date || null;
    console.log('');
    // console.log(data.ocid);
    const response = await axios.get(`${BASE_URL}/character/${data.type}`, {
      params: {
        ocid: data.ocid,
        date: exDate,
      },
      headers: {
        'x-nxopen-api-key': API_KEY,
        accept: 'application/json',
      },
    });

    // console.log(response.data);.
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error: any) {
    if (error.response) {
      console.error(`API 요청 실패:`, error.response.status, error.response.data);
    } else {
      console.error('네트워크 오류:', error.message);
    }
  }
}
*/
