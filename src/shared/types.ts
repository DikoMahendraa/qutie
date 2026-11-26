export type LanguageCode = 'id' | 'en'

export interface Settings {
  shortcut: string
  launchAtLogin: boolean
}

export type PopupState =
  | { status: 'loading'; original: string }
  | { status: 'done'; original: string; translated: string; from: string; to: LanguageCode }
  | { status: 'empty' }
  | { status: 'error'; message: string }

export interface SaveSettingsResult {
  ok: boolean
  error?: string
  settings: Settings
}

export interface QutieApi {
  onPopupState: (listener: (state: PopupState) => void) => () => void
  copyText: (text: string) => void
  closePopup: () => void
  resizePopup: (height: number) => void
  getSettings: () => Promise<Settings>
  saveSettings: (settings: Settings) => Promise<SaveSettingsResult>
  platform: NodeJS.Platform
}
