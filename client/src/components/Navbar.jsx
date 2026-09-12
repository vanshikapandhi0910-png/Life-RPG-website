import React, { useState } from 'react';
import { Shield, Sparkles, Coins, Gem, Flame, Palette, LogOut, Wand2, User, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../context/SoundContext';
import AudioToggle from './AudioToggle';

export default function Navbar({ onOpenShop, onOpenInventory, onOpenStats, onOpenSpells }) {
  const { user, logout } = useAuth();
  const { theme, setTheme, availableThemes } = useTheme();
  const { playClick } = useSound();
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full rpg-glass border-b border-purple-500/20 px-4 lg:px-8 py-3 transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* LOGO & TITLE */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-purple-600/30 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-fantasy font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-cyan-300">
                REALMQUEST
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 border border-purple-500/40 text-purple-300 tracking-widest hidden sm:inline">
                RPG LIFE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Aetheria Task Progression Engine</p>
          </div>
        </div>

        {/* STAT CURRENCIES & QUICK STATS */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* Streak Flame */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm"
            title="Active Streak: Complete dailies consecutively to increase rewards!"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
            <span>{user?.streak || 0}</span>
            <span className="text-[10px] text-amber-400/70 hidden md:inline">DAYS</span>
          </div>

          {/* Gold */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs font-bold shadow-sm"
            title="Gold Currency: Earned from quest completions"
          >
            <Coins className="w-4 h-4 text-yellow-400" />
            <span>{user?.gold || 0}</span>
          </div>

          {/* Gems */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-sm"
            title="Astral Gems: Rare loot from epic quests & world bosses"
          >
            <Gem className="w-4 h-4 text-cyan-400" />
            <span>{user?.gems || 0}</span>
          </div>

          {/* Spellcasting Fast-Action */}
          <button
            onClick={() => { playClick(); onOpenSpells(); }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-900/60 hover:border-indigo-400 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            title="Cast Mana Spells"
          >
            <Wand2 className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">Spells</span>
          </button>
        </div>

        {/* THEME & SETTINGS & PROFILE */}
        <div className="flex items-center gap-2">
          
          {/* Audio Toggle */}
          <AudioToggle />

          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => { playClick(); setThemeDropdownOpen(!themeDropdownOpen); }}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-purple-500/50 flex items-center gap-1 text-xs transition-all"
              title="Change Visual Theme"
            >
              <Palette className="w-4 h-4 text-purple-400" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {themeDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-950 border border-purple-500/30 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setThemeDropdownOpen(false)}
              >
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1.5">
                  Visual Themes
                </div>
                <div className="flex flex-col gap-1">
                  {availableThemes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        playClick();
                        setTheme(t.id);
                        setThemeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        theme === t.id
                          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent }} />
                        <span>{t.name}</span>
                      </div>
                      {theme === t.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <button
              onClick={() => { playClick(); onOpenStats(); }}
              className="flex items-center gap-2 p-1.5 sm:px-3 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-purple-500/50 transition-all text-left"
              title="View Character Radar & Analytics"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                {user?.username?.charAt(0).toUpperCase() || 'H'}
              </div>
              <div className="hidden lg:block">
                <div className="text-xs font-bold text-slate-200 leading-tight flex items-center gap-1">
                  {user?.username}
                </div>
                <div className="text-[10px] text-purple-400 font-semibold leading-none">
                  Lvl {user?.level || 1} {user?.characterClass}
                </div>
              </div>
            </button>

            <button
              onClick={() => { playClick(); logout(); }}
              className="p-2 rounded-xl bg-red-950/30 border border-red-500/30 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-all"
              title="Logout / Save Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
