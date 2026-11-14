export type View =
  | 'overview'
  | 'upload'
  | 'version-list'
  | 'compare'
  | 'equipment'
  | 'class'
  | 'class-editor'
  | 'skill-list'
  | 'skill-editor'
  | 'skill-image'
  | 'operations'

export type NavigationItem =
  | { id: View; label: string; icon: string }
  | { label: string; icon: string; children: { id: View; label: string }[] }

export const navigation: NavigationItem[] = [
  { id: 'overview', label: '대시보드', icon: '01' },
  { id: 'upload', label: '데이터 업로드', icon: '02' },
  {
    label: '버전 관리',
    icon: '03',
    children: [
      { id: 'version-list', label: '리스트' },
      { id: 'compare', label: '비교' }
    ]
  },
  { id: 'equipment', label: '장비 데이터', icon: '04' },
  {
    label: '직업 데이터',
    icon: '05',
    children: [
      { id: 'class', label: '직업 정보' },
      { id: 'class-editor', label: '에디터' }
    ]
  },
  {
    label: '스킬 데이터',
    icon: '06',
    children: [
      { id: 'skill-list', label: '스킬 목록' },
      { id: 'skill-editor', label: '스킬 에디터' },
      { id: 'skill-image', label: '스킬 이미지' }
    ]
  },
  { id: 'operations', label: 'DB · 타입 작업', icon: '07' }
]
