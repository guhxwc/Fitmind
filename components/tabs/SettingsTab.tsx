
import React from 'react';
import { supabase } from '../../supabaseClient';
import type { UserData } from '../../types';
import { WEEKDAYS } from '../../constants';
import { UserCircleIcon, StarIcon, MoonIcon, BellIcon, ShieldCheckIcon, SyringeIcon } from '../core/Icons';

interface SettingsTabProps {
    userData: UserData;
    onShowSubscription: () => void;
}

const SettingsItem: React.FC<{icon: React.ReactNode, label: string, onClick?: () => void}> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center w-full p-4 bg-gray-100/60 rounded-xl hover:bg-gray-200/60 transition-colors">
        <div className="text-gray-600">{icon}</div>
        <span className="ml-4 font-semibold text-gray-800">{label}</span>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    </button>
)

export const SettingsTab: React.FC<SettingsTabProps> = ({ userData, onShowSubscription }) => {

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="p-6 space-y-6 bg-white min-h-screen">
            <header>
                <h1 className="text-4xl font-bold text-gray-900">Ajustes</h1>
                <p className="text-gray-500">Gerencie sua conta e preferências</p>
            </header>

            <section className="space-y-3">
                 <SettingsItem icon={<UserCircleIcon className="w-6 h-6"/>} label="Conta" />
                 <SettingsItem icon={<StarIcon className="w-6 h-6 text-blue-500"/>} label="Assinatura PRO" onClick={onShowSubscription} />
                 <SettingsItem icon={<MoonIcon className="w-6 h-6"/>} label="Tema" />
                 <SettingsItem icon={<BellIcon className="w-6 h-6"/>} label="Notificações" />
                 <SettingsItem icon={<ShieldCheckIcon className="w-6 h-6"/>} label="Privacidade" />
            </section>
            
            <section className="bg-gray-100/50 p-5 rounded-2xl">
                <div className="flex items-center text-gray-600 mb-2">
                    <SyringeIcon />
                    <h3 className="ml-2 text-lg font-semibold text-gray-800">Próxima Aplicação</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-1">{userData.medication.nextApplication}</p>
                <p className="text-sm text-gray-500">
                    {new Date(new Date().setDate(new Date().getDate() + (WEEKDAYS.indexOf(userData.medication.nextApplication) - new Date().getDay() + 7) % 7)).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                </p>
            </section>
            
             <section className="pt-4 text-center space-y-4">
                <button onClick={handleLogout} className="text-red-500 font-semibold">
                    Sair da Conta
                </button>
                <button className="text-gray-500 font-semibold">Sobre o FitMind</button>
             </section>
        </div>
    );
};