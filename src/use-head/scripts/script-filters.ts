import type { HeadScriptDto, HeadScriptFilterEntry } from '../types'

/** Named filters; entry runs them at emit (`insert` / `toHtml`). `false` = skip. */
export class ScriptFilters {
  private readonly filters: HeadScriptFilterEntry[] = []

  addFilter (...entries: HeadScriptFilterEntry[]): this {
    this.filters.push(...entries)

    return this
  }

  /**
   * Runs filters in registration order.
   * @returns the key of the first filter that returned `false`, or `undefined` if all passed.
   */
  run (script: HeadScriptDto): string | undefined {
    for (const { key, filter } of this.filters) {
      if (!filter(script)) {
        return key
      }
    }

    return undefined
  }
}
