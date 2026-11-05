import { ClientScripts } from './scripts/client-scripts'
import { isSsrEnvironment } from './scripts/environment'
import { SsrScripts } from './scripts/ssr-scripts'
import type { HeadController, HeadScriptsCollection } from './types'

class Head implements HeadController {
  readonly scripts: HeadScriptsCollection

  private constructor (scripts: HeadScriptsCollection) {
    this.scripts = scripts
  }

  static create (): Head {
    if (isSsrEnvironment()) {
      return Head.createSsr()
    }

    return Head.createClient()
  }

  private static createSsr (): Head {
    return new Head(SsrScripts.create())
  }

  private static createClient (): Head {
    return new Head(ClientScripts.create())
  }
}

/** Fresh head for the current environment: SSR collection when `window` is missing, client identity map otherwise. */
export function createHead (): HeadController {
  return Head.create()
}
