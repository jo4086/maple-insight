import type { AllClassName, Affiliation, ClassGroup } from '@/taxonomy';

type ClassTreeNode = {
  className: AllClassName;
  classGroup?: ClassGroup | readonly ClassGroup[];
  children?: ClassTreeNode[];
};

type AffiliationClassTree = {
  affiliation: Affiliation;
  roots: ClassTreeNode[];
};

export const classTree: AffiliationClassTree[] = [
  {
    affiliation: '모험가',
    roots: [
      {
        className: '초보자',
        children: [
          {
            className: '검사',
            classGroup: '전사',
            children: [
              {
                className: '파이터',
                children: [{ className: '크루세이더', children: [{ className: '히어로' }] }],
              },
              {
                className: '페이지',
                children: [{ className: '나이트', children: [{ className: '팔라딘' }] }],
              },
              {
                className: '스피어맨',
                children: [{ className: '버서커', children: [{ className: '다크나이트' }] }],
              },
            ],
          },
          {
            className: '메지션',
            classGroup: '마법사',
            children: [
              {
                className: '위자드(불,독)',
                children: [
                  {
                    className: '메이지(불,독)',
                    children: [
                      {
                        className: '아크메이지(불,독)',
                      },
                    ],
                  },
                ],
              },
              {
                className: '위자드(썬,콜)',
                children: [
                  {
                    className: '메이지(썬,콜)',
                    children: [
                      {
                        className: '아크메이지(썬,콜)',
                      },
                    ],
                  },
                ],
              },
              {
                className: '클레릭',
                children: [
                  {
                    className: '프리스트',
                    children: [
                      {
                        className: '비숍',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            className: '아처',
            classGroup: '궁수',
            children: [
              {
                className: '헌터',
                children: [
                  {
                    className: '레인저',
                    children: [
                      {
                        className: '보우마스터',
                      },
                    ],
                  },
                ],
              },
              {
                className: '사수',
                children: [
                  {
                    className: '저격수',
                    children: [
                      {
                        className: '신궁',
                      },
                    ],
                  },
                ],
              },
              {
                className: '에이션트 아처',
                children: [
                  {
                    className: '체이서',
                    children: [
                      {
                        className: '패스파인더',
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            className: '로그',
            classGroup: '도적',
            children: [
              {
                className: '어쌔신',
                children: [
                  {
                    className: '허밋',
                    children: [
                      {
                        className: '나이트로드',
                      },
                    ],
                  },
                ],
              },
              {
                className: '시프',
                children: [
                  {
                    className: '시프마스터',
                    children: [
                      {
                        className: '섀도어',
                      },
                    ],
                  },
                ],
              },
              {
                className: '세미듀어러',
                children: [
                  {
                    className: '듀어러',
                    children: [
                      {
                        className: '듀얼마스터',
                        children: [
                          {
                            className: '슬래셔',
                            children: [
                              {
                                className: '듀얼블레이더',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            className: '해적',
            classGroup: '해적',
            children: [
              {
                className: '인파이터',
                children: [
                  {
                    className: '버커니어',
                    children: [
                      {
                        className: '바이퍼',
                      },
                    ],
                  },
                ],
              },
              {
                className: '건슬링거',
                children: [
                  {
                    className: '발키리',
                    children: [
                      {
                        className: '캡틴',
                      },
                    ],
                  },
                ],
              },
              {
                className: '캐논슈터',
                children: [
                  {
                    className: '캐논블래스터',
                    children: [
                      {
                        className: '캐논마스터',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    affiliation: '시그너스 기사단',
    roots: [
      {
        className: '노블레스',
        children: [
          //
          { className: '소울마스터', classGroup: '전사' },
          { className: '미하일', classGroup: '전사' },
          { className: '플레임위자드', classGroup: '마법사' },
          { className: '윈드브레이커', classGroup: '궁수' },
          { className: '나이트워커', classGroup: '도적' },
          { className: '스트라이커', classGroup: '해적' },
        ],
      },
    ],
  },
  {
    affiliation: '영웅',
    roots: [
      { className: '아란', classGroup: '전사' }, // 전사부터
      { className: '에반', classGroup: '마법사' },
      { className: '루미너스', classGroup: '마법사' },
      { className: '메르세데스', classGroup: '궁수' },
      { className: '팬텀', classGroup: '도적' },
      { className: '은월', classGroup: '해적' },
    ],
  },
  {
    affiliation: '레지스탕스',
    roots: [
      {
        className: '시티즌',
        children: [
          //
          { className: '블래스터', classGroup: '전사' },
          { className: '배틀메이지', classGroup: '마법사' },
          { className: '와일드헌터', classGroup: '궁수' },
          { className: '메카닉', classGroup: '해적' },
        ],
      },
      { className: '데몬슬레이어', classGroup: '전사' },
      { className: '데몬어벤져', classGroup: '전사' },
      { className: '제논', classGroup: ['도적', '해적'] },
    ],
  },
  {
    affiliation: '노바',
    roots: [
      //
      { className: '카이저', classGroup: '전사' },
      { className: '카인', classGroup: '궁수' },
      { className: '카데나', classGroup: '도적' },
      { className: '엔젤릭버스터', classGroup: '해적' },
    ],
  },
  {
    affiliation: '초월자',
    roots: [{ className: '제로', classGroup: '전사' }],
  },
  {
    affiliation: '프렌즈 월드',
    roots: [{ className: '키네시스', classGroup: '마법사' }],
  },
  {
    affiliation: '레프',
    roots: [
      //
      { className: '아델', classGroup: '전사' },
      { className: '일리움', classGroup: '마법사' },
      { className: '칼리', classGroup: '도적' },
      { className: '아크', classGroup: '해적' },
    ],
  },
  {
    affiliation: '아니마',
    roots: [
      //
      { className: '렌', classGroup: '전사' },
      { className: '라라', classGroup: '마법사' },
      { className: '호영', classGroup: '도적' },
    ],
  },
];
