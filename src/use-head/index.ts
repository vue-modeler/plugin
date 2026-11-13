import './vue-augmentation'

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
