import { useCallback, useEffect, useRef, useState } from 'react'
import type { PopupState } from '@shared/types'

const COPIED_RESET_MS = 1400

function languageLabel(code: string): string {
  return code === 'auto' ? '?' : code.split('-')[0].toUpperCase()
}

export function Popup() {
  const [state, setState] = useState<PopupState | null>(null)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(
    () =>
      window.qutie.onPopupState((next) => {
        setState(next)
        setCopied(false)
      }),
    []
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') window.qutie.closePopup()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return
    const observer = new ResizeObserver(() => window.qutie.resizePopup(element.getBoundingClientRect().height))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), COPIED_RESET_MS)
    return () => window.clearTimeout(timer)
  }, [copied])

  const copyTranslation = useCallback(() => {
    if (state?.status !== 'done') return
    window.qutie.copyText(state.translated)
    setCopied(true)
  }, [state])

  return (
    <div className="popup" ref={containerRef}>
      <header className="popup-header">
        {state?.status === 'done' ? (
          <span className="direction">
            {languageLabel(state.from)} to {languageLabel(state.to)}
          </span>
        ) : (
          <span className="brand">Qutie</span>
        )}
        <div className="popup-actions">
          {state?.status === 'done' && (
            <button type="button" className="action" onClick={copyTranslation}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          <button type="button" className="action icon" aria-label="Close" onClick={() => window.qutie.closePopup()}>
            <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </header>

      <main className="popup-body">
        {state?.status === 'done' && (
          <>
            <p className="translated">{state.translated}</p>
            <p className="original">{state.original}</p>
          </>
        )}

        {state?.status === 'loading' && (
          <>
            <p className="status" role="status">
              Translating
              <span className="dots" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </p>
            <p className="original">{state.original}</p>
          </>
        )}

        {state?.status === 'empty' && (
          <p className="status">No text selected. Highlight some text, then press the shortcut again.</p>
        )}

        {state?.status === 'error' && <p className="status error">{state.message}</p>}
      </main>
    </div>
  )
}
