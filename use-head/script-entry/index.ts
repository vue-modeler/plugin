import { ScriptEntry } from './script-entry'

export { ClientScriptEntry } from './client-script-entry'
export {
  escapeInlineScriptText,
  SsrScriptEntry,
} from './ssr-script-entry'

/** Re-export shared data-loaded constants from the base entry. */
export const DATA_LOADED_ATTR = ScriptEntry.DATA_LOADED_ATTR
export const DATA_LOADED_VALUE = ScriptEntry.DATA_LOADED_VALUE
