import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Trophy, ArrowRight, Zap, Shield, Heart } from 'lucide-react';
import { useRPG } from '../context/RPGContext';
import { useSound } from '../context/SoundContext';

export default function LevelUpOverlay() {
  const { levelUpEvent, setLevelUpEvent } = useRPG();
  const { playClick } = useSound();

  if (!levelUpEvent) return null;

  const handleClose = () => {
    playClick();
    setLevelUpEvent(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.7, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 280 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/80 shadow-[0_0_80px_rgba(245,158,11,0.4)] p-8 text-center"
        >
          {/* Background Glow Halo */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Icon Badge */}
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex items-center justify-center shadow-xl shadow-amber-500/40 mb-6 border border-yellow-100"
          >
            <Crown className="w-12 h-12 text-slate-950 stroke-[2.5]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Ascended to New Tier
            </div>
            <h2 className="font-fantasy text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500 mb-2">
              LEVEL UP!
            </h2>
            <div className="text-2xl font-bold text-white mb-1">
              Level {levelUpEvent.newLevel}
            </div>
            <div className="text-sm font-medium text-amber-200/80 mb-6">
              Title Acquired: <span className="text-amber-400 font-bold">{levelUpEvent.newTitle}</span>
            </div>
          </motion.div>

          {/* Perks & Stats Gained */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-3 gap-3 bg-slate-900/80 rounded-2xl p-4 border border-slate-800 mb-8"
          >
            <div className="flex flex-col items-center">
              <Heart className="w-5 h-5 text-red-400 mb-1" />
              <span className="text-xs text-slate-400">Max HP</span>
              <span className="text-sm font-bold text-red-300">+15 HP</span>
            </div>
            <div className="flex flex-col items-center">
              <Zap className="w-5 h-5 text-blue-400 mb-1" />
              <span className="text-xs text-slate-400">Max Mana</span>
              <span className="text-sm font-bold text-blue-300">+8 MP</span>
            </div>
            <div className="flex flex-col items-center">
              <Trophy className="w-5 h-5 text-amber-400 mb-1" />
              <span className="text-xs text-slate-400">Rank Bonus</span>
              <span className="text-sm font-bold text-amber-300">+Power</span>
            </div>
          </motion.div>

          {/* Continue Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClose}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-all cursor-pointer"
          >
            <span>CLAIM GLORY & CONTINUE</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
