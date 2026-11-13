/**
 * Filter abort: script was intentionally not inserted.
 * Passed as `cause` of `ScriptLoadError` via `fail(skip)`.
 * Callers should use `isScriptSkippedError` (walks `cause`) and treat as a quiet skip.
 */
export class ScriptSkippedError extends Error {
  readonly filterName: string

  constructor (identity: string, filterName: string) {
    super(`[useHead] skipped script "${identity}" by filter "${filterName}"`)
    this.name = 'ScriptSkippedError'
    this.filterName = filterName
  }
}

export function isScriptSkippedError (error: unknown): boolean {
  let current: unknown = error
  const seen = new Set<unknown>()

  while (current instanceof Error && !seen.has(current)) {
    seen.add(current)

    if (current instanceof ScriptSkippedError) {
      return true
    }

    current = current.cause
  }

  return false
}
