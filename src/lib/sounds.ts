let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.08) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // silently fail
  }
}

export function soundFlip() {
  playTone(600, 0.08, 'sine', 0.06);
  setTimeout(() => playTone(800, 0.06, 'sine', 0.04), 40);
}

export function soundSend() {
  playTone(500, 0.06, 'sine', 0.05);
  setTimeout(() => playTone(700, 0.08, 'sine', 0.05), 60);
}

export function soundReceive() {
  playTone(400, 0.1, 'triangle', 0.06);
  setTimeout(() => playTone(600, 0.08, 'triangle', 0.04), 80);
}

export function soundSuccess() {
  [523, 659, 784].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, 'sine', 0.07), i * 100);
  });
}

export function soundError() {
  playTone(200, 0.3, 'sawtooth', 0.04);
}

export function soundGenerate() {
  playTone(300, 0.1, 'triangle', 0.05);
  setTimeout(() => playTone(500, 0.1, 'triangle', 0.05), 80);
  setTimeout(() => playTone(700, 0.15, 'triangle', 0.05), 160);
}

export function soundNav() {
  playTone(900, 0.04, 'sine', 0.03);
}
