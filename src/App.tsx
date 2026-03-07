import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Calendar, 
  Settings, 
  Plus, 
  TrendingUp, 
  Moon, 
  Sun,
  User,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  return (
    <div className="min-h-screen bg-ios-bg dark:bg-ios-dark-bg text-ios-dark-bg dark:text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass px-6 pt-12 pb-4 flex justify-between items-center border-b border-ios-separator dark:border-ios-dark-separator">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">FitMind</h1>
          <p className="text-ios-gray text-sm font-medium">Bem-vindo de volta!</p>
        </div>
        <button 
          onClick={toggleDarkMode}
          className="p-2 rounded-full bg-ios-card dark:bg-ios-dark-card shadow-soft"
        >
          {isDarkMode ? <Sun size={20} className="text-ios-orange" /> : <Moon size={20} className="text-ios-blue" />}
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Daily Progress Card */}
              <div className="bg-ios-card dark:bg-ios-dark-card rounded-2xl p-6 shadow-soft border border-black/5 dark:border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="text-ios-blue" size={20} />
                    Atividade Diária
                  </h2>
                  <span className="text-ios-blue text-sm font-semibold">Ver detalhes</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">1,240</p>
                    <p className="text-xs text-ios-gray uppercase font-bold tracking-wider">Kcal</p>
                  </div>
                  <div className="text-center border-x border-ios-separator dark:border-ios-dark-separator">
                    <p className="text-2xl font-bold">8,432</p>
                    <p className="text-xs text-ios-gray uppercase font-bold tracking-wider">Passos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">45</p>
                    <p className="text-xs text-ios-gray uppercase font-bold tracking-wider">Min</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-ios-blue text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-glow">
                  <Plus size={24} />
                  <span className="text-sm font-bold">Registrar Refeição</span>
                </button>
                <button className="bg-ios-green text-white rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-soft">
                  <TrendingUp size={24} />
                  <span className="text-sm font-bold">Registrar Peso</span>
                </button>
              </div>

              {/* AI Insight */}
              <div className="bg-gradient-to-br from-ios-blue to-violet-600 text-white rounded-2xl p-6 shadow-soft relative overflow-hidden">
                <Sparkles className="absolute -right-4 -top-4 opacity-20" size={120} />
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  Insight FitMind AI
                </h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  Você está 15% mais ativo do que na semana passada! Continue assim para atingir sua meta de peso até o final do mês.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-20"
            >
              <div className="w-20 h-20 bg-ios-blue/10 rounded-full flex items-center justify-center">
                <Calendar size={40} className="text-ios-blue" />
              </div>
              <h2 className="text-xl font-bold">Calendário de Treinos</h2>
              <p className="text-ios-gray max-w-xs">
                Visualize seu histórico e planeje seus próximos desafios aqui.
              </p>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <h2 className="text-xl font-bold px-2">Ajustes</h2>
              <div className="bg-ios-card dark:bg-ios-dark-card rounded-2xl overflow-hidden shadow-soft border border-black/5 dark:border-white/5">
                <button className="w-full px-4 py-4 flex items-center justify-between border-b border-ios-separator dark:border-ios-dark-separator">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-ios-blue rounded-lg flex items-center justify-center text-white">
                      <User size={18} />
                    </div>
                    <span className="font-medium">Perfil Pessoal</span>
                  </div>
                  <ChevronRight size={18} className="text-ios-gray" />
                </button>
                <button className="w-full px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-ios-gray rounded-lg flex items-center justify-center text-white">
                      <Settings size={18} />
                    </div>
                    <span className="font-medium">Preferências</span>
                  </div>
                  <ChevronRight size={18} className="text-ios-gray" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-ios-separator dark:border-ios-dark-separator px-8 pt-3 pb-8 flex justify-between items-center z-50">
        <button 
          onClick={() => setActiveTab('summary')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'summary' ? 'text-ios-blue' : 'text-ios-gray'}`}
        >
          <Activity size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Resumo</span>
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'calendar' ? 'text-ios-blue' : 'text-ios-gray'}`}
        >
          <Calendar size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Agenda</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'settings' ? 'text-ios-blue' : 'text-ios-gray'}`}
        >
          <Settings size={24} />
          <span className="text-[10px] font-bold uppercase tracking-wider">Ajustes</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
