export const INSERT_TIMINGS = {
  server: 'server',
  /** Client: insert during the current module turn, before DOMContentLoaded. */
  clientImmediate: 'client-immediate',
  idle: 'idle',
  domContentLoaded: 'dom-content-loaded',
  windowLoad: 'window-load',
  idleAfterWindowLoad: 'idle-after-window-load',
} as const

export type InsertTiming = typeof INSERT_TIMINGS[keyof typeof INSERT_TIMINGS]

export const INSERT_TIMING_VALUES: ReadonlySet<InsertTiming> = new Set(
  Object.values(INSERT_TIMINGS),
)
