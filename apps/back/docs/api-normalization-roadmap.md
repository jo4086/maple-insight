# API Normalization Roadmap

## 메모

현재 구조를 보면 `src/config/api-config.ts`의 `nexonApiConfig`는 예전에 API 목록을 카테고리별로 정리하고, 정규화/수집 흐름을 체계화하려던 시도의 흔적으로 보인다.  
실제 정규화 작업은 지금 `raw type -> normalized type -> mapper` 구조로 진행 중이므로, 이 문서는 그 작업 순서를 관리하기 위한 로드맵으로 사용한다.

## 우선순위 기준

- 현재 프론트와 직접 연결되는가
- 도메인 구조를 안정화하는 데 핵심적인가
- 이후 시뮬레이터, DB, AI 기능으로 확장 가치가 큰가
- 조회 구조가 새로운 패턴을 만들어내는가

## API군 우선순위 표

| 우선순위 | API군     | 핵심 이유                                   | 상태           |
| -------- | --------- | ------------------------------------------- | -------------- |
| 1        | Character | 현재 시스템의 핵심 도메인                   | 가장 먼저 완성 |
| 2        | Union     | 캐릭터 확장성과 사용자 가치가 큼            | Character 다음 |
| 3        | Guild     | 별도 식별자 흐름과 길드 기능 확장에 필요    | Union 다음     |
| 4        | History   | 시뮬레이터 및 강화 분석과 연결 가치가 큼    | 중기 과제      |
| 5        | Ranking   | 읽기 전용 리스트형 데이터 정규화에 적합     | 중기 과제      |
| 6        | Notice    | UI 확장에는 유리하지만 핵심 도메인성은 낮음 | 후순위         |

## Character 상세 목록

| 분류       | 엔드포인트                                                   |
| ---------- | ------------------------------------------------------------ |
| Identifier | `GET /maplestory/v1/id`                                      |
| Character  | `GET /maplestory/v1/character/basic`                         |
| Character  | `GET /maplestory/v1/character/popularity`                    |
| Character  | `GET /maplestory/v1/character/stat`                          |
| Character  | `GET /maplestory/v1/character/hyper-stat`                    |
| Character  | `GET /maplestory/v1/character/propensity`                    |
| Character  | `GET /maplestory/v1/character/ability`                       |
| Character  | `GET /maplestory/v1/character/item-equipment`                |
| Character  | `GET /maplestory/v1/character/cashitem-equipment`            |
| Character  | `GET /maplestory/v1/character/symbol-equipment`              |
| Character  | `GET /maplestory/v1/character/beauty-equipment`              |
| Character  | `GET /maplestory/v1/character/android-equipment`             |
| Character  | `GET /maplestory/v1/character/pet-equipment`                 |
| Character  | `GET /maplestory/v1/character/skill`                         |
| Character  | `GET /maplestory/v1/character/link-skill`                    |
| Character  | `GET /maplestory/v1/character/vmatrix`                       |
| Character  | `GET /maplestory/v1/character/set-effect`                    |
| Character  | `GET /maplestory/v1/character/hexamatrix`                    |
| Character  | `GET /maplestory/v1/character/hexamatrix-stat`               |
| Character  | `GET /maplestory/v1/character/dojang`                        |
| Character  | `GET /maplestory/v1/character/other-stat`                    |
| Character  | `GET /maplestory/v1/character/ring-exchange-skill-equipment` |
| Character  | `GET /maplestory/v1/character/ring-reserve-skill-equipment`  |

## Union 상세 목록

| 엔드포인트                               | 설명                      |
| ---------------------------------------- | ------------------------- |
| `GET /maplestory/v1/user/union`          | 유니온 정보 조회          |
| `GET /maplestory/v1/user/union-raider`   | 유니온 공격대 정보 조회   |
| `GET /maplestory/v1/user/union-artifact` | 유니온 아티팩트 정보 조회 |
| `GET /maplestory/v1/user/union-champion` | 유니온 챔피언 정보 조회   |

## Guild 상세 목록

| 엔드포인트                       | 설명                             |
| -------------------------------- | -------------------------------- |
| `GET /maplestory/v1/guild/id`    | 길드 식별자(oguild_id) 정보 조회 |
| `GET /maplestory/v1/guild/basic` | 길드 기본 정보 조회              |

## History 상세 목록

| 엔드포인트                             | 설명                           |
| -------------------------------------- | ------------------------------ |
| `GET /maplestory/v1/history/starforce` | 스타포스 강화 결과 조회        |
| `GET /maplestory/v1/history/potential` | 잠재능력 재설정 이용 결과 조회 |
| `GET /maplestory/v1/history/cube`      | 큐브 사용 결과 조회            |

## Ranking 상세 목록

| 엔드포인트                               | 설명                    |
| ---------------------------------------- | ----------------------- |
| `GET /maplestory/v1/ranking/overall`     | 종합 랭킹 정보 조회     |
| `GET /maplestory/v1/ranking/union`       | 유니온 랭킹 정보 조회   |
| `GET /maplestory/v1/ranking/guild`       | 길드 랭킹 정보 조회     |
| `GET /maplestory/v1/ranking/dojang`      | 무릉도장 랭킹 정보 조회 |
| `GET /maplestory/v1/ranking/theseed`     | 더 시드 랭킹 정보 조회  |
| `GET /maplestory/v1/ranking/achievement` | 업적 랭킹 정보 조회     |

## Notice 상세 목록

| 엔드포인트                                  | 설명                     |
| ------------------------------------------- | ------------------------ |
| `GET /maplestory/v1/notice`                 | 공지사항 목록 조회       |
| `GET /maplestory/v1/notice/detail`          | 공지사항 상세 조회       |
| `GET /maplestory/v1/notice-update`          | 업데이트 목록 조회       |
| `GET /maplestory/v1/notice-update/detail`   | 업데이트 상세 조회       |
| `GET /maplestory/v1/notice-event`           | 진행 중 이벤트 목록 조회 |
| `GET /maplestory/v1/notice-event/detail`    | 진행 중 이벤트 상세 조회 |
| `GET /maplestory/v1/notice-cashshop`        | 캐시샵 공지 목록 조회    |
| `GET /maplestory/v1/notice-cashshop/detail` | 캐시샵 공지 상세 조회    |

## 현재 권장 작업 순서

1. Character API군 정규화 완성
2. 공통 타입 패키지 안정화
3. Character 데이터를 프론트에서 normalized 기준으로 소비
4. Union API군 정규화
5. Guild API군 정규화
6. History / Ranking / Notice 순서로 확장
