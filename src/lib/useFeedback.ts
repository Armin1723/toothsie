'use client';

import { useSettings } from './SettingsContext';
import { hapticLight, hapticMedium, hapticSuccess, hapticError } from './haptics';
import { soundFlip, soundSend, soundReceive, soundSuccess, soundError, soundGenerate, soundNav } from './sounds';

export function useFeedback() {
  const { soundEnabled, hapticEnabled } = useSettings();

  const feedback = (haptic: () => void, sound: () => void) => {
    if (hapticEnabled) haptic();
    if (soundEnabled) sound();
  };

  return {
    flip: () => feedback(hapticLight, soundFlip),
    send: () => feedback(hapticMedium, soundSend),
    receive: () => feedback(hapticLight, soundReceive),
    success: () => feedback(hapticSuccess, soundSuccess),
    error: () => feedback(hapticError, soundError),
    generate: () => feedback(hapticLight, soundGenerate),
    nav: () => feedback(hapticLight, soundNav),
  };
}
