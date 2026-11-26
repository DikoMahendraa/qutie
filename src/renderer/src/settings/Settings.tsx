import { useCallback, useEffect, useState } from 'react'
import type { Settings as SettingsModel } from '@shared/types'
import { ShortcutRecorder } from './ShortcutRecorder'

type Feedback = { kind: 'saved' | 'error'; message: string } | null

export function Settings() {
  const [settings, setSettings] = useState<SettingsModel | null>(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const supportsLaunchAtLogin = window.qutie.platform !== 'linux'

  useEffect(() => {
    void window.qutie.getSettings().then(setSettings)
  }, [])

  const save = useCallback(async (next: SettingsModel) => {
    setSaving(true)
    const result = await window.qutie.saveSettings(next)
    setSettings(result.settings)
    setFeedback(
      result.ok ? { kind: 'saved', message: 'Saved' } : { kind: 'error', message: result.error ?? 'Could not save.' }
    )
    setSaving(false)
  }, [])

  if (!settings) return null

  return (
    <div className="settings">
      <header className="settings-header">
        <h1>Qutie</h1>
        <p>Select text in any app, press your shortcut, and read the translation right there.</p>
      </header>

      <section className="field">
        <h2>Shortcut</h2>
        <ShortcutRecorder
          value={settings.shortcut}
          disabled={saving}
          onChange={(shortcut) => void save({ ...settings, shortcut })}
        />
      </section>

      <section className="field">
        <h2>Languages</h2>
        <p className="field-value">Indonesian and English</p>
        <p className="field-note">Qutie detects which one you selected and translates to the other.</p>
      </section>

      <section className="field">
        <label className="toggle">
          <input
            type="checkbox"
            checked={settings.launchAtLogin}
            disabled={saving || !supportsLaunchAtLogin}
            onChange={(event) => void save({ ...settings, launchAtLogin: event.target.checked })}
          />
          <span className="toggle-track" aria-hidden="true" />
          <span className="toggle-label">Start Qutie when I log in</span>
        </label>
        {!supportsLaunchAtLogin && (
          <p className="field-note">On Linux, add Qutie to your desktop environment's startup applications.</p>
        )}
      </section>

      <footer className="settings-footer" aria-live="polite">
        {feedback && <span className={`feedback ${feedback.kind}`}>{feedback.message}</span>}
      </footer>
    </div>
  )
}
