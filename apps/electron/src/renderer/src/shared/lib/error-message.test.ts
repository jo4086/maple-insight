import { describe, expect, it } from 'vitest'

import { getErrorMessage } from './error-message'

describe('getErrorMessage', () => {
  it('removes the Electron IPC wrapper from remote errors', () => {
    expect(
      getErrorMessage(
        new Error(
          "Error invoking remote method 'data-version:list': Error: DB 버전 목록을 불러오지 못했습니다."
        )
      )
    ).toBe('DB 버전 목록을 불러오지 못했습니다.')
  })

  it('preserves regular error messages', () => {
    expect(getErrorMessage(new Error('변환 실패'))).toBe('변환 실패')
  })
})
