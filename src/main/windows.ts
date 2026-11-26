import { BrowserWindow, nativeTheme, screen, type Point, type Rectangle } from 'electron'
import { join } from 'node:path'
import { IPC } from '@shared/constants'
import type { PopupState } from '@shared/types'
import appIcon from '../../resources/icon.png?asset'

const POPUP_WIDTH = 380
const POPUP_INITIAL_HEIGHT = 160
const POPUP_MIN_HEIGHT = 96
const POPUP_MAX_HEIGHT = 440
const CURSOR_OFFSET = 14
const BLUR_GRACE_MS = 300

function windowBackground(): string {
  return nativeTheme.shouldUseDarkColors ? '#17151f' : '#ffffff'
}

let popupWindow: BrowserWindow | null = null
let popupReady: Promise<void> | null = null
let popupShownAt = 0
let settingsWindow: BrowserWindow | null = null

function loadRoute(window: BrowserWindow, route: 'popup' | 'settings'): Promise<void> {
  const devServerUrl = process.env['ELECTRON_RENDERER_URL']
  if (devServerUrl) return window.loadURL(`${devServerUrl}#/${route}`)
  return window.loadFile(join(__dirname, '../renderer/index.html'), { hash: `/${route}` })
}

function clampToWorkArea(bounds: Rectangle, anchor: Point): Rectangle {
  const { workArea } = screen.getDisplayNearestPoint(anchor)
  const x = Math.min(Math.max(bounds.x, workArea.x), workArea.x + workArea.width - bounds.width)
  const y = Math.min(Math.max(bounds.y, workArea.y), workArea.y + workArea.height - bounds.height)
  return { ...bounds, x, y }
}

export function createPopupWindow(): void {
  popupWindow = new BrowserWindow({
    width: POPUP_WIDTH,
    height: POPUP_INITIAL_HEIGHT,
    show: false,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: true,
    backgroundColor: windowBackground(),
    icon: appIcon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  popupWindow.setAlwaysOnTop(true, 'screen-saver')
  popupWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  popupWindow.on('blur', () => {
    if (Date.now() - popupShownAt > BLUR_GRACE_MS) popupWindow?.hide()
  })

  popupReady = loadRoute(popupWindow, 'popup')
}

export function isPopupVisible(): boolean {
  return popupWindow?.isVisible() ?? false
}

export function hidePopup(): void {
  popupWindow?.hide()
}

export async function showPopup(state: PopupState, anchor: Point): Promise<void> {
  if (!popupWindow) return
  await popupReady

  const target = clampToWorkArea(
    {
      x: anchor.x + CURSOR_OFFSET,
      y: anchor.y + CURSOR_OFFSET,
      width: POPUP_WIDTH,
      height: popupWindow.getBounds().height
    },
    anchor
  )

  popupWindow.setBounds(target)
  popupShownAt = Date.now()
  popupWindow.webContents.send(IPC.popupState, state)
  popupWindow.show()
  popupWindow.focus()
}

export function updatePopup(state: PopupState): void {
  popupWindow?.webContents.send(IPC.popupState, state)
}

export function resizePopup(requestedHeight: number): void {
  if (!popupWindow) return
  const height = Math.round(Math.min(Math.max(requestedHeight, POPUP_MIN_HEIGHT), POPUP_MAX_HEIGHT))
  const bounds = popupWindow.getBounds()
  if (bounds.height === height) return
  const next = clampToWorkArea({ ...bounds, height }, { x: bounds.x, y: bounds.y })
  popupWindow.setBounds(next)
}

export function openSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    if (settingsWindow.isMinimized()) settingsWindow.restore()
    settingsWindow.show()
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 460,
    height: 500,
    useContentSize: true,
    title: 'Qutie',
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    autoHideMenuBar: true,
    backgroundColor: windowBackground(),
    icon: appIcon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  settingsWindow.removeMenu()
  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  void loadRoute(settingsWindow, 'settings')
}
