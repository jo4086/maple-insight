const ipcErrorPrefix = /^Error invoking remote method '[^']+': (?:Error: )?/

export function getErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error)
  return message.replace(ipcErrorPrefix, '')
}
