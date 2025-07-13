## 배경색 (bg-\*)

| 클래스                                          | 다크모드 | 용도                     |
| ----------------------------------------------- | :------: | ------------------------ |
| `bg-white`                                      |    x     | 카드/콘텐츠 기본 배경    |
| `bg-gray-50`                                    |    x     | 인풋/서브 패널 배경      |
| `bg-gray-100`                                   |    x     | 버튼 hover 등            |
| `bg-gray-800`                                   |    o     | 다크 카드 배경           |
| `bg-gray-900`                                   |    o     | 다크 전체 배경           |
| `bg-red-500`, `bg-blue-500`, `bg-yellow-500`    |    x     | 세트 아이콘 배경         |
| `bg-purple-100`                                 |    x     | 장비 선택 강조           |
| `bg-purple-300`                                 |    x     | 테두리 강조              |
| `bg-gradient-to-br from-purple-400 to-blue-500` |    x     | 장비 아이콘 배경         |
| `bg-red-100`, `bg-orange-100`, `bg-blue-100`    |    x     | 등급 색상 표시           |
| `bg-purple-600`                                 |    o     | 강조 버튼 등             |
| `bg-gray-200`, `bg-gray-300`                    |    x     | 비활성 버튼, 스위치 배경 |
| `bg-gray-700`                                   |    o     | 다크모드 input 배경      |

---

## 보더 (border-\*)

| 클래스               | 용도                 |
| -------------------- | -------------------- |
| `border`             | 기본 보더 활성화     |
| `border-2`           | 강조용 보더 (선택)   |
| `border-transparent` | 포커스 시 제거       |
| `border-gray-200`    | 카드 구분선 (라이트) |
| `border-gray-300`    | 라이트 인풋용        |
| `border-gray-600`    | 다크 인풋용          |
| `border-gray-700`    | 다크 카드 보더       |

---

## 텍스트 (text-\*)

| 클래스                                             | 다크모드 | 용도                       |
| -------------------------------------------------- | :------: | -------------------------- |
| `text-white`                                       |    o     | 헤더/아이콘 등 강조 텍스트 |
| `text-gray-800`                                    |    x     | 일반 본문 텍스트           |
| `text-gray-900`                                    |    x     | 헤더 강조                  |
| `text-gray-600`                                    |    x     | 보조 정보                  |
| `text-gray-500`                                    |    x     | 힌트/placeholder           |
| `text-gray-400`, `text-gray-300`                   |    o     | 다크 보조 텍스트           |
| `text-purple-600`                                  |    x     | 강조 수치/버튼             |
| `text-yellow-400`                                  |    x     | 능력치 수치 강조           |
| `text-green-400`, `text-blue-300`                  |    x     | 능력치 부가 색             |
| `text-red-600`, `text-orange-600`, `text-blue-600` |    x     | 등급 색상                  |

---

## 레이아웃 / 크기 / 여백

| 클래스                                | 설명                  |
| ------------------------------------- | --------------------- |
| `w-full`, `h-screen`, `h-96`          | 크기 지정             |
| `w-8`, `h-8`                          | 세트 아이콘 크기      |
| `w-10`, `h-10`                        | 햄버거 버튼 등        |
| `w-12`, `h-12`                        | 장비 아이콘용         |
| `p-6`, `p-3`                          | 카드 내부 여백        |
| `px-4 py-2`, `pl-10`                  | 인풋 padding          |
| `gap-2`, `gap-3`, `gap-6`             | flex 간격             |
| `space-y-2`, `space-y-3`, `space-y-4` | 리스트 수직 간격      |
| `mx-6`                                | 좌우 마진 (검색창 등) |

---

## 텍스트 크기 / 폰트 스타일

| 클래스                           | 설명                    |
| -------------------------------- | ----------------------- |
| `text-xs`, `text-sm`             | 설명, 보조 정보         |
| `text-lg`, `text-xl`, `text-3xl` | 제목, 강조 수치         |
| `font-medium`, `font-bold`       | 강조된 글자             |
| `whitespace-nowrap`              | 버튼 텍스트 줄바꿈 방지 |

---

## 레이아웃 구성

| 클래스                                                   | 설명               |
| -------------------------------------------------------- | ------------------ |
| `flex`, `items-center`, `justify-between`                | 수평 정렬          |
| `grid`, `grid-cols-1`, `lg:grid-cols-2`, `lg:col-span-2` | 반응형 배치        |
| `overflow-y-auto`                                        | 수직 스크롤 영역   |
| `rounded-lg`, `rounded`                                  | 모서리 둥글게      |
| `cursor-pointer`                                         | 클릭 가능 영역     |
| `hover:bg-*`                                             | hover 효과         |
| `transition-all`                                         | 전환 효과 부드럽게 |

---

## 포커스 / 상태 표현

| 클래스                                               | 설명                      |
| ---------------------------------------------------- | ------------------------- |
| `focus:outline-none`                                 | 기본 브라우저 포커스 제거 |
| `focus:ring-2 focus:ring-purple-500`                 | 포커스 시 링 강조         |
| `absolute left-3 top-1/2 transform -translate-y-1/2` | 아이콘 중앙 정렬 (검색창) |
