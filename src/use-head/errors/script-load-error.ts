import type { HeadScriptDto } from '../types'

export type ScriptLoadErrorOptions = ErrorOptions & {
  cause: unknown
}

/**
 * Client script failed to load / was aborted before insert.
 * `cause` may be a DOM error event, a thrown filter error, or `ScriptSkippedError`.
 */
export class ScriptLoadError extends Error {
  readonly identity: string
  readonly definition: HeadScriptDto
  override readonly cause: unknown

  constructor (
    identity: string,
    definition: HeadScriptDto,
    options: ScriptLoadErrorOptions,
  ) {
    super(`[useHead] failed to load script "${identity}"`, options)
    this.name = 'ScriptLoadError'
    this.identity = identity
    this.definition = { ...definition }
    this.cause = options.cause
  }
}

export function isScriptLoadError (error: unknown): error is ScriptLoadError {
  return error instanceof ScriptLoadError
}
