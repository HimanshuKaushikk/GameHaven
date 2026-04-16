import { Audio } from 'expo-av';

// Mapping to physical assets
const SOUNDS = {
  tap: require('../../assets/sounds/624071__the_sample_workshop__2690_vial_tap_br-f4-tmc.aiff'),
  timer: require('../../assets/sounds/450614__breviceps__8-bit-collect-sound-timer-countdown.wav'),
  piano: require('../../assets/sounds/850325__josefpres__piano-loops-207-octave-short-loop-120-bpm.wav'),
  // Fallbacks for remaining interactions
  win: 'https://actions.google.com/sounds/v1/cartoon/clown_horn.ogg',
  lose: 'https://actions.google.com/sounds/v1/cartoon/slip.ogg',
  bounce: 'https://actions.google.com/sounds/v1/impacts/wood_hit_hollow.ogg',
};

class SoundManager {
  constructor() {
    this.soundCache = {};
    this.globalVolume = 0.5; // 0.0 to 1.0 mapping from settings 0-100
    this.bgMusic = null;
  }

  async init() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Preload all sounds heavily into memory
      for (const [name, source] of Object.entries(SOUNDS)) {
        // source could be require() or string uri
        const sourceAsset = typeof source === 'string' ? { uri: source } : source;
        const { sound } = await Audio.Sound.createAsync(
            sourceAsset,
            { shouldPlay: false, volume: this.globalVolume, isLooping: name === 'piano' }
        );
        this.soundCache[name] = sound;
      }
    } catch (e) {
      console.log('Audio init failed:', e);
    }
  }

  setVolume(rawVol) {
    this.globalVolume = Math.max(0, Math.min(100, rawVol)) / 100;
    // Update all cached loaded sounds live
    Object.values(this.soundCache).forEach(sound => {
       if (sound && sound.setVolumeAsync) {
           sound.setVolumeAsync(this.globalVolume);
       }
    });
  }

  async play(soundName) {
    if (this.globalVolume <= 0) return; // Muted

    const sound = this.soundCache[soundName];
    if (!sound) return;

    try {
      // Instantly replay the completely cached audio buffer
      await sound.replayAsync();
    } catch (error) {
      console.log('Failed playing sound', soundName, error);
    }
  }

  async startBackgroundMusic(soundName) {
    if (this.bgMusic) await this.bgMusic.stopAsync();
    this.bgMusic = this.soundCache[soundName];
    if (this.bgMusic && this.globalVolume > 0) {
      await this.bgMusic.replayAsync();
    }
  }

  async stopBackgroundMusic() {
    if (this.bgMusic) {
      await this.bgMusic.stopAsync();
    }
  }
}

export default new SoundManager();
