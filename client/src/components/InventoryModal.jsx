import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Briefcase, 
  Sword, 
  Shield, 
  CircleDot, 
  Sparkles, 
  Check, 
  Heart, 
  Droplet, 
  Zap,
  ArrowUp,
  Coins,
  Flame,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Clock,
  Crown,
  Eye,
  Wand2
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

export default function InventoryModal({ isOpen, onClose, onOpenShop }) {
  const { user } = useAuth();
  const { shopItems, equipItem, unequipItem, usePotion } = useRPG();
  const { playClick } = useSound();
  const [activeTab, setActiveTab] = useState('gear'); // 'gear' or 'consumables'

  if (!isOpen) return null;

  const equipped = user?.equipped || {};
  const inventory = user?.inventory || [];

  // Helper to get full item details
  const getItemDetails = (itemId) => {
    return shopItems.find(i => i._id === itemId || i.id === itemId);
  };

  const equippedWeapon = getItemDetails(equipped.weapon);
  const equippedArmor = getItemDetails(equipped.armor);
  const equippedAccessory = getItemDetails(equipped.accessory);
  const equippedPet = getItemDetails(equipped.pet);

  const gearItems = inventory.filter(i => i.type !== 'potion' && i.type !== 'consumable');
  const consumableItems = inventory.filter(i => i.type === 'potion' || i.type === 'consumable');

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
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-fantasy text-2xl font-black text-slate-100">
              Hero Armory & Inventory
            </h2>
            <p className="text-xs text-slate-400">Equip powerful artifacts to amplify your attribute multipliers</p>
          </div>
        </div>

        {/* EQUIPMENT SLOTS HUD */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Active Equipment Slots
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            
            {/* WEAPON SLOT */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-bold">
                <span>WEAPON</span>
                <Sword className="w-4 h-4 text-purple-400" />
              </div>
              {equippedWeapon ? (
                <div>
                  <div className="font-bold text-xs text-white truncate mb-1">{equippedWeapon.name}</div>
                  <div className="text-[10px] text-cyan-300 mb-2 font-mono">
                    {equippedWeapon.stats && Object.entries(equippedWeapon.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}
                  </div>
                  <button
                    onClick={() => unequipItem('weapon')}
                    className="w-full py-1 text-[10px] font-bold rounded-lg bg-slate-800 hover:bg-red-950/50 hover:text-red-300 text-slate-300 transition-colors"
                  >
                    Unequip
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <span className="text-[11px] text-slate-500 italic">Empty Slot</span>
                </div>
              )}
            </div>

            {/* ARMOR SLOT */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-bold">
                <span>ARMOR</span>
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              {equippedArmor ? (
                <div>
                  <div className="font-bold text-xs text-white truncate mb-1">{equippedArmor.name}</div>
                  <div className="text-[10px] text-cyan-300 mb-2 font-mono">
                    {equippedArmor.stats && Object.entries(equippedArmor.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}
                  </div>
                  <button
                    onClick={() => unequipItem('armor')}
                    className="w-full py-1 text-[10px] font-bold rounded-lg bg-slate-800 hover:bg-red-950/50 hover:text-red-300 text-slate-300 transition-colors"
                  >
                    Unequip
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <span className="text-[11px] text-slate-500 italic">Empty Slot</span>
                </div>
              )}
            </div>

            {/* ACCESSORY SLOT */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-bold">
                <span>ACCESSORY</span>
                <CircleDot className="w-4 h-4 text-amber-400" />
              </div>
              {equippedAccessory ? (
                <div>
                  <div className="font-bold text-xs text-white truncate mb-1">{equippedAccessory.name}</div>
                  <div className="text-[10px] text-cyan-300 mb-2 font-mono">
                    {equippedAccessory.stats && Object.entries(equippedAccessory.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}
                  </div>
                  <button
                    onClick={() => unequipItem('accessory')}
                    className="w-full py-1 text-[10px] font-bold rounded-lg bg-slate-800 hover:bg-red-950/50 hover:text-red-300 text-slate-300 transition-colors"
                  >
                    Unequip
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <span className="text-[11px] text-slate-500 italic">Empty Slot</span>
                </div>
              )}
            </div>

            {/* PET SLOT */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-bold">
                <span>COMPANION</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              {equippedPet ? (
                <div>
                  <div className="font-bold text-xs text-white truncate mb-1">{equippedPet.name}</div>
                  <div className="text-[10px] text-cyan-300 mb-2 font-mono">
                    {equippedPet.stats && Object.entries(equippedPet.stats).map(([k, v]) => `+${v} ${k}`).join(', ')}
                  </div>
                  <button
                    onClick={() => unequipItem('pet')}
                    className="w-full py-1 text-[10px] font-bold rounded-lg bg-slate-800 hover:bg-red-950/50 hover:text-red-300 text-slate-300 transition-colors"
                  >
                    Unequip
                  </button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <span className="text-[11px] text-slate-500 italic">Empty Slot</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* TAB TOGGLE: GEAR VS CONSUMABLES */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
          <button
            onClick={() => { playClick(); setActiveTab('gear'); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'gear'
                ? 'bg-purple-600/30 border border-purple-500/50 text-purple-200'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Relics & Equipment ({gearItems.length})
          </button>
          <button
            onClick={() => { playClick(); setActiveTab('consumables'); }}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'consumables'
                ? 'bg-purple-600/30 border border-purple-500/50 text-purple-200'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Potions & Consumables ({consumableItems.length})
          </button>
        </div>

        {/* ITEMS LIST */}
        <div className="max-h-72 overflow-y-auto pr-1">
          {activeTab === 'gear' ? (
            gearItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {gearItems.map((invItem) => {
                  const details = getItemDetails(invItem.itemId) || invItem.itemData;
                  const isEquipped = Object.values(equipped).includes(invItem.itemId);
                  const Icon = details?.icon ? (ICON_MAP[details.icon] || Sparkles) : Sparkles;

                  return (
                    <div
                      key={invItem.itemId}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-purple-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-100">{details?.name || invItem.name}</h4>
                          <span className="text-[10px] text-slate-400 uppercase">{invItem.type}</span>
                        </div>
                      </div>

                      {isEquipped ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>Equipped</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => equipItem(invItem.itemId, invItem.type)}
                          className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
                        >
                          Equip
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No relics currently in your bag.{' '}
                <button onClick={() => { playClick(); onClose(); onOpenShop(); }} className="text-purple-400 font-bold underline">
                  Visit the Marketplace
                </button>
              </div>
            )
          ) : (
            consumableItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {consumableItems.map((invItem) => {
                  const details = getItemDetails(invItem.itemId) || invItem.itemData;
                  const Icon = details?.icon ? (ICON_MAP[details.icon] || Sparkles) : Sparkles;

                  return (
                    <div
                      key={invItem.itemId}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-100">{details?.name || invItem.name}</h4>
                          <span className="text-[10px] text-amber-300 font-semibold font-mono">
                            x{invItem.quantity || 1} available
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => usePotion(invItem.itemId)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Use</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No potions or scrolls in your pouch.{' '}
                <button onClick={() => { playClick(); onClose(); onOpenShop(); }} className="text-purple-400 font-bold underline">
                  Buy Potions
                </button>
              </div>
            )
          )}
        </div>

      </motion.div>
    </div>
  );
}
