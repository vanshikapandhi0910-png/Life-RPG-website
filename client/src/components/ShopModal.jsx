import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  ShoppingBag, 
  Coins, 
  Gem, 
  Sword, 
  Shield, 
  Sparkles, 
  Zap, 
  Check, 
  Heart, 
  Droplet, 
  ShieldAlert,
  Flame,
  Wand2,
  Cpu,
  CircleDot,
  Clock,
  Crown,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRPG } from '../context/RPGContext';
import { useSound } from '../context/SoundContext';

const ICON_MAP = {
  Sword,
  Zap,
  Wand2,
  Flame,
  Shield,
  Cpu,
  ShieldCheck,
  CircleDot,
  Clock,
  Crown,
  Sparkles,
  Sparkle: Sparkles,
  Eye,
  Heart,
  Droplet,
  ShieldAlert
};

const RARITY_COLORS = {
  common: 'border-slate-700 text-slate-300',
  rare: 'border-blue-500/50 bg-blue-950/20 text-blue-300',
  epic: 'border-purple-500/50 bg-purple-950/20 text-purple-300',
  legendary: 'border-amber-500/60 bg-amber-950/20 text-amber-300 shadow-lg shadow-amber-950/50'
};

export default function ShopModal({ isOpen, onClose, onOpenInventory }) {
  const { user } = useAuth();
  const { shopItems, buyItem } = useRPG();
  const { playClick } = useSound();
  const [filterType, setFilterType] = useState('all');
  const [buyingId, setBuyingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  if (!isOpen) return null;

  const inventory = user?.inventory || [];
  const ownedItemIds = new Set(inventory.map(i => i.itemId));

  const filteredItems = shopItems.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const handleBuy = async (item) => {
    setBuyingId(item._id);
    setToastMsg('');
    try {
      await buyItem(item._id);
      setToastMsg(`Acquired ${item.name}! Added to your Armory.`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err) {
      setToastMsg(err.message || 'Purchase failed.');
      setTimeout(() => setToastMsg(''), 3000);
    } finally {
      setBuyingId(null);
    }
  };

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-fantasy text-2xl font-black text-slate-100">
                Aetherian Marketplace
              </h2>
              <p className="text-xs text-slate-400">Trade hard-earned Gold & Gems for mythic gear and potions</p>
            </div>
          </div>

          {/* WALLET DISPLAY */}
          <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-300">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{user?.gold || 0} Gold</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Gem className="w-4 h-4 text-cyan-400" />
              <span>{user?.gems || 0} Gems</span>
            </div>
          </div>
        </div>

        {/* TOAST MESSAGE */}
        {toastMsg && (
          <div className="mb-4 p-3 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-200 text-xs font-semibold text-center animate-fade-in">
            {toastMsg}
          </div>
        )}

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-slate-800">
          {[
            { id: 'all', label: 'All Relics' },
            { id: 'weapon', label: 'Weapons' },
            { id: 'armor', label: 'Armor' },
            { id: 'accessory', label: 'Accessories' },
            { id: 'pet', label: 'Companions' },
            { id: 'potion', label: 'Potions & Consumables' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { playClick(); setFilterType(tab.id); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ITEMS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-1">
          {filteredItems.map(item => {
            const ItemIcon = ICON_MAP[item.icon] || Sparkles;
            const rarityClass = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
            const isConsumable = item.type === 'potion' || item.type === 'consumable';
            const isOwned = !isConsumable && ownedItemIds.has(item._id);
            const canAfford = item.gems 
              ? (user?.gems || 0) >= item.gems 
              : (user?.gold || 0) >= item.price;

            return (
              <div
                key={item._id}
                className={`rounded-2xl border p-4 bg-slate-900/70 backdrop-blur-md flex flex-col justify-between transition-all ${rarityClass}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                      <ItemIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 border border-slate-800">
                      {item.rarity}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 mb-1">{item.name}</h3>
                  <p className="text-[11px] text-slate-400 mb-3">{item.description}</p>

                  {/* STATS BREAKDOWN */}
                  {item.stats && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {Object.entries(item.stats).map(([k, v]) => (
                        <span key={k} className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/20">
                          +{v} {k}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.effect && (
                    <div className="mb-3 text-[11px] text-emerald-400 font-semibold">
                      ⚡ Restores {item.effect.amount} {item.effect.type.replace('_', ' ')}
                    </div>
                  )}
                </div>

                {/* BUY BUTTON */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 font-bold text-xs">
                    {item.gems ? (
                      <span className="text-cyan-300 flex items-center gap-1">
                        <Gem className="w-3.5 h-3.5 text-cyan-400" />
                        {item.gems} Gems
                      </span>
                    ) : (
                      <span className="text-yellow-300 flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-yellow-400" />
                        {item.price} Gold
                      </span>
                    )}
                  </div>

                  {isOwned ? (
                    <span className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Owned</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford || buyingId === item._id}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Purchase</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* FOOTER LINK TO INVENTORY */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => { playClick(); onClose(); onOpenInventory(); }}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold underline"
          >
            Open Armory to Equip Items & Drink Potions →
          </button>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="px-5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-all"
          >
            Leave Shop
          </button>
        </div>
      </motion.div>
    </div>
  );
}
