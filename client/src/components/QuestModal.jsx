import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Coins, 
  Plus, 
  Trash2, 
  Dumbbell, 
  Brain, 
  Footprints, 
  HeartPulse, 
  MessageSquare,
  Flame,
  Check
} from 'lucide-react';
import { useRPG } from '../context/RPGContext';
import { useSound } from '../context/SoundContext';

const ATTRIBUTES = [
  { key: 'STR', name: 'Strength', icon: Dumbbell, color: 'text-orange-400', border: 'border-orange-500/40' },
  { key: 'INT', name: 'Intellect', icon: Brain, color: 'text-blue-400', border: 'border-blue-500/40' },
  { key: 'AGI', name: 'Agility', icon: Footprints, color: 'text-emerald-400', border: 'border-emerald-500/40' },
  { key: 'VIT', name: 'Vitality', icon: HeartPulse, color: 'text-pink-400', border: 'border-pink-500/40' },
  { key: 'CHA', name: 'Charisma', icon: MessageSquare, color: 'text-yellow-400', border: 'border-yellow-500/40' },
  { key: 'SPI', name: 'Spirit', icon: Sparkles, color: 'text-purple-400', border: 'border-purple-500/40' },
];

const DIFFICULTIES = [
  { key: 'TRIVIAL', label: 'Trivial', xp: '+15 XP', gold: '+5 G', color: 'text-slate-400 border-slate-700' },
  { key: 'EASY', label: 'Easy', xp: '+30 XP', gold: '+12 G', color: 'text-emerald-400 border-emerald-500/40' },
  { key: 'MEDIUM', label: 'Medium', xp: '+65 XP', gold: '+25 G', color: 'text-blue-400 border-blue-500/40' },
  { key: 'HARD', label: 'Hard', xp: '+140 XP', gold: '+55 G', color: 'text-purple-400 border-purple-500/40' },
  { key: 'LEGENDARY', label: 'Legendary', xp: '+300 XP', gold: '+130 G', color: 'text-amber-400 border-amber-500/50' },
];

const TYPES = [
  { key: 'daily', label: 'Daily Trial', desc: 'Resets every dawn. Cultivates disciplined routine.' },
  { key: 'todo', label: 'Main Quest', desc: 'One-time project, milestone, or task.' },
  { key: 'habit', label: 'Habit Ritual', desc: '+/- trigger tracking positive or negative impulses.' },
  { key: 'epic', label: 'Epic Raid', desc: 'Multi-part objective with subtask milestones.' },
];

export default function QuestModal({ isOpen, onClose, editingQuest = null }) {
  const { createQuest, updateQuest } = useRPG();
  const { playClick } = useSound();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [type, setType] = useState('daily');
  const [attribute, setAttribute] = useState('STR');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (editingQuest) {
      setTitle(editingQuest.title || '');
      setNotes(editingQuest.notes || '');
      setType(editingQuest.type || 'daily');
      setAttribute(editingQuest.attribute || 'STR');
      setDifficulty(editingQuest.difficulty || 'MEDIUM');
      setPriority(editingQuest.priority || 'MEDIUM');
      setDueDate(editingQuest.dueDate ? editingQuest.dueDate.split('T')[0] : '');
      setSubtasks(editingQuest.subtasks || []);
      setTagsText((editingQuest.tags || []).join(', '));
    } else {
      setTitle('');
      setNotes('');
      setType('daily');
      setAttribute('STR');
      setDifficulty('MEDIUM');
      setPriority('MEDIUM');
      setDueDate('');
      setSubtasks([]);
      setNewSubtaskText('');
      setTagsText('');
    }
    setFormError('');
  }, [editingQuest, isOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = (e) => {
    e?.preventDefault();
    if (!newSubtaskText.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: `sub_${Date.now()}`, text: newSubtaskText.trim(), completed: false }
    ]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id) => {
    setSubtasks(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Quest title is required by the Guild!');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const tags = tagsText
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title: title.trim(),
      notes: notes.trim(),
      type,
      attribute,
      difficulty,
      priority,
      dueDate: dueDate || null,
      subtasks,
      tags
    };

    try {
      if (editingQuest) {
        await updateQuest(editingQuest._id, payload);
      } else {
        await createQuest(payload);
      }
      playClick();
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to chart quest.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-2xl bg-slate-950 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8"
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={() => { playClick(); onClose(); }}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-fantasy text-xl font-bold text-slate-100">
              {editingQuest ? 'Modify Quest Directive' : 'Chart a New Quest'}
            </h2>
            <p className="text-xs text-slate-400">Assign real-life tasks to your hero progression tree</p>
          </div>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-semibold">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* TITLE */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Quest Title <span className="text-purple-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 45-Minute Coding Sprint or 5km Morning Run"
              className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 placeholder-slate-500 text-sm outline-none transition-all"
            />
          </div>

          {/* TYPE SELECTOR */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Quest Classification
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPES.map((t) => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => { playClick(); setType(t.key); }}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    type === t.key
                      ? 'bg-purple-950/70 border-purple-500 text-purple-200 shadow-md shadow-purple-950/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold">{t.label}</span>
                  <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ATTRIBUTE MAPPING */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Associated Character Attribute (Stat Growth)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ATTRIBUTES.map((attr) => {
                const Icon = attr.icon;
                const isSelected = attribute === attr.key;

                return (
                  <button
                    type="button"
                    key={attr.key}
                    onClick={() => { playClick(); setAttribute(attr.key); }}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                      isSelected
                        ? `bg-slate-800 ${attr.border} text-white shadow-lg`
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${attr.color}`} />
                    <span className="text-xs font-bold font-mono">{attr.key}</span>
                    <span className="text-[10px] text-slate-400">{attr.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DIFFICULTY TIER */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Difficulty & Reward Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  type="button"
                  key={d.key}
                  onClick={() => { playClick(); setDifficulty(d.key); }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    difficulty === d.key
                      ? `bg-slate-800 ${d.color} shadow-md`
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{d.label}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{d.xp} • {d.gold}</div>
                </button>
              ))}
            </div>
          </div>

          {/* NOTES & LORE */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes & Lore Description (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add actionable steps, details, or motivation..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-slate-100 placeholder-slate-500 text-xs outline-none transition-all resize-none"
            />
          </div>

          {/* SUBTASK CHECKLIST BUILDER */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Checklist / Subtasks (Optional)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask(e)}
                placeholder="Add a sub-step..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 text-slate-100 placeholder-slate-500 text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {subtasks.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
                    <span>{sub.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(sub.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DUE DATE & TAGS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Target Due Date (Optional)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 text-slate-200 text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="coding, health, morning"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-purple-500 text-slate-200 text-xs outline-none"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => { playClick(); onClose(); }}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{editingQuest ? 'Update Quest' : 'Inscribe in Ledger'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
