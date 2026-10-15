import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { VersionListView } from './VersionListView'

describe('VersionListView', () => {
  it('formats UTC-midnight release dates as UTC calendar dates', () => {
    const markup = renderToStaticMarkup(
      <VersionListView
        currentVersion="1.2.421"
        registeredVersions={[
          {
            version: '1.2.421',
            releasedOn: '2026-10-15T00:00:00.000Z',
            createdAt: '2026-10-15T00:00:00.000Z',
            environment: 'production',
            status: 'ready'
          }
        ]}
        versionStatus="ready"
      />
    )

    expect(markup).toContain('2026. 10. 15.')
  })

  it('renders registered production and test versions', () => {
    const markup = renderToStaticMarkup(
      <VersionListView
        currentVersion="1.2.419"
        registeredVersions={[
          {
            version: '1.2.419',
            releasedOn: '2024-01-02',
            createdAt: '2024-01-03T04:05:00.000Z',
            environment: 'production',
            status: 'ready'
          },
          {
            version: '1.2.420',
            releasedOn: null,
            createdAt: '2024-01-04T05:06:00.000Z',
            environment: 'test',
            status: 'importing'
          }
        ]}
        versionStatus="ready"
      />
    )

    expect(markup).toContain('2024. 1. 2.')
    expect(markup).toContain('미등록')
    expect(markup).toContain('운영')
    expect(markup).toContain('테스트')
    expect(markup).toContain('준비됨')
    expect(markup).toContain('가져오는 중')
    expect(markup).toContain('1.2.419<span class="ml-2')
    expect(markup).toContain('>현재</span>')
  })
})
