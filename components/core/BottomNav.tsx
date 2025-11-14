
import React from 'react';
import { HomeIcon, UtensilsIcon, DumbbellIcon, ChartLineIcon, SettingsIcon } from './Icons';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavItem: React.FC<{ label: string; icon: React.ReactNode; isActive: boolean; onClick: () => void }> = ({ label, icon, isActive, onClick }) => {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-1/5 transition-colors duration-200 ${isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}>
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'summary', label: 'Resumo', icon: <HomeIcon /> },
    { id: 'meals', label: 'Refeições', icon: <UtensilsIcon /> },
    { id: 'workouts', label: 'Treinos', icon: <DumbbellIcon /> },
    { id: 'progress', label: 'Progresso', icon: <ChartLineIcon /> },
    { id: 'settings', label: 'Ajustes', icon: <SettingsIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-sm border-t border-gray-200 flex justify-around py-2">
      {tabs.map(tab => (
        <NavItem 
          key={tab.id}
          label={tab.label}
          icon={tab.icon}
          isActive={activeTab === tab.id}
          onClick={() => setActiveTab(tab.id)}
        />
      ))}
    </nav>
  );
};
