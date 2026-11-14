export type RegisterGameDataVersionImportOptions = {
  version: string
  releasedOn: string | null
}

export async function registerGameDataVersionImport(
  options: RegisterGameDataVersionImportOptions
): Promise<void> {
  const { startGameDataVersionImport } = await import('@maple/db/admin/game-data-version')

  await startGameDataVersionImport(options.version, {
    ...(options.releasedOn ? { releasedOn: options.releasedOn } : {})
  })
}

export async function markGameDataVersionImportFailed(version: string): Promise<void> {
  const { failGameDataVersionImport } = await import('@maple/db/admin/game-data-version')
  await failGameDataVersionImport(version)
}
