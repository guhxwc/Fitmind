import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { CheckCircleIcon, StarIcon } from '../core/Icons';

const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center space-x-3">
    <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
    <span className="text-gray-700 dark:text-gray-300">{children}</span>
  </li>
);

export const ProPlanTab: React.FC = () => {
    const navigate = useNavigate();
    const { userData } = useAppContext();

    if (!userData) return null;

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
                    <div className="w-20 h-20 bg-blue-100 text-blue-500 rounded-3xl mx-auto flex items-center justify-center">
                        <StarIcon className="w-10 h-10"/>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-4">Você é PRO!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                        Olá {userData.name}, obrigado por fazer parte do FitMind PRO. Aproveite todos os recursos exclusivos.
                    </p>
                </div>
                
                <div className="mt-8 bg-gray-100/60 dark:bg-gray-800/50 p-6 rounded-2xl">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Seus benefícios exclusivos:</h3>
                    <ul className="space-y-3">
                        <FeatureItem>
                            <strong>CalorieCam:</strong> Reconhecimento de alimentos por IA
                        </FeatureItem>
                        <FeatureItem>Planos de treino completos e personalizados</FeatureItem>
                        <FeatureItem>Dietas avançadas geradas por IA</FeatureItem>
                        <FeatureItem>Gráficos detalhados e projeções</FeatureItem>
                        <FeatureItem>Comparador de fotos de progresso</FeatureItem>
                         <FeatureItem>Relatórios semanais inteligentes</FeatureItem>
                    </ul>
                </div>

                <div className="mt-8 text-center">
                     <button className="text-gray-500 dark:text-gray-400 font-semibold">Gerenciar Assinatura</button>
                </div>

            </main>
        </div>
    );
};