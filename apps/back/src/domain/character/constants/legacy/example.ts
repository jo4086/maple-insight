export const exampleClasses = {
  Adventurer: {
    warrior: {
      히어로: {
        progression: {
          '0': '모험가',
          '1': '검사',
          '2': '파이터',
          '3': '크루세이더',
          '4': '히어로',
        },
      },
      팔라딘: {
        progression: {
          '0': '모험가',
          '1': '검사',
          '2': '페이지',
          '3': '나이트',
          '4': '팔라딘',
        },
      },
      다크나이트: {
        progression: {
          '0': '모험가',
          '1': '검사',
          '2': '스피어맨',
          '3': '버서커',
          '4': '다크나이트',
        },
      },
    },
    pirate: {
      캡틴: {
        progression: {
          '0': '모험가',
          '1': '해적',
          '2': '건슬링거',
          '3': '발키리',
          '4': '캡틴',
        },
      },
    },
  },
} as const;

export const exampleClassMetaMap = new Map([
  ['모험가', { affiliation: 'Adventurer', group: 'warrior', finalJob: '히어로' }],
  ['검사', { affiliation: 'Adventurer', group: 'warrior', finalJob: '히어로' }],
  ['파이터', { affiliation: 'Adventurer', group: 'warrior', finalJob: '히어로' }],
  ['크루세이더', { affiliation: 'Adventurer', group: 'warrior', finalJob: '히어로' }],
  ['히어로', { affiliation: 'Adventurer', group: 'warrior', finalJob: '히어로' }],
  ['페이지', { affiliation: 'Adventurer', group: 'warrior', finalJob: '팔라딘' }],
  ['나이트', { affiliation: 'Adventurer', group: 'warrior', finalJob: '팔라딘' }],
  ['팔라딘', { affiliation: 'Adventurer', group: 'warrior', finalJob: '팔라딘' }],
  ['스피어맨', { affiliation: 'Adventurer', group: 'warrior', finalJob: '다크나이트' }],
  ['버서커', { affiliation: 'Adventurer', group: 'warrior', finalJob: '다크나이트' }],
  ['다크나이트', { affiliation: 'Adventurer', group: 'warrior', finalJob: '다크나이트' }],
  ['해적', { affiliation: 'Adventurer', group: 'pirate', finalJob: '캡틴' }],
  ['건슬링거', { affiliation: 'Adventurer', group: 'pirate', finalJob: '캡틴' }],
  ['발키리', { affiliation: 'Adventurer', group: 'pirate', finalJob: '캡틴' }],
  ['캡틴', { affiliation: 'Adventurer', group: 'pirate', finalJob: '캡틴' }],
]);
