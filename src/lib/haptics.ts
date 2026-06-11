export function vibrate(pattern: number | number[] = 10) {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // silently fail
  }
}

export function hapticLight() { vibrate(8); }
export function hapticMedium() { vibrate(15); }
export function hapticHeavy() { vibrate([15, 30, 15]); }
export function hapticSuccess() { vibrate([10, 50, 10, 30, 10]); }
export function hapticError() { vibrate([30, 50, 30]); }
