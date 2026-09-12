import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  BarChart3, 
  Sparkles, 
  Activity, 
  Target, 
  CheckCircle2, 
  Shield, 
  Zap, 
  Clock,
  Dumbbell,
  Brain,
  Footprints,
  HeartPulse,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { api } from '../services/api';

const ATTRIBUTES = [
  { key: 'STR', label: 'Strength', icon: Dumbbell, angle: 0 },
  { key: 'INT', label: 'Intellect', icon: Brain, angle: 60 },
  { key: 'AGI', label: 'Agility', icon: Footprints, angle: 120 },
  { key: 'VIT', label: 'Vitality', icon: HeartPulse, angle: 180 },
  { key: 'CHA', label: 'Charisma', icon: MessageSquare, angle: 240 },
  { key: 'SPI', label: 'Spirit', icon: Sparkles, angle: 300 },
];

export default function StatsRadar({ isOpen, onClose }) {
  const { user } = useAuth();
  const { playClick } = useSound();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getPlayerOverview()
        .then(res => setStatsData(res.overview))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const baseAttrs = statsData?.baseAttributes || user?.attributes || { STR: 10, INT: 10, AGI: 10, VIT: 10, CHA: 10, SPI: 10 };
  const effectiveAttrs = statsData?.effectiveAttributes || baseAttrs;

  // Radar Polygon calculation
  const center = 120;
  const radius = 80;
  const maxStatCap = 50;

  const points = ATTRIBUTES.map(attr => {
    const val = Math.min(maxStatCap, effectiveAttrs[attr.key] || 10);
    const r = (val / maxStatCap) * radius;
    const rad = (attr.angle - 90) * (Math.PI / 180);
    const x = center + r * Math.cos(rad);
    const y = center + r * Math.sin(rad);
    return `${x},${y}`;
  }).join(' ');

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-4xl bg-slate-950 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8"
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
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-fantasy text-2xl font-black text-slate-100">
              Hero Analytics & Skill Radar
            </h2>
            <p className="text-xs text-slate-400">Holistic breakdown of character growth and productivity distribution</p>
          </div>
        </div>

        {/* TOP METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Directives Completed</div>
            <div className="text-2xl font-black font-mono text-purple-400">
              {statsData?.completedQuests || 0}
            </div>
            <div className="text-[10px] text-slate-500">out of {statsData?.totalQuests || 0} total</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Completion Rate</div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {statsData?.completionRate || 0}%
            </div>
            <div className="text-[10px] text-slate-500">efficiency ratio</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Active Streak</div>
            <div className="text-2xl font-black font-mono text-amber-400">
              {statsData?.streak || 0} <span className="text-xs">Days</span>
            </div>
            <div className="text-[10px] text-slate-500">+{(statsData?.streak || 0) * 5}% Loot Bonus</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Total Level</div>
            <div className="text-2xl font-black font-mono text-cyan-400">
              Lvl {user?.level || 1}
            </div>
            <div className="text-[10px] text-slate-500">{user?.title}</div>
          </div>
        </div>

        {/* SKILL RADAR + ATTRIBUTE BREAKDOWN */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          
          {/* RADAR SVG */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-900/60 border border-slate-800 relative">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Attribute Hexagon Balance
            </h3>

            <div className="relative w-64 h-64">
              <svg width="240" height="240" className="overflow-visible">
                {/* Background Web Polygons */}
                {gridLevels.map((lvl, idx) => {
                  const gridPoints = ATTRIBUTES.map(attr => {
                    const r = radius * lvl;
                    const rad = (attr.angle - 90) * (Math.PI / 180);
                    return `${center + r * Math.cos(rad)},${center + r * Math.sin(rad)}`;
                  }).join(' ');
                  return (
                    <polygon
                      key={idx}
                      points={gridPoints}
                      fill="none"
                      stroke="rgba(148, 163, 184, 0.15)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Spokes */}
                {ATTRIBUTES.map(attr => {
                  const rad = (attr.angle - 90) * (Math.PI / 180);
                  const x = center + radius * Math.cos(rad);
                  const y = center + radius * Math.sin(rad);
                  return (
                    <line
                      key={attr.key}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="rgba(148, 163, 184, 0.15)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Data Fill Polygon */}
                <polygon
                  points={points}
                  fill="rgba(168, 85, 247, 0.35)"
                  stroke="#a855f7"
                  strokeWidth="2.5"
                  className="transition-all duration-700 ease-out"
                />

                {/* Corner Labels */}
                {ATTRIBUTES.map(attr => {
                  const rad = (attr.angle - 90) * (Math.PI / 180);
                  const x = center + (radius + 20) * Math.cos(rad);
                  const y = center + (radius + 20) * Math.sin(rad);
                  return (
                    <text
                      key={attr.key}
                      x={x}
                      y={y + 4}
                      fill="#94a3b8"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {attr.key}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* ATTRIBUTE NUMBERS */}
          <div className="lg:col-span-6 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Attributes & Gear Modifiers
            </h3>
            {ATTRIBUTES.map(attr => {
              const Icon = attr.icon;
              const base = baseAttrs[attr.key] || 10;
              const effective = effectiveAttrs[attr.key] || base;
              const bonus = effective - base;

              return (
                <div
                  key={attr.key}
                  className="p-2.5 px-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="font-bold text-slate-200 block">{attr.label}</span>
                      <span className="text-[10px] text-slate-500 font-mono">Base {base}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {bonus > 0 && (
                      <span className="text-cyan-400 text-[10px] font-bold">
                        +{bonus.toFixed(1)} Gear
                      </span>
                    )}
                    <span className="text-sm font-black font-mono text-white">
                      {effective.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* RECENT ACTIVITY LOGS */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Chronicles & Activity History</span>
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {statsData?.recentLogs?.length > 0 ? (
              statsData.recentLogs.map(log => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-slate-300">{log.details}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap ml-2">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500 text-center py-4">No recent chronicle logs.</div>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
}
