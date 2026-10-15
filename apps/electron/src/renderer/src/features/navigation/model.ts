export type View =
  'overview' | 'upload' | 'version-list' | 'compare' | 'equipment' | 'class' | 'operations'

export type NavigationItem =
  | { id: View; label: string; icon: string }
  | { label: string; icon: string; children: { id: View; label: string }[] }

export const navigation: NavigationItem[] = [
  { id: 'overview', label: '대시보드', icon: '01' },
  { id: 'upload', label: '데이터 업로드', icon: '02' },
  {
    label: '버전',
    icon: '03',
    children: [
      { id: 'version-list', label: '리스트' },
      { id: 'compare', label: '비교' }
    ]
  },
  { id: 'equipment', label: '장비 데이터', icon: '04' },
  { id: 'class', label: '직업 데이터', icon: '05' },
  { id: 'operations', label: 'DB · 타입 작업', icon: '06' }
]
