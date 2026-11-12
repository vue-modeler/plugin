# @vue-modeler/plugin

[![test](https://github.com/vue-modeler/plugin/actions/workflows/test.yml/badge.svg)](https://github.com/vue-modeler/plugin/actions/workflows/test.yml)

Vue plugins for apps built with vue-modeler.

## Version compatibility

| @vue-modeler/plugin | Vue   |
|---------------------|-------|
| 1.x.x               | ^2.7  |

## Installation

```bash
pnpm add @vue-modeler/plugin
```

## Plugins

### `use-head`

App-scoped head/scripts controller for Vue 2.7 (client + SSR). Fresh `$head` per root app instance — not a process-wide singleton.

```ts
import Vue from 'vue'
import { UseHeadPlugin, useHead } from '@vue-modeler/plugin/use-head'

Vue.use(UseHeadPlugin)

// inside setup / composition API
const head = useHead()
head.scripts.push({
  id: 'analytics',
  src: 'https://example.com/a.js',
  async: true,
  insertTiming: 'idle',
})
```

SSR HTML for `insertTiming: 'server'` scripts:

```ts
app.$head.scripts.toHtml()
```
