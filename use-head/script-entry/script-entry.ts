import { INSERT_TIMING_VALUES } from '../insert-timings'
import type { HeadScriptDto } from '../types'

/** Largest 32-bit prime; keeps hash intermediates in the safe-integer range. */
const HASH_MODULUS = 4294967291

type StringAttrProp = 'id' | 'type' | 'src' | 'crossOrigin' | 'integrity' | 'referrerPolicy' | 'nonce'
type BooleanAttrProp = 'async' | 'defer' | 'noModule'

/**
 * A registered script: always valid, always has a stable identity.
 * SSR and client differ only in readiness (already resolved vs pending load).
 */
export abstract class ScriptEntry {
  static readonly DATA_LOADED_ATTR = 'data-loaded'
  static readonly DATA_LOADED_VALUE = 'true'
  /** Inline `onload` for SSR external scripts (`data-loaded` adoption on the client). */
  static readonly SSR_ONLOAD_ATTR = `this.setAttribute('${ScriptEntry.DATA_LOADED_ATTR}','${ScriptEntry.DATA_LOADED_VALUE}')`

  /** DTO keys mirrored to DOM props / HTML attrs (`crossOrigin` → `crossorigin`). */
  protected static readonly STRING_ATTRS: readonly StringAttrProp[] = [
    'id',
    'type',
    'src',
    'crossOrigin',
    'integrity',
    'referrerPolicy',
    'nonce',
  ]

  protected static readonly BOOLEAN_ATTRS: readonly BooleanAttrProp[] = [
    'async',
    'defer',
    'noModule',
  ]

  readonly identity: string
  readonly descriptor: HeadScriptDto
  abstract readonly loadPromise: Promise<void>

  constructor (script: HeadScriptDto) {
    ScriptEntry.validate(script)
    this.descriptor = { ...script }
    this.identity = ScriptEntry.getIdentity(this.descriptor)
  }

  conflictsWith (script: HeadScriptDto): boolean {
    return this.descriptor.src !== script.src
      || this.descriptor.text !== script.text
      || this.descriptor.insertTiming !== script.insertTiming
  }

  /** HTML attribute name for a DTO prop (`referrerPolicy` → `referrerpolicy`). */
  protected static toHtmlAttrName (prop: string): string {
    return prop.toLowerCase()
  }

  /** DOM dataset key → HTML attribute (`myKey` → `data-my-key`). */
  protected static datasetKeyToAttrName (key: string): string {
    const kebab = key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)

    return `data-${kebab}`
  }

  /** Non-empty `dataset` entries in insertion order. */
  protected static datasetEntries (
    dataset: Record<string, string> | undefined,
  ): Array<[string, string]> {
    if (!dataset) {
      return []
    }

    return Object.entries(dataset).filter((entry): entry is [string, string] => {
      const value = entry[1]

      return typeof value === 'string' && value !== ''
    })
  }

  protected static validate (script: HeadScriptDto): void {
    if (typeof script !== 'object' || script === null) {
      throw new Error('[useHead] script descriptor must be an object')
    }

    const hasSrc = typeof script.src === 'string'
    const hasText = typeof script.text === 'string'

    if (hasSrc === hasText) {
      throw new Error('[useHead] script descriptor must have exactly one of `src` or `text`')
    }

    if (!INSERT_TIMING_VALUES.has(script.insertTiming)) {
      throw new Error('[useHead] script descriptor requires a valid `insertTiming`')
    }

    if (script.async && script.defer) {
      throw new Error('[useHead] script descriptor cannot have both `async` and `defer`')
    }
  }

  /** Stable identity: prefer `id`, else a hash of `src` + `type` + `text`. */
  protected static getIdentity (script: HeadScriptDto): string {
    if (script.id) {
      return script.id
    }

    return `h:${stableHash(JSON.stringify({
      src: script.src ?? null,
      type: script.type ?? null,
      text: script.text ?? null,
    }))}`
  }
}

function stableHash (input: string): string {
  let hash = 0

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) % HASH_MODULUS
  }

  return hash.toString(36)
}
