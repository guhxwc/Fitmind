
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UtensilsIcon, DumbbellIcon, ChartLineIcon, SettingsIcon, SyringeIcon } from './Icons';

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
            `flex flex-col items-center justify-center flex-1 transition-colors duration-200 ${
                isActive ? 'text-black' : 'text-gray-400 hover:text-gray-600'
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
    { to: '/applications', label: 'Aplicações', icon: <SyringeIcon /> },
    { to: '/meals', label: 'Refeições', icon: <UtensilsIcon /> },
    { to: '/workouts', label: 'Treinos', icon: <DumbbellIcon /> },
    { to: '/progress', label: 'Progresso', icon: <ChartLineIcon /> },
    { to: '/settings', label: 'Ajustes', icon: <SettingsIcon /> },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-sm border-t border-gray-200 flex justify-around py-3">
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