# Jev Guide

## 1. Jev란 무엇인가

Jev는 TypeSafe AI의 System One 모델이다. 일반적인 생성형 LLM처럼 문장, 코드,
설명을 생성하는 모델이 아니라 주어진 상태(`state`)를 보고 제한된 선택지 안에서
빠르게 판단하는 모델이다.

Jev의 기본 입력과 출력은 다음과 같다.

- 입력: 문자열 또는 JSON 형태의 상태
- 질문: 코드가 정의한 하나 이상의 타입화된 질문
- 출력: 선택값, 점수 또는 참일 확률
- 부가 정보: 선택지별 확률, confidence, 토큰 사용량

Jev는 텍스트만 처리한다. 이미지, 오디오, 비디오는 직접 입력할 수 없다. 한국어를
포함한 CJK 문자도 입력할 수 있지만 공식 문서상 영어가 주 학습 언어이므로, 중요한
분류에서는 프로젝트 데이터로 정확도를 별도로 검증해야 한다.

공식 문서: [System One](https://docs.typesafe.ai/concepts/system-one)

## 2. Jev가 적합한 작업

Jev는 정확한 규칙으로 해결하기 어려운 의미 기반 판단에 사용한다.

- 정해진 카테고리 중 하나로 문서나 레코드 분류
- 설명과 가장 관련 있는 후보 선택
- 문장의 의도, 위험도 또는 품질 판단
- 추출 후보 중 원문 의미와 일치하는 값 선택
- 불확실한 입력을 자동 처리 또는 사람 검토로 분기

다음 작업에는 일반 코드를 사용한다.

- 수학 계산과 스탯 공식
- ID 또는 문자열의 정확한 일치
- CSV/JSON 파싱
- 버전 문자열 검증
- DB 무결성 및 스키마 검증
- 권한 검사와 파괴적 작업 승인

Jev의 결과는 판단 보조 정보다. 타입화된 출력이 결과의 정확성을 보장하지는 않는다.

## 3. 기본 구조

하나의 요청은 `state`, `questions`, 선택적인 `model`로 구성된다.

```ts
const response = await client.systemOne({
  state: {
    fileName: 'equipment.csv',
    columns: ['itemId', 'name', 'part', 'reqLevel'],
  },
  questions: {
    dataType: choice('이 파일에는 어떤 종류의 게임 데이터가 들어있는가?', {
      equipment: '장비, 무기, 방어구 또는 장신구 데이터',
      skill: '스킬과 스킬 효과 데이터',
      class: '직업과 전직 데이터',
      unknown: '어느 분류에도 확실하게 속하지 않음',
    }),
  },
});
```

`state`에는 판단 대상과 필요한 근거를 넣고, `questions`에는 그 근거를 보고 내려야 할
판단을 넣는다. 여러 질문이 같은 상태를 사용한다면 한 요청에 함께 보내는 것이 기본이다.
각 질문은 같은 상태를 보지만 서로의 답변은 볼 수 없으며 독립적으로 평가된다.

공식 문서: [State](https://docs.typesafe.ai/concepts/state),
[Primitives](https://docs.typesafe.ai/primitives)

## 4. 질문 타입

### Choice

순서가 없는 고정된 후보 중 하나를 선택할 때 사용한다.

```ts
const question = choice('데이터 종류를 선택하세요.', {
  equipment: '장비 데이터',
  skill: '스킬 데이터',
  unknown: '판단 근거가 부족함',
});
```

주요 반환값:

- `choice`: 가장 높은 확률의 선택지
- `probabilities`: 모든 선택지의 확률 분포
- `confidence`: 분포가 하나의 선택지에 얼마나 집중됐는지 나타내는 값

후보가 모든 상황을 포함하지 않는다면 `unknown`, `other`, `none` 같은 선택지를 둔다.

### Score

서로 순서가 있는 단계나 스펙트럼을 평가할 때 사용한다.

```ts
const question = score('데이터 변환 위험도를 평가하세요.', ['자동 변환해도 안전함', '일부 필드를 검토해야 함', '사람이 전체를 검토해야 함']);
```

주요 반환값:

- `score`: 확률 가중 평균이므로 정수가 아닐 수 있음
- `legend`: 숫자와 각 단계 설명의 대응 관계
- `probabilities`: 단계별 확률 분포
- `confidence`: 확률 분포 기반 확신도

### Noul

명확한 참/거짓 질문을 할 때 사용한다. 반환되는 `noul`은 참일 확률이다.

```ts
const question = noul('이 레코드에는 장비 이름이 포함되어 있는가?', {
  true: '명시적인 장비 이름이 있음',
  false: '장비 이름이 없거나 판단할 수 없음',
});
```

주요 반환값:

- `noul`: `0`부터 `1` 사이의 참일 확률

Noul에는 별도의 `confidence`가 없다. `0.5`는 중간 강도가 아니라 참과 거짓의 가능성이
비슷하다는 뜻이다.

## 5. 프로젝트 설치

### Agent Skill

Agent Skill은 Codex가 TypeSafe API와 질문 설계 방식을 이해하도록 하는 지침이다.
프로젝트 런타임 의존성이 아니며 Jev API를 직접 호출하지 않는다.

```bash
pnpm dlx skills add typesafe-ai/skills --skill typesafe-ai --agent codex
```

### JavaScript SDK

Electron 애플리케이션에서 실제 API를 호출하려면 공식 SDK를 설치한다.

```bash
pnpm --filter @apps/electron add @typesafe-ai/sdk
```

현재 프로젝트는 `@typesafe-ai/sdk`를 Electron main process의 런타임 의존성으로 둔다.

공식 문서: [JavaScript SDK](https://docs.typesafe.ai/sdk/javascript)

## 6. 환경 변수와 클라이언트 옵션

필수 환경 변수:

```bash
export TYPESAFE_API_KEY='발급받은 API 키'
```

지원되는 환경 변수:

| 환경 변수                | 역할                 | 기본값                    |
| ------------------------ | -------------------- | ------------------------- |
| `TYPESAFE_API_KEY`       | TypeSafe API 인증 키 | 필수                      |
| `TYPESAFE_BASE_URL`      | API 서버 주소        | `https://api.typesafe.ai` |
| `TYPESAFE_DEFAULT_MODEL` | 기본 모델            | `jev-latest`              |
| `TYPESAFE_LOG_LEVEL`     | SDK 로그 수준        | `warn`                    |

클라이언트 생성 시 환경 변수 대신 옵션을 직접 전달할 수도 있다.

```ts
const client = new TypeSafeClient({
  defaultModel: 'jev-latest',
  timeout: 10_000,
  logLevel: 'warn',
  retry: {
    maxRetries: 2,
    backoffInitialMs: 500,
    backoffMaxMs: 5_000,
  },
});
```

주요 옵션:

| 옵션             | 역할                                            |
| ---------------- | ----------------------------------------------- |
| `apiKey`         | 환경 변수 대신 API 키 지정                      |
| `baseURL`        | API 서버 주소 변경                              |
| `defaultModel`   | 요청에서 모델을 생략했을 때 사용할 모델         |
| `timeout`        | 각 요청 시도의 제한 시간                        |
| `retry`          | 재시도 횟수와 backoff 정책                      |
| `logLevel`       | `debug`, `info`, `warn`, `error`, `off` 중 선택 |
| `defaultHeaders` | 모든 요청에 추가할 HTTP 헤더                    |

API 키를 소스 코드나 Git 저장소에 기록하지 않는다. `debug` 로그는 요청 본문까지 기록할
수 있으므로 실제 데이터에 민감한 내용이 있다면 사용하지 않는다.

## 7. Electron 연결 구조

이 프로젝트에서는 다음 경계를 유지한다.

```text
renderer
  -> preload의 제한된 API
  -> Electron IPC
  -> main process의 TypeSafe 서비스
  -> TypeSafe API
```

- API 키와 SDK 클라이언트는 main process에만 둔다.
- renderer에서 `TypeSafeClient`를 직접 생성하지 않는다.
- `dangerouslyAllowBrowser`를 활성화하지 않는다.
- renderer에는 필요한 판단 결과만 전달한다.
- 파일 전체 대신 판단에 필요한 제한된 미리보기만 전송한다.
- Jev 결과만으로 DB 수정이나 삭제를 실행하지 않는다.

현재 연결의 첫 사용 사례는 업로드 파일을 `equipment`, `skill`, `class`, `monster`,
`unknown` 중 하나로 분류하는 것이다. 사용자가 분석 버튼을 눌렀을 때만 API를 호출하며,
Electron native dialog에서 선택한 파일만 분석 대상으로 허용한다.

## 8. Confidence 처리

`confidence`는 정답 확률 그 자체가 아니라 Choice 또는 Score의 확률 분포가 얼마나 한쪽에
집중되었는지를 요약한 값이다. 임계값은 작업 위험도와 실제 프로젝트 평가 결과에 따라
정해야 한다.

초기 정책 예시:

```ts
if (result.confidence >= 0.9) {
  // 자동으로 다음 검증 단계로 이동
} else if (result.confidence >= 0.6) {
  // 추천 결과를 표시하고 사용자 확인 요청
} else {
  // 자동 처리하지 않고 수동 분류 요청
}
```

위 숫자는 예시일 뿐이다. 실제 임계값은 대표 데이터와 오분류 비용을 측정한 뒤 결정한다.
DB 반영, 삭제, 배포처럼 영향이 큰 작업은 confidence가 높아도 사용자 승인을 유지한다.

공식 문서: [Confidence](https://docs.typesafe.ai/confidence)

## 9. 질문 작성 원칙

1. 질문 하나에는 빠르고 좁은 판단 하나만 넣는다.
2. `state`에는 판단에 필요한 근거만 구조화해서 제공한다.
3. 선택지 설명은 서로 겹치지 않게 작성한다.
4. 후보가 불완전할 수 있으면 `unknown`을 포함한다.
5. 동일한 상태를 보는 독립 질문은 한 요청에 묶는다.
6. 질문과 임계값을 한곳에 모아 코드 리뷰가 가능하게 한다.
7. 대표 입력, 경계 입력, 정보가 부족한 입력으로 결과를 평가한다.
8. 모델 판단과 결정론적 검증 결과를 구분해서 기록한다.

## 10. 오류 처리

주요 API 오류:

| 상태  | 의미                       | 처리                             |
| ----- | -------------------------- | -------------------------------- |
| `401` | API 키 누락 또는 인증 실패 | 키 설정 확인                     |
| `422` | 요청 또는 질문 형식 오류   | state와 questions 검증           |
| `429` | 요청 제한 초과             | backoff 후 재시도                |
| `529` | 서비스 과부하              | backoff 후 재시도 또는 수동 처리 |

공식 SDK는 기본 재시도 정책을 제공한다. 반복 실패 시 사용자의 작업을 막지 말고 분석을
건너뛰거나 수동 분류로 전환할 수 있어야 한다.

공식 문서: [HTTP API](https://docs.typesafe.ai/api)

## 11. 검증 체크리스트

- `TYPESAFE_API_KEY`가 main process 환경에만 존재하는가
- renderer 번들에 API 키나 SDK 클라이언트가 포함되지 않는가
- 질문의 모든 선택지가 명확히 구분되는가
- `unknown` 또는 수동 검토 경로가 있는가
- 낮은 confidence에서 자동 반영하지 않는가
- 전송되는 파일 미리보기의 크기가 제한되는가
- 로그에 API 키나 민감한 원문이 남지 않는가
- API 실패 시 기존 데이터 관리 기능을 계속 사용할 수 있는가

## 12. 참고 자료

- [TypeSafe AI 문서](https://docs.typesafe.ai/)
- [Agent Skill](https://docs.typesafe.ai/agent-skill)
- [System One](https://docs.typesafe.ai/concepts/system-one)
- [State](https://docs.typesafe.ai/concepts/state)
- [Primitives](https://docs.typesafe.ai/primitives)
- [Confidence](https://docs.typesafe.ai/confidence)
- [JavaScript SDK](https://docs.typesafe.ai/sdk/javascript)
- [HTTP API](https://docs.typesafe.ai/api)
