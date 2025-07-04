import axios from 'axios';
import { createApiConfig } from './api-config';

export const API_URL = createApiConfig({
  nexon: {
    base: 'https://open.api.nexon.com/maplestory/v1',
    secParams: {
      ocid: 'id',
      ouid: 'ouid',
      guildId: 'guild/id',
    },
    category: {
      stat: {
        secParams: 'ocid',
        endpoint: {
          character: [
            'stat',
            'hyper-stat',
            'ability',
            'hexamatrix-stat',
            'set-effect',
            'propensity',
          ],
          user: ['union', 'union-raider', 'union-artifact', 'union-champion'],
        },
      },
      skill: {
        secParams: 'ocid',
        endpoint: {
          character: ['skill', 'vmatrix', 'hexamatrix', 'link-skill'],
        },
      },
      basic: {
        secParams: 'ocid',
        endpoint: {
          character: ['basic', 'item-equipment', 'symbol-equipment', 'ability'],
        },
      },
    },
  },
});

const base = API_URL.nexon.base;
const ocid = API_URL.nexon.secParams.ocid;
const ouid = API_URL.nexon.secParams.ouid;
const guildId = API_URL.nexon.secParams.guildId;
const getIdUrl = `${base}/${ocid}`;

// axios;
