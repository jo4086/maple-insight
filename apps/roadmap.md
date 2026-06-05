# 로드 맵

### 캐릭터 검색 로직

- 월드별 ranking 조회 -> ocid, basic, union-champion 조회 -> union-champion이 같다: 같은 계정 캐릭터(본캐-부캐) -> db 저장

### api 호출 감소

- 캐릭터 검색시 초기 검색으로 스킬데이터를 저장 -> 1~하이퍼까지는 업데이트가 있기 전까지 flag로 재조회 막기
