// Mood → visual style mapping. This is your creativity differentiator:
// the comic visually shifts based on mood.

export const moodStyles = {
  happy: {
    palette: { bg: '#FFD23F', accent: '#EE4266', ink: '#0D1B2A' },
    sfxBank: ['YAY!', 'WHEE!', 'ZING!', 'POP!'],
    genre: 'slice-of-life'
  },
  sad: {
    palette: { bg: '#B8C5D6', accent: '#4A5568', ink: '#1A202C' },
    sfxBank: ['SIGH', 'DRIP', 'TICK', 'HUSH'],
    genre: 'noir'
  },
  melancholic: {
    palette: { bg: '#9FA8BA', accent: '#5C6B7F', ink: '#1A202C' },
    sfxBank: ['SIGH...', 'DRIP', 'FADE', 'ECHO'],
    genre: 'noir'
  },
  adventurous: {
    palette: { bg: '#3BCEAC', accent: '#EE4266', ink: '#0D1B2A' },
    sfxBank: ['ZOOM!', 'WHOOSH!', 'BAM!', 'DASH!'],
    genre: 'action'
  },
  hyper: {
    palette: { bg: '#FF6B35', accent: '#FFD23F', ink: '#0D1B2A' },
    sfxBank: ['BAM!', 'POW!', 'ZAP!', 'BOOM!'],
    genre: 'action'
  },
  calm: {
    palette: { bg: '#E0F2E9', accent: '#3BCEAC', ink: '#0D1B2A' },
    sfxBank: ['hmm~', 'sway', 'soft', 'ahh'],
    genre: 'slice-of-life'
  },
  romantic: {
    palette: { bg: '#FFD6E0', accent: '#EE4266', ink: '#4A1A2E' },
    sfxBank: ['♥', 'SWOON', 'BLUSH', 'SIGH~'],
    genre: 'romance'
  },
  mysterious: {
    palette: { bg: '#2D3142', accent: '#9B5DE5', ink: '#F5F5F5' },
    sfxBank: ['HMM?', 'GASP!', 'AHA!', 'SHH...'],
    genre: 'mystery'
  },
  curious: {
    palette: { bg: '#F7E8A4', accent: '#9B5DE5', ink: '#0D1B2A' },
    sfxBank: ['HMM?', 'AHA!', 'OH?', 'PEEK'],
    genre: 'mystery'
  },
  nostalgic: {
    palette: { bg: '#E8D5B7', accent: '#C17767', ink: '#3E2723' },
    sfxBank: ['AH...', 'SIGH', 'REMEMBER', 'FADE'],
    genre: 'slice-of-life'
  },
  lazy: {
    palette: { bg: '#FAE5C3', accent: '#FFB366', ink: '#0D1B2A' },
    sfxBank: ['YAWN', 'ZZZ', 'SLOW', 'MMM'],
    genre: 'slice-of-life'
  },
  default: {
    palette: { bg: '#FFF8E7', accent: '#EE4266', ink: '#0D1B2A' },
    sfxBank: ['POW!', 'ZAP!', 'BAM!', 'WHOOSH!'],
    genre: 'adventure'
  }
};

export function getMoodStyle(mood) {
  const key = (mood || '').toLowerCase().trim();
  return moodStyles[key] || moodStyles.default;
}

export const PRESET_MOODS = [
  'happy', 'melancholic', 'adventurous', 'romantic',
  'mysterious', 'lazy', 'nostalgic', 'hyper'
];
