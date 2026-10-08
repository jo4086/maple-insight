export type View = 'overview' | 'upload' | 'compare' | 'equipment' | 'class' | 'operations'

export const navigation: { id: View; label: string; icon: string }[] = [
  { id: 'overview', label: '대시보드', icon: '01' },
  { id: 'upload', label: '데이터 업로드', icon: '02' },
  { id: 'compare', label: '버전 비교', icon: '03' },
  { id: 'equipment', label: '장비 데이터', icon: '04' },
  { id: 'class', label: '직업 데이터', icon: '05' },
  { id: 'operations', label: 'DB · 타입 작업', icon: '06' }
]
