import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Flame, 
  ListTodo, 
  Repeat, 
  Layers, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { useRPG } from '../context/RPGContext';
import { useSound } from '../context/SoundContext';
import QuestCard from './QuestCard';

const TABS = [
  { id: 'all', label: 'All Directives', icon: Layers },
  { id: 'daily', label: 'Dailies', icon: Flame },
  { id: 'todo', label: 'Main Quests', icon: ListTodo },
  { id: 'habit', label: 'Habits', icon: Repeat },
  { id: 'epic', label: 'Epic Raids', icon: Sparkles },
  { id: 'completed', label: 'Vanquished', icon: CheckCircle2 },
];

export default function QuestList({ onOpenNewQuest, onEditQuest }) {
  const { quests } = useRPG();
  const { playClick } = useSound();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [attributeFilter, setAttributeFilter] = useState('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('DEFAULT');

  const filteredQuests = useMemo(() => {
    return quests.filter(q => {
      // Tab filter
      if (activeTab === 'completed') {
        if (!q.completed && q.type !== 'habit') return false;
        if (q.type === 'habit' && (!q.habitCounter || q.habitCounter === 0)) return false;
      } else if (activeTab !== 'all') {
        if (q.type !== activeTab) return false;
        if (q.completed && activeTab !== 'completed') return false;
      } else {
        // 'all' tab hides completed one-time tasks to keep focus fresh
        if (q.completed && q.type === 'todo') return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = q.title.toLowerCase().includes(query);
        const matchesNotes = q.notes?.toLowerCase().includes(query);
        const matchesTags = q.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesNotes && !matchesTags) return false;
      }

      // Attribute Filter
      if (attributeFilter !== 'ALL' && q.attribute !== attributeFilter) {
        return false;
      }

      // Difficulty Filter
      if (difficultyFilter !== 'ALL' && q.difficulty !== difficultyFilter) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'PRIORITY') {
        const pOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (pOrder[b.priority] || 0) - (pOrder[a.priority] || 0);
      }
      if (sortBy === 'DIFFICULTY') {
        const dOrder = { LEGENDARY: 5, HARD: 4, MEDIUM: 3, EASY: 2, TRIVIAL: 1 };
        return (dOrder[b.difficulty] || 0) - (dOrder[a.difficulty] || 0);
      }
      return 0; // Default creation order
    });
  }, [quests, activeTab, searchQuery, attributeFilter, difficultyFilter, sortBy]);

  const activeQuestsCount = quests.filter(q => !q.completed).length;

  return (
    <div className="w-full space-y-5">
      
      {/* HEADER & NEW QUEST BUTTON */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-fantasy text-2xl font-black text-slate-100 flex items-center gap-2">
            <span>Quest Ledger</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-sans font-bold">
              {activeQuestsCount} Active
            </span>
          </h2>
          <p className="text-xs text-slate-400">Complete tasks to harvest XP, Gold, and level up your character stats.</p>
        </div>

        <button
          onClick={() => { playClick(); onOpenNewQuest(); }}
          className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>CHART NEW QUEST</span>
        </button>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => { playClick(); setActiveTab(tab.id); }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SEARCH AND FILTER CONTROLS */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Bar */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search directives, tags, or notes..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-purple-500 text-xs text-slate-100 placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Attribute Filter */}
        <div className="sm:col-span-3">
          <select
            value={attributeFilter}
            onChange={(e) => { playClick(); setAttributeFilter(e.target.value); }}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 outline-none focus:border-purple-500"
          >
            <option value="ALL">All Attributes</option>
            <option value="STR">STR (Strength)</option>
            <option value="INT">INT (Intellect)</option>
            <option value="AGI">AGI (Agility)</option>
            <option value="VIT">VIT (Vitality)</option>
            <option value="CHA">CHA (Charisma)</option>
            <option value="SPI">SPI (Spirit)</option>
          </select>
        </div>

        {/* Difficulty Filter */}
        <div className="sm:col-span-2">
          <select
            value={difficultyFilter}
            onChange={(e) => { playClick(); setDifficultyFilter(e.target.value); }}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 outline-none focus:border-purple-500"
          >
            <option value="ALL">All Tiers</option>
            <option value="TRIVIAL">Trivial</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
            <option value="LEGENDARY">Legendary</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="sm:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => { playClick(); setSortBy(e.target.value); }}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 outline-none focus:border-purple-500"
          >
            <option value="DEFAULT">Order: Default</option>
            <option value="PRIORITY">Order: Priority</option>
            <option value="DIFFICULTY">Order: Difficulty</option>
          </select>
        </div>
      </div>

      {/* QUEST CARDS GRID / LIST */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredQuests.length > 0 ? (
            filteredQuests.map((quest) => (
              <QuestCard
                key={quest._id}
                quest={quest}
                onEdit={onEditQuest}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-fantasy text-lg font-bold text-slate-200 mb-1">
                No Quests Found in Ledger
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Your queue is clear, or no directives match the current filters. Chart a new quest to begin earning rewards!
              </p>
              <button
                onClick={() => { playClick(); onOpenNewQuest(); }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
              >
                Create First Quest
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
