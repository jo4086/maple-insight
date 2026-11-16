# 포트폴리오 제작 에이전트용 브리프

## 한 문장 소개 초안

> Maple Insight는 메이플스토리의 외부 API 응답과 버전별 게임 원본 데이터를 분리해 관리하고, 검증된 데이터를 조회·분석 기능으로 연결하려는 TypeScript 모노레포입니다. 현재는 Electron 기반 Data Studio의 가져오기·검증·버전 비교를 완료하고 편집 작업본을 개발 중입니다.

이 문장은 [프로젝트 소개](../../README.md), [Electron 단계 상태](../../apps/electron/docs/GOAL/README.md)에 맞춘 설명이다. 개인 기여도, 팀 규모, 개발 기간, 배포 URL은 이 저장소만으로 확정할 수 없으므로 작성자에게 확인해야 한다.

## 우선 사례 1: 검증 가능한 게임 데이터 관리

**문제:** 버전별 raw 데이터와 편집·DB 반영이 섞이면 잘못된 변경이나 출처 손실을 발견하기 어렵다.

**결정:** 원본 보존, 변환, 검증 작업본, diff, 편집 작업본을 단계로 나누고 Renderer의 파일·DB 작업을 Preload/IPC/Main에 둔다. [Electron 아키텍처](../../apps/electron/docs/ARCHITECTURE.md), [Main IPC 등록](../../apps/electron/src/main/ipc/register.ts).

**현재 결과:** Phase 00~03의 완료 기록과 Phase 04 부분 구현을 구분해 보여준다. [Phase 02 검증](../../apps/electron/docs/REVIEW/Phase02.md), [Phase 03 검증](../../apps/electron/docs/REVIEW/Phase03.md), [Phase 04 목표](../../apps/electron/docs/GOAL/Phase04.md).

**시각 자료:** import·validation·diff 화면의 기존 수동 스크린샷을 선택하고, 필요하면 실제 현 상태를 새로 촬영한다. [스크린샷 디렉터리 규칙](../../screenshots/README.md). 스킬 조회 UI는 [예시 이미지](../../screenshots/manual/electron/electron-2026-11-14T11-23-27-234Z.png)를 사용할 수 있지만 이미지만으로 데이터 저장 기능을 주장하지 않는다.

## 우선 사례 2: 모노레포의 데이터 책임 분리

**문제:** API raw 타입, 제품 응답 계약, 버전별 정적 데이터, Prisma 저장, 생성·계산이 서로 다른 변경 주기를 가진다.

**결정:** `api-types`, `contracts`, `game-data`, `db`, `data-admin`, `bootstrap`, `generator`, `simulator`로 경계를 분리한다. 특히 core taxonomy 생성의 빌드 순환을 bootstrap으로 풀었다. [패키지 분석](./packages.md), [패키지 빌드 설명](../../packages/README.md).

**현재 결과:** 패키지 경계와 DB runtime/admin API는 코드로 확인 가능하다. 전체 clean checkout 생성과 생성 최신성 CI는 아직 남았다고 적는다.

## 보조 사례: 검색 API와 수집 파이프라인

- **검색:** 닉네임 → OCID → 직업별 skill endpoint → mapper → React Query 화면 흐름을 코드와 작은 도식으로 표현한다. 화면의 실제 표시 범위는 이미지·장비 중심이다. [흐름 분석](./flows.md).
- **수집:** 랭킹 raw page를 먼저 남기고 OCID·캐릭터·그룹 잡을 분리한 구조, 이름 대신 OCID와 시점별 snapshot을 사용하려는 이유를 설명한다. 기본 잡은 랭킹 전용이며 운영 파이프라인 완료를 주장하지 않는다. [Ingestor 분석](./applications.md).

## 에이전트에게 전달할 작성 규칙

1. 각 사례를 **문제 → 설계 판단 → 실제 구현 → 검증 근거 → 남은 범위** 순서로 쓴다.
2. 완료 문장은 해당 앱의 GOAL/ROADMAP/REVIEW와 대조한다. 설계 문서의 미래형 문장을 구현 성과로 바꾸지 않는다.
3. 특정 성과 수치가 필요하면 검증 기록의 날짜·조건을 그대로 명시한다. 성능 향상률이나 사용자 수를 임의로 만들지 않는다.
4. 개인정보·API 키·DB 접속 정보가 화면이나 로그에 있으면 제거하고, 코드 링크는 공개 가능한 경로만 고른다.
5. 이 브리프의 문장과 그림은 초안이다. 최종 포트폴리오를 공개하기 전에 현재 브랜치의 동작, 화면, 작성자 개인 기여를 확인한다.
