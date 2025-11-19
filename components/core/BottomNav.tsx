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
            `flex flex-col items-center justify-center flex-1 transition-all duration-300 ${
                isActive 
                  ? 'text-ios-blue scale-105' 
                  : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
            }`
        }
    >
      {({ isActive }) => (
          <>
            {/* Icon Container */}
            <div className="relative">
                {React.cloneElement(icon as React.ReactElement, { 
                    strokeWidth: isActive ? 2.5 : 2,
                    className: "w-6 h-6"
                })}
                {isActive && <div className="absolute inset-0 bg-blue-400/20 blur-xl rounded-full"></div>}
            </div>
            <span className="text-[10px] font-semibold mt-1 tracking-tight">{label}</span>
          </>
      )}
    </NavLink>
  );
};

export const BottomNav: React.FC = () => {
  const tabs = [
    { to: '/', label: 'Resumo', icon: <HomeIcon /> },
    { to: '/applications', label: 'Doses', icon: <CalendarCheckIcon /> },
    { to: '/meals', label: 'Dieta', icon: <UtensilsIcon /> },
    { to: '/workouts', label: 'Treinos', icon: <FlameIcon /> },
    { to: '/progress', label: 'Corpo', icon: <BarChartIcon /> },
    { to: '/settings', label: 'Ajustes', icon: <SettingsIcon /> },
  ];

  return (
    <>
        {/* Blur backdrop for modern feel */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass border-t border-gray-200/40 dark:border-gray-800/40 flex justify-around py-3 pb-6 z-50">
            {tabs.map(tab => (
                <NavItem 
                    key={tab.to}
                    to={tab.to}
                    label={tab.label}
                    icon={tab.icon}
                />
            ))}
        </nav>
    </>
  );
};