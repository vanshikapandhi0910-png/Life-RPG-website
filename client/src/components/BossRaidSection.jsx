import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Swords, 
  Skull, 
  Flame, 
  Hourglass, 
  Trophy, 
  Sparkles, 
  Coins, 
  Gem, 
  Zap, 
  ShieldAlert,
  Dumbbell,
  Brain,
  Footprints,
  HeartPulse,
  MessageSquare
} from 'lucide-react';
import { useRPG } from '../context/RPGContext';
import { useSound } from '../context/SoundContext';
import { api } from '../services/api';

const ATTR_ICONS = {
  STR: Dumbbell,
  INT: Brain,
  AGI: Footprints,
  VIT: HeartPulse,
  CHA: MessageSquare,
  SPI: Sparkles
};

export default function BossRaidSection({ isOpen, onClose }) {
  const { boss, bossDamageEvent } = useRPG();
  const { playClick } = useSound();
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('boss'); // 'boss' or 'leaderboard'

  useEffect(() => {
    if (isOpen) {
      api.getBossLeaderboard()
        .then(res => setLeaderboard(res.leaderboard || []))
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentHp = boss?.currentHp ?? 2500;
  const totalHp = boss?.totalHp ?? 3000;
  const hpPercent = Math.min(100, Math.max(0, Math.round((currentHp / totalHp) * 100)));
  const WeaknessIcon = boss?.weakness ? (ATTR_ICONS[boss.weakness] || Flame) : Flame;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-3xl bg-slate-950 border border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(239,68,68,0.25)] relative my-8"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => { playClick(); onClose(); }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <Skull className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-fantasy text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
              World Raid: Dread Encounters
            </h2>
            <p className="text-xs text-slate-400">Every completed quest strikes a blow against colossal procrastinators</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-2">
          <button
            onClick={() => { playClick(); setActiveTab('boss'); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'boss'
                ? 'bg-red-600/30 border border-red-500/50 text-red-200'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Raid Target
          </button>
          <button
            onClick={() => { playClick(); setActiveTab('leaderboard'); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-red-600/30 border border-red-500/50 text-red-200'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Guild Leaderboard
          </button>
        </div>

        {activeTab === 'boss' ? (
          <div>
            {/* BOSS CARD */}
            <div className="p-6 rounded-3xl bg-gradient-to-b from-red-950/40 via-slate-900/90 to-slate-950 border border-red-500/30 shadow-xl mb-6 relative overflow-hidden">
              
              {/* Splat damage notification */}
              {bossDamageEvent && (
                <motion.div
                  initial={{ scale: 2, opacity: 1 }}
                  animate={{ scale: 1, opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute top-4 right-4 pointer-events-none text-red-400 font-fantasy text-xl font-black"
                >
                  -{bossDamageEvent.damageDealt} CRIT!
                </motion.div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left mb-6">
                <div className="w-20 h-20 rounded-2xl bg-red-900/50 border border-red-500/60 flex items-center justify-center text-red-400 shadow-lg shadow-red-950/60">
                  <Skull className="w-10 h-10 animate-bounce" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                    <ShieldAlert className="w-3 h-3" />
                    <span>Lvl {boss?.level || 5} World Boss</span>
                  </div>
                  <h3 className="font-fantasy text-xl font-bold text-slate-100 mb-0.5">
                    {boss?.name || 'Chronos, The Time Devourer'}
                  </h3>
                  <p className="text-xs text-amber-300/80 font-medium">
                    {boss?.subtitle || 'Lord of Wasted Hours'}
                  </p>
                </div>
              </div>

              {/* BOSS HP BAR */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-red-400 uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>TITAN HEALTH POOL</span>
                  </span>
                  <span className="font-mono text-slate-300 text-xs">
                    {currentHp.toLocaleString()} / {totalHp.toLocaleString()} HP ({hpPercent}%)
                  </span>
                </div>
                <div className="h-4 w-full bg-slate-950 rounded-full p-0.5 border border-red-950 overflow-hidden shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full transition-all duration-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                    style={{ width: `${hpPercent}%` }}
                  />
                </div>
              </div>

              {/* WEAKNESS AND MECHANICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <WeaknessIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Vulnerability</span>
                    <span className="text-xs font-bold text-blue-300">
                      {boss?.weakness || 'INT'} Quests deal +50% Crit Damage
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Vanquish Bounty</span>
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-2">
                      <span>+{boss?.rewardGold || 250} Gold</span>
                      <span>+{boss?.rewardGems || 10} Gems</span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                {boss?.description}
              </p>
            </div>
          </div>
        ) : (
          /* LEADERBOARD */
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {leaderboard.map((player, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-white block">{player.username}</span>
                    <span className="text-[10px] text-purple-400 font-semibold">{player.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-purple-300 font-bold block">Level {player.level}</span>
                    <span className="text-[10px] text-slate-400">{player.characterClass}</span>
                  </div>
                  <div className="text-emerald-400 font-bold font-mono">
                    {player.completedQuestsCount} Quests
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </motion.div>
    </div>
  );
}
