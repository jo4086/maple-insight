# Skill Image Extractor — 설계 개요

## 배경

Maple Insight는 직업 및 전직 ID를 관리하고 있으나, 스킬 이미지 에셋을 대량으로 추출하고 등록하는 기능이 부족하다.

이를 해결하기 위해 WzComparerR2 seotbeo 배포본의 WzLib를 활용하는 C# CLI 추출기를 추가하고, Electron 관리 앱에 단계적으로 연결한다.

## 현재 구현 상태

- Windows .NET 8 SDK 설치 완료
- `net8.0-windows` C# 프로젝트 생성
- WzLib DLL 참조 설정
- ILSpy 분석 자료 5개 확보 (`references/`)
- README 및 Git 제외 규칙 구성
- Windows .NET 8 빌드 및 `Base.wz`의 히어로·팔라딘 전직 묶음 실행 검증 완료 (10개 전직 ID 폴더, PNG 484개, 공통 ID 재사용·부분 누락 복구 확인)

## 목표

1. 대표 jobID를 입력하여 연결된 전직 jobID의 스킬 이미지를 일괄 추출한다.
2. 공용 전직 및 이미 추출된 이미지의 중복 작업을 방지한다.
3. Electron의 스킬 데이터 탭에서 이미지 추출 및 등록 기능을 제공한다.
4. Windows/WSL 개발 환경과 향후 Windows 배포 환경을 지원한다.
5. Electron 환경설정에서 WZ 원본 경로 및 이미지 저장 경로를 관리한다.

## 관련 문서

| 문서                                 | 역할                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------ |
| [REQUIREMENTS.md](./REQUIREMENTS.md) | 기능 요구사항 및 출력 구조                                               |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | 아키텍처 검토 범위, 설계 지침 및 우선순위 중인 Windows 경로·DB 백업 제안 |

## 현재 단계

**전직 ID 묶음 추출 및 WSL Electron 로컬 이미지 연결 부분 검증 완료**

전직 ID 목록을 전달해 순차 추출하고 공통 ID의 기존 PNG 재사용 및 부분 누락 복구를 검증했다. Electron의 현재 스킬 목록에서 로컬 PNG 표시와 선택 직업의 추출 버튼도 실제 WSL 실행으로 확인했다. [Electron `REQ003`](../../apps/electron/docs/REQUIREMENTS/REQ003.md)에 현재 범위와 남은 검증을 기록했다. 전체 생성과 환경설정은 후속 단계다.

Windows 설치본의 경로 설정과 DB 이미지 백업은 [후속 아키텍처 제안](./ARCHITECTURE.md#6-후속-제안--windows-경로-설정과-이미지-db-백업)에 **우선순위 중·대기**로 기록했다.

후속 Electron 환경설정과 DB 백업은 대기 중이다.
