import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { SoundProvider } from './context/SoundContext';
import { AuthProvider } from './context/AuthContext';
import { RPGProvider } from './context/RPGContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <SoundProvider>
        <AuthProvider>
          <RPGProvider>
            <App />
          </RPGProvider>
        </AuthProvider>
      </SoundProvider>
    </ThemeProvider>
  </React.StrictMode>
);
