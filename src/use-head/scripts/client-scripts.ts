import { INSERT_TIMINGS } from '../insert-timings'
import { ClientScriptEntry } from '../script-entry'
import type { HeadScriptDto, HeadScriptsCollection } from '../types'
import { assertClientScope } from './environment'
import {
  DEFAULT_TIMING_HANDLERS,
  type TimingHandler,
  type TimingHandlers,
} from './timing-handlers'

export class ClientScripts implements HeadScriptsCollection {
  private readonly identityMap = new Map<string, ClientScriptEntry>()
  private readonly timingQueues = new Map<TimingHandler, ClientScriptEntry[]>()
  private readonly calledHandlers = new Set<TimingHandler>()

  private constructor (private readonly timingHandlers: TimingHandlers = DEFAULT_TIMING_HANDLERS) {
    Object.values(timingHandlers).forEach((handler) => {
      handler(() => {
        this.calledHandlers.add(handler)
        this.applyTimingHandler(handler)
      })
    })
  }

  static create (): ClientScripts {
    assertClientScope('ClientScripts.create()')

    return new ClientScripts()
  }

  push (...scripts: HeadScriptDto[]): Array<Promise<void>> {
    return scripts.map((script) => this.appendOne(script))
  }

  private appendOne (scriptDto: HeadScriptDto): Promise<void> {
    const candidate = new ClientScriptEntry(scriptDto)
    const existing = this.identityMap.get(candidate.identity)

    if (existing) {
      warnDuplicate(existing, scriptDto)

      return existing.loadPromise
    }

    this.identityMap.set(candidate.identity, candidate)

    this.enqueue(candidate)

    return candidate.loadPromise
  }

  private enqueue (entry: ClientScriptEntry): void {
    if (entry.descriptor.insertTiming === INSERT_TIMINGS.server) {
      entry.insert()

      return
    }

    const handler = this.timingHandlers[entry.descriptor.insertTiming]

    if (!handler) {
      throw new Error(`[useHead] no timing handler for "${entry.descriptor.insertTiming}"`)
    }

    this.getQueue(handler).push(entry)

    // Timing event has already fired — flush the queue immediately.
    if (this.calledHandlers.has(handler)) {
      this.applyTimingHandler(handler)
    }
  }

  private getQueue (handler: TimingHandler): ClientScriptEntry[] {
    return this.timingQueues.get(handler) ?? this.timingQueues.set(handler, []).get(handler)!
  }

  private applyTimingHandler (handler: TimingHandler): void {
    for (const entry of this.getQueue(handler)) {
      entry.insert()
    }

    this.timingQueues.delete(handler)
  }
}

function warnDuplicate (existing: ClientScriptEntry, script: HeadScriptDto): void {
  const conflictNote = existing.conflictsWith(script)
    ? ' Descriptors conflict (src/text/insertTiming differ); keep-first applies.'
    : ''

  console.warn(
    `[useHead] duplicate script identity "${existing.identity}"; keeping first registration.${conflictNote}`,
  )
}
