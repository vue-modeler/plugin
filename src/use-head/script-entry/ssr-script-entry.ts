import { ScriptFilters } from '../scripts/script-filters'
import { ScriptEntry } from './script-entry'

type AttrValue = string | boolean | undefined

export class SsrScriptEntry extends ScriptEntry {
  readonly loadPromise: Promise<void> = Promise.resolve()

  /**
   * Serialize this entry to an HTML `<script>` tag.
   * A filter returning `false` yields an empty string (tag omitted).
   */
  toHtml (filters: ScriptFilters = new ScriptFilters()): string {
    try {
      const skippedBy = filters.run(this.descriptor)

      if (skippedBy !== undefined) {
        console.info(`[useHead] skipped script "${this.identity}" by filter "${skippedBy}"`)

        return ''
      }
    } catch (error) {
      console.warn(`[useHead] skipped script "${this.identity}" due to filter error`, error)

      return ''
    }

    const { descriptor } = this
    const onload = typeof descriptor.src === 'string'
      ? renderStringAttr('onload', ScriptEntry.SSR_ONLOAD_ATTR)
      : ''

    const attrs = [
      ...ScriptEntry.STRING_ATTRS.map((prop) => (
        renderStringAttr(ScriptEntry.toHtmlAttrName(prop), descriptor[prop])
      )),
      ...ScriptEntry.BOOLEAN_ATTRS.map((prop) => (
        renderBooleanAttr(ScriptEntry.toHtmlAttrName(prop), descriptor[prop])
      )),
      ...ScriptEntry.datasetEntries(descriptor.dataset).map(([key, value]) => (
        renderStringAttr(ScriptEntry.datasetKeyToAttrName(key), value)
      )),
      onload,
    ].join('')

    const body = typeof descriptor.text === 'string'
      ? escapeInlineScriptText(descriptor.text)
      : ''

    return `<script${attrs}>${body}</script>`
  }
}

/** Escape sequences that would break out of an inline `<script>` tag. */
export function escapeInlineScriptText (text: string): string {
  return text.replace(/<\/script/gi, '<\\/script')
}

function escapeAttr (value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

function renderStringAttr (name: string, value: AttrValue): string {
  if (typeof value !== 'string' || value === '') {
    return ''
  }

  return ` ${name}="${escapeAttr(value)}"`
}

function renderBooleanAttr (name: string, value: AttrValue): string {
  if (value !== true) {
    return ''
  }

  return ` ${name}`
}
