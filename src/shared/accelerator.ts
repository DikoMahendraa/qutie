export interface KeyInput {
  code: string
  key: string
  ctrlKey: boolean
  metaKey: boolean
  altKey: boolean
  shiftKey: boolean
}

const MODIFIER_CODES = new Set([
  'ControlLeft',
  'ControlRight',
  'MetaLeft',
  'MetaRight',
  'AltLeft',
  'AltRight',
  'ShiftLeft',
  'ShiftRight'
])

const NAMED_KEYS: Record<string, string> = {
  Space: 'Space',
  Enter: 'Enter',
  Tab: 'Tab',
  Backspace: 'Backspace',
  Delete: 'Delete',
  Insert: 'Insert',
  Home: 'Home',
  End: 'End',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  ArrowUp: 'Up',
  ArrowDown: 'Down',
  ArrowLeft: 'Left',
  ArrowRight: 'Right',
  Minus: '-',
  Equal: '=',
  BracketLeft: '[',
  BracketRight: ']',
  Backslash: '\\',
  Semicolon: ';',
  Quote: "'",
  Comma: ',',
  Period: '.',
  Slash: '/',
  Backquote: '`'
}

export function isModifierCode(code: string): boolean {
  return MODIFIER_CODES.has(code)
}

function mainKeyFromCode(code: string): string | null {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3)
  if (/^Digit[0-9]$/.test(code)) return code.slice(5)
  if (/^F([1-9]|1[0-9]|2[0-4])$/.test(code)) return code
  return NAMED_KEYS[code] ?? null
}

export function buildAccelerator(input: KeyInput, platform: string): string | null {
  if (isModifierCode(input.code)) return null
  const mainKey = mainKeyFromCode(input.code)
  if (!mainKey) return null

  const modifiers: string[] = []
  if (input.ctrlKey) modifiers.push('Control')
  if (input.metaKey) modifiers.push(platform === 'darwin' ? 'Command' : 'Super')
  if (input.altKey) modifiers.push('Alt')
  if (input.shiftKey) modifiers.push('Shift')
  if (modifiers.length === 0) return null

  return [...modifiers, mainKey].join('+')
}

export function formatAccelerator(accelerator: string, platform: string): string {
  const isMac = platform === 'darwin'
  const labels: Record<string, string> = isMac
    ? { Control: '⌃', Command: '⌘', Super: '⌘', Alt: '⌥', Shift: '⇧', CommandOrControl: '⌘', CmdOrCtrl: '⌘' }
    : { Control: 'Ctrl', Command: 'Win', Super: 'Win', Alt: 'Alt', Shift: 'Shift', CommandOrControl: 'Ctrl', CmdOrCtrl: 'Ctrl' }
  const parts = accelerator.split('+').map((part) => labels[part] ?? part)
  return isMac ? parts.join('') : parts.join(' + ')
}
