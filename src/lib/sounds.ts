let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function play8Bit(freq: number, duration: number, volume = 0.1) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    // Quick attack for percussive feel
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

function playNoise(duration: number, volume = 0.04) {
  try {
    const ctx = getCtx();
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(ctx.currentTime);
  } catch {
    // silently fail
  }
}

export function soundFlip() {
  // Classic NES "blip" — quick upward chirp
  play8Bit(523, 0.06, 0.08);
  setTimeout(() => play8Bit(784, 0.04, 0.06), 35);
}

export function soundSend() {
  // Downward "boop" — like pressing a button in an RPG
  play8Bit(440, 0.05, 0.09);
  setTimeout(() => play8Bit(349, 0.07, 0.07), 50);
}

export function soundReceive() {
  // Upward two-note "ding" — message received
  play8Bit(659, 0.06, 0.08);
  setTimeout(() => play8Bit(880, 0.08, 0.07), 60);
  setTimeout(() => playNoise(0.04, 0.03), 50);
}

export function soundSuccess() {
  // Zelda-style treasure fanfare
  const notes = [523, 659, 784, 1047];
  notes.forEach((f, i) => {
    setTimeout(() => play8Bit(f, 0.1, 0.09), i * 80);
  });
  setTimeout(() => playNoise(0.06, 0.04), 280);
}

export function soundError() {
  // Low buzz — like losing a life
  play8Bit(147, 0.15, 0.12);
  setTimeout(() => play8Bit(110, 0.2, 0.1), 100);
  setTimeout(() => playNoise(0.08, 0.05), 80);
}

export function soundGenerate() {
  // Mario-style coin pickup arpeggio
  play8Bit(988, 0.05, 0.08);
  setTimeout(() => play8Bit(1319, 0.05, 0.08), 50);
  setTimeout(() => play8Bit(1760, 0.08, 0.07), 100);
  setTimeout(() => playNoise(0.03, 0.03), 130);
}

export function soundNav() {
  // Soft tick — menu navigation
  play8Bit(1109, 0.03, 0.05);
}
