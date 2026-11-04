# Database Architecture

이 문서는 현재 구현된 database 단위만 설명한다. 요구사항 상태와 검증 근거는 각각 [ROADMAP](./ROADMAP.md)과 [REVIEW](./REVIEW.md)에서 관리한다.

## Package boundary

- `@maple/db`가 Prisma schema와 migration, Prisma Client 수명 주기, runtime repository, 관리용 조회·seed·backfill API와 transaction을 소유한다.
- `@maple/data-admin`은 입력 경로와 CLI 실행 흐름을 소유하고 `@maple/db`의 공개 API에 DB 작업을 위임한다. Prisma 접근과 저장 로직을 중복하지 않는다.

## Weapon catalog and equipment

`equipment.weapon_types`는 게임 데이터 버전과 무관한 전역 무기 타입 카탈로그다. `equipment.equipment_items`는 `version`별 장비를 저장하며 nullable `weapon_type_id`로 카탈로그를 참조한다. 아이템별 `required_class_override`가 있으면 연결된 카탈로그의 착용 조건보다 우선한다. FK가 없으면 repository가 기존 `required_class`를 legacy fallback으로 반환한다.

`1.2.419`의 주무기 199개는 카탈로그 FK에 연결되어 있다. 카탈로그가 없는 보조무기는 nullable FK를 유지한다. DB repository에는 카탈로그·override·legacy fallback을 해석하는 조회 API가 구현되어 있지만 애플리케이션 소비자는 아직 이 API로 전환되지 않아 기존 경로를 사용한다.

## Historical proposal

[ARCHITECTURE-weapon-types-proposal.md](./ARCHITECTURE-weapon-types-proposal.md)는 별도 보존하는 승인 당시 제안과 결정 이력이다. 현재 구현 여부는 이 문서와 코드에서 판단하며, 제안 문서의 미래 소비자 통합을 구현 완료로 간주하지 않는다.
