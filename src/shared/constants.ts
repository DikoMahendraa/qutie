export const DEFAULT_SETTINGS = {
  shortcut: 'Alt+Shift+T',
  launchAtLogin: false
} as const

export const MAX_TEXT_LENGTH = 5000

export const IPC = {
  popupState: 'popup:state',
  popupCopy: 'popup:copy',
  popupClose: 'popup:close',
  popupResize: 'popup:resize',
  settingsGet: 'settings:get',
  settingsSave: 'settings:save'
} as const
