import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  Plus, 
  Minus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Coins, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Tag, 
  AlertCircle,
  Dumbbell,
  Brain,
  Footprints,
  HeartPulse,
  MessageSquare
} from 'lucide-react';
import { useRPG } from '../context/RPGContext';
import { useSound } from '../context/SoundContext';

const DIFFICULTY_STYLES = {
  TRIVIAL: { border: 'border-slate-700/60', badge: 'bg-slate-800 text-slate-300', glow: '' },
  EASY: { border: 'border-emerald-500/40', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', glow: 'hover:shadow-emerald-950/40' },
  MEDIUM: { border: 'border-blue-500/40', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', glow: 'hover:shadow-blue-950/40' },
  HARD: { border: 'border-purple-500/50', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', glow: 'hover:shadow-purple-950/60' },
  LEGENDARY: { border: 'border-amber-500/70', badge: 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border-amber-500/60', glow: 'hover:shadow-amber-950/80' }
};

const ATTR_ICONS = {
  STR: Dumbbell,
  INT: Brain,
  AGI: Footprints,
  VIT: HeartPulse,
  CHA: MessageSquare,
  SPI: Sparkles
};

export default function QuestCard({ quest, onEdit }) {
  const { completeQuest, revertQuest, deleteQuest, habitAction, updateQuest } = useRPG();
  const { playClick } = useSound();
  const [expanded, setExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const diffStyle = DIFFICULTY_STYLES[quest.difficulty] || DIFFICULTY_STYLES.MEDIUM;
  const AttrIcon = ATTR_ICONS[quest.attribute] || Sparkles;

  const handleToggleComplete = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (quest.completed) {
        await revertQuest(quest._id);
      } else {
        await completeQuest(quest._id);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHabit = async (direction) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await habitAction(quest._id, direction);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubtaskToggle = async (subId) => {
    playClick();
    const updatedSubtasks = (quest.subtasks || []).map(s => 
      s.id === subId ? { ...s, completed: !s.completed } : s
    );
    await updateQuest(quest._id, { subtasks: updatedSubtasks });
  };

  const subtasksCount = quest.subtasks?.length || 0;
  const subtasksDone = quest.subtasks?.filter(s => s.completed).length || 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative rounded-2xl bg-slate-900/80 backdrop-blur-md border ${diffStyle.border} ${diffStyle.glow} p-4 sm:p-5 transition-all duration-300 hover:border-purple-400/60 shadow-lg ${
        quest.completed ? 'opacity-65 bg-slate-950/70' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        
        {/* COMPLETION BUTTON / HABIT CONTROLS */}
        <div className="pt-0.5">
          {quest.type === 'habit' ? (
            <div className="flex flex-col gap-1.5 items-center">
              <button
                onClick={() => handleHabit('positive')}
                disabled={isProcessing}
                className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                title="Positive Habit Trigger (+XP/Gold)"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-slate-300">
                {quest.habitCounter || 0}
              </span>
              <button
                onClick={() => handleHabit('negative')}
                disabled={isProcessing}
                className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-90"
                title="Negative Habit Trigger (-HP)"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleToggleComplete}
              disabled={isProcessing}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                quest.completed
                  ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/40 scale-105'
                  : 'bg-slate-950/80 border-slate-700 hover:border-purple-400 hover:bg-purple-950/40 text-transparent hover:text-purple-400/50'
              }`}
              title={quest.completed ? 'Mark Incomplete' : 'Complete Quest & Claim XP'}
            >
              <Check className="w-4 h-4 stroke-[3]" />
            </button>
          )}
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {/* TYPE BADGE */}
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 text-slate-300">
              {quest.type}
            </span>

            {/* ATTRIBUTE BADGE */}
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-950/60 border border-purple-500/30 text-purple-300 flex items-center gap-1">
              <AttrIcon className="w-3 h-3" />
              <span>{quest.attribute}</span>
            </span>

            {/* DIFFICULTY BADGE */}
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${diffStyle.badge}`}>
              {quest.difficulty}
            </span>

            {/* PRIORITY BADGE */}
            {quest.priority === 'URGENT' && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/20 border border-red-500/40 text-red-300 flex items-center gap-0.5">
                <AlertCircle className="w-3 h-3" />
                <span>URGENT</span>
              </span>
            )}
          </div>

          <h3 className={`text-base font-bold text-slate-100 mb-1 break-words ${quest.completed ? 'line-through text-slate-400' : ''}`}>
            {quest.title}
          </h3>

          {quest.notes && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-2 break-words">
              {quest.notes}
            </p>
          )}

          {/* SUBTASKS SUMMARY BAR */}
          {subtasksCount > 0 && (
            <div className="mb-2">
              <button
                onClick={() => { playClick(); setExpanded(!expanded); }}
                className="flex items-center gap-2 text-xs text-slate-400 hover:text-purple-300 transition-colors"
              >
                <span>Checklist: {subtasksDone}/{subtasksCount}</span>
                <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${(subtasksDone / subtasksCount) * 100}%` }}
                  />
                </div>
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}

          {/* EXPANDED SUBTASK CHECKLIST */}
          <AnimatePresence>
            {expanded && subtasksCount > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-3 pl-2 border-l-2 border-purple-500/30 space-y-1.5 pt-1"
              >
                {quest.subtasks.map((sub) => (
                  <label
                    key={sub.id}
                    className="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={!!sub.completed}
                      onChange={() => handleSubtaskToggle(sub.id)}
                      className="rounded bg-slate-950 border-slate-700 text-purple-600 focus:ring-purple-500 w-3.5 h-3.5"
                    />
                    <span className={sub.completed ? 'line-through text-slate-500' : ''}>
                      {sub.text}
                    </span>
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* FOOTER CHIPS (DUE DATE, TAGS, REWARDS) */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
            
            <div className="flex flex-wrap items-center gap-2 text-slate-400 text-[11px]">
              {quest.dueDate && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3 h-3 text-purple-400" />
                  <span>{new Date(quest.dueDate).toLocaleDateString()}</span>
                </div>
              )}

              {quest.tags?.map((tag, idx) => (
                <span key={idx} className="flex items-center gap-0.5 text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded text-[10px]">
                  <Tag className="w-2.5 h-2.5" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>

            {/* REWARDS INDICATOR */}
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold">
              <span className="text-purple-400 flex items-center gap-0.5">
                <Sparkles className="w-3 h-3" />
                <span>+XP</span>
              </span>
              <span className="text-amber-400 flex items-center gap-0.5">
                <Coins className="w-3 h-3" />
                <span>+Gold</span>
              </span>
            </div>
          </div>
        </div>

        {/* ACTIONS (EDIT / DELETE) */}
        <div className="flex flex-col gap-1 items-center">
          <button
            onClick={() => { playClick(); onEdit(quest); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-300 hover:bg-slate-800 transition-colors"
            title="Edit Quest"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { playClick(); deleteQuest(quest._id); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            title="Abandon Quest"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </motion.div>
  );
}
