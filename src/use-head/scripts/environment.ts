export function isSsrEnvironment (): boolean {
  return typeof window === 'undefined'
}

export function assertSsrScope (context: string): void {
  if (!isSsrEnvironment()) {
    throw new Error(`[useHead] ${context} can only be used during SSR`)
  }
}

export function assertClientScope (context: string): void {
  if (isSsrEnvironment()) {
    throw new Error(`[useHead] ${context} can only be used in the browser`)
  }
}
