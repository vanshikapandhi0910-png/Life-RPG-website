import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = [
  { id: 'cyberpunk', name: 'Cyberpunk Neon', class: 'theme-cyberpunk', accent: '#06b6d4', desc: 'High-tech neon HUD with cyan and violet glows' },
  { id: 'retro-dungeon', name: '16-Bit Retro Dungeon', class: 'theme-retro-dungeon', accent: '#f59e0b', desc: 'Classic golden embers and stone dungeon aesthetic' },
  { id: 'dark-fantasy', name: 'Eldritch Dark Fantasy', class: 'theme-dark-fantasy', accent: '#ef4444', desc: 'Gothic crimson blades and obsidian depths' },
  { id: 'celestial', name: 'Celestial Sanctuary', class: 'theme-celestial', accent: '#38bdf8', desc: 'High fantasy starlight and divine azure radiance' },
  { id: 'cozy-tavern', name: 'Cozy Tavern & Hearth', class: 'theme-cozy-tavern', accent: '#d97706', desc: 'Warm oak timber, fireside amber, and lo-fi vibes' }
];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('realmquest_theme') || 'cyberpunk';
  });

  useEffect(() => {
    localStorage.setItem('realmquest_theme', theme);
    const root = document.documentElement;
    THEMES.forEach(t => root.classList.remove(t.class));
    const current = THEMES.find(t => t.id === theme) || THEMES[0];
    root.classList.add(current.class);
  }, [theme]);

  const changeTheme = (themeId) => {
    setTheme(themeId);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, availableThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
