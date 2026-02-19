
import React, { useState, useRef } from 'react';
import { 
    PlusIcon, 
    XMarkIcon, 
    SyringeIcon, 
    CameraIcon, 
    ScaleIcon, 
    FlameIcon, 
    WavesIcon, 
    UtensilsIcon 
} from './Icons';

interface FloatingActionMenuProps {
    onAction: (action: 'application' | 'photo' | 'weight' | 'activity' | 'side_effect' | 'meal') => void;
}

const ActionButton: React.FC<{ 
    label: string; 
    icon: React.ReactNode; 
    onClick: () => void; 
    delay: number;
    colorClass: string;
}> = ({ label, icon, onClick, delay, colorClass }) => (
    <div 
        className="flex items-center justify-end gap-4 mb-4 animate-slide-up" 
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
        <span className="text-white font-bold text-sm bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm">
            {label}
        </span>
        <button 
            onClick={onClick}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform ${colorClass}`}
        >
            {icon}
        </button>
    </div>
);

export const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleActionClick = (action: 'application' | 'photo' | 'weight' | 'activity' | 'side_effect' | 'meal') => {
        setIsOpen(false);
        onAction(action);
    };

    return (
        <>
            {/* Overlay Dark Background */}
            <div 
                className={`fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Menu Items */}
            <div className={`fixed bottom-28 right-5 z-[70] flex flex-col items-end pointer-events-none ${isOpen ? 'pointer-events-auto' : ''}`}>
                {isOpen && (
                    <>
                        <ActionButton 
                            label="Registrar Refeição" 
                            icon={<UtensilsIcon className="w-5 h-5" />} 
                            onClick={() => handleActionClick('meal')}
                            delay={0}
                            colorClass="bg-orange-500"
                        />
                        <ActionButton 
                            label="Efeito Colateral" 
                            icon={<WavesIcon className="w-5 h-5" />} 
                            onClick={() => handleActionClick('side_effect')}
                            delay={50}
                            colorClass="bg-purple-500"
                        />
                        <ActionButton 
                            label="Atividade Física" 
                            icon={<FlameIcon className="w-5 h-5" />} 
                            onClick={() => handleActionClick('activity')}
                            delay={100}
                            colorClass="bg-red-500"
                        />
                        <ActionButton 
                            label="Registrar Peso" 
                            icon={<ScaleIcon className="w-5 h-5" />} 
                            onClick={() => handleActionClick('weight')}
                            delay={150}
                            colorClass="bg-blue-500"
                        />
                        <ActionButton 
                            label="Foto Pessoal" 
                            icon={<CameraIcon className="w-5 h-5" />} 
                            onClick={() => handleActionClick('photo')}
                            delay={200}
                            colorClass="bg-pink-500"
                        />
                        <ActionButton 
                            label="Registrar Aplicação" 
                            icon={<SyringeIcon className="w-5 h-5" />} 
                            onClick={() => handleActionClick('application')}
                            delay={250}
                            colorClass="bg-green-500"
                        />
                    </>
                )}
            </div>

            {/* Floating Action Button (FAB) */}
            <button 
                onClick={toggleMenu}
                className={`fixed bottom-24 right-5 w-14 h-14 rounded-full bg-black dark:bg-white text-white dark:text-black shadow-2xl flex items-center justify-center z-[70] transition-all duration-300 active:scale-90 border-4 border-white/10 dark:border-black/10 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                aria-label="Menu de Ações Rápidas"
            >
                <PlusIcon className="w-8 h-8" />
            </button>
        </>
    );
};
