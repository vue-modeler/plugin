import { INSERT_TIMINGS } from '../insert-timings'
import { SsrScriptEntry } from '../script-entry'
import type { HeadScriptDto, HeadScriptsCollection, SsrHeadScriptsCollection } from '../types'
import { assertSsrScope } from './environment'

export class SsrScripts implements SsrHeadScriptsCollection {
  private readonly byIdentity = new Map<string, SsrScriptEntry>()

  private constructor () {
    // Use SsrScripts.create() so the SSR environment is checked first.
  }

  static create (): SsrScripts {
    assertSsrScope('SsrScripts.create()')

    return new SsrScripts()
  }

  push (...scripts: HeadScriptDto[]): Array<Promise<void>> {
    return scripts.map((script) => this.appendOne(script))
  }

  toHtml (): string {
    let html = ''

    for (const entry of this.byIdentity.values()) {
      if (entry.descriptor.insertTiming !== INSERT_TIMINGS.server) {
        continue
      }

      html += entry.toHtml()
    }

    return html
  }

  private appendOne (script: HeadScriptDto): Promise<void> {
    const candidate = new SsrScriptEntry(script)
    const existing = this.byIdentity.get(candidate.identity) ?? this.byIdentity.set(candidate.identity, candidate).get(candidate.identity)!

    return existing.loadPromise
  }
}

export function isSsrScripts (
  scripts: HeadScriptsCollection,
): scripts is SsrHeadScriptsCollection {
  return 'toHtml' in scripts && typeof scripts.toHtml === 'function'
}
