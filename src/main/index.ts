import { app, clipboard, ipcMain, screen } from 'electron'
import { IPC } from '@shared/constants'
import type { PopupState, SaveSettingsResult, Settings } from '@shared/types'
import { hasStoredSettings, loadSettings, persistSettings } from './settings-store'
import { SelectionError, captureSelectedText } from './selection'
import { applyShortcut, releaseShortcuts } from './shortcuts'
import { TranslationError, translate } from './translator'
import { createTray } from './tray'
import {
  createPopupWindow,
  hidePopup,
  isPopupVisible,
  openSettingsWindow,
  resizePopup,
  showPopup,
  updatePopup
} from './windows'

const POPUP_HIDE_SETTLE_MS = 150

let settings: Settings
let translating = false
let shortcutActive = false

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function messageFor(error: unknown): string {
  if (error instanceof SelectionError || error instanceof TranslationError) return error.message
  return 'Something went wrong. Please try again.'
}

async function translateSelection(): Promise<void> {
  if (translating) return
  translating = true

  try {
    if (isPopupVisible()) {
      hidePopup()
      await sleep(POPUP_HIDE_SETTLE_MS)
    }

    const anchor = screen.getCursorScreenPoint()
    let original: string

    try {
      original = (await captureSelectedText()).trim()
    } catch (error) {
      await showPopup({ status: 'error', message: messageFor(error) }, anchor)
      return
    }

    if (!original) {
      await showPopup({ status: 'empty' }, anchor)
      return
    }

    await showPopup({ status: 'loading', original }, anchor)

    let finalState: PopupState
    try {
      const result = await translate(original)
      finalState = { status: 'done', original, translated: result.translated, from: result.from, to: result.to }
    } catch (error) {
      finalState = { status: 'error', message: messageFor(error) }
    }
    updatePopup(finalState)
  } finally {
    translating = false
  }
}

function applyLaunchAtLogin(enabled: boolean): void {
  if (!app.isPackaged) return
  app.setLoginItemSettings({ openAtLogin: enabled })
}

function registerIpc(): void {
  ipcMain.on(IPC.popupCopy, (_event, text: unknown) => {
    if (typeof text === 'string') void clipboard.writeText(text).catch(() => undefined)
  })

  ipcMain.on(IPC.popupClose, () => hidePopup())

  ipcMain.on(IPC.popupResize, (_event, height: unknown) => {
    if (typeof height === 'number' && Number.isFinite(height)) resizePopup(height)
  })

  ipcMain.handle(IPC.settingsGet, (): Settings => settings)

  ipcMain.handle(IPC.settingsSave, (_event, next: Settings): SaveSettingsResult => {
    const candidate: Settings = {
      shortcut: typeof next?.shortcut === 'string' ? next.shortcut.trim() : '',
      launchAtLogin: Boolean(next?.launchAtLogin)
    }

    if (!candidate.shortcut) {
      return { ok: false, error: 'Choose a shortcut first.', settings }
    }

    if (candidate.shortcut !== settings.shortcut || !shortcutActive) {
      const result = applyShortcut(candidate.shortcut, () => void translateSelection())
      if (!result.ok) return { ok: false, error: result.error, settings }
      shortcutActive = true
    }

    settings = candidate
    persistSettings(settings)
    applyLaunchAtLogin(settings.launchAtLogin)
    return { ok: true, settings }
  })
}

const hasLock = app.requestSingleInstanceLock()

if (!hasLock) {
  app.quit()
} else {
  app.on('second-instance', () => openSettingsWindow())

  app.on('window-all-closed', () => undefined)

  app.on('will-quit', () => releaseShortcuts())

  app.whenReady().then(() => {
    if (process.platform === 'darwin') app.dock?.hide()

    const isFirstRun = !hasStoredSettings()
    settings = loadSettings()

    registerIpc()
    createPopupWindow()
    createTray({ translateSelection: () => void translateSelection(), openSettings: openSettingsWindow })

    shortcutActive = applyShortcut(settings.shortcut, () => void translateSelection()).ok
    applyLaunchAtLogin(settings.launchAtLogin)

    if (isFirstRun || !shortcutActive) openSettingsWindow()
  })
}
