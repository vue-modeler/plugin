import { getCurrentInstance, inject } from 'vue'

import { HEAD_INJECT_KEY } from './plugin'
import type { HeadController } from './types'

/**
 * Resolve the app-bound head controller from the current Vue context.
 * Throws if called outside a Vue instance / without the UseHead plugin.
 */
export function useHead (): HeadController {
  const instance = getCurrentInstance()
  const fromInstance = instance?.proxy?.$head as HeadController | undefined

  if (fromInstance) {
    return fromInstance
  }

  const injected = inject<HeadController | null>(HEAD_INJECT_KEY, null)

  if (injected) {
    return injected
  }

  throw new Error('[useHead] useHead() called without Vue context or UseHead plugin')
}
