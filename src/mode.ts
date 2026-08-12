/**
 * Collab mode — Benable runs two campaign types and every screen must work
 * for both (Julia's master-prototype spec, local-vs-product instructions):
 * - 'product': the creator receives a product (shipped).
 * - 'local':   the creator visits the business in person. No product, no
 *              order, no package, no shipping — ever.
 *
 * Read from the URL (?mode=local), default 'product', module-persisted for
 * the session so the demo toggle survives remounts.
 */
export type CollabMode = 'product' | 'local'

let current: CollabMode | null = null

export function initialMode(): CollabMode {
  if (current) return current
  const param = new URLSearchParams(window.location.search).get('mode')
  current = param === 'local' ? 'local' : 'product'
  return current
}

export function persistMode(mode: CollabMode) {
  current = mode
  const url = new URL(window.location.href)
  url.searchParams.set('mode', mode)
  window.history.replaceState(null, '', url)
}
