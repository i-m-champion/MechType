export type TouchFinger =
  | 'left_pinky'
  | 'left_ring'
  | 'left_middle'
  | 'left_index'
  | 'thumb'
  | 'right_index'
  | 'right_middle'
  | 'right_ring'
  | 'right_pinky';

export interface FingerInfo {
  id: TouchFinger;
  name: string;
  hand: 'left' | 'right' | 'both';
  color: string;
  keys: string[];
}

export interface KeyDefinition {
  code: string;
  label: string;
  subLabel?: string;
  width: number; // in unit 'u' (1 = normal key, 6.25 = spacebar)
  row: number;
  col: number;
  finger: TouchFinger;
  isModifier?: boolean;
  isSpacebar?: boolean;
  isEnter?: boolean;
  isBackspace?: boolean;
}

export const FINGER_DEFINITIONS: Record<TouchFinger, FingerInfo> = {
  left_pinky: {
    id: 'left_pinky',
    name: 'Left Pinky',
    hand: 'left',
    color: '#f43f5e',
    keys: ['`', '1', 'Tab', 'q', 'CapsLock', 'a', 'ShiftLeft', 'z', 'ControlLeft'],
  },
  left_ring: {
    id: 'left_ring',
    name: 'Left Ring',
    hand: 'left',
    color: '#fb923c',
    keys: ['2', 'w', 's', 'x', 'AltLeft'],
  },
  left_middle: {
    id: 'left_middle',
    name: 'Left Middle',
    hand: 'left',
    color: '#facc15',
    keys: ['3', 'e', 'd', 'c'],
  },
  left_index: {
    id: 'left_index',
    name: 'Left Index',
    hand: 'left',
    color: '#4ade80',
    keys: ['4', '5', 'r', 't', 'f', 'g', 'v', 'b'],
  },
  thumb: {
    id: 'thumb',
    name: 'Thumbs',
    hand: 'both',
    color: '#2dd4bf',
    keys: [' '],
  },
  right_index: {
    id: 'right_index',
    name: 'Right Index',
    hand: 'right',
    color: '#38bdf8',
    keys: ['6', '7', 'y', 'u', 'h', 'j', 'n', 'm'],
  },
  right_middle: {
    id: 'right_middle',
    name: 'Right Middle',
    hand: 'right',
    color: '#818cf8',
    keys: ['8', 'i', 'k', ','],
  },
  right_ring: {
    id: 'right_ring',
    name: 'Right Ring',
    hand: 'right',
    color: '#c084fc',
    keys: ['9', 'o', 'l', '.'],
  },
  right_pinky: {
    id: 'right_pinky',
    name: 'Right Pinky',
    hand: 'right',
    color: '#f472b6',
    keys: ['0', '-', '=', 'Backspace', 'p', '[', ']', '\\', ';', "'", 'Enter', '/', 'ShiftRight'],
  },
};
