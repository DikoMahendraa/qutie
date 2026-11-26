import { app } from 'electron'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DEFAULT_SETTINGS } from '@shared/constants'
import type { Settings } from '@shared/types'

function settingsPath(): string {
  return join(app.getPath('userData'), 'settings.json')
}

function sanitize(raw: unknown): Settings {
  const value = (raw && typeof raw === 'object' ? raw : {}) as Partial<Settings>
  return {
    shortcut:
      typeof value.shortcut === 'string' && value.shortcut.trim().length > 0
        ? value.shortcut
        : DEFAULT_SETTINGS.shortcut,
    launchAtLogin:
      typeof value.launchAtLogin === 'boolean' ? value.launchAtLogin : DEFAULT_SETTINGS.launchAtLogin
  }
}

export function loadSettings(): Settings {
  try {
    return sanitize(JSON.parse(readFileSync(settingsPath(), 'utf-8')))
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function persistSettings(settings: Settings): void {
  const target = settingsPath()
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, JSON.stringify(sanitize(settings), null, 2), 'utf-8')
}

export function hasStoredSettings(): boolean {
  try {
    readFileSync(settingsPath(), 'utf-8')
    return true
  } catch {
    return false
  }
}
