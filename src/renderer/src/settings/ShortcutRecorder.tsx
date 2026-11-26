import { useEffect, useState } from 'react'
import { buildAccelerator, formatAccelerator, isModifierCode } from '@shared/accelerator'

interface ShortcutRecorderProps {
  value: string
  disabled: boolean
  onChange: (accelerator: string) => void
}

export function ShortcutRecorder({ value, disabled, onChange }: ShortcutRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [hint, setHint] = useState('')
  const platform = window.qutie.platform

  useEffect(() => {
    if (!recording) return

    const onKeyDown = (event: KeyboardEvent): void => {
      event.preventDefault()
      event.stopPropagation()

      if (event.code === 'Escape') {
        setRecording(false)
        setHint('')
        return
      }

      if (isModifierCode(event.code)) return

      const accelerator = buildAccelerator(event, platform)
      if (!accelerator) {
        setHint('Include at least one modifier key, such as Ctrl, Alt or Shift.')
        return
      }

      setRecording(false)
      setHint('')
      onChange(accelerator)
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [recording, platform, onChange])

  return (
    <div className="recorder">
      <button
        type="button"
        className={recording ? 'recorder-button recording' : 'recorder-button'}
        disabled={disabled}
        onClick={() => {
          setHint('')
          setRecording((current) => !current)
        }}
        onBlur={() => setRecording(false)}
      >
        {recording ? 'Press your shortcut' : formatAccelerator(value, platform)}
      </button>
      <p className="field-note" aria-live="polite">
        {hint || (recording ? 'Press Esc to cancel.' : 'Select the button, then press the keys you want.')}
      </p>
    </div>
  )
}
