
import React, { useMemo } from 'react';
import { CheckCircleIcon, ShieldCheckIcon, StarIcon, ChartLineIcon, CalendarIcon, LockIcon, FlameIcon, PersonStandingIcon } from './core/Icons';
import { useAppContext } from './AppContext';

interface PreSubscriptionPageProps {
    onContinue: () => void;
    onClose: () => void;
}

const TimelineItem: React.FC<{ 
    icon: React.ReactNode; 
    title: string; 
    date: string; 
    description: string; 
    isLast?: boolean;
    isActive?: boolean;
    highlight?: boolean;
}> = ({ icon, title, date, description, isLast, isActive = true, highlight }) => (
    <div className="flex gap-4 relative">
        {/* Connecting Line */}
        {!isLast && (
            <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800">
                {isActive && (
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-500 via-blue-400 to-gray-200 dark:to-gray-800 opacity-30"></div>
                )}
            </div>
        )}

        {/* Icon Bubble */}
        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center z-10 border-4 ${
            highlight 
                ? 'bg-blue-600 border-blue-100 dark:border-blue-900 text-white shadow-lg shadow-blue-500/30' 
                : 'bg-white dark:bg-gray-800 border-gray-50 dark:border-gray-900 text-blue-500'
        }`}>
            {React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}
        </div>

        {/* Content */}
        <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
            <div className="flex justify-between items-baseline mb-1">
                <h3 className={`font-bold text-base ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                    {title}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                    {date}
                </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {description}
            </p>
        </div>
    </div>
);

const JourneyTimeline: React.FC<{ currentWeight: number, targetWeight: number, weeksToGoal: number }> = ({ currentWeight, targetWeight, weeksToGoal }) => {
    
    // Calculate dates
    const today = new Date();
    
    const getDateAfterDays = (days: number) => {
        const d = new Date(today);
        d.setDate(today.getDate() + days);
        return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    };

    const finalDate = new Date(today);
    finalDate.setDate(today.getDate() + (weeksToGoal * 7));
    const finalDateString = finalDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    return (
        <div className="mt-8 mb-10 px-2">
            <div className="relative">
                <TimelineItem 
                    icon={<ChartLineIcon />}
                    title="O Ponto de Virada"
                    date="Hoje"
                    description={`Você inicia com ${currentWeight}kg e uma decisão tomada. Fim da confusão. O aplicativo organiza sua nutrição e treino imediatamente.`}
                />
                
                <TimelineItem 
                    icon={<ShieldCheckIcon />}
                    title="Estrutura & Controle"
                    date={getDateAfterDays(7)}
                    description="O inchaço diminui. Você sente segurança sabendo exatamente o que comer e quando aplicar, sem ansiedade."
                />

                <TimelineItem 
                    icon={<FlameIcon />}
                    title="Aceleração Metabólica"
                    date={getDateAfterDays(21)}
                    description="O hábito se instala. Seu corpo responde ao GLP-1 com eficiência máxima. As roupas começam a ficar mais largas."
                />

                <TimelineItem 
                    icon={<StarIcon />}
                    title="Nova Identidade"
                    date={getDateAfterDays(45)}
                    description="As pessoas começam a perguntar o que você fez. Sua auto-estima e energia para viver estão em outro nível."
                />

                <TimelineItem 
                    icon={<CheckCircleIcon />}
                    title="Liberdade (Meta Atingida)"
                    date={finalDateString}
                    description={`Você chega aos ${targetWeight}kg. Mais do que magro(a), você aprendeu a manter. Fim definitivo do efeito sanfona.`}
                    isLast
                    highlight
                />
            </div>
        </div>
    );
};

export const PreSubscriptionPage: React.FC<PreSubscriptionPageProps> = ({ onContinue, onClose }) => {
    const { userData } = useAppContext();

    // Lógica de projeção baseada nos dados do usuário
    const projection = useMemo(() => {
        if (!userData) return { weeks: 12, date: 'breve', weightLoss: 0 };

        const current = userData.weight;
        const target = userData.targetWeight;
        const diff = Math.max(0, current - target);
        
        // Estimativa: Perda de 0.8kg a 1kg por semana (média saudável com GLP-1)
        const avgWeeklyLoss = 0.8; 
        const weeks = Math.ceil(diff / avgWeeklyLoss);
        
        const finishDate = new Date();
        finishDate.setDate(finishDate.getDate() + (weeks * 7));
        const dateString = finishDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

        return {
            weeks,
            date: dateString,
            weightLoss: diff.toFixed(1)
        };
    }, [userData]);

    if (!userData) return null;

    return (
        <div className="fixed inset-0 bg-white dark:bg-black z-[70] font-sans animate-fade-in flex flex-col h-[100dvh]">
            
            {/* 1. Header (Fixed Height) */}
            <header className="flex-none flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black z-20">
                <div className="flex items-center gap-2">
                    <div className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded-md text-xs font-bold tracking-wider shadow-sm">
                        PRO
                    </div>
                    <span className="font-bold text-sm tracking-tight text-gray-500 dark:text-gray-400">Plano Personalizado</span>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </header>

            {/* 2. Scrollable Content */}
            <div className="flex-grow overflow-y-auto hide-scrollbar bg-white dark:bg-black min-h-0">
                <div className="max-w-md mx-auto px-6 py-8 pb-40">
                    
                    {/* Hero Section - Personalizado & Emocional */}
                    <div className="text-left mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="inline-block bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3 border border-blue-100 dark:border-blue-800">
                            Previsão para {userData.name.split(' ')[0]}
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-3">
                            Veja como será sua jornada até os <span className="text-blue-600 dark:text-blue-400 underline decoration-blue-200 dark:decoration-blue-800 underline-offset-4">{userData.targetWeight}kg</span>.
                        </h1>
                        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                            Não é mágica, é consistência guiada por dados. Veja o que acontece quando você para de tentar sozinho.
                        </p>
                    </div>

                    {/* The New Journey Timeline */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <JourneyTimeline 
                            currentWeight={userData.weight} 
                            targetWeight={userData.targetWeight}
                            weeksToGoal={projection.weeks}
                        />
                    </div>

                    {/* Social Proof - More Subtle & Integrated */}
                    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center gap-4 mb-3">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white dark:border-gray-800"></div>
                                <div className="w-8 h-8 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800"></div>
                                <div className="w-8 h-8 rounded-full bg-gray-500 border-2 border-white dark:border-gray-800"></div>
                            </div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                Junte-se a +15.000 membros
                            </p>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200 text-sm font-medium italic leading-relaxed">
                            "Eu tentei de tudo por 5 anos. O FitMind foi a única coisa que me fez ter constância porque tirou o peso de ter que pensar em tudo sozinho."
                        </p>
                        <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-wide">— Roberto M., -18kg</p>
                    </div>
                </div>
            </div>

            {/* 3. Footer Action (Fixed Height) */}
            <div className="flex-none p-6 pt-4 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] w-full">
                <div className="max-w-md mx-auto">
                    <button 
                        onClick={onContinue}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-lg font-bold shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all flex flex-col items-center justify-center gap-0.5 group relative overflow-hidden"
                    >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-200%] animate-[shimmer_2s_infinite]"></div>
                        
                        <span className="flex items-center gap-2">
                            Começar Minha Transformação
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </span>
                        <span className="text-[10px] opacity-90 font-normal uppercase tracking-wider">Garantia de 30 dias ou seu dinheiro de volta</span>
                    </button>
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                            <LockIcon className="w-3 h-3" />
                            Ambiente Seguro
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium">
                            <CalendarIcon className="w-3 h-3" />
                            Cancele quando quiser
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
