import { crestOfTheSolar } from './crest-of-the-solar';
import { erdaShower } from './erda-shower';
import { solHecate, solHecatePhlegethon, solHecateStyx } from './sol-hecate';
import { solJanus } from './sol-janus';
import { spiderInMirror } from './spider-in-mirror';

export * from './crest-of-the-solar';
export * from './erda-shower';
export * from './sol-hecate';
export * from './sol-janus';
export * from './spider-in-mirror';

export const skillValueMap = {
  '에르다 샤워': erdaShower,
  '스파이더 인 미러': spiderInMirror,
  '크레스트 오브 더 솔라': crestOfTheSolar,
  '솔 야누스': solJanus,
  '솔 헤카테': solHecate,
  '솔 헤카테 : 스틱스': solHecateStyx,
  '솔 헤카테 : 플레게톤': solHecatePhlegethon,
};
