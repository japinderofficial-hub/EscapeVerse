/**
 * Web Audio API Sound Service
 * Generates procedural audio effects for clicks, typing, item pickups, door unlocks, oracle hints, and background haunted wind ambience.
 * Zero external MP3 downloads required, completely offline-compatible and cross-platform.
 */

let audioCtx = null;
let ambienceGainNode = null;
let ambienceOscillator = null;
let isMuted = false;

// Lazy initialization of Web Audio Context on user interaction
const getAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

/**
 * Sets global mute state.
 * @param {boolean} muted 
 */
export const setMuted = (muted) => {
  isMuted = muted;
  if (ambienceGainNode) {
    ambienceGainNode.gain.setTargetAtTime(isMuted ? 0 : 0.08, audioCtx ? audioCtx.currentTime : 0, 0.5);
  }
};

/**
 * Checks if sound is muted.
 * @returns {boolean}
 */
export const getMuted = () => isMuted;

/**
 * Plays a soft wooden UI click sound.
 */
export const playClickSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.04);
};

/**
 * Plays a quick, soft key tap sound for typing feedback.
 */
export const playTypingSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Subtle pitch variation for keypress realism
  const randomPitch = 600 + Math.random() * 200;
  osc.type = "triangle";
  osc.frequency.setValueAtTime(randomPitch, ctx.currentTime);

  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.02);
};

/**
 * Plays a warm chime sound when picking up an item.
 */
export const playPickupSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [440, 554.37, 659.25]; // A major triad
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

    gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.06);
    osc.stop(ctx.currentTime + idx * 0.06 + 0.4);
  });
};

/**
 * Plays a heavy metallic click for door/puzzle unlocking.
 */
export const playUnlockSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start();
  osc.stop(ctx.currentTime + 0.15);
};

/**
 * Plays a mysterious chime for Oracle hints.
 */
export const playOracleSound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [311.13, 369.99, 466.16]; // Eb minor tone
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.1);
    osc.stop(ctx.currentTime + idx * 0.1 + 0.8);
  });
};

/**
 * Plays a triumphant victory sequence on mission completion.
 */
export const playVictorySound = () => {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25]; // C major chord progression
  arpeggio.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

    gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.9);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + idx * 0.12);
    osc.stop(ctx.currentTime + idx * 0.12 + 0.9);
  });
};

/**
 * Starts continuous haunted wind background ambience loop using audio synthesis filter.
 */
export const startAmbience = () => {
  const ctx = getAudioContext();
  if (!ctx || ambienceOscillator) return;

  try {
    // Generate pink noise buffer for realistic wind swoosh
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.05;
      b6 = white * 0.115926;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate low wind gusts
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(250, ctx.currentTime);

    // LFO to slowly swell wind volume back and forth
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.1, ctx.currentTime); // 10 second wind swell cycle
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(100, ctx.currentTime);

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    ambienceGainNode = ctx.createGain();
    ambienceGainNode.gain.setValueAtTime(isMuted ? 0 : 0.08, ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(ambienceGainNode);
    ambienceGainNode.connect(ctx.destination);

    whiteNoise.start();
    lfo.start();
    ambienceOscillator = whiteNoise;
  } catch (err) {
    console.warn("Could not start Web Audio wind ambience:", err);
  }
};
