import {
  INSERT_TIMINGS,
  type InsertTiming,
} from '../insert-timings'

export type GateCallback = () => void
export type TimingHandler = (onReady: GateCallback) => void
export type ClientInsertTiming = Exclude<
  InsertTiming,
  typeof INSERT_TIMINGS.server | typeof INSERT_TIMINGS.clientImmediate
>
export type TimingHandlers = Record<ClientInsertTiming, TimingHandler>

export const DEFAULT_TIMING_HANDLERS: TimingHandlers = {
  [INSERT_TIMINGS.idle]: runIdle,
  [INSERT_TIMINGS.domContentLoaded]: runAfterDomContentLoaded,
  [INSERT_TIMINGS.windowLoad]: runAfterWindowLoad,
  [INSERT_TIMINGS.idleAfterWindowLoad]: runIdleAfterWindowLoad,
}

function runIdle (onReady: GateCallback): void {
  const requestIdleCallback = (globalThis as {
    requestIdleCallback?: (onReady: GateCallback, opts?: { timeout: number }) => number
  }).requestIdleCallback

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(onReady, { timeout: 2000 })

    return
  }

  setTimeout(onReady, 1)
}

function runAfterDomContentLoaded (onReady: GateCallback): void {
  if (typeof document === 'undefined') {
    throw new Error('[useHead] document is required for insertTiming "dom-content-loaded"')
  }

  if (document.readyState !== 'loading') {
    onReady()

    return
  }

  document.addEventListener('DOMContentLoaded', onReady, { once: true })
}

function runAfterWindowLoad (onReady: GateCallback): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('[useHead] window/document is required for insertTiming "window-load"')
  }

  if (document.readyState === 'complete') {
    onReady()

    return
  }

  window.addEventListener('load', onReady, { once: true })
}

function runIdleAfterWindowLoad (onReady: GateCallback): void {
  runAfterWindowLoad(() => {
    runIdle(onReady)
  })
}
