import React from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import { Shield } from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center gap-4 text-purple-400">
        <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center animate-bounce shadow-xl shadow-purple-950">
          <Shield className="w-8 h-8" />
        </div>
        <div className="font-fantasy text-base font-bold text-slate-200 tracking-wider">
          Entering Aetherian Realm...
        </div>
      </div>
    );
  }

  return user ? <DashboardPage /> : <AuthPage />;
}
