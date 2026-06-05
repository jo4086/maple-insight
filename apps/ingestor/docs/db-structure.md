# DB Structure

## 목적

- 랭킹 수집과 실시간 검색으로 확보한 `character_name`을 기준으로 `ocid` 존재 여부를 관리한다.
- 최초 단계에서는 캐릭터 상세 메타보다 `닉네임 -> ocid 조회 결과`를 안정적으로 누적하는 것을 우선한다.

## DB 구조

### `ocids`

- 닉네임별 `ocid` 조회 결과를 저장하는 기본 테이블이다.
- `character_name`은 현재 조회 기준 이름이다.
- `ocid`는 조회 성공 시 저장하고, 조회 실패 또는 존재하지 않는 닉네임이면 `null`일 수 있다.
- 조회 결과 상태는 `status` 컬럼으로 관리한다.

권장 컬럼:

- `id`
  - 내부 PK
- `character_name`
  - 조회 대상 닉네임
- `ocid`
  - Nexon API에서 확인한 `ocid`
  - 조회 결과가 없으면 `null`
- `status`
  - 조회 상태
  - 예시: `pending | found | not_found | failed`
- `created_at`
  - 최초 row 생성 시각
- `updated_at`
  - 마지막 갱신 시각
