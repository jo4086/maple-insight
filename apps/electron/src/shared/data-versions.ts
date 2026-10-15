export type RegisteredDataVersion = {
  version: string
  environment: 'production' | 'test'
  releasedOn: string | null
  createdAt: string
  status: 'ready' | 'importing'
}
