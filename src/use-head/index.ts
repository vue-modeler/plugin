import './vue-augmentation'

export { createScriptLoader } from './create-script-loader'
export { UseHeadPlugin } from './plugin'
export { useHead } from './use-head'
export {
  isScriptLoadError,
  isScriptSkippedError,
  ScriptLoadError,
  ScriptSkippedError,
} from './errors'
export type { ScriptLoadErrorOptions } from './errors'
export type {
  HeadController,
  HeadScriptDto,
  HeadScriptFilter,
  HeadScriptsCollection,
  SsrHeadScriptsCollection,
} from './types'
export type { InsertTiming } from './insert-timings'
