# Maple Skill Extractor

메이플스토리 KMS의 WZ 파일에서 스킬 아이콘을 추출하기 위한 C# CLI 도구입니다.

## 목적

`Base.wz`에 포함된 스킬 데이터를 탐색하여 스킬 ID별 아이콘을 PNG 파일로 추출합니다.

추출 대상:

- `icon` — 기본 스킬 아이콘
- `iconMouseOver` — 마우스 오버 아이콘
- `iconDisabled` — 비활성화 아이콘

추출한 이미지는 Maple Insight 프로젝트의 게임 에셋으로 활용할 수 있도록 구성합니다.

## 개발 환경

- OS: Windows 10
- .NET SDK: 8.0
- Target Framework: `net8.0-windows`
- Language: C#
- WZ Parser: WzComparerR2 seotbeo 배포본의 WzLib

WSL에서 소스코드를 관리하며 Windows의 .NET SDK를 이용해 빌드 및 실행합니다.

## 디렉터리 구조

```text
maple-skill-extractor/
├── lib/                          # 외부 WzLib DLL
├── references/                   # 역컴파일 API 참고 자료
│   ├── Wz_File.md
│   ├── Wz_Image.md
│   ├── Wz_Node.md
│   ├── Wz_Png.md
│   └── Wz_Structure.md
├── Program.cs                    # CLI 진입점
├── maple-skill-extractor.csproj  # 프로젝트 설정
└── README.md
```

## 주요 API

| 클래스         | 역할                           |
| -------------- | ------------------------------ |
| `Wz_Structure` | WZ 파일 로드 및 구조 관리      |
| `Wz_File`      | WZ 파일 정보 및 내부 노드 접근 |
| `Wz_Image`     | IMG 데이터 추출 및 해제        |
| `Wz_Node`      | 노드 탐색 및 데이터 접근       |
| `Wz_Png`       | PNG 이미지 데이터 추출         |

API 상세 내용은 `references/` 문서를 참고합니다.

## 설치 및 빌드

Windows에 .NET 8 SDK가 설치되어 있어야 합니다.

WSL에서 프로젝트 디렉터리로 이동한 후 실행합니다.

```bash
dotnet.exe restore
dotnet.exe build
```

`Base.wz`가 분할 WZ 형식이면 함께 있는 `.ini`와 하위 WZ 폴더를 WzLib로 읽습니다. Windows .NET에서 실행하므로 WZ와 출력 경로는 Windows 경로로 전달합니다.

```powershell
dotnet run -- --wz D:\Game\Maple\Data\Base\Base.wz --output D:\skill-images\skills\1.2.419 --job-id 112
dotnet run -- --wz D:\Game\Maple\Data\Base\Base.wz --output D:\skill-images\skills\1.2.419 --job-ids 000,100,110,111,112,114
```

WSL에서 Windows `dotnet.exe`를 호출할 때 출력 위치가 WSL 파일 시스템이라면 `--output`에 Windows UNC 경로를 전달합니다. `--output`은 데이터 버전 디렉터리까지 지정합니다. Electron은 선택한 데이터 버전을 경로에 붙여 전달하고, CLI를 직접 실행할 때는 호출자가 올바른 버전 디렉터리를 선택해야 합니다. CLI는 전달받은 전직 ID를 숫자 오름차순으로 한 번씩 처리합니다. 직업 관계는 CLI에 포함하지 않으며 호출자가 연결된 전직 ID 목록을 전달합니다. 이미 존재하는 PNG는 같은 출력 디렉터리에서만 재사용하고 누락된 파일만 다시 생성합니다.

기존 버전 미지정 출력은 사용자가 `1.2.419` 추출 결과로 확인했으며, 전직 폴더 23개와 PNG 986개를 `output/skills/1.2.419/`로 이전했습니다.

## 추출 규칙

1. `Base.wz`를 로드하고 Skill 영역을 탐색합니다.
2. 각 스킬 ID의 아이콘 노드를 확인합니다.
3. `icon`, `iconMouseOver`, `iconDisabled`를 PNG로 저장합니다.
4. UOL 참조가 존재하면 실제 대상 노드를 찾아 처리합니다.
5. 누락된 아이콘은 건너뛰고 로그에 기록합니다.
6. 중복 스킬 ID 및 파일 덮어쓰기를 방지합니다.

## 출력 구조

```text
skills/
└── {version}/
    └── {jobID}/
        └── {skillID}/
            ├── icon.png
            ├── iconMouseOver.png
            └── iconDisabled.png
```

## 구현 상태

- [x] .NET 8 프로젝트 생성
- [x] WzLib DLL 참조 설정
- [x] API 참고 문서 구성
- [x] Windows .NET 8 빌드 및 DLL 참조 검증
- [x] 전직 `112`의 스킬 아이콘 3종 추출 및 PNG 확인
- [ ] 전체 스킬 탐색 및 추출
- [x] 기본 UOL 참조 처리 코드 추가 (실제 UOL 사례 검증은 남음)
- [x] 기존 PNG 재사용 및 누락 아이콘 보고
- [x] 단일 전직 ID용 출력 경로 및 CLI 옵션 구현
- [x] 전달된 전직 ID 묶음의 순차 추출 및 공통 ID 중복 생성 방지 검증

2026-11-14 검증: `Base.wz`에서 `112`의 스킬 24개를 확인했고, 22개 스킬에 대해 PNG 66개를 생성했습니다. `1120017`, `1121055`는 원본 노드에서 아이콘 3종을 찾지 못해 `MISSING`으로 보고했습니다. 같은 명령을 다시 실행하면 `created=0`, `reused=66`, `missing=6`, `failed=0`입니다.

같은 출력 디렉터리에서 히어로 연결 ID `000,100,110,111,112,114`를 실행해 `created=276`, `reused=66`, `missing=42`, `failed=0`을 확인했습니다. 이어 팔라딘 연결 ID `000,100,120,121,122,124`를 실행해 공통 ID `000,100`의 195개 PNG를 재사용하고 다른 ID에서 142개를 생성했습니다. 공통 PNG의 실행 전후 해시는 같았습니다. `100`의 PNG 한 개를 임시로 비운 후 재실행에서는 `created=1`, `reused=17`이었고 복구된 PNG는 원본과 바이트 단위로 일치했습니다. 총 10개 전직 ID 폴더에 PNG 484개가 있습니다. [Electron `REQ003`](../../apps/electron/docs/REQUIREMENTS/REQ003.md)에서 현재 스킬 목록의 이미지 연결 및 직업별 버튼 실행을 부분 검증했습니다. 전체 직업 자동 생성과 Windows 설치본 연동은 아직 구현되지 않았습니다.

## 주의사항

- `lib/`의 DLL은 외부 라이브러리이며 출처와 MIT 고지는 `THIRD_PARTY_NOTICES.md`에 기록했습니다.
- WZ 원본 및 추출한 이미지는 저작권과 이용 조건을 확인한 후 사용해야 합니다.
- 외부 DLL의 출처 및 라이선스는 `THIRD_PARTY_NOTICES.md`를 참조합니다. 역컴파일 참고 자료, 게임 원본 및 추출 이미지는 Git에서 제외합니다.
