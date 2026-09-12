import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Wand2, 
  Zap, 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Flame 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRPG } from '../context/RPGContext';
import { useSound } from '../context/SoundContext';

const SPELLS_DATA = [
  {
    id: 'CLARITY_BURST',
    name: 'Clarity Burst',
    cost: 20,
    icon: Heart,
    color: 'from-red-600 to-rose-500',
    desc: 'Channel focused mindfulness to cleanse stress and restore +35 Health Points instantly.',
    effectText: '+35 HP Recovery'
  },
  {
    id: 'FOCUSED_RUSH',
    name: 'Focused Rush',
    cost: 30,
    icon: Sparkles,
    color: 'from-purple-600 to-indigo-600',
    desc: 'Enter deep flow state. Your next 2 completed quests will award +100% Double Experience.',
    effectText: '2x Double XP Buff'
  },
  {
    id: 'ASTRAL_SHIELD',
    name: 'Astral Shield',
    cost: 40,
    icon: ShieldCheck,
    color: 'from-cyan-600 to-blue-600',
    desc: 'Erect an ethereal barrier that safeguards your active streak from breaking if you miss a daily trial.',
    effectText: 'Streak Freeze Charge'
  }
];

export default function SpellsModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { castSpell } = useRPG();
  const { playClick } = useSound();
  const [castingId, setCastingId] = useState(null);
  const [castSuccessMsg, setCastSuccessMsg] = useState('');

  if (!isOpen) return null;

  const currentMana = user?.mana ?? 50;

  const handleCast = async (spell) => {
    setCastingId(spell.id);
    setCastSuccessMsg('');
    try {
      const res = await castSpell(spell.id);
      setCastSuccessMsg(res.message || `Channeled ${spell.name}!`);
      setTimeout(() => setCastSuccessMsg(''), 3000);
    } catch (err) {
      setCastSuccessMsg(err.message || 'Spell fizzled.');
      setTimeout(() => setCastSuccessMsg(''), 3000);
    } finally {
      setCastingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-slate-950 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(99,102,241,0.2)] relative my-8"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => { playClick(); onClose(); }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Wand2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-fantasy text-2xl font-black text-slate-100">
                Arcane Spellcraft
              </h2>
              <p className="text-xs text-slate-400">Spend harvested Mana from tasks to cast powerful personal enchantments</p>
            </div>
          </div>

          {/* MANA POOL INDICATOR */}
          <div className="flex items-center gap-2 bg-blue-950/60 border border-blue-500/40 px-3.5 py-1.5 rounded-2xl text-blue-300 text-xs font-bold font-mono">
            <Zap className="w-4 h-4 text-blue-400 fill-blue-400" />
            <span>{currentMana} / {user?.maxMana ?? 50} MP</span>
          </div>
        </div>

        {castSuccessMsg && (
          <div className="mb-4 p-3 rounded-xl bg-indigo-950/70 border border-indigo-500/40 text-indigo-200 text-xs font-semibold text-center animate-fade-in">
            {castSuccessMsg}
          </div>
        )}

        {/* SPELLS LIST */}
        <div className="space-y-3">
          {SPELLS_DATA.map((spell) => {
            const Icon = spell.icon;
            const canCast = currentMana >= spell.cost;
            const isCasting = castingId === spell.id;

            return (
              <div
                key={spell.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${spell.color} flex items-center justify-center text-white shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-sm text-white">{spell.name}</h3>
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                        {spell.effectText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-md">{spell.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <span className="text-xs font-mono font-bold text-blue-300 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    {spell.cost} MP
                  </span>

                  <button
                    onClick={() => handleCast(spell)}
                    disabled={!canCast || isCasting}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                      canCast
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>{isCasting ? 'Channelling...' : 'Cast Spell'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ACTIVE BUFFS HUD */}
        {user?.activeBuffs?.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Active Enchantments & Shields:
            </span>
            <div className="flex flex-wrap gap-2">
              {user.activeBuffs.map((buff, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>
                    {buff.type === 'DOUBLE_XP' ? `Double XP (${buff.remainingQuests} quests left)` : 'Astral Shield Protected'}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
}
