import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useSound } from './SoundContext';

const RPGContext = createContext();

export const RPGProvider = ({ children }) => {
  const { user, updateUserState, isAuthenticated } = useAuth();
  const { playQuestComplete, playLevelUp, playCoinSound, playSwordSlash, playSpellCast, playEquip, playError } = useSound();

  const [quests, setQuests] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [boss, setBoss] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rewardPopups, setRewardPopups] = useState([]);
  const [levelUpEvent, setLevelUpEvent] = useState(null);
  const [bossDamageEvent, setBossDamageEvent] = useState(null);

  // Fetch initial game data
  const loadGameData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [questRes, shopRes, bossRes] = await Promise.all([
        api.getQuests(),
        api.getShop(),
        api.getActiveBoss()
      ]);
      setQuests(questRes.quests || []);
      setShopItems(shopRes.items || []);
      setBoss(bossRes.boss || null);
    } catch (err) {
      console.error('Failed to load RPG state:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadGameData();
  }, [loadGameData]);

  // Trigger celebratory confetti burst
  const triggerConfetti = (isEpic = false) => {
    try {
      if (isEpic) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#ffffff']
        });
      } else {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (e) {}
  };

  // Add floating reward popup
  const pushRewardPopup = (reward) => {
    const id = Date.now() + Math.random();
    setRewardPopups(prev => [...prev, { ...reward, id }]);
    setTimeout(() => {
      setRewardPopups(prev => prev.filter(p => p.id !== id));
    }, 3500);
  };

  // QUEST ACTIONS
  const createQuest = async (questData) => {
    try {
      const res = await api.createQuest(questData);
      setQuests(prev => [res.quest, ...prev]);
      return res.quest;
    } catch (err) {
      playError();
      throw err;
    }
  };

  const updateQuest = async (id, updates) => {
    try {
      // Optimistic update
      setQuests(prev => prev.map(q => q._id === id ? { ...q, ...updates } : q));
      const res = await api.updateQuest(id, updates);
      setQuests(prev => prev.map(q => q._id === id ? res.quest : q));
      return res.quest;
    } catch (err) {
      loadGameData();
      playError();
      throw err;
    }
  };

  const deleteQuest = async (id) => {
    try {
      setQuests(prev => prev.filter(q => q._id !== id));
      await api.deleteQuest(id);
    } catch (err) {
      loadGameData();
      playError();
      throw err;
    }
  };

  const completeQuest = async (id) => {
    try {
      const targetQuest = quests.find(q => q._id === id);
      const isEpic = targetQuest?.difficulty === 'HARD' || targetQuest?.difficulty === 'LEGENDARY';

      // Call completion API
      const res = await api.completeQuest(id);

      // Play audio & sound effects
      playQuestComplete();
      setTimeout(playCoinSound, 250);

      if (res.bossReport) {
        setTimeout(playSwordSlash, 350);
        setBossDamageEvent(res.bossReport);
        if (boss) {
          setBoss(prev => prev ? { ...prev, currentHp: res.bossReport.remainingHp } : null);
        }
      }

      // Update state
      if (res.user) updateUserState(res.user);
      if (res.quest) {
        setQuests(prev => prev.map(q => q._id === id ? res.quest : q));
      }

      // Trigger visual confetti
      triggerConfetti(isEpic || !!res.levelUp);

      // Trigger reward HUD popups
      pushRewardPopup({
        xp: res.rewards?.xpGained,
        gold: res.rewards?.goldGained,
        stat: res.rewards?.statGain,
        attr: res.rewards?.attribute,
        gems: res.rewards?.gemsGained
      });

      // Level Up modal celebration
      if (res.levelUp) {
        setTimeout(() => {
          playLevelUp();
          setLevelUpEvent(res.levelUp);
          triggerConfetti(true);
        }, 500);
      }

      return res;
    } catch (err) {
      playError();
      throw err;
    }
  };

  const revertQuest = async (id) => {
    try {
      const res = await api.revertQuest(id);
      setQuests(prev => prev.map(q => q._id === id ? res.quest : q));
    } catch (err) {
      playError();
      throw err;
    }
  };

  const habitAction = async (id, direction) => {
    try {
      if (direction === 'positive') {
        return await completeQuest(id);
      } else {
        const res = await api.habitAction(id, direction);
        playError();
        if (res.user) updateUserState(res.user);
        if (res.quest) {
          setQuests(prev => prev.map(q => q._id === id ? res.quest : q));
        }
        pushRewardPopup({ hpLost: res.damage });
        return res;
      }
    } catch (err) {
      playError();
      throw err;
    }
  };

  // SHOP ACTIONS
  const buyItem = async (itemId) => {
    try {
      const res = await api.buyItem(itemId);
      playCoinSound();
      updateUserState(res.user);
      pushRewardPopup({ acquired: res.boughtItem?.name });
      return res;
    } catch (err) {
      playError();
      throw err;
    }
  };

  const equipItem = async (itemId, slot) => {
    try {
      const res = await api.equipItem(itemId, slot);
      playEquip();
      updateUserState(res.user);
      return res;
    } catch (err) {
      playError();
      throw err;
    }
  };

  const unequipItem = async (slot) => {
    try {
      const res = await api.unequipItem(slot);
      playEquip();
      updateUserState(res.user);
      return res;
    } catch (err) {
      playError();
      throw err;
    }
  };

  const usePotion = async (itemId) => {
    try {
      const res = await api.usePotion(itemId);
      playSpellCast();
      updateUserState(res.user);
      return res;
    } catch (err) {
      playError();
      throw err;
    }
  };

  const castSpell = async (spellType) => {
    try {
      const res = await api.castSpell(spellType);
      playSpellCast();
      updateUserState(res.user);
      triggerConfetti(false);
      return res;
    } catch (err) {
      playError();
      throw err;
    }
  };

  return (
    <RPGContext.Provider value={{
      quests,
      shopItems,
      boss,
      loading,
      rewardPopups,
      levelUpEvent,
      setLevelUpEvent,
      bossDamageEvent,
      setBossDamageEvent,
      createQuest,
      updateQuest,
      deleteQuest,
      completeQuest,
      revertQuest,
      habitAction,
      buyItem,
      equipItem,
      unequipItem,
      usePotion,
      castSpell,
      refreshGame: loadGameData
    }}>
      {children}
    </RPGContext.Provider>
  );
};

export const useRPG = () => useContext(RPGContext);
