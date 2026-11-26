import { clipboard, ClipboardItem, type ClipboardBookmark } from 'electron'
import { execFile } from 'node:child_process'

const MODIFIER_RELEASE_DELAY_MS = 220
const CLIPBOARD_POLL_INTERVAL_MS = 25
const CLIPBOARD_TIMEOUT_MS = 1500
const COMMAND_TIMEOUT_MS = 4000
const RAW_FORMAT_PREFIX = 'electron application/osclipboard'

type SnapshotEntry = Record<string, Blob | ClipboardBookmark>

export class SelectionError extends Error {}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(command, args, { timeout: COMMAND_TIMEOUT_MS, windowsHide: true }, (error, _stdout, stderr) => {
      if (error) reject(Object.assign(error, { stderr }))
      else resolve()
    })
  })
}

async function takeSnapshot(): Promise<SnapshotEntry[]> {
  try {
    const snapshot: SnapshotEntry[] = []
    for (const item of await clipboard.read()) {
      const entry: SnapshotEntry = {}
      for (const type of item.types) {
        if (type.startsWith(RAW_FORMAT_PREFIX)) continue
        entry[type] = await item.getType(type)
      }
      if (Object.keys(entry).length > 0) snapshot.push(entry)
    }
    return snapshot
  } catch {
    return []
  }
}

async function restoreSnapshot(snapshot: SnapshotEntry[]): Promise<void> {
  try {
    if (snapshot.length === 0) clipboard.clear()
    else await clipboard.write(snapshot.map((entry) => new ClipboardItem(entry)))
  } catch {
    clipboard.clear()
  }
}

async function simulateCopy(): Promise<void> {
  switch (process.platform) {
    case 'darwin':
      try {
        await runCommand('osascript', [
          '-e',
          'tell application "System Events" to keystroke "c" using command down'
        ])
      } catch (error) {
        const detail = String((error as { stderr?: string }).stderr ?? '')
        if (/not allowed|1002|assistive/i.test(detail)) {
          throw new SelectionError(
            'Qutie needs Accessibility permission. Open System Settings > Privacy & Security > Accessibility and enable Qutie.'
          )
        }
        throw new SelectionError('Could not copy the selected text.')
      }
      return
    case 'win32':
      try {
        await runCommand('powershell.exe', [
          '-NoProfile',
          '-NonInteractive',
          '-WindowStyle',
          'Hidden',
          '-Command',
          "(New-Object -ComObject WScript.Shell).SendKeys('^c')"
        ])
      } catch {
        throw new SelectionError('Could not copy the selected text.')
      }
      return
    default:
      await simulateCopyOnLinux()
  }
}

async function simulateCopyOnLinux(): Promise<void> {
  const isWayland = process.env.XDG_SESSION_TYPE === 'wayland'
  try {
    if (isWayland) await runCommand('wtype', ['-M', 'ctrl', 'c', '-m', 'ctrl'])
    else await runCommand('xdotool', ['key', '--clearmodifiers', 'ctrl+c'])
  } catch {
    throw new SelectionError(
      isWayland
        ? 'Could not copy the selected text. Install "wtype", or select the text and copy it with Ctrl+C first.'
        : 'Could not copy the selected text. Install "xdotool", or select the text and copy it with Ctrl+C first.'
    )
  }
}

async function waitForClipboardChange(marker: string): Promise<string> {
  const deadline = Date.now() + CLIPBOARD_TIMEOUT_MS
  while (Date.now() < deadline) {
    const current = await clipboard.readText()
    if (current !== marker) return current
    await sleep(CLIPBOARD_POLL_INTERVAL_MS)
  }
  return ''
}

export async function captureSelectedText(): Promise<string> {
  if (process.platform === 'linux') {
    const primarySelection = (await clipboard.selection.readText().catch(() => '')).trim()
    if (primarySelection) return primarySelection
  }

  const snapshot = await takeSnapshot()
  const marker = `qutie-marker-${Date.now()}-${Math.random()}`
  await clipboard.writeText(marker)

  try {
    await sleep(MODIFIER_RELEASE_DELAY_MS)
    await simulateCopy()
    return await waitForClipboardChange(marker)
  } finally {
    await restoreSnapshot(snapshot)
  }
}
