# Maple Insight Data Studio Roadmap

## 1. 문서 목적

이 문서는 [SPEC](./SPEC/README.md)의 요구사항을 구현 가능한 단계로 나누고 단계 간 의존 순서를 정의한다.

- 제품 요구사항의 기준: [SPEC](./SPEC/README.md)
- 현재 작업과 완료 조건: [GOAL](./GOAL/README.md)
- 구현 및 검증 결과: [REVIEW](./REVIEW.md)

| 단계 | 목표 문서 | 상태 |
| --- | --- | --- |
| [Phase 2](#phase-02) | [현재 목표](./GOAL/Phase02.md) | 진행 중 |
| [Phase 3](#phase-03) | [버전 비교](./GOAL/Phase03.md) | 대기 |
| [Phase 4](#phase-04) | [직업·스킬·장비 편집](./GOAL/Phase04.md) | 대기 |
| [Phase 5](#phase-05) | [DB dry-run 및 반영](./GOAL/Phase05.md) | 대기 |
| [Phase 6](#phase-06) | [타입·정적 데이터 생성](./GOAL/Phase06.md) | 대기 |

각 Phase 문서는 구현 계획이다. 검증 전에는 체크박스를 완료 처리하지 않는다.

## 2. 상태 정의

| 상태    | 의미                                                |
| ------- | --------------------------------------------------- |
| 완료    | 구현과 검증이 끝났으며 다음 단계에서 사용할 수 있음 |
| 진행 중 | 현재 구현 또는 검증 중                              |
| 준비    | 선행 조건이 충족되어 다음 GOAL로 선택 가능          |
| 대기    | 선행 단계가 완료되어야 시작 가능                    |
| 보류    | 필요하지만 초기 제품 범위 이후에 진행               |

단계는 코드가 존재하는 것만으로 완료하지 않는다. 각 단계의 종료 조건과 검증 결과가
[REVIEW](./REVIEW.md)에 기록되어야 완료로 변경한다.

## 3. 구현 원칙

1. 원본 파일은 항상 불변으로 유지한다.
2. renderer는 파일 시스템, DB, 외부 API에 직접 접근하지 않는다.
3. 입력, 변환, 검증, diff, publish를 서로 분리한다.
4. 가져오기 상태 메타데이터를 제외한 도메인 DB 데이터는 dry-run과 사용자 승인 전에 변경하지 않는다.
5. 결정론적 규칙은 코드로 처리하고 Jev는 의미 기반 판단에만 사용한다.
6. 새 단계는 이전 단계의 안정된 출력 계약을 입력으로 사용한다.
7. 기능 구현과 UI 표시를 같은 완료 조건으로 묶지 않는다.

## 4. 단계 의존성

```text
Phase 0: 애플리케이션 기반
  -> Phase 1: 파일 가져오기 및 변환
    -> Phase 2: 검증 및 작업본
      -> Phase 3: 버전 diff
        -> Phase 4: 도메인 편집
          -> Phase 5: DB dry-run 및 publish
            -> Phase 6: 타입 및 정적 데이터 생성
              -> Phase 7: 운영 안정화
```

Jev는 Phase 0에서 연결 기반을 마련하고, 각 단계에서 의미 기반 판단이 필요한 경우에만
보조 기능으로 확장한다.


<a id="phase-00"></a>
## Phase 00 — 애플리케이션 기반

**완료.** [상세 범위](./ROADMAP/Phase00.md)

<a id="phase-01"></a>
## Phase 01 — 파일 가져오기 및 변환

**완료.** [상세 범위](./ROADMAP/Phase01.md)

<a id="phase-02"></a>
## Phase 02 — 검증 및 작업본

**진행 중.** [상세 범위](./ROADMAP/Phase02.md) · [현재 목표](./GOAL/Phase02.md)

<a id="phase-03"></a>
## Phase 03 — 버전 비교

**대기.** [상세 범위](./ROADMAP/Phase03.md) · [목표](./GOAL/Phase03.md)

<a id="phase-04"></a>
## Phase 04 — 직업·스킬·장비 편집

**대기.** [상세 범위](./ROADMAP/Phase04.md) · [목표](./GOAL/Phase04.md)

<a id="phase-05"></a>
## Phase 05 — DB dry-run 및 반영

**대기.** [상세 범위](./ROADMAP/Phase05.md) · [목표](./GOAL/Phase05.md)

<a id="phase-06"></a>
## Phase 06 — 타입 및 정적 데이터 생성

**대기.** [상세 범위](./ROADMAP/Phase06.md) · [목표](./GOAL/Phase06.md)

<a id="phase-07"></a>
## Phase 07 — 운영 안정화

**대기.** [상세 범위](./ROADMAP/Phase07.md)
