import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, StarIcon } from '../core/Icons';

const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-center space-x-3">
    <CheckCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
    <span className="text-gray-700 dark:text-gray-300">{children}</span>
  </li>
);

export const ProPlanTab: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4 sm:p-6 bg-white dark:bg-black min-h-screen animate-fade-in">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Minha Assinatura</h1>
            </header>
            
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl mx-auto flex items-center justify-center">
                    <StarIcon className="w-8 h-8"/>
                </div>
                <div className="mt-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Você é um membro PRO!</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Aproveite ao máximo todos os recursos exclusivos.</p>
                </div>
            </div>

            <div className="bg-gray-100/50 dark:bg-gray-800/50 p-6 rounded-2xl text-left mt-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">Seus benefícios incluem:</h3>
                <ul className="space-y-3">
                    <FeatureItem>
                        <strong>CalorieCam:</strong> Reconhecimento de alimentos por IA
                    </FeatureItem>
                    <FeatureItem>Planos de treino completos e personalizados</FeatureItem>
                    <FeatureItem>Dietas avançadas geradas por IA</FeatureItem>
                    <FeatureItem>Gráficos detalhados e projeções</FeatureItem>
                    <FeatureItem>Comparador de fotos de progresso</FeatureItem>
                    <FeatureItem>Relatórios semanais com insights da IA</FeatureItem>
                </ul>
            </div>

            <div className="text-center mt-8">
                <p className="text-gray-500 dark:text-gray-400">Obrigado por apoiar o FitMind.</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Para gerenciar sua assinatura, visite a loja de aplicativos do seu dispositivo.</p>
            </div>
        </div>
    );
};
