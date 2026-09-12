import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import CharacterHUD from '../components/CharacterHUD';
import QuestList from '../components/QuestList';
import QuestModal from '../components/QuestModal';
import ShopModal from '../components/ShopModal';
import InventoryModal from '../components/InventoryModal';
import BossRaidSection from '../components/BossRaidSection';
import StatsRadar from '../components/StatsRadar';
import SpellsModal from '../components/SpellsModal';
import LevelUpOverlay from '../components/LevelUpOverlay';
import FloatingRewards from '../components/FloatingRewards';

export default function DashboardPage() {
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState(null);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isBossOpen, setIsBossOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSpellsOpen, setIsSpellsOpen] = useState(false);

  const handleOpenNewQuest = () => {
    setEditingQuest(null);
    setIsQuestModalOpen(true);
  };

  const handleEditQuest = (quest) => {
    setEditingQuest(quest);
    setIsQuestModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* TOP NAVIGATION BAR */}
      <Navbar
        onOpenShop={() => setIsShopOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenSpells={() => setIsSpellsOpen(true)}
      />

      {/* MAIN GAMEPLAY CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 sm:py-8">
        {/* CHARACTER HUD & STATS */}
        <CharacterHUD
          onOpenShop={() => setIsShopOpen(true)}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenBoss={() => setIsBossOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
        />

        {/* QUESTS LEDGER */}
        <QuestList
          onOpenNewQuest={handleOpenNewQuest}
          onEditQuest={handleEditQuest}
        />
      </main>

      {/* MODALS */}
      <QuestModal
        isOpen={isQuestModalOpen}
        onClose={() => { setIsQuestModalOpen(false); setEditingQuest(null); }}
        editingQuest={editingQuest}
      />

      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onOpenInventory={() => setIsInventoryOpen(true)}
      />

      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        onOpenShop={() => setIsShopOpen(true)}
      />

      <BossRaidSection
        isOpen={isBossOpen}
        onClose={() => setIsBossOpen(false)}
      />

      <StatsRadar
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />

      <SpellsModal
        isOpen={isSpellsOpen}
        onClose={() => setIsSpellsOpen(false)}
      />

      {/* CELEBRATORY OVERLAYS & FLOATING REWARDS */}
      <LevelUpOverlay />
      <FloatingRewards />
    </div>
  );
}
