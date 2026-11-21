export type SwitchProfile =
  | 'cherry_blue'
  | 'gateron_black'
  | 'ibm_model_m'
  | 'cherry_red'
  | 'typewriter_1920';

export type BonusSoundpack =
  | 'minecraft'
  | 'rubber_duck'
  | 'bubble_wrap';

export type SoundProfileId = SwitchProfile | BonusSoundpack;

export interface SoundProfileMeta {
  id: SoundProfileId;
  name: string;
  category: 'mechanical' | 'bonus';
  description: string;
  tactileFeel: string;
  accentColor: string;
}

export const SOUND_PROFILES: SoundProfileMeta[] = [
  {
    id: 'cherry_blue',
    name: 'Cherry MX Blue',
    category: 'mechanical',
    description: 'Crisp, high-pitched tactile click and sharp metallic leaf snap',
    tactileFeel: 'Clicky (60cN actuation)',
    accentColor: '#38bdf8',
  },
  {
    id: 'gateron_black',
    name: 'Gateron Ink Black',
    category: 'mechanical',
    description: 'Deep, lubricated, buttery "thock" with cushioned bottom-out',
    tactileFeel: 'Linear Heavy (70cN actuation)',
    accentColor: '#1e293b',
  },
  {
    id: 'ibm_model_m',
    name: 'IBM Model M 1985',
    category: 'mechanical',
    description: 'Heavy buckling spring metallic clank and resonant steel backplate ring',
    tactileFeel: 'Buckling Spring (75cN actuation)',
    accentColor: '#d97706',
  },
  {
    id: 'cherry_red',
    name: 'Cherry MX Red',
    category: 'mechanical',
    description: 'Silent, buttery smooth linear glide with soft cushioned stem clack',
    tactileFeel: 'Linear Light (45cN actuation)',
    accentColor: '#ef4444',
  },
  {
    id: 'typewriter_1920',
    name: '1920s Underwood Typewriter',
    category: 'mechanical',
    description: 'Steel hammer strike onto paper platen + authentic carriage return bell *DING!* on Enter',
    tactileFeel: 'Vintage Heavy Mechanical Strike',
    accentColor: '#a8a29e',
  },
  {
    id: 'minecraft',
    name: 'Minecraft Mode',
    category: 'bonus',
    description: 'Crisp stone break clatter, crunchy wood chops, and block placement pops',
    tactileFeel: 'Voxel Block Impact',
    accentColor: '#10b981',
  },
  {
    id: 'rubber_duck',
    name: 'Rubber Duck',
    category: 'bonus',
    description: 'Cheeky high-pitch chirpy squeaks per key with a loud honk on Spacebar',
    tactileFeel: 'High-Elasticity Squeeze',
    accentColor: '#eab308',
  },
  {
    id: 'bubble_wrap',
    name: 'Bubble Wrap',
    category: 'bonus',
    description: 'Ultra-satisfying air chamber snaps and high-pressure popping bursts',
    tactileFeel: 'Pressurized Polymer Snap',
    accentColor: '#ec4899',
  },
];

export interface KeystrokeAudioEvent {
  key: string;
  code: string;
  isKeyDown: boolean;
  columnNormalized?: number; // -1 (leftmost) to +1 (rightmost) for spatial panning
  isSpacebar?: boolean;
  isEnter?: boolean;
  isBackspace?: boolean;
  isOpponent?: boolean; // If true, route to opponent spatial 3D audio panner
}
