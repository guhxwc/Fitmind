
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, UtensilsIcon, FlameIcon, BarChartIcon, SettingsIcon, CalendarCheckIcon, DietIcon } from './Icons';
import { MessageCircle } from 'lucide-react';
import { useAppContext } from '../AppContext';

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  id?: string; // Added ID prop
}

const NavItem: React.FC<NavItemProps> = ({ to, label, icon, id }) => {
  return (
    <NavLink 
        to={to} 
        id={id}
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
                {React.isValidElement(icon) && icon.type === MessageCircle 
                  ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-6 h-6", strokeWidth: isActive ? 2.5 : 2 })
                  : React.cloneElement(icon as React.ReactElement<any>, { 
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
  const { consultationStatus } = useAppContext();

  // Added specific IDs for the tour
  const baseTabs = [
    { to: '/', label: 'Resumo', icon: <HomeIcon />, id: 'nav-home' },
    { to: '/applications', label: 'Doses', icon: <CalendarCheckIcon />, id: 'nav-applications' },
    { to: '/meals', label: 'Dieta', icon: <DietIcon />, id: 'nav-meals' },
    { to: '/workouts', label: 'Treinos', icon: <FlameIcon />, id: 'nav-workouts' },
    { to: '/progress', label: 'Corpo', icon: <BarChartIcon />, id: 'nav-progress' },
    { to: '/settings', label: 'Ajustes', icon: <SettingsIcon />, id: 'nav-settings' },
  ];

  const tabs = [...baseTabs];
  
  if (consultationStatus === 'pending' || consultationStatus === 'anamnese_done' || consultationStatus === 'active') {
      tabs.splice(3, 0, { to: '/consultation', label: 'Consulta', icon: <MessageCircle />, id: 'nav-consultation' });
  }

  return (
    <>
        {/* Blur backdrop for modern feel */}
        <nav id="tour-nav" className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass border-t border-gray-200/40 dark:border-gray-800/40 flex justify-around py-3 pb-6 z-50">
            {tabs.map(tab => (
                <NavItem 
                    key={tab.to}
                    to={tab.to}
                    label={tab.label}
                    icon={tab.icon}
                    id={tab.id}
                />
            ))}
        </nav>
    </>
  );
};
