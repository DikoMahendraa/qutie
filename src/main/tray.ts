import { Menu, Tray, app, nativeImage } from 'electron'
import trayIconPath from '../../resources/tray.png?asset'
import trayTemplatePath from '../../resources/trayTemplate.png?asset'

let tray: Tray | null = null

export interface TrayActions {
  translateSelection: () => void
  openSettings: () => void
}

export function createTray(actions: TrayActions): void {
  const isMac = process.platform === 'darwin'
  const image = nativeImage.createFromPath(isMac ? trayTemplatePath : trayIconPath)
  if (isMac) image.setTemplateImage(true)

  tray = new Tray(image)
  tray.setToolTip('Qutie')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Translate selection', click: actions.translateSelection },
      { label: 'Settings', click: actions.openSettings },
      { type: 'separator' },
      { label: 'Quit Qutie', click: () => app.quit() }
    ])
  )
  tray.on('click', actions.openSettings)
}
