import { KeyDefinition, TouchFinger } from '../types/keyboard';

/**
 * Full ANSI 60% / 65% Mechanical Keyboard Layout Specification
 */
export const ANSI_KEYBOARD_LAYOUT: KeyDefinition[][] = [
  // Row 0: Number Row
  [
    { code: 'Backquote', label: '`', subLabel: '~', width: 1, row: 0, col: 0, finger: 'left_pinky' },
    { code: 'Digit1', label: '1', subLabel: '!', width: 1, row: 0, col: 1, finger: 'left_pinky' },
    { code: 'Digit2', label: '2', subLabel: '@', width: 1, row: 0, col: 2, finger: 'left_ring' },
    { code: 'Digit3', label: '3', subLabel: '#', width: 1, row: 0, col: 3, finger: 'left_middle' },
    { code: 'Digit4', label: '4', subLabel: '$', width: 1, row: 0, col: 4, finger: 'left_index' },
    { code: 'Digit5', label: '5', subLabel: '%', width: 1, row: 0, col: 5, finger: 'left_index' },
    { code: 'Digit6', label: '6', subLabel: '^', width: 1, row: 0, col: 6, finger: 'right_index' },
    { code: 'Digit7', label: '7', subLabel: '&', width: 1, row: 0, col: 7, finger: 'right_index' },
    { code: 'Digit8', label: '8', subLabel: '*', width: 1, row: 0, col: 8, finger: 'right_middle' },
    { code: 'Digit9', label: '9', subLabel: '(', width: 1, row: 0, col: 9, finger: 'right_ring' },
    { code: 'Digit0', label: '0', subLabel: ')', width: 1, row: 0, col: 10, finger: 'right_pinky' },
    { code: 'Minus', label: '-', subLabel: '_', width: 1, row: 0, col: 11, finger: 'right_pinky' },
    { code: 'Equal', label: '=', subLabel: '+', width: 1, row: 0, col: 12, finger: 'right_pinky' },
    { code: 'Backspace', label: 'BACKSPACE', width: 2, row: 0, col: 13, finger: 'right_pinky', isModifier: true, isBackspace: true },
  ],
  // Row 1: QWERTY Row
  [
    { code: 'Tab', label: 'TAB', width: 1.5, row: 1, col: 0, finger: 'left_pinky', isModifier: true },
    { code: 'KeyQ', label: 'Q', width: 1, row: 1, col: 1, finger: 'left_pinky' },
    { code: 'KeyW', label: 'W', width: 1, row: 1, col: 2, finger: 'left_ring' },
    { code: 'KeyE', label: 'E', width: 1, row: 1, col: 3, finger: 'left_middle' },
    { code: 'KeyR', label: 'R', width: 1, row: 1, col: 4, finger: 'left_index' },
    { code: 'KeyT', label: 'T', width: 1, row: 1, col: 5, finger: 'left_index' },
    { code: 'KeyY', label: 'Y', width: 1, row: 1, col: 6, finger: 'right_index' },
    { code: 'KeyU', label: 'U', width: 1, row: 1, col: 7, finger: 'right_index' },
    { code: 'KeyI', label: 'I', width: 1, row: 1, col: 8, finger: 'right_middle' },
    { code: 'KeyO', label: 'O', width: 1, row: 1, col: 9, finger: 'right_ring' },
    { code: 'KeyP', label: 'P', width: 1, row: 1, col: 10, finger: 'right_pinky' },
    { code: 'BracketLeft', label: '[', subLabel: '{', width: 1, row: 1, col: 11, finger: 'right_pinky' },
    { code: 'BracketRight', label: ']', subLabel: '}', width: 1, row: 1, col: 12, finger: 'right_pinky' },
    { code: 'Backslash', label: '\\', subLabel: '|', width: 1.5, row: 1, col: 13, finger: 'right_pinky' },
  ],
  // Row 2: Home Row
  [
    { code: 'CapsLock', label: 'CAPS', width: 1.75, row: 2, col: 0, finger: 'left_pinky', isModifier: true },
    { code: 'KeyA', label: 'A', width: 1, row: 2, col: 1, finger: 'left_pinky' },
    { code: 'KeyS', label: 'S', width: 1, row: 2, col: 2, finger: 'left_ring' },
    { code: 'KeyD', label: 'D', width: 1, row: 2, col: 3, finger: 'left_middle' },
    { code: 'KeyF', label: 'F', width: 1, row: 2, col: 4, finger: 'left_index' },
    { code: 'KeyG', label: 'G', width: 1, row: 2, col: 5, finger: 'left_index' },
    { code: 'KeyH', label: 'H', width: 1, row: 2, col: 6, finger: 'right_index' },
    { code: 'KeyJ', label: 'J', width: 1, row: 2, col: 7, finger: 'right_index' },
    { code: 'KeyK', label: 'K', width: 1, row: 2, col: 8, finger: 'right_middle' },
    { code: 'KeyL', label: 'L', width: 1, row: 2, col: 9, finger: 'right_ring' },
    { code: 'Semicolon', label: ';', subLabel: ':', width: 1, row: 2, col: 10, finger: 'right_pinky' },
    { code: 'Quote', label: "'", subLabel: '"', width: 1, row: 2, col: 11, finger: 'right_pinky' },
    { code: 'Enter', label: 'ENTER', width: 2.25, row: 2, col: 12, finger: 'right_pinky', isModifier: true, isEnter: true },
  ],
  // Row 3: Bottom Row
  [
    { code: 'ShiftLeft', label: 'SHIFT', width: 2.25, row: 3, col: 0, finger: 'left_pinky', isModifier: true },
    { code: 'KeyZ', label: 'Z', width: 1, row: 3, col: 1, finger: 'left_pinky' },
    { code: 'KeyX', label: 'X', width: 1, row: 3, col: 2, finger: 'left_ring' },
    { code: 'KeyC', label: 'C', width: 1, row: 3, col: 3, finger: 'left_middle' },
    { code: 'KeyV', label: 'V', width: 1, row: 3, col: 4, finger: 'left_index' },
    { code: 'KeyB', label: 'B', width: 1, row: 3, col: 5, finger: 'left_index' },
    { code: 'KeyN', label: 'N', width: 1, row: 3, col: 6, finger: 'right_index' },
    { code: 'KeyM', label: 'M', width: 1, row: 3, col: 7, finger: 'right_index' },
    { code: 'Comma', label: ',', subLabel: '<', width: 1, row: 3, col: 8, finger: 'right_middle' },
    { code: 'Period', label: '.', subLabel: '>', width: 1, row: 3, col: 9, finger: 'right_ring' },
    { code: 'Slash', label: '/', subLabel: '?', width: 1, row: 3, col: 10, finger: 'right_pinky' },
    { code: 'ShiftRight', label: 'SHIFT', width: 2.75, row: 3, col: 11, finger: 'right_pinky', isModifier: true },
  ],
  // Row 4: Spacebar & Modifiers
  [
    { code: 'ControlLeft', label: 'CTRL', width: 1.25, row: 4, col: 0, finger: 'left_pinky', isModifier: true },
    { code: 'MetaLeft', label: 'WIN', width: 1.25, row: 4, col: 1, finger: 'left_pinky', isModifier: true },
    { code: 'AltLeft', label: 'ALT', width: 1.25, row: 4, col: 2, finger: 'left_ring', isModifier: true },
    { code: 'Space', label: 'SPACEBAR', width: 6.25, row: 4, col: 3, finger: 'thumb', isSpacebar: true },
    { code: 'AltRight', label: 'ALT', width: 1.25, row: 4, col: 4, finger: 'right_ring', isModifier: true },
    { code: 'MetaRight', label: 'FN', width: 1.25, row: 4, col: 5, finger: 'right_pinky', isModifier: true },
    { code: 'ControlRight', label: 'CTRL', width: 1.25, row: 4, col: 6, finger: 'right_pinky', isModifier: true },
  ],
];

// Fast lookup map by code
export const KEY_BY_CODE: Record<string, KeyDefinition> = {};
ANSI_KEYBOARD_LAYOUT.forEach((row) => {
  row.forEach((key) => {
    KEY_BY_CODE[key.code] = key;
  });
});

/**
 * Map character or key string to KeyDefinition
 */
export function getKeyDefinition(key: string, code?: string): KeyDefinition | undefined {
  if (code && KEY_BY_CODE[code]) {
    return KEY_BY_CODE[code];
  }

  const upper = key.toUpperCase();
  for (const row of ANSI_KEYBOARD_LAYOUT) {
    for (const k of row) {
      if (k.label === upper || k.code === `Key${upper}` || k.code === `Digit${upper}`) {
        return k;
      }
      if (k.subLabel === key) {
        return k;
      }
      if (key === ' ' && k.isSpacebar) {
        return k;
      }
    }
  }
  return undefined;
}

/**
 * Get normalized column from -1 (leftmost) to +1 (rightmost)
 */
export function getNormalizedColumn(code: string): number {
  const def = KEY_BY_CODE[code];
  if (!def) return 0;
  if (def.isSpacebar) return 0;

  // Total keyboard width is approx 15 units
  // Row width is roughly 15u
  let offset = 0;
  const row = ANSI_KEYBOARD_LAYOUT[def.row];
  if (!row) return 0;

  for (let i = 0; i < def.col; i++) {
    offset += row[i].width;
  }
  offset += def.width / 2;

  // map 0..15 to -1..+1
  return (offset / 15) * 2 - 1;
}

/**
 * Get touch typing finger for key
 */
export function getFingerForKey(key: string, code?: string): TouchFinger {
  const def = getKeyDefinition(key, code);
  return def ? def.finger : 'thumb';
}
