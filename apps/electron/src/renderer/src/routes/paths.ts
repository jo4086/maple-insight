import type { View } from '../features/navigation/model'

export const viewPaths: Record<View, string> = {
  overview: '/',
  upload: '/upload',
  'version-list': '/version-list',
  compare: '/compare',
  equipment: '/equipment',
  class: '/class',
  operations: '/operations'
}

export function viewFromPath(pathname: string): View {
  return (Object.entries(viewPaths).find(([, path]) => path === pathname)?.[0] ??
    'overview') as View
}
