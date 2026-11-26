import { Popup } from './popup/Popup'
import { Settings } from './settings/Settings'

export function App() {
  const route = window.location.hash.replace(/^#\/?/, '')
  return route === 'settings' ? <Settings /> : <Popup />
}
