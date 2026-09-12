const DEFAULT_ITEMS = [
  // WEAPONS
  {
    _id: 'item_wpn_01',
    name: 'Iron Longsword',
    type: 'weapon',
    rarity: 'common',
    price: 60,
    currency: 'gold',
    icon: 'Sword',
    description: 'A well-balanced blade forged for fledgling warriors.',
    stats: { STR: 3, damage: 15, xpBonus: 2 }
  },
  {
    _id: 'item_wpn_02',
    name: 'Cybernetic Monokatana',
    type: 'weapon',
    rarity: 'rare',
    price: 180,
    currency: 'gold',
    icon: 'Zap',
    description: 'High-frequency vibrating edge slicing through tough tasks.',
    stats: { AGI: 6, STR: 4, damage: 35, xpBonus: 5 }
  },
  {
    _id: 'item_wpn_03',
    name: 'Chronos Arcane Staff',
    type: 'weapon',
    rarity: 'epic',
    price: 350,
    currency: 'gold',
    icon: 'Wand2',
    description: 'Harness the flow of time to supercharge mental focus.',
    stats: { INT: 12, SPI: 8, damage: 60, xpBonus: 10 }
  },
  {
    _id: 'item_wpn_04',
    name: 'Celestial Dawnbreaker',
    type: 'weapon',
    rarity: 'legendary',
    price: 800,
    gems: 10,
    currency: 'gold',
    icon: 'Flame',
    description: 'Forged in stellar flames. Vanquishes all procrastination.',
    stats: { STR: 15, INT: 10, VIT: 10, damage: 120, xpBonus: 20, goldBonus: 15 }
  },

  // ARMOR
  {
    _id: 'item_arm_01',
    name: 'Reinforced Leather Vest',
    type: 'armor',
    rarity: 'common',
    price: 50,
    currency: 'gold',
    icon: 'Shield',
    description: 'Lightweight protection providing freedom of movement.',
    stats: { AGI: 3, VIT: 2 }
  },
  {
    _id: 'item_arm_02',
    name: 'Nano-Fiber Exo Plate',
    type: 'armor',
    rarity: 'rare',
    price: 200,
    currency: 'gold',
    icon: 'Cpu',
    description: 'Reinforced micro-mesh that deflects mental fatigue.',
    stats: { VIT: 8, STR: 4, goldBonus: 5 }
  },
  {
    _id: 'item_arm_03',
    name: 'Paladin Radiant Aegis Armor',
    type: 'armor',
    rarity: 'epic',
    price: 400,
    currency: 'gold',
    icon: 'ShieldCheck',
    description: 'Imbued with holy resilience. Safeguards your streak.',
    stats: { VIT: 15, SPI: 10, goldBonus: 10 }
  },

  // ACCESSORIES
  {
    _id: 'item_acc_01',
    name: 'Ring of Relentless Focus',
    type: 'accessory',
    rarity: 'common',
    price: 75,
    currency: 'gold',
    icon: 'CircleDot',
    description: 'Keeps your thoughts sharp amidst daily distractions.',
    stats: { INT: 4, SPI: 3 }
  },
  {
    _id: 'item_acc_02',
    name: 'Chronograph of Discipline',
    type: 'accessory',
    rarity: 'rare',
    price: 220,
    currency: 'gold',
    icon: 'Clock',
    description: 'A magical timepiece granting temporal mastery.',
    stats: { INT: 8, AGI: 5, xpBonus: 8 }
  },
  {
    _id: 'item_acc_03',
    name: 'Amulet of the Sovereign',
    type: 'accessory',
    rarity: 'legendary',
    price: 650,
    gems: 8,
    currency: 'gold',
    icon: 'Crown',
    description: 'Radiates majestic aura. Amplifies all gained rewards.',
    stats: { CHA: 15, STR: 8, INT: 8, goldBonus: 20, xpBonus: 15 }
  },

  // PETS / COMPANIONS
  {
    _id: 'item_pet_01',
    name: 'Ember Fox',
    type: 'pet',
    rarity: 'rare',
    price: 250,
    currency: 'gold',
    icon: 'Sparkles',
    description: 'Playful spirit animal igniting your inner drive.',
    stats: { AGI: 6, CHA: 6, goldBonus: 8 }
  },
  {
    _id: 'item_pet_02',
    name: 'Cyber Synth-Owl',
    type: 'pet',
    rarity: 'epic',
    price: 450,
    currency: 'gold',
    icon: 'Eye',
    description: 'Omniscient scouting drone tracking your achievements.',
    stats: { INT: 12, SPI: 8, xpBonus: 12 }
  },
  {
    _id: 'item_pet_03',
    name: 'Celestial Astral Dragon',
    type: 'pet',
    rarity: 'legendary',
    price: 1000,
    gems: 15,
    currency: 'gold',
    icon: 'Sparkle',
    description: 'A mythic guardian bestowing cosmic power and prestige.',
    stats: { STR: 12, INT: 12, VIT: 12, SPI: 12, damage: 50, xpBonus: 25, goldBonus: 25 }
  },

  // POTIONS & CONSUMABLES
  {
    _id: 'item_pot_01',
    name: 'Elixir of Rejuvenation',
    type: 'potion',
    rarity: 'common',
    price: 30,
    currency: 'gold',
    icon: 'Heart',
    description: 'Restores 50 HP and cleanses mental burnout.',
    effect: { type: 'HEAL_HP', amount: 50 }
  },
  {
    _id: 'item_pot_02',
    name: 'Draught of Arcane Mana',
    type: 'potion',
    rarity: 'common',
    price: 35,
    currency: 'gold',
    icon: 'Droplet',
    description: 'Restores 40 Mana for casting empowerment spells.',
    effect: { type: 'RESTORE_MANA', amount: 40 }
  },
  {
    _id: 'item_pot_03',
    name: 'Streak Guardian Shield',
    type: 'consumable',
    rarity: 'rare',
    price: 120,
    currency: 'gold',
    icon: 'ShieldAlert',
    description: 'Protects your streak from resetting if you miss a daily.',
    effect: { type: 'STREAK_FREEZE', amount: 1 }
  }
];

const DEFAULT_BOSSES = [
  {
    _id: 'boss_01',
    name: 'Chronos, The Time Devourer',
    subtitle: 'Lord of Wasted Hours',
    level: 5,
    totalHp: 3000,
    currentHp: 2450,
    weakness: 'INT',
    rewardXp: 500,
    rewardGold: 250,
    rewardGems: 10,
    imageIcon: 'Hourglass',
    active: true,
    description: 'A colossal temporal titan that feeds on delayed tasks. Complete intellect and study quests to deal extra critical damage!'
  },
  {
    _id: 'boss_02',
    name: 'The Procrastination Wyrm',
    subtitle: 'Slumbering Shadow of Doubt',
    level: 10,
    totalHp: 6500,
    currentHp: 6500,
    weakness: 'STR',
    rewardXp: 1200,
    rewardGold: 600,
    rewardGems: 25,
    imageIcon: 'Flame',
    active: false,
    description: 'A gargantuan dragon coiled atop mountains of unfinished chores and workouts. Slay it with Strength and Agility!'
  }
];

module.exports = {
  DEFAULT_ITEMS,
  DEFAULT_BOSSES
};
