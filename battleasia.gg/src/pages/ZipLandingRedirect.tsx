import { useEffect } from 'react'

/** Serves the zip page itself (`public/full-work`), not a React recreation. */
export function ZipLandingRedirect({ chat = false }: { chat?: boolean }) {
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    if (chat) q.set('chat', '1')
    const search = q.toString()
    window.location.replace(`/full-work/index.html${search ? `?${search}` : ''}`)
  }, [chat])

  return <div style={{ minHeight: '100svh', background: '#0a0b0f' }} />
}
