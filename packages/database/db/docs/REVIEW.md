# Database Review

## 2026-10-27: Weapon type 구현 검증

### 통과

- `pnpm --filter @maple/db exec prisma validate`: Prisma schema 유효.
- `pnpm --filter @maple/db run typecheck`: 통과.
- `pnpm --filter @maple/db run build`: JavaScript와 declaration build 통과.
- `pnpm --filter @maple/data-equipment run typecheck`: 공유 타입 검사 통과.
- `pnpm --filter @maple/data-equipment run build`: 공유 패키지 build 통과.
- `pnpm --filter @maple/data-admin exec tsc --noEmit`: 통과.
- `pnpm --filter @maple/data-admin run build:js`: `seed-weapon-types`를 포함한 JavaScript build 통과.
- `pnpm --filter @maple/db exec tsx --test src/admin/seed-weapon-types.repo.test.ts`: 3개 통과, 실패 0개. 입력 검증, 동일 행 skip, 충돌 시 write 전 중단을 확인했다.
- generator build 후 in-memory `createWeaponEquipmentJson()` 확인: 199개 item, 데스티니 세이버 기본 상수 `1.24`, 데스티니 튜너 `requiredClass` `아델`, 데스티니 세이버(히어로) 상수 `1.34`.
- [`20261027000000_add_weapon_types`](../prisma/migrations/20261027000000_add_weapon_types/migration.sql): `hero_weapon_constant`를 한손검·두손검·한손도끼·두손도끼로 제한하는 CHECK 확인.
- 작성한 [`REVIEW.md`](./REVIEW.md)와 [`weapon-types.md`](./REQUESTS/weapon-types.md)를 별도 검사: trailing whitespace 없음.

### 실패와 미검증

- 저장소 전체 `git diff --check`: 실패. 생성된 [`index.d.ts`](../src/generated/prisma/index.d.ts)에 trailing whitespace가 남아 있다. 이 검토의 문서 소유 범위 밖이라 수정하지 않았다.
- [`builder.ts`](../../../game-data/equipment/src/information/weapon/builder.ts)의 `WeaponMetaInput`은 `requiredClass`를 허용하지 않는다. item-level per-item override 요구사항은 미구현이다.
- [`EquipmentItem`](../prisma/schema.prisma)에 `weapon_type_id`가 없다. 전역 타입 카탈로그와 item 상속·override 연결은 미구현이다.
- migration 적용과 `seed:weapon-types` 실행은 수행하지 않았다. seed dry run과 in-memory 생성 검증은 실제 DB seed가 아니다. 실제 DB 행은 검증하지 않았다.
- Migration 적용 승인과 seed 실행 승인은 별도이며 어느 승인도 완료됐다고 기록하지 않는다.
