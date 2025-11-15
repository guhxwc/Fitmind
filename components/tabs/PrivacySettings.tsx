import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import { FileTextIcon, TrashIcon } from '../core/Icons';

const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-gray-800 dark:text-gray-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const PrivacySettings: React.FC = () => {
    const context = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const handleExportData = () => {
        setIsExporting(true);
        try {
            const allData = {
                profile: context.userData,
                weightHistory: context.weightHistory,
                applicationHistory: context.applicationHistory,
                progressPhotos: context.progressPhotos,
                workoutPlan: context.workoutPlan,
                workoutHistory: context.workoutHistory,
                dailyNotes: context.dailyNotes,
                sideEffects: context.sideEffects,
                meals: context.meals,
            };

            const dataStr = JSON.stringify(allData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `fitmind_data_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error("Failed to export data", error);
            addToast("Ocorreu um erro ao exportar seus dados.", 'error');
        } finally {
            setTimeout(() => setIsExporting(false), 1000); // Give time for download to start
        }
    };

    return (
        <div className="p-4 sm:p-6 space-y-6 bg-white dark:bg-black min-h-screen animate-fade-in">
            <header className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300 p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Privacidade</h1>
            </header>
            
            <section className="space-y-4">
                 <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Gerenciar Meus Dados</h2>
                <div className="bg-gray-100/60 dark:bg-gray-800/50 p-4 rounded-xl">
                    <div className="flex items-start gap-3">
                         <div className="text-gray-500 dark:text-gray-400 mt-1"><FileTextIcon className="w-5 h-5"/></div>
                         <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-200">Exportar todos os dados</p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">Baixe uma cópia de todos os seus dados registrados no aplicativo, incluindo perfil, progresso e registros diários, em formato JSON.</p>
                         </div>
                    </div>
                    <button onClick={handleExportData} disabled={isExporting} className="w-full flex justify-center items-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 py-2 rounded-md font-semibold text-gray-800 dark:text-gray-200 disabled:opacity-50">
                        {isExporting ? <Spinner /> : 'Baixar Meus Dados'}
                    </button>
                </div>

                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mt-2 border border-red-200 dark:border-red-800">
                     <div className="flex items-start gap-3">
                         <div className="text-red-500 dark:text-red-400 mt-1"><TrashIcon className="w-5 h-5"/></div>
                         <div>
                             <p className="font-semibold text-red-800 dark:text-red-300">Excluir conta e dados</p>
                            <p className="text-sm text-red-700 dark:text-red-400 mb-3">Esta ação é permanente. Ao continuar, você será levado para a tela de confirmação de exclusão da conta.</p>
                         </div>
                     </div>
                    <button onClick={() => navigate('/settings/account')} className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700">
                        Ir para Exclusão de Conta
                    </button>
                </div>
            </section>
        </div>
    );
};