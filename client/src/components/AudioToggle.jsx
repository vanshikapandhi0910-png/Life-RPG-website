import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '../context/SoundContext';

export default function AudioToggle() {
  const { soundEnabled, setSoundEnabled, playClick } = useSound();

  const handleToggle = () => {
    playClick();
    setSoundEnabled(!soundEnabled);
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold border ${
        soundEnabled
          ? 'bg-purple-950/60 border-purple-500/50 text-purple-300 hover:bg-purple-900/60 shadow-lg shadow-purple-950/50'
          : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:bg-slate-800/60'
      }`}
      title={soundEnabled ? 'Mute 8-Bit Audio' : 'Unmute 8-Bit Audio'}
      aria-label="Toggle Audio Effects"
    >
      {soundEnabled ? (
        <>
          <Volume2 className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="hidden sm:inline">SFX ON</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4 text-slate-500" />
          <span className="hidden sm:inline">SFX OFF</span>
        </>
      )}
    </button>
  );
}
