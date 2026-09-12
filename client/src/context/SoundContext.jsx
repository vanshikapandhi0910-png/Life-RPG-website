import React, { createContext, useContext, useState, useEffect } from 'react';

const SoundContext = createContext();

export const SoundProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('realmquest_sound');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [audioCtx, setAudioCtx] = useState(null);

  useEffect(() => {
    localStorage.setItem('realmquest_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const initAudio = () => {
    if (!audioCtx) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioCtx(ctx);
      return ctx;
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  const playTone = (freq, type = 'sine', duration = 0.1, delay = 0, gainVal = 0.15) => {
    if (!soundEnabled) return;
    try {
      const ctx = initAudio();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  };

  const playQuestComplete = () => {
    if (!soundEnabled) return;
    // Ascending victory arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      playTone(freq, 'triangle', 0.18, idx * 0.08, 0.18);
    });
  };

  const playLevelUp = () => {
    if (!soundEnabled) return;
    // Triumphant Fanfare: C5 -> G5 -> C6 -> E6 -> G6
    const fanfare = [523.25, 783.99, 1046.50, 1318.51, 1567.98];
    fanfare.forEach((freq, idx) => {
      playTone(freq, 'square', 0.35, idx * 0.12, 0.2);
    });
  };

  const playCoinSound = () => {
    if (!soundEnabled) return;
    playTone(987.77, 'sine', 0.08, 0, 0.2); // B5
    playTone(1318.51, 'sine', 0.2, 0.07, 0.22); // E6
  };

  const playSwordSlash = () => {
    if (!soundEnabled) return;
    playTone(320, 'sawtooth', 0.06, 0, 0.15);
    playTone(180, 'triangle', 0.15, 0.04, 0.2);
  };

  const playSpellCast = () => {
    if (!soundEnabled) return;
    [800, 700, 900, 1100].forEach((freq, idx) => {
      playTone(freq, 'sine', 0.2, idx * 0.06, 0.12);
    });
  };

  const playEquip = () => {
    if (!soundEnabled) return;
    playTone(440, 'triangle', 0.08, 0, 0.15);
    playTone(660, 'sine', 0.12, 0.06, 0.18);
  };

  const playClick = () => {
    if (!soundEnabled) return;
    playTone(600, 'sine', 0.03, 0, 0.05);
  };

  const playError = () => {
    if (!soundEnabled) return;
    playTone(180, 'sawtooth', 0.2, 0, 0.18);
    playTone(140, 'sawtooth', 0.25, 0.1, 0.2);
  };

  return (
    <SoundContext.Provider value={{
      soundEnabled,
      setSoundEnabled,
      playQuestComplete,
      playLevelUp,
      playCoinSound,
      playSwordSlash,
      playSpellCast,
      playEquip,
      playClick,
      playError
    }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
