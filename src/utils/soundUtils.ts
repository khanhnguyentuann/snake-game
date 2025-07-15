type SoundType = 'eat' | 'specialEat' | 'gameOver' | 'levelUp';

// Web Audio API sound generation
class SoundGenerator {
  private audioContext: AudioContext | null = null;

  constructor() {
    // Initialize AudioContext on first user interaction
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
    } catch {
      // Web Audio API not supported - silently fail
    }
  }

  private async ensureAudioContext() {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch {
        // Failed to resume audio context - silently fail
      }
    }
  }

  private createOscillator(frequency: number, type: OscillatorType = 'sine'): OscillatorNode | null {
    if (!this.audioContext) {
      return null;
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = type;

    return oscillator;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.audioContext) {
      return;
    }

    const oscillator = this.createOscillator(frequency, type);
    if (!oscillator) {
      return;
    }

    const gainNode = this.audioContext.createGain();
    oscillator.disconnect();
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  async playEatSound() {
    await this.ensureAudioContext();
    // Pleasant eating sound - quick ascending tone
    this.playTone(400, 0.1, 'sine', 0.15);
    setTimeout(() => this.playTone(600, 0.1, 'sine', 0.1), 50);
  }

  async playSpecialEatSound() {
    await this.ensureAudioContext();
    // Special food sound - magical chime
    this.playTone(800, 0.15, 'sine', 0.2);
    setTimeout(() => this.playTone(1000, 0.15, 'sine', 0.15), 75);
    setTimeout(() => this.playTone(1200, 0.15, 'sine', 0.1), 150);
  }

  async playGameOverSound() {
    await this.ensureAudioContext();
    // Game over sound - descending dramatic tone
    this.playTone(400, 0.3, 'sawtooth', 0.3);
    setTimeout(() => this.playTone(300, 0.3, 'sawtooth', 0.25), 150);
    setTimeout(() => this.playTone(200, 0.5, 'sawtooth', 0.2), 300);
  }

  async playLevelUpSound() {
    await this.ensureAudioContext();
    // Level up sound - triumphant ascending sequence
    this.playTone(500, 0.2, 'square', 0.2);
    setTimeout(() => this.playTone(700, 0.2, 'square', 0.18), 100);
    setTimeout(() => this.playTone(900, 0.2, 'square', 0.16), 200);
    setTimeout(() => this.playTone(1100, 0.3, 'square', 0.14), 300);
  }
}

// Global sound generator instance
const soundGenerator = new SoundGenerator();

// Sound settings
let soundEnabled = true;

export const toggleSound = (): boolean => {
  soundEnabled = !soundEnabled;
  localStorage.setItem('snakeGameSoundEnabled', soundEnabled.toString());
  return soundEnabled;
};

export const isSoundEnabled = (): boolean => {
  const stored = localStorage.getItem('snakeGameSoundEnabled');
  if (stored !== null) {
    soundEnabled = stored === 'true';
  }
  return soundEnabled;
};

export const playSound = async (type: SoundType): Promise<void> => {
  if (!isSoundEnabled()) {
    return;
  }

  try {
    switch (type) {
    case 'eat':
      await soundGenerator.playEatSound();
      break;
    case 'specialEat':
      await soundGenerator.playSpecialEatSound();
      break;
    case 'gameOver':
      await soundGenerator.playGameOverSound();
      break;
    case 'levelUp':
      await soundGenerator.playLevelUpSound();
      break;
    default:
      // Unknown sound type - silently ignore
      break;
    }
  } catch {
    // Failed to play sound - silently fail
  }
};

// Initialize sound on first user interaction
let soundInitialized = false;

export const initializeSound = async (): Promise<void> => {
  if (soundInitialized) {
    return;
  }

  try {
    await soundGenerator.playEatSound();
    soundInitialized = true;
  } catch {
    // Failed to initialize sound - silently fail
  }
};

// Auto-initialize sound on user interaction
if (typeof window !== 'undefined') {
  const initOnInteraction = () => {
    initializeSound();
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('keydown', initOnInteraction);
    document.removeEventListener('touchstart', initOnInteraction);
  };

  document.addEventListener('click', initOnInteraction);
  document.addEventListener('keydown', initOnInteraction);
  document.addEventListener('touchstart', initOnInteraction);
}
