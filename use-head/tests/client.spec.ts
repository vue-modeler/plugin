/**
 * @vitest-environment happy-dom
 */
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createHead,
  DATA_LOADED_ATTR,
  DATA_LOADED_VALUE,
} from '../scripts'

function flushMicrotasks (): Promise<void> {
  return Promise.resolve().then(() => undefined)
}

async function flushIdle (): Promise<void> {
  await flushMicrotasks()
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 5)
  })
}

describe('use-head client', () => {
  afterEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('warns on duplicate id and returns the same promise', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const head = createHead()

    const [first] = head.scripts.push({
      id: 'inline',
      text: 'window.__a = 1',
      insertTiming: 'server',
    })
    const [second] = head.scripts.push({
      id: 'inline',
      text: 'window.__a = 2',
      insertTiming: 'idle',
    })

    expect(first).toBe(second)
    expect(warn.mock.calls.some((call) => String(call[0]).includes('duplicate script identity'))).toBe(true)
    expect(warn.mock.calls.some((call) => String(call[0]).includes('conflict'))).toBe(true)
    await first
    expect(document.querySelectorAll('#inline')).toHaveLength(1)
  })

  it('adopts SSR DOM tag with data-loaded', async () => {
    const el = document.createElement('script')
    el.id = 'sdk'
    el.textContent = 'window.__sdk = 1'
    el.setAttribute(DATA_LOADED_ATTR, DATA_LOADED_VALUE)
    document.head.appendChild(el)

    const head = createHead()
    const [ready] = head.scripts.push({
      id: 'sdk',
      text: 'window.__sdk = 1',
      insertTiming: 'server',
    })

    await expect(ready).resolves.toBeUndefined()
    expect(document.querySelectorAll('#sdk')).toHaveLength(1)
  })

  it('server timing without SSR tag inserts immediately and warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const head = createHead()

    const [ready] = head.scripts.push({
      id: 'boot',
      text: 'window.__boot = true',
      insertTiming: 'server',
    })

    await ready
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('insertTiming "server"'))
    expect(document.getElementById('boot')).toBeTruthy()
    expect(document.getElementById('boot')?.getAttribute(DATA_LOADED_ATTR)).toBe(DATA_LOADED_VALUE)
  })

  it('live late push after gate fired still inserts', async () => {
    expect(document.readyState).not.toBe('loading')

    const head = createHead()
    const [ready] = head.scripts.push({
      id: 'late',
      text: 'window.__late = 1',
      insertTiming: 'dom-content-loaded',
    })

    await ready
    expect(document.getElementById('late')).toBeTruthy()
  })

  it('push schedules insert without a separate startScheduler call', async () => {
    const head = createHead()
    const [ready] = head.scripts.push({
      id: 'queued',
      text: 'window.__queued = 1',
      insertTiming: 'dom-content-loaded',
    })

    await ready
    expect(document.getElementById('queued')).toBeTruthy()
  })

  it('ignoring promises still schedules insert', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const head = createHead()
    head.scripts.push({
      id: 'ignored',
      text: 'window.__ignored = 1',
      insertTiming: 'server',
    })

    await flushIdle()
    expect(document.getElementById('ignored')).toBeTruthy()
  })

  it('inserts same-timing scripts in registration order', async () => {
    const head = createHead()
    head.scripts.push(
      {
        id: 'i1',
        text: '1',
        insertTiming: 'idle',
      },
      {
        id: 'i2',
        text: '2',
        insertTiming: 'idle',
      },
    )

    await flushIdle()
    const ids = [...document.head.querySelectorAll('script')].map((el) => el.id)
    expect(ids).toEqual(['i1', 'i2'])
  })

  it('applies dataset as data-* on insert and omits empty values', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const head = createHead()
    const [ready] = head.scripts.push({
      id: 'om',
      text: 'window.__om = 1',
      insertTiming: 'server',
      dataset: {
        user: 'u1',
        account: '',
        myKey: 'v1',
      },
    })

    await ready
    const el = document.getElementById('om') as HTMLScriptElement
    expect(el.getAttribute('data-user')).toBe('u1')
    expect(el.getAttribute('data-account')).toBeNull()
    expect(el.getAttribute('data-my-key')).toBe('v1')
    expect(el.dataset.user).toBe('u1')
    expect(el.dataset.myKey).toBe('v1')
  })
})
