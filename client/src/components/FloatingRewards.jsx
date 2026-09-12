import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Coins, Gem, ArrowUp, HeartCrack, ShieldCheck } from 'lucide-react';
import { useRPG } from '../context/RPGContext';

export default function FloatingRewards() {
  const { rewardPopups } = useRPG();

  return (
    <div className="fixed bottom-8 right-8 z-50 pointer-events-none flex flex-col gap-2 items-end">
      <AnimatePresence>
        {rewardPopups.map((popup) => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 0, y: 25, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-purple-500/40 backdrop-blur-xl shadow-2xl shadow-purple-950/80 text-sm font-semibold"
          >
            {popup.hpLost && (
              <div className="flex items-center gap-1.5 text-red-400">
                <HeartCrack className="w-4 h-4 animate-bounce" />
                <span>-{popup.hpLost} HP Penalty!</span>
              </div>
            )}

            {popup.acquired && (
              <div className="flex items-center gap-1.5 text-cyan-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Acquired {popup.acquired}!</span>
              </div>
            )}

            {popup.xp !== undefined && (
              <div className="flex items-center gap-1 text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>+{popup.xp} XP</span>
              </div>
            )}

            {popup.gold !== undefined && (
              <div className="flex items-center gap-1 text-amber-300">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>+{popup.gold} Gold</span>
              </div>
            )}

            {popup.gems !== undefined && popup.gems > 0 && (
              <div className="flex items-center gap-1 text-cyan-300">
                <Gem className="w-4 h-4 text-cyan-400" />
                <span>+{popup.gems} Gems</span>
              </div>
            )}

            {popup.stat !== undefined && (
              <div className="flex items-center gap-1 text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded-lg border border-emerald-500/30">
                <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>+{popup.stat} {popup.attr}</span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
