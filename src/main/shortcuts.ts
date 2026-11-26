import { globalShortcut } from 'electron'

let activeAccelerator: string | null = null

export interface ShortcutResult {
  ok: boolean
  error?: string
}

function tryRegister(accelerator: string, handler: () => void): boolean {
  try {
    return globalShortcut.register(accelerator, handler)
  } catch {
    return false
  }
}

export function applyShortcut(accelerator: string, handler: () => void): ShortcutResult {
  const previous = activeAccelerator
  if (previous) globalShortcut.unregister(previous)

  if (tryRegister(accelerator, handler)) {
    activeAccelerator = accelerator
    return { ok: true }
  }

  activeAccelerator = previous && tryRegister(previous, handler) ? previous : null
  return {
    ok: false,
    error: 'This shortcut is invalid or already used by another app. Try a different combination.'
  }
}

export function releaseShortcuts(): void {
  globalShortcut.unregisterAll()
  activeAccelerator = null
}
