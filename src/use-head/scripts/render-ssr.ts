export const HEAD_SCRIPTS_PLACEHOLDER = '<!-- head-scripts -->'

export function replaceHeadScriptsPlaceholder (html: string, scriptsHtml: string): string {
  return html.split(HEAD_SCRIPTS_PLACEHOLDER).join(scriptsHtml)
}
