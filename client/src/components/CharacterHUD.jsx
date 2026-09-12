import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Heart, 
  Zap, 
  Sparkles, 
  Brain, 
  Footprints, 
  HeartPulse, 
  MessageSquare, 
  Flame, 
  ShoppingBag, 
  Briefcase, 
  Swords, 
  BarChart3,
  Dumbbell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

const ATTRIBUTE_METADATA = [
  { key: 'STR', name: 'Strength', icon: Dumbbell, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', desc: 'Bolstered by physical fitness, workouts, and heavy chores.' },
  { key: 'INT', name: 'Intellect', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', desc: 'Cultivated via coding, studying, reading, and problem solving.' },
  { key: 'AGI', name: 'Agility', icon: Footprints, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', desc: 'Trained through speed, rapid task completion, and flexibility.' },
  { key: 'VIT', name: 'Vitality', icon: HeartPulse, color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/30', desc: 'Built with sleep, hydration, nutrition, and wellness habits.' },
  { key: 'CHA', name: 'Charisma', icon: MessageSquare, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', desc: 'Enhanced by networking, public speaking, and team meetings.' },
  { key: 'SPI', name: 'Spirit', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', desc: 'Deepened through meditation, discipline, journaling, and focus.' },
];

const CLASS_AVATARS = {
  WARRIOR: { title: 'Storm Berserker', icon: Swords, color: 'from-orange-600 to-red-600', perk: '+20% Boss Raid Damage' },
  MAGE: { title: 'Chrono Sorcerer', icon: Sparkles, color: 'from-blue-600 to-indigo-600', perk: '+15% Quest XP' },
  ROGUE: { title: 'Shadow Stalker', icon: Footprints, color: 'from-emerald-600 to-teal-600', perk: '+25% Gold Loot' },
  PALADIN: { title: 'Iron Vanguard', icon: Shield, color: 'from-yellow-600 to-amber-600', perk: '+25 Max HP & Shielding' },
  ALCHEMIST: { title: 'Philosopher Alchemist', icon: Sparkles, color: 'from-purple-600 to-pink-600', perk: 'Bonus Gem Discovery' },
  BARD: { title: 'Virtuoso Troubadour', icon: MessageSquare, color: 'from-amber-600 to-yellow-500', perk: '+10% All Rewards' }
};

export default function CharacterHUD({ onOpenShop, onOpenInventory, onOpenBoss, onOpenStats }) {
  const { user } = useAuth();
  const { playClick } = useSound();

  const charClass = user?.characterClass || 'WARRIOR';
  const classInfo = CLASS_AVATARS[charClass] || CLASS_AVATARS.WARRIOR;
  const ClassIcon = classInfo.icon;

  const currentHp = user?.hp ?? 100;
  const maxHp = user?.maxHp ?? 100;
  const hpPercent = Math.min(100, Math.max(0, Math.round((currentHp / maxHp) * 100)));

  const currentMana = user?.mana ?? 50;
  const maxMana = user?.maxMana ?? 50;
  const manaPercent = Math.min(100, Math.max(0, Math.round((currentMana / maxMana) * 100)));

  const currentXp = user?.xp ?? 0;
  const maxXp = user?.maxXp ?? 120;
  const xpPercent = Math.min(100, Math.max(0, Math.round((currentXp / maxXp) * 100)));

  const attributes = user?.attributes || { STR: 10, INT: 10, AGI: 10, VIT: 10, CHA: 10, SPI: 10 };

  return (
    <div className="w-full rpg-glass rounded-3xl p-5 sm:p-6 mb-8 border border-purple-500/20 shadow-xl relative overflow-hidden">
      
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-center justify-between">
        
        {/* CHARACTER AVATAR & IDENTITY */}
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full lg:w-auto">
          <div className="relative group cursor-pointer" onClick={() => { playClick(); onOpenStats(); }}>
            {/* Animated Level Crest */}
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr ${classInfo.color} p-1 shadow-xl shadow-purple-900/40 group-hover:scale-105 transition-transform duration-300`}>
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center p-2 relative overflow-hidden">
                <ClassIcon className="w-8 h-8 text-white mb-0.5 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-300">
                  {charClass}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-amber-500 border-2 border-slate-950 text-slate-950 font-black text-xs shadow-md">
              LV {user?.level || 1}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="font-fantasy font-extrabold text-2xl text-slate-100">
                {user?.username || 'Hero'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 border border-purple-500/40 text-purple-300">
                {user?.title || 'Novice Adventurer'}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm mb-3">
              Passive: <span className="text-purple-300 font-medium">{classInfo.perk}</span>
            </p>

            {/* QUICK RPG HUB BUTTONS */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <button
                onClick={() => { playClick(); onOpenInventory(); }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 hover:border-purple-400 hover:text-white text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span>Armory</span>
              </button>

              <button
                onClick={() => { playClick(); onOpenShop(); }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 hover:border-amber-400 hover:text-white text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                <span>Marketplace</span>
              </button>

              <button
                onClick={() => { playClick(); onOpenBoss(); }}
                className="px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/40 hover:bg-red-900/50 hover:border-red-400 text-xs font-semibold text-red-300 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Swords className="w-3.5 h-3.5 text-red-400" />
                <span>World Raid</span>
              </button>

              <button
                onClick={() => { playClick(); onOpenStats(); }}
                className="px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/60 hover:border-cyan-400 hover:text-white text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Skill Radar</span>
              </button>
            </div>
          </div>
        </div>

        {/* VITALS: HEALTH, MANA, EXPERIENCE PROGRESS BARS */}
        <div className="w-full lg:w-[380px] flex flex-col gap-3">
          
          {/* HP Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <div className="flex items-center gap-1.5 text-red-400">
                <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                <span>HEALTH</span>
              </div>
              <span className="text-slate-300 font-mono text-[11px]">
                {currentHp} / {maxHp} <span className="text-slate-500">({hpPercent}%)</span>
              </span>
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-full p-0.5 border border-red-950/60 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 rounded-full stat-bar-fill shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${hpPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Mana Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <div className="flex items-center gap-1.5 text-blue-400">
                <Zap className="w-3.5 h-3.5 fill-blue-500 text-blue-500" />
                <span>MANA</span>
              </div>
              <span className="text-slate-300 font-mono text-[11px]">
                {currentMana} / {maxMana} <span className="text-slate-500">({manaPercent}%)</span>
              </span>
            </div>
            <div className="h-3 w-full bg-slate-900 rounded-full p-0.5 border border-blue-950/60 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 rounded-full stat-bar-fill shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${manaPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <div className="flex items-center gap-1.5 text-purple-400">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>EXP PROGRESSION</span>
              </div>
              <span className="text-slate-300 font-mono text-[11px]">
                {currentXp} / {maxXp} XP <span className="text-purple-400 font-bold">({xpPercent}%)</span>
              </span>
            </div>
            <div className="h-3.5 w-full bg-slate-900 rounded-full p-0.5 border border-purple-900/60 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 rounded-full stat-bar-fill shadow-[0_0_12px_rgba(168,85,247,0.7)]"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* CORE 6 ATTRIBUTES ROW */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {ATTRIBUTE_METADATA.map((attr) => {
          const Icon = attr.icon;
          const val = attributes[attr.key] || 10;

          return (
            <div
              key={attr.key}
              className={`p-3 rounded-2xl border ${attr.bg} backdrop-blur-md flex flex-col justify-between transition-all hover:scale-[1.02] cursor-default group`}
              title={`${attr.name}: ${attr.desc}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{attr.key}</span>
                <Icon className={`w-4 h-4 ${attr.color}`} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-black font-mono text-slate-100">{val}</span>
                <span className="text-[10px] text-slate-500 font-semibold truncate ml-1">{attr.name}</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
