
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { CheckCircleIcon, StarIcon, ArrowPathIcon } from '../core/Icons';
import { supabase } from '../../supabaseClient';
import { useToast } from '../ToastProvider';

const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center space-x-3">
    <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
    <span className="text-gray-700 dark:text-gray-300">{children}</span>
  </li>
);

export const ProPlanTab: React.FC = () => {
    const navigate = useNavigate();
    const { userData } = useAppContext();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    if (!userData) return null;

    const handleManageSubscription = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-portal-session', {
                body: { returnUrl: window.location.href }
            });

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error("URL não retornada");
            }
        } catch (error: any) {
            console.error(error);
            addToast(error.message === 'Nenhuma assinatura ativa encontrada para este usuário.' 
                ? 'Você não possui uma assinatura ativa vinculada.' 
                : 'Erro ao abrir portal. Tente novamente.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-black">
            <header className="flex-shrink-0 flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-800">
                <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Minha Assinatura</h1>
            </header>

            <main className="flex-grow overflow-y-auto p-6 animate-fade-in">
                <div className="text-center">
                    <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <StarIcon className="w-10 h-10"/>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">Você é PRO!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                        Olá {userData.name}, obrigado por fazer parte do FitMind PRO. Aproveite todos os recursos exclusivos.
                    </p>
                </div>
                
                <div className="mt-8 bg-gray-50 dark:bg-gray-900 rounded-[24px] p-6 border border-gray-100 dark:border-gray-800">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-400 mb-4">Seus benefícios ativos</h3>
                    <ul className="space-y-4">
                        <FeatureItem><strong>CalorieCam:</strong> Reconhecimento de alimentos</FeatureItem>
                        <FeatureItem>Planos de treino personalizados</FeatureItem>
                        <FeatureItem>Dietas geradas por IA</FeatureItem>
                        <FeatureItem>Gráficos e projeções avançadas</FeatureItem>
                        <FeatureItem>Relatórios semanais inteligentes</FeatureItem>
                    </ul>
                </div>

                <div className="mt-8 text-center">
                     <button 
                        onClick={handleManageSubscription}
                        disabled={loading}
                        className="text-gray-500 dark:text-gray-400 font-bold text-sm hover:text-black dark:hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto w-full py-3"
                    >
                        {loading ? (
                            <>
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                Abrindo Portal...
                            </>
                        ) : (
                            'Gerenciar Assinatura / Cancelar'
                        )}
                    </button>
                </div>

            </main>
        </div>
    );
};
