import type { HeadScriptDto, HeadScriptFilter } from '../types'

interface NamedFilter {
  name: string
  filter: HeadScriptFilter
}

/** Named filters; entry runs them at emit (`insert` / `toHtml`). `false` = skip. */
export class ScriptFilters {
  private readonly filters: NamedFilter[] = []

  addFilter (name: string, filter: HeadScriptFilter): void {
    this.filters.push({ name, filter })
  }

  /**
   * Runs filters in registration order.
   * @returns the name of the first filter that returned `false`, or `undefined` if all passed.
   */
  run (script: HeadScriptDto): string | undefined {
    for (const { name, filter } of this.filters) {
      if (!filter(script)) {
        return name
      }
    }

    return undefined
  }
}
