import * as base from './character.type';

type KSTDateString = string;

interface GetCharaterBasicDataType {
  /**
   * 캐릭터 명
   **/
  character_name: string;
  /**
   * 월드 명
   **/
  world_name: string;
  /**
   * 캐릭터 성별
   **/
  character_gender: string;
  /**
   * 캐릭터 직업
   **/
  character_class: string;
  /**
   * 캐릭터 전직 차수
   **/
  character_class_level: string;
  /**
   * 캐릭터 레벨 (int64)
   **/
  character_level: number;
  /**
   * 현재 레벨에서 보유한 경험치 (int64)
   **/
  character_exp: number;
  /**
   * 현재 레벨에서 경험치 퍼센트
   * */
  character_exp_rate: string;
  /**
   * 소속 길드 명
   **/
  character_guild_name: string | null;
  /**
   * 캐릭터 외형 이미지
   * @example https://open.api.nexon.com/static/maplestory/character/look/ABCDEFG?action=A00.2&emotion=E00&width=200&height=200
   *
   * - 조회된 캐릭터 외형 이미지 URL에 쿼리 파리미터를 사용하여 캐릭터 이미지의 동작이나 감정표현을 변경하실 수 있습니다
   * - 쿼리 파라미터는 API로 조회된 URL 뒤에 물음표(?)와 "Key=value" 쌍을 입력하여 조회합니다.
   * - 여러 개의 쿼리 파라미터를 전달하려면 파라미터 사이에 앰퍼샌드(&)을 추가하여 하나의 문자열로 입력합니다.
   * - 액션 및 감정표현에 프레임 값("Key=value.number")을 입력하여 아바타 이미지를 프레임 별로 조회 가능합니다. (20250116 추가)
   * - 캐릭터 외형 이미지에 사용할 수 있는 쿼리 파라미터는 다음과 같습니다.
   *
   * (./docs/example.md)
   *
   * 액션 코드 (A00 ~ A41)
   * @param {string} action
   * - A00: stand1 (default)  | frame: 0 ~ 2
   * - A01: stand2            | frame: 0 ~ 2
   * - A02: walk1             | frame: 0 ~ 3
   * - A03: walk2             | frame: 0 ~ 3
   * - A04: prone             | frame: 0
   * - A05: fly               | frame: 0 ~ 1
   * - A06: jump              | frame: 0
   * - A07: sit               | frame: 0
   * - A08: ladder            | frame: 0 ~ 1
   * - A09: rope              | frame: 0 ~ 1
   * - A10: heal              | frame: 0 ~ 2
   * - A11: alert             | frame: 0 ~ 2
   * - A12: proneStab         | frame: 0 ~ 1
   * - A13: swingO1           | frame: 0 ~ 2
   * - A14: swingO2           | frame: 0 ~ 2
   * - A15: swingO3           | frame: 0 ~ 2
   * - A16: swingOF           | frame: 0 ~ 3
   * - A17: swingP1           | frame: 0 ~ 2
   * - A18: swingP2           | frame: 0 ~ 2
   * - A19: swingPF           | frame: 0 ~ 3
   * - A20: swingT1           | frame: 0 ~ 2
   * - A21: swingT2           | frame: 0 ~ 2
   * - A22: swingT3           | frame: 0 ~ 2
   * - A23: swingTF           | frame: 0 ~ 3
   * - A24: stabO1            | frame: 0 ~ 1
   * - A25: stabO2            | frame: 0 ~ 1
   * - A26: stabOF            | frame: 0 ~ 2
   * - A27: stabT1            | frame: 0 ~ 2
   * - A28: stabT2            | frame: 0 ~ 2
   * - A29: stabTF            | frame: 0 ~ 3
   * - A30: shoot1            | frame: 0 ~ 2
   * - A31: shoot2            | frame: 0 ~ 4
   * - A32: shootF            | frame: 0 ~ 2
   * - A33: dead              | frame: 0
   * - A34: ghostwalk         | frame: 0 ~ 3
   * - A35: ghoststand        | frame: 0 ~ 2
   * - A36: ghostjump         | frame: 0
   * - A37: ghostproneStab    | frame: 0 ~ 1
   * - A38: ghostladder       | frame: 0 ~ 1
   * - A39: ghostrope         | frame: 0 ~ 1
   * - A40: ghostfly          | frame: 0 ~ 1
   * - A41: ghostsit          | frame: 0 ~ 0
   *
   * 감정 표현 코드 (E00 ~ E24)
   * @param {string} emotion
   * - E00: default (default) | frame: 0
   * - E01: wink              | frame: 0
   * - E02: smile             | frame: 0
   * - E03: cry               | frame: 0
   * - E04: angry             | frame: 0
   * - E05: bewildered        | frame: 0
   * - E06: blink             | frame: 0 ~ 2
   * - E07: blaze             | frame: 0 ~ 1
   * - E08: bowing            | frame: 0 ~ 1
   * - E09: cheers            | frame: 0
   * - E10: chu               | frame: 0
   * - E11: dam               | frame: 0 ~ 1
   * - E12: despair           | frame: 0 ~ 1
   * - E13: glitter           | frame: 0 ~ 1
   * - E14: hit               | frame: 0
   * - E15: hot               | frame: 0 ~ 1
   * - E16: hum               | frame: 0 ~ 1
   * - E17: love              | frame: 0 ~ 1
   * - E18: oops              | frame: 0
   * - E19: pain              | frame: 0
   * - E20: troubled          | frame: 0
   * - E21: qBlue             | frame: 0
   * - E22: shine             | frame: 0
   * - E23: stunned           | frame: 0
   * - E24: vomit             | frame: 0 ~ 1
   *
   * 무기 모션 코드 (W00 ~ W04)
   * @param {string} wmotion
   *  - W00: 기본 모션 (default, 무기 타입에 따른 모션)
   *  - W01: 한손 모션
   *  - W02: 두손 모션
   *  - W03: 건 모션
   *  - W04: 무기 제외
   *
   * @param {number} width 가로 길이 (배경 크기에 해당함, 96(default)~1000)
   * @param {number} height 세로 길이 (배경 크기에 해당함, 96(default)~1000)
   * @param {number} x 캐릭터의 가로 좌표 (좌표 범위 0 < x < width, 0은 왼쪽 시작점에 해당)
   * @param {number} y 캐릭터의 세로 좌표 (좌표 범위 0 < y < height, 0은 상단 시작점에 해당)
   **/
  character_image: string;
  /**
   * 캐릭터 생성일 (KST, 일 단위 데이터로, 시 분은 일괄 0으로 표시)
   * @type {string}
   * @example '2025-01-01T00:00+09:00'
   **/
  character_date_create: KSTDateString;
  /**
   * 조회 기준일 (KST, 일 단위 데이터로, 시 분은 일괄 0으로 표시)
   * @type {string}
   * @example '2023-12-21T00:00+09:00'
   **/
  date?: KSTDateString;
  /**
   * 최근 7일이내 접속 여부
   * @type {string}
   * @enum {'true' | 'false'}
   * @example 'true' → 접속
   * @example 'false' → 미접속
   **/
  access_flag: 'true' | 'false';
  /**
   * 제네시스 무기 해방 여부
   **/
  liberation_quest_clear_flag: 'true' | 'false';
}
