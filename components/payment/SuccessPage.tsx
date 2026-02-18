
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, StarIcon, SparklesIcon } from '../core/Icons';
import { useAppContext } from '../AppContext';

export const SuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const { fetchData, userData } = useAppContext();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Tenta atualizar os dados do usuário para confirmar o status PRO
        const refreshData = async () => {
            await fetchData();
            setLoading(false);
            // Salva no localStorage para o TourGuide saber que deve mostrar o tour do PRO
            localStorage.setItem('trigger_pro_tour', 'true');
        };
        refreshData();
    }, [fetchData]);

    return (
        <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            {/* Background Glows */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative mb-8">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center shadow-lg animate-pop-in">
                    <CheckCircleIcon className="w-14 h-14" />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md animate-bounce delay-300">
                    <StarIcon className="w-6 h-6" />
                </div>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
                Pagamento Confirmado!
            </h1>
            
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium max-w-xs mx-auto mb-10 leading-relaxed">
                Bem-vindo ao FitMind PRO. Sua jornada acaba de ganhar um novo aliado potente.
            </p>

            <div className="w-full max-w-sm space-y-4 mb-12">
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 text-left animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <SparklesIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Recursos Desbloqueados</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">CalorieCam, Treinos IA e muito mais.</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => navigate('/')}
                disabled={loading}
                className="w-full max-w-sm bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-bold shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
            >
                {loading ? 'Atualizando Perfil...' : 'Começar Agora'}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
        </div>
    );
};
