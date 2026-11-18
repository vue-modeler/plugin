import type { HeadScriptDto, HeadScriptsCollection } from './types'

/**
 * `headScripts.push` typed to an app script descriptor.
 * Extra fields on `TScript` stay on the call site; the collection stores `HeadScriptDto`.
 */
// TScript is chosen by the caller. It types the returned `scripts` argument only.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function createScriptLoader<TScript extends HeadScriptDto = HeadScriptDto> (
  headScripts: HeadScriptsCollection,
): (...scripts: TScript[]) => Array<Promise<void>> {
  return (...scripts) => headScripts.push(...scripts)
}
