import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Swords, 
  Sparkles, 
  Footprints, 
  MessageSquare, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Flame, 
  Check, 
  Gamepad2,
  HeartPulse
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';

const CLASSES = [
  {
    id: 'WARRIOR',
    name: 'Storm Berserker',
    icon: Swords,
    color: 'from-orange-600 to-red-600',
    stat: 'Strength (STR)',
    perk: '+20% Boss Raid Damage & +10% STR gain',
    desc: 'Excels in physical challenges, heavy lifting, and tough workouts.'
  },
  {
    id: 'MAGE',
    name: 'Chrono Sorcerer',
    icon: Sparkles,
    color: 'from-blue-600 to-indigo-600',
    stat: 'Intellect (INT)',
    perk: '+15% Quest XP & +10% INT gain',
    desc: 'Master of deep work sprints, coding algorithms, and intense research.'
  },
  {
    id: 'ROGUE',
    name: 'Shadow Stalker',
    icon: Footprints,
    color: 'from-emerald-600 to-teal-600',
    stat: 'Agility (AGI)',
    perk: '+25% Gold Loot & +10% AGI gain',
    desc: 'Specialist in agile chores, rapid multi-tasking, and swift execution.'
  },
  {
    id: 'PALADIN',
    name: 'Iron Vanguard',
    icon: Shield,
    color: 'from-yellow-600 to-amber-600',
    stat: 'Vitality (VIT)',
    perk: '+25 Max HP & Shielding bonuses',
    desc: 'Dedicated to endurance, healthy habits, sleep, and holistic wellness.'
  },
  {
    id: 'ALCHEMIST',
    name: 'Philosopher Alchemist',
    icon: Sparkles,
    color: 'from-purple-600 to-pink-600',
    stat: 'Spirit (SPI)',
    perk: 'Bonus Gem Drops & +10% SPI gain',
    desc: 'Refines mindfulness, meditation, discipline, and experimental projects.'
  },
  {
    id: 'BARD',
    name: 'Virtuoso Troubadour',
    icon: MessageSquare,
    color: 'from-amber-600 to-yellow-500',
    stat: 'Charisma (CHA)',
    perk: '+10% All Rewards & +10% CHA gain',
    desc: 'Commands public speaking, networking, writing, and leadership.'
  }
];

export default function AuthPage() {
  const { login, register } = useAuth();
  const { playClick, playLevelUp, playError } = useSound();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClass, setSelectedClass] = useState('WARRIOR');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        await register({
          username: username.trim(),
          email: email.trim(),
          password,
          characterClass: selectedClass
        });
        playLevelUp();
      } else {
        await login(email.trim() || username.trim(), password);
        playClick();
      }
    } catch (err) {
      playError();
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPlay = async (classChoice = 'WARRIOR') => {
    setLoading(true);
    setErrorMsg('');
    const demoSuffix = Math.floor(Math.random() * 8999 + 1000);
    try {
      await register({
        username: `Hero_${demoSuffix}`,
        email: `hero_${demoSuffix}@realmquest.app`,
        password: 'Password123!',
        characterClass: classChoice
      });
      playLevelUp();
    } catch (err) {
      playError();
      setErrorMsg(err.message || 'Failed to initialize demo hero.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-slate-950">
      
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-slate-900/90 border border-purple-500/30 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-2xl relative z-10"
      >
        {/* LOGO & HEADING */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-1 shadow-xl shadow-purple-900/50 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[20px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Aetheria Progression Engine
          </div>

          <h1 className="font-fantasy text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-slate-100 to-cyan-300">
            REALMQUEST RPG
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Transform everyday tasks into character levels, real-life stats, legendary loot, and dungeon raids.
          </p>
        </div>

        {/* TOGGLE TABS (LOGIN / CREATE HERO) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { playClick(); setIsRegister(false); setErrorMsg(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              !isRegister
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Resume Quest (Login)
          </button>
          <button
            type="button"
            onClick={() => { playClick(); setIsRegister(true); setErrorMsg(''); }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
              isRegister
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Awaken New Hero (Sign Up)
          </button>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold text-center animate-fade-in">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* USERNAME */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Hero Name / Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. Shadowblade_99"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@realmquest.app"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Security Seal (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* CHARACTER CLASS SELECTOR (ONLY DURING SIGN UP) */}
          <AnimatePresence>
            {isRegister && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-2 overflow-hidden"
              >
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Choose Hero Class Archetype
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {CLASSES.map((cls) => {
                    const Icon = cls.icon;
                    const isSelected = selectedClass === cls.id;

                    return (
                      <button
                        type="button"
                        key={cls.id}
                        onClick={() => { playClick(); setSelectedClass(cls.id); }}
                        className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-purple-950/80 border-purple-500 text-white shadow-lg shadow-purple-950/60 scale-[1.02]'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${cls.color} flex items-center justify-center text-white`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-purple-400 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-200">{cls.name}</div>
                          <div className="text-[10px] text-purple-400 font-mono mt-0.5">{cls.stat}</div>
                          <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">{cls.perk}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-purple-600/30 transition-all active:scale-98 cursor-pointer mt-4"
          >
            <span>{isRegister ? 'ENTER THE REALM' : 'LOGIN TO PROGRESSION'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* QUICK PLAY DEMO HERO BUTTON */}
        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => handleDemoPlay()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-purple-950/50 border border-purple-500/30 text-xs font-bold text-purple-300 hover:text-white transition-all shadow-md cursor-pointer"
          >
            <Gamepad2 className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Instant Demo Play (1-Click Ready Hero)</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
