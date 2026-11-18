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

export interface HeadScriptFilterEntry {
  /** Stored on `ScriptSkippedError.filterName` when the filter returns `false`. */
  key: string
  filter: HeadScriptFilter
}

export interface HeadScriptsCollection {
  push: (...scripts: HeadScriptDto[]) => Array<Promise<void>>
  /** Registers filters in call order and returns this collection. */
  addFilter (...entries: HeadScriptFilterEntry[]): this
  // TScript is chosen by the caller. It types the returned `scripts` argument only.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  createLoader<TScript extends HeadScriptDto = HeadScriptDto>(): (
    ...scripts: TScript[]
  ) => Array<Promise<void>>
}

export interface SsrHeadScriptsCollection extends HeadScriptsCollection {
  /** SSR HTML for `insertTiming: 'server'` entries in collection order. */
  toHtml: () => string
}

export interface HeadController {
  readonly scripts: HeadScriptsCollection
}
