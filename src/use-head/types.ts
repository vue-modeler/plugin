import type { InsertTiming } from './insert-timings'

/**
 * Script descriptor aligned with HTMLScriptElement fields we emit,
 * plus required non-DOM `insertTiming`.
 *
 * Collection / DOM / SSR `toHtml` order is insertion order, not browser
 * execution order when `async: true`.
 */
export interface HeadScriptDto {
  id?: string
  src?: string
  text?: string
  type?: string
  async?: boolean
  defer?: boolean
  crossOrigin?: string
  integrity?: string
  referrerPolicy?: string
  noModule?: boolean
  nonce?: string
  /** Optional `data-*` attrs; keys use DOM dataset naming (`user` → `data-user`). */
  dataset?: Record<string, string>
  insertTiming: InsertTiming
}

/**
 * Runs at emit (`insert` / `toHtml`).
 * `true` — allow; `false` — skip (reject client load promise / omit from SSR HTML).
 */
export type HeadScriptFilter = (script: HeadScriptDto) => boolean

export interface HeadScriptsCollection {
  push: (...scripts: HeadScriptDto[]) => Array<Promise<void>>
  /** `name` is stored on `ScriptSkippedError` when the filter returns `false`. */
  addFilter: (name: string, filter: HeadScriptFilter) => void
}

export interface SsrHeadScriptsCollection extends HeadScriptsCollection {
  /** SSR HTML for `insertTiming: 'server'` entries in collection order. */
  toHtml: () => string
}

export interface HeadController {
  readonly scripts: HeadScriptsCollection
}
