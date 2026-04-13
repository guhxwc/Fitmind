import React, { useState } from 'react';
import { XMarkIcon } from './core/Icons';
import { Download } from 'lucide-react';
import { useAppContext } from './AppContext';
import Portal from './core/Portal';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format, subMonths, isAfter, subYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from './ToastProvider';

interface ReportGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TimeRange = '1_month' | '3_months' | '6_months' | '1_year';

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({ isOpen, onClose }) => {
    const { userData, weightHistory, meals, currentWater, updateStreak } = useAppContext();
    const { addToast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen) return null;

    const generatePDF = async (range: TimeRange) => {
        setIsGenerating(true);
        try {
            const doc = new jsPDF();
            const now = new Date();
            let startDate = new Date();

            switch (range) {
                case '1_month': startDate = subMonths(now, 1); break;
                case '3_months': startDate = subMonths(now, 3); break;
                case '6_months': startDate = subMonths(now, 6); break;
                case '1_year': startDate = subYears(now, 1); break;
            }

            // Filter data based on date
            const filteredWeight = weightHistory.filter(w => isAfter(new Date(w.date), startDate));
            
            // Basic data
            const initialWeight = userData?.startWeight || 0;
            const currentWeight = userData?.weight || 0;
            const goalWeight = userData?.targetWeight || 0;
            const weightLost = initialWeight - currentWeight;

            // Colors
            const primaryColor = [79, 70, 229]; // Indigo 600
            const secondaryColor = [107, 114, 128]; // Gray 500

            // Header
            doc.setFontSize(24);
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.text('Relatório FitMind', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.text(`Gerado em: ${format(now, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`, 14, 30);
            
            let rangeText = '';
            switch (range) {
                case '1_month': rangeText = 'Último mês'; break;
                case '3_months': rangeText = 'Últimos 3 meses'; break;
                case '6_months': rangeText = 'Últimos 6 meses'; break;
                case '1_year': rangeText = 'Último ano'; break;
            }
            doc.text(`Período: ${rangeText}`, 14, 36);

            // User Info
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Dados do Paciente', 14, 50);
            
            doc.setFontSize(11);
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            doc.text(`Nome: ${userData?.name || 'Não informado'}`, 14, 58);
            doc.text(`Altura: ${userData?.height ? `${userData.height} cm` : 'Não informada'}`, 14, 64);
            doc.text(`Tratamento: ${userData?.medication || 'Nenhum'}`, 14, 70);

            // Progress Summary
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Resumo de Progresso', 14, 85);

            const progressData = [
                ['Peso Inicial', 'Peso Atual', 'Meta de Peso', 'Total Perdido'],
                [`${initialWeight} kg`, `${currentWeight} kg`, `${goalWeight} kg`, `${weightLost > 0 ? weightLost.toFixed(1) : 0} kg`]
            ];

            (doc as any).autoTable({
                startY: 90,
                head: [progressData[0]],
                body: [progressData[1]],
                theme: 'grid',
                headStyles: { fillColor: primaryColor, textColor: 255 },
                styles: { halign: 'center' }
            });

            // Daily Averages and Consistency
            const finalY = (doc as any).lastAutoTable.finalY || 110;
            
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Hábitos e Consistência', 14, finalY + 15);

            const goalsData = [
                ['Proteína (Meta)', 'Água (Meta)', 'Consistência (Ofensiva)'],
                [`${userData?.goals?.protein || 0} g`, `${userData?.goals?.water || 0} L`, `${userData?.streak || 0} dias seguidos`]
            ];

            (doc as any).autoTable({
                startY: finalY + 20,
                head: [goalsData[0]],
                body: [goalsData[1]],
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129], textColor: 255 }, // Emerald 500
                styles: { halign: 'center' }
            });

            // Weight History Table
            if (filteredWeight.length > 0) {
                const historyY = (doc as any).lastAutoTable.finalY || 150;
                doc.setFontSize(14);
                doc.setTextColor(0, 0, 0);
                doc.text('Histórico de Peso (Período Selecionado)', 14, historyY + 15);

                const historyBody = filteredWeight.map(w => [
                    format(new Date(w.date), 'dd/MM/yyyy'),
                    `${w.weight} kg`
                ]);

                (doc as any).autoTable({
                    startY: historyY + 20,
                    head: [['Data', 'Peso']],
                    body: historyBody,
                    theme: 'striped',
                    headStyles: { fillColor: primaryColor, textColor: 255 }
                });
            }

            // Footer
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `Página ${i} de ${pageCount} - FitMind Health Technologies`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
            }

            doc.save(`Relatorio_FitMind_${format(now, 'yyyyMMdd')}.pdf`);
            addToast('Relatório gerado com sucesso!', 'success');
            onClose();
        } catch (error) {
            console.error('Error generating PDF:', error);
            addToast('Erro ao gerar relatório.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 backdrop-blur-sm transition-opacity">
                <div 
                    className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-t-3xl p-6 shadow-2xl transform transition-transform duration-300 translate-y-0"
                    style={{ animation: 'slideUp 0.3s ease-out forwards' }}
                >
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gerar Relatório</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Gere um relatório em PDF com seu histórico de tratamento.</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => generatePDF('1_month')}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group disabled:opacity-50"
                        >
                            <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Último mês</span>
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                        </button>
                        
                        <button 
                            onClick={() => generatePDF('3_months')}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group disabled:opacity-50"
                        >
                            <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Últimos 3 meses</span>
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                        </button>

                        <button 
                            onClick={() => generatePDF('6_months')}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group disabled:opacity-50"
                        >
                            <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Últimos 6 meses</span>
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                        </button>

                        <button 
                            onClick={() => generatePDF('1_year')}
                            disabled={isGenerating}
                            className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group disabled:opacity-50"
                        >
                            <span className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Último ano</span>
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" />
                        </button>
                    </div>
                    
                    {isGenerating && (
                        <p className="text-center text-sm text-indigo-600 dark:text-indigo-400 mt-4 animate-pulse">
                            Gerando relatório...
                        </p>
                    )}
                    
                    <style>{`
                        @keyframes slideUp {
                            from { transform: translateY(100%); }
                            to { transform: translateY(0); }
                        }
                    `}</style>
                </div>
            </div>
        </Portal>
    );
};
