export type UpdateDataVersionReleaseDateRequest = {
  version: string
  releasedOn: string | null
}

export type CopyDataVersionRequest = {
  sourceVersion: string
  targetVersion: string
}

export type DeleteDataVersionRequest = {
  version: string
  confirmationVersion: string
}

export type RegisteredDataVersion = {
  version: string
  environment: 'production' | 'test' | 'copy'
  releasedOn: string | null
  createdAt: string
  status: 'ready' | 'importing'
}
