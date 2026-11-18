import { describe, expect, expectTypeOf, it, vi } from 'vitest'

import { createScriptLoader } from '../../src/use-head/create-script-loader'
import type { HeadScriptDto, HeadScriptsCollection } from '../../src/use-head/types'

type AppScript = HeadScriptDto & { skipForBots?: boolean }

describe('createScriptLoader', () => {
  it('forwards scripts to the collection and returns its promises', () => {
    const first = Promise.resolve()
    const second = Promise.resolve()
    const push = vi.fn(() => [first, second])
    const collection: HeadScriptsCollection = {
      push,
      addFilter () {},
    }

    const load = createScriptLoader<AppScript>(collection)
    const scripts: [AppScript, AppScript] = [
      {
        id: 'a',
        insertTiming: 'idle',
        skipForBots: true,
      },
      {
        id: 'b',
        text: '1',
        insertTiming: 'server',
      },
    ]
    const result = load(...scripts)

    expect(push).toHaveBeenCalledOnce()
    expect(push).toHaveBeenCalledWith(...scripts)
    expect(result).toEqual([first, second])
    expectTypeOf(load).toEqualTypeOf<(...scripts: AppScript[]) => Array<Promise<void>>>()
  })
})
