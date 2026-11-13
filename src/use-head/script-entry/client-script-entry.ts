import { INSERT_TIMINGS } from '../insert-timings'
import { ScriptLoadError, ScriptSkippedError } from '../errors'
import type { ScriptFilters } from '../scripts/script-filters'
import type { HeadScriptDto } from '../types'
import { ScriptEntry } from './script-entry'

export class ClientScriptEntry extends ScriptEntry {
  readonly loadPromise: Promise<void>

  private el: HTMLScriptElement | null = null
  private readonly resolveLoad: () => void
  private readonly rejectLoad: (reason?: unknown) => void

  constructor (script: HeadScriptDto) {
    super(script)

    let resolveLoad!: () => void
    let rejectLoad!: (reason?: unknown) => void

    this.loadPromise = new Promise<void>((resolve, reject) => {
      resolveLoad = resolve
      rejectLoad = reject
    })

    this.resolveLoad = resolveLoad
    this.rejectLoad = rejectLoad
  }

  /**
   * Resolve `loadPromise` and set `data-loaded` on the bound DOM element.
   */
  protected markAsLoaded (): void {
    if (!this.el) {
      throw new Error(`[useHead] script "${this.identity}" not found`)
    }

    if (this.el.getAttribute(ScriptEntry.DATA_LOADED_ATTR) !== ScriptEntry.DATA_LOADED_VALUE) {
      this.el.setAttribute(ScriptEntry.DATA_LOADED_ATTR, ScriptEntry.DATA_LOADED_VALUE)
    }

    this.resolveLoad()
  }

  protected fail (reason: unknown): void {
    this.rejectLoad(new ScriptLoadError(this.identity, this.descriptor, { cause: reason }))
  }

  /**
   * Adopt an existing DOM tag or append a new one into `document.head`.
   * A filter returning `false` calls `fail` with `ScriptSkippedError` as `cause`.
   */
  insert (filters: ScriptFilters): void {
    if (this.el) {
      return
    }

    try {
      const skippedBy = filters.run(this.descriptor)

      if (skippedBy) {
        this.fail(new ScriptSkippedError(this.identity, skippedBy))

        return
      }
    } catch (error) {
      this.fail(error)

      return
    }

    const existing = this.findExistingElement()

    if (existing) {
      this.el = existing
      this.initFromDomElement()

      return
    }

    this.createNewEl()
  }

  protected findExistingElement (): HTMLScriptElement | null {
    if (!this.descriptor.id || typeof document === 'undefined') {
      return null
    }

    const el = document.getElementById(this.descriptor.id)

    return el instanceof HTMLScriptElement
      ? el
      : null
  }

  protected initFromDomElement (): void {
    if (!this.el) {
      throw new Error(`[useHead] script "${this.identity}" not found`)
    }

    if (typeof this.descriptor.text === 'string') {
      this.markAsLoaded()

      return
    }

    if (this.el.getAttribute(ScriptEntry.DATA_LOADED_ATTR) === ScriptEntry.DATA_LOADED_VALUE) {
      this.markAsLoaded()

      return
    }

    this.el.addEventListener('load', () => this.markAsLoaded(), { once: true })
    this.el.addEventListener('error', (error: unknown) => this.fail(error), { once: true })
  }

  protected createNewEl (): void {
    if (this.descriptor.insertTiming === INSERT_TIMINGS.server) {
      console.warn(
        `[useHead] insertTiming "server" on client without existing DOM tag for "${this.identity}"; inserting immediately into document.head`,
      )
    }

    this.el = document.createElement('script')
    this.applyAttrs(this.el)

    if (typeof this.descriptor.text === 'string') {
      this.el.textContent = this.descriptor.text
      document.head.appendChild(this.el)
      this.markAsLoaded()

      return
    }

    this.el.addEventListener('load', () => this.markAsLoaded(), { once: true })
    this.el.addEventListener('error', (error: unknown) => this.fail(error), { once: true })
    this.el.src = this.descriptor.src as string
    document.head.appendChild(this.el)
  }

  protected applyAttrs (el: HTMLScriptElement): void {
    const { descriptor } = this

    ScriptEntry.STRING_ATTRS.forEach((prop) => {
      // `src` is set after load/error listeners in createNewEl.
      if (prop === 'src') {
        return
      }

      const value = descriptor[prop]

      if (typeof value !== 'string' || value === '') {
        return
      }

      if (prop === 'referrerPolicy') {
        el.referrerPolicy = value as HTMLScriptElement['referrerPolicy']

        return
      }

      el[prop] = value
    })

    ScriptEntry.BOOLEAN_ATTRS.forEach((prop) => {
      if (descriptor[prop] === true) {
        el[prop] = true
      }
    })

    ScriptEntry.datasetEntries(descriptor.dataset).forEach(([key, value]) => {
      el.dataset[key] = value
    })
  }
}
