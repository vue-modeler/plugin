import { describe, expect, it, vi } from 'vitest'

import { SsrScriptEntry } from '../script-entry'
import {
  createHead,
  escapeInlineScriptText,
  HEAD_SCRIPTS_PLACEHOLDER,
  isSsrScripts,
  replaceHeadScriptsPlaceholder,
} from '../scripts'
import type { HeadScriptDto } from '../types'

function scriptsToHtml (scripts: ReturnType<typeof createHead>['scripts']): string {
  if (!isSsrScripts(scripts)) {
    throw new Error('expected SSR scripts collection')
  }

  return scripts.toHtml()
}

describe('use-head SSR toHtml / validation', () => {
  it('emits only server-timed scripts in collection order', () => {
    const head = createHead()
    head.scripts.push(
      {
        id: 'a',
        text: 'a()',
        insertTiming: 'server',
      },
      {
        id: 'b',
        src: 'https://example.com/b.js',
        insertTiming: 'idle',
      },
      {
        id: 'c',
        text: 'c()',
        insertTiming: 'server',
      },
    )

    const html = scriptsToHtml(head.scripts)

    expect(html).toContain('id="a"')
    expect(html).toContain('id="c"')
    expect(html).not.toContain('id="b"')
    expect(html.indexOf('id="a"')).toBeLessThan(html.indexOf('id="c"'))
  })

  it('escapes inline script breakouts', () => {
    const escaped = escapeInlineScriptText('foo()</script><script>alert(1)')

    expect(escaped).toBe('foo()<\\/script><script>alert(1)')
    expect(new SsrScriptEntry({
      id: 'x',
      text: '</script><script>evil()',
      insertTiming: 'server',
    }).toHtml()).toContain('<\\/script>')
  })

  it('external server scripts include onload data-loaded marker', () => {
    const html = new SsrScriptEntry({
      id: 'sdk',
      src: 'https://example.com/sdk.js',
      insertTiming: 'server',
    }).toHtml()

    expect(html).toContain('onload="this.setAttribute(\'data-loaded\',\'true\')"')
  })

  it('emits dataset as data-* attributes and omits empty values', () => {
    const html = new SsrScriptEntry({
      id: 'om',
      src: 'https://example.com/om.js',
      insertTiming: 'server',
      dataset: {
        user: 'u1',
        account: '',
        myKey: 'v&"<>',
      },
    }).toHtml()

    expect(html).toContain('data-user="u1"')
    expect(html).not.toContain('data-account')
    expect(html).toContain('data-my-key="v&amp;&quot;&lt;>"')
  })

  it('replaces placeholder and leaves none when empty', () => {
    const withScripts = replaceHeadScriptsPlaceholder(
      `<head>${HEAD_SCRIPTS_PLACEHOLDER}</head>`,
      '<script id="a"></script>',
    )

    expect(withScripts).toBe('<head><script id="a"></script></head>')
    expect(withScripts).not.toContain(HEAD_SCRIPTS_PLACEHOLDER)

    const empty = replaceHeadScriptsPlaceholder(
      `<head>${HEAD_SCRIPTS_PLACEHOLDER}</head>`,
      '',
    )

    expect(empty).toBe('<head></head>')
  })

  it('throws on invalid descriptors', () => {
    const head = createHead()

    expect(() => head.scripts.push({ insertTiming: 'server' } as HeadScriptDto)).toThrow()
    expect(() => head.scripts.push({
      src: 'a.js',
      text: 'x',
      insertTiming: 'server',
    })).toThrow()
    expect(() => head.scripts.push({
      src: 'a.js',
    } as HeadScriptDto)).toThrow()
    expect(() => head.scripts.push({
      src: 'a.js',
      async: true,
      defer: true,
      insertTiming: 'server',
    })).toThrow()
  })
})

describe('use-head SSR dedupe / resolve', () => {
  it('resolves on register and keep-first without warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const head = createHead()
    const [first] = head.scripts.push({
      id: 'sdk',
      src: 'https://example.com/a.js',
      insertTiming: 'server',
    })
    const [second] = head.scripts.push({
      id: 'sdk',
      src: 'https://example.com/b.js',
      insertTiming: 'idle',
    })

    await expect(first).resolves.toBeUndefined()
    await expect(second).resolves.toBeUndefined()
    expect(first).toBe(second)
    expect(scriptsToHtml(head.scripts)).toContain('https://example.com/a.js')
    expect(scriptsToHtml(head.scripts)).not.toContain('https://example.com/b.js')
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('keeps two app instances isolated', () => {
    const headA = createHead()
    const headB = createHead()

    headA.scripts.push({
      id: 'only-a',
      text: 'a()',
      insertTiming: 'server',
    })
    headB.scripts.push({
      id: 'only-b',
      text: 'b()',
      insertTiming: 'server',
    })

    expect(scriptsToHtml(headA.scripts)).toContain('only-a')
    expect(scriptsToHtml(headA.scripts)).not.toContain('only-b')
    expect(scriptsToHtml(headB.scripts)).toContain('only-b')
    expect(scriptsToHtml(headB.scripts)).not.toContain('only-a')
  })
})
