import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UtensilsIcon, FlameIcon, BarChartIcon, SettingsIcon, CalendarCheckIcon } from './Icons';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon }) => {
  return (
    <NavLink 
        to={to} 
        className={({ isActive }) => 
            `flex flex-col items-center justify-center flex-1 transition-all duration-200 active:scale-95 ${
                isActive ? 'text-black dark:text-white' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`
        }
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );
};

export const BottomNav: React.FC = () => {
  const tabs = [
    { to: '/', label: 'Resumo', icon: <HomeIcon /> },
    { to: '/applications', label: 'Aplicações', icon: <CalendarCheckIcon /> },
    { to: '/meals', label: 'Refeições', icon: <UtensilsIcon /> },
    { to: '/workouts', label: 'Treinos', icon: <FlameIcon /> },
    { to: '/progress', label: 'Progresso', icon: <BarChartIcon /> },
    { to: '/settings', label: 'Ajustes', icon: <SettingsIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 dark:bg-black/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 flex justify-around py-3">
      {tabs.map(tab => (
        <NavItem 
          key={tab.to}
          to={tab.to}
          label={tab.label}
          icon={tab.icon}
        />
      ))}
    </nav>
  );
};