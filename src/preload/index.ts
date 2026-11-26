import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '@shared/constants'
import type { PopupState, QutieApi, Settings } from '@shared/types'

const api: QutieApi = {
  onPopupState: (listener) => {
    const handler = (_event: Electron.IpcRendererEvent, state: PopupState): void => listener(state)
    ipcRenderer.on(IPC.popupState, handler)
    return () => ipcRenderer.removeListener(IPC.popupState, handler)
  },
  copyText: (text) => ipcRenderer.send(IPC.popupCopy, text),
  closePopup: () => ipcRenderer.send(IPC.popupClose),
  resizePopup: (height) => ipcRenderer.send(IPC.popupResize, height),
  getSettings: () => ipcRenderer.invoke(IPC.settingsGet),
  saveSettings: (settings: Settings) => ipcRenderer.invoke(IPC.settingsSave, settings),
  platform: process.platform
}

contextBridge.exposeInMainWorld('qutie', api)
