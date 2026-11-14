import type { View } from '../features/navigation/model'

export const viewPaths: Record<View, string> = {
  overview: '/',
  upload: '/upload',
  'version-list': '/version-list',
  compare: '/compare',
  equipment: '/equipment',
  class: '/class',
  'class-editor': '/class/editor',
  'skill-list': '/skill',
  'skill-editor': '/skill/editor',
  'skill-image': '/skill/image',
  operations: '/operations'
}

export function viewFromPath(pathname: string): View {
  if (pathname === '/class/editor' || pathname.startsWith('/class/edit/')) return 'class-editor'
  return (Object.entries(viewPaths).find(([, path]) => path === pathname)?.[0] ??
    'overview') as View
}
