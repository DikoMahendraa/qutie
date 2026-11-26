import { describe, expect, it } from 'vitest'
import { buildAccelerator, formatAccelerator, type KeyInput } from '../src/shared/accelerator'

function keyInput(overrides: Partial<KeyInput>): KeyInput {
  return { code: 'KeyT', key: 't', ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, ...overrides }
}

describe('buildAccelerator', () => {
  it('builds an accelerator from modifiers and a letter', () => {
    expect(buildAccelerator(keyInput({ altKey: true, shiftKey: true }), 'win32')).toBe('Alt+Shift+T')
  })

  it('uses Command on macOS and Super elsewhere', () => {
    expect(buildAccelerator(keyInput({ metaKey: true }), 'darwin')).toBe('Command+T')
    expect(buildAccelerator(keyInput({ metaKey: true }), 'linux')).toBe('Super+T')
  })

  it('rejects keys without a modifier', () => {
    expect(buildAccelerator(keyInput({}), 'darwin')).toBeNull()
  })

  it('ignores modifier-only presses', () => {
    expect(buildAccelerator(keyInput({ code: 'ShiftLeft', shiftKey: true }), 'darwin')).toBeNull()
  })

  it('maps digits, function keys and arrows', () => {
    expect(buildAccelerator(keyInput({ code: 'Digit5', ctrlKey: true }), 'win32')).toBe('Control+5')
    expect(buildAccelerator(keyInput({ code: 'F8', ctrlKey: true }), 'win32')).toBe('Control+F8')
    expect(buildAccelerator(keyInput({ code: 'ArrowUp', altKey: true }), 'win32')).toBe('Alt+Up')
  })
})

describe('formatAccelerator', () => {
  it('uses symbols on macOS', () => {
    expect(formatAccelerator('Alt+Shift+T', 'darwin')).toBe('⌥⇧T')
  })

  it('uses words on other platforms', () => {
    expect(formatAccelerator('Control+Alt+T', 'win32')).toBe('Ctrl + Alt + T')
  })
})
