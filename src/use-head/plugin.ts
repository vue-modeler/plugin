import Vue, { type PluginObject } from 'vue'

import { createHead } from './head'
import type { HeadController } from './types'

export const HEAD_INJECT_KEY = 'useHead:$head'

/**
 * Vue plugin: fresh `$head` per root app instance (not a process-wide singleton).
 * Child components inherit `$head` from the parent chain; Composition API can inject it.
 * Do not put the controller on `Vue.prototype` — that would leak across SSR requests.
 *
 * Client inserts are armed by live `push`/`unshift` (timing gates handle already-fired
 * events). There is no separate bootstrap `startScheduler` step — the client registry
 * starts empty and is filled by isomorphic component registrations after mount.
 */
export const UseHeadPlugin: PluginObject<never> = {
  install (VueConstructor) {
    VueConstructor.mixin({
      beforeCreate (this: Vue) {
        const options = this.$options as {
          __head?: HeadController
          parent?: Vue
        }

        this.$head = options.__head ?? options.parent?.$head ?? createHead()
      },
    })
  },
}

