import type { HeadController } from './types'

declare module 'vue/types/vue' {
  interface Vue {
    $head: HeadController
  }
}

declare module 'vue/types/options' {
  // `V` is required to match Vue's ComponentOptions generic; unused in this augmentation.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ComponentOptions<V extends import('vue').default> {
    __head?: HeadController
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $head: HeadController
  }
}

export {}
