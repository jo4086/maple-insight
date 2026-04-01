## • Findings

1. 현재 앱은 사실상 character 단일 도메인 하드코딩 구조입니다. 엔트리부터 라우팅까지 character
   하나만 연결돼 있어서, 도메인 확장이 늘어나면 router.loader.ts가 빠르게 병목이 됩니다. 지금
   은 단순해서 좋지만, 이미 samples/generated/legacy/mappers/types가 커진 상태라 다음 도메인
   추가 시 구조적 일반화가 필요합니다.
   참조: src/index.ts, src/app.ts, src/loaders/router.loader.ts, src/domain/character/
   character.route.ts

2. character 도메인의 현재 실제 실행 경로는 raw fetch 집계까지만 있고, 정규화 mapper가 서비스
   흐름에 아직 연결되지 않았습니다. 프론트에서 데이터가 오는 건 맞지만, 설계상 핵심인 raw ->
   normalized 레이어가 런타임 경로에서 미사용이라 구조의 장점이 아직 절반만 살아 있습니다.
   참조: src/domain/character/character.controller.ts, src/domain/character/
   character.service.ts, src/domain/character/mappers/ability.mapper.ts, src/domain/character/
   mappers/item-equipment.mapper.ts, src/domain/character/mappers/cashitem-equipment.mapper.ts

3. legacy, samples, generated가 도메인 내부에 많이 쌓이면서 “현재 운영 코드”와 “참고/보조 자
   료”의 경계가 흐려질 위험이 있습니다. 지금은 의도적으로 잘 분리하기 시작했지만, 이 상태로 더
   늘어나면 도메인 폴더가 구현, 샘플, 마이그레이션 기록을 모두 품는 저장소가 됩니다.
   참조: src/domain/character/legacy, src/domain/character/samples, src/domain/character/
   generated

4. 미사용 또는 연결되지 않은 보조 구조가 꽤 있습니다. character.cache.ts, character.dto.ts,
   generateMapleStoryApiUrls, 캐시 시스템은 구조상 준비돼 있지만 실제 실행 경로에서는 사용되지
   않습니다. 이런 파일이 많아질수록 “현재 시스템”과 “준비 중인 구조”를 읽어 구분하는 비용이 커
   집니다.
   참조: src/domain/character/character.cache.ts, src/domain/character/character.dto.ts, src/
   utils/createDomainCache.ts, src/cache/index.ts, src/config/api-config.ts

5. 앱 초기화와 에러 처리 방식은 얇고 단순하지만, 실패를 복구하거나 원인별로 나누는 계층은 아직
   없습니다. App()와 loader에서 에러를 로그만 찍고 지나가거나, 컨트롤러에서 일괄 500으로 처리
   합니다. 지금 단계에선 빠르지만, 정규화/매퍼가 본격 연결되면 어느 레이어에서 실패했는지 추적
   이 어려워질 수 있습니다.
   참조: src/index.ts, src/loaders/index.ts, src/domain/character/character.controller.ts

### 평가

좋은 점부터 보면, 현재 구조는 “확장 준비”는 꽤 잘 돼 있습니다.

- 엔트리와 앱 조립이 매우 얇습니다.
  src/index.ts -> src/app.ts -> loaders로 이어지는 흐름은 단순하고 읽기 쉽습니다.
- raw 타입, normalized 타입, mapper, domain utils, global utils로 책임을 나누려는 방향은 좋습
  니다.
- character.service.ts에 CharacterEndpoint를 둬서 endpoint 목록을 단일 출처로 모은 건 꽤 좋은
  정리입니다.
  src/domain/character/character.service.ts
- 공통 타입을 @maple/types로 빼고, 백엔드에 raw만 남기기 시작한 방향도 맞습니다. 이건 프론트/
  백 간 계약을 한 군데로 모으는 데 큰 도움이 됩니다.

즉 구조 철학은 좋습니다. 문제는 “실행 중인 현재 시스템”과 “구축 중인 목표 구조”가 동시에 섞여
있다는 점입니다. 지금 코드는 나쁜 구조라기보다, 마이그레이션 중간 단계의 흔적이 많이 남아 있는
구조에 가깝습니다.

구조 효율성 관점

현재 효율은 “개발 효율은 높고, 운영 구조 효율은 아직 중간” 정도로 봅니다.

- 개발 효율이 높은 이유
  새 endpoint를 붙이고 raw를 관찰하고 타입을 쌓는 작업은 지금 구조가 빠릅니다. samples,
  generated, legacy가 있는 것도 그 목적에는 유리합니다.
- 운영 구조 효율이 아직 중간인 이유
  런타임 경로는 아직 raw aggregation 위주인데, 코드베이스는 normalized architecture 기준으로
  커지고 있습니다. 즉 구조 비용을 먼저 지불했지만, 그 효익이 실제 서비스 흐름에 아직 완전히 연
  결되진 않았습니다.

가장 큰 전환점은 이겁니다.

- 현재: controller -> service(raw fetch) -> raw 반환
- 목표: controller -> service(raw fetch) -> mapper -> normalized 반환

이 전환이 끝나면 지금의 타입/매퍼 분리가 확실히 빛날 겁니다.

데드코드 / 미완성 흔적

지금 기준으로 특히 눈에 띄는 항목은:

- src/domain/character/character.cache.ts: 현재 미사용
- src/domain/character/character.dto.ts: 사실상 빈 파일
- src/config/api-config.ts의 URL 생성 유틸: 준비 성격이 강하고 현재 주 경로 미사용
- legacy 폴더 전반: 의도적 보관물이므로 dead code라기보다 “격리된 과거 구조”
- samples/generated: 개발 보조물로 유용하지만 운영 코드와 같은 레벨에서 커지면 읽기 비용 증가

이건 전부 “정리 실패”라기보다, 아직 정리 시점을 일부러 늦춘 상태로 보입니다. 그래서 지금은 감
점 요소라기보단 관리 포인트입니다.

종합

구조 설계는 방향이 좋습니다. 특히:

- 앱 엔트리가 얇고
- 외부 API 응답을 raw와 normalized로 분리하려는 의도가 명확하고
- 공통 타입 패키지로 이동하는 방향도 합리적입니다.

다만 현재는 “정교한 최종 구조”라기보다 “좋은 목표 구조로 수렴 중인 마이그레이션 구조”입니다.
점수를 매기면 대략:

- 구조 방향성: 높음
- 현재 일관성: 중간
- 실행 경로 정제도: 중간 이하
- 확장 준비도: 높음

즉 설계 감각은 좋고, 지금 필요한 건 새 구조를 실제 런타임 경로에 끝까지 연결하면서, 미사용 보
조물의 역할을 더 분명히 분리하는 일입니다.

원하면 다음 단계로는 이 순서가 가장 효과적입니다.

1. character 조회 응답을 mapper 기반 normalized 반환으로 연결
2. legacy/samples/generated의 유지 기준 문서화 또는 폴더 규칙 고정
3. cache/dto/config 중 실제 미사용 파일 정리
4. router.loader.ts를 도메인 등록형으로 일반화
