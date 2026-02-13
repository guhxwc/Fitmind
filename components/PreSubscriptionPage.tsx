
import React, { useMemo } from 'react';
import { CheckCircleIcon, ShieldCheckIcon, CoffeeIcon, ScienceIcon, CameraIcon, FlameIcon, BarChartIcon, LockIcon } from './core/Icons';
import { useAppContext } from './AppContext';

interface PreSubscriptionPageProps {
    onContinue: () => void;
    onClose: () => void;
}

// --- Componentes Visuais Auxiliares ---

const TimelineItem: React.FC<{
    step: string;
    title: string;
    description: string;
    color: string;
    isLast?: boolean;
    isActive?: boolean;
}> = ({ step, title, description, color, isLast, isActive }) => (
    <div className="relative pl-8 pb-10 last:pb-0">
        {/* Vertical Line */}
        {!isLast && (
            <div className="absolute left-[11px] top-3 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>
        )}
        
        {/* Dot */}
        <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-black shadow-sm z-10 flex items-center justify-center ${color}`}>
            {isActive && <div className="w-2 h-2 bg-white rounded-full animate-ping opacity-75 absolute"></div>}
            {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full relative"></div>}
        </div>

        {/* Content */}
        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${color.replace('bg-', 'text-')}`}>{step}</span>
                {isActive && <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Você está aqui</span>}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1 leading-tight">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {description}
            </p>
        </div>
    </div>
);

const PainAmplificationCard: React.FC<{ title: string; text: string }> = ({ title, text }) => (
    <div className="bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 p-5 rounded-r-xl my-6 animate-fade-in">
        <div className="flex items-start gap-3">
            <div className="text-2xl pt-1">⚠️</div>
            <div>
                <h3 className="text-red-800 dark:text-red-300 font-bold text-base mb-1">{title}</h3>
                <p className="text-red-700/80 dark:text-red-200/80 text-sm leading-relaxed font-medium">
                    {text}
                </p>
            </div>
        </div>
    </div>
);

const FeatureRow: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string }> = ({ icon, title, description, color }) => (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-gray-800 shadow-sm transition-transform hover:scale-[1.01]">
        <div className={`p-3 rounded-xl ${color} text-white shadow-md flex-shrink-0`}>
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {description}
            </p>
        </div>
    </div>
);

const TestimonialCard: React.FC = () => (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 mt-8">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                RM
            </div>
            <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white">Roberto M., 42 anos</p>
                <div className="flex items-center gap-1 text-yellow-500 text-xs">
                    ★★★★★ <span className="text-gray-400 ml-1">• Perdeu 18kg em 16 semanas</span>
                </div>
            </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm italic leading-relaxed mb-3">
            "O FitMind me mostrou exatamente o que eu estava fazendo errado. Descobri que comia pouca proteína e isso atrasava meus resultados. Em 16 semanas, perdi 18kg e me sinto confiante novamente."
        </p>
        <p className="text-xs text-gray-400 font-medium">
            Usando Mounjaro + FitMind. Antes, ele tentou 3 dietas diferentes sem sucesso.
        </p>
    </div>
);

const AuthorityBlock: React.FC = () => (
    <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 mt-6 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full text-blue-600 dark:text-blue-400">
                <CheckCircleIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-blue-900 dark:text-blue-200 text-base">Prova Social Inquestionável</h3>
        </div>
        
        <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed mb-4 font-medium">
            Mais de 15.000 usuários em 12 meses perderam em média 8kg em 12 semanas usando o FitMind.
        </p>
        
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-white dark:bg-black/20 px-3 py-2 rounded-lg border border-blue-100 dark:border-gray-700/50 w-fit">
            <ScienceIcon className="w-4 h-4 text-purple-500" />
            <span>Método baseado em 28+ estudos clínicos</span>
        </div>
    </div>
);

const ObjectionHandler: React.FC = () => (
    <div className="mt-6 space-y-3">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-black border border-gray-100 dark:border-gray-800">
            <div className="text-green-500 mt-0.5"><ShieldCheckIcon className="w-4 h-4"/></div>
            <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Garantia Blindada</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">7 dias para testar tudo. Cancele com 1 clique.</p>
            </div>
        </div>
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-black border border-gray-100 dark:border-gray-800">
            <div className="text-orange-500 mt-0.5"><CoffeeIcon className="w-4 h-4"/></div>
            <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Mais barato que um café</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">O plano anual custa centavos por dia.</p>
            </div>
        </div>
    </div>
);

export const PreSubscriptionPage: React.FC<PreSubscriptionPageProps> = ({ onContinue, onClose }) => {
    const { userData } = useAppContext();

    // Lógica Central de Personalização (Mapa do Dinheiro)
    const copy = useMemo(() => {
        if (!userData) return { headline: '', subheadline: '', painTitle: '', painText: '' };

        const { journeyDuration, biggestFrustration, monthlyInvestment, futureWorry, medication } = userData;
        const name = userData.name.split(' ')[0]; // Primeiro nome
        
        // Default (Iniciante Ansioso)
        let content = {
            headline: `${name}, esta é a sua jornada para sair da incerteza e chegar na sua meta.`,
            subheadline: "Você investiu no tratamento. Agora, veja o plano para garantir que cada centavo e cada dose contem.",
            painTitle: "A Incerteza Solitária",
            painText: "Náuseas, dúvidas e medo de errar. O começo não precisa ser assim. Existe um caminho seguro e guiado."
        };

        // Perfil 1: O Investidor Frustrado (> R$ 1000)
        if (monthlyInvestment && (monthlyInvestment.includes('1.000') || monthlyInvestment.includes('2.000'))) {
            content = {
                headline: `Você investe alto no ${medication.name}. E se estiver jogando metade desse dinheiro fora?`,
                subheadline: "O medicamento tira sua fome, mas não muda seu metabolismo. Sem a estratégia certa, você está apenas 'alugando' o emagrecimento.",
                painTitle: "O Ciclo do Desperdício",
                painText: "A pior sensação é gastar uma fortuna todo mês e ver resultados medíocres. Não deixe que seu investimento se transforme em frustração."
            };
        }

        // Perfil 2: O Veterano Estagnado (> 6 meses)
        if (journeyDuration && (journeyDuration.includes('Mais de 6 meses') || journeyDuration.includes('3-6 meses')) && biggestFrustration?.includes('lentos')) {
            content = {
                headline: `Você fez tudo certo, mas a balança parou. Por que o efeito platô acontece?`,
                subheadline: "Seu corpo é inteligente: ele se adaptou ao remédio. Aumentar a dose não é a única saída (e é a mais cara).",
                painTitle: "A Armadilha da Adaptação",
                painText: "Insistir na mesma estratégia esperando resultados diferentes só trará desânimo. Você precisa de um 'choque metabólico' estratégico."
            };
        }

        // Perfil 3: O Preocupado com o Futuro (Efeito Rebote)
        if (futureWorry && (futureWorry.includes('Ganhar o peso') || futureWorry.includes('manter'))) {
            content = {
                headline: "O seu maior medo é ver todo o peso voltar quando o tratamento acabar?",
                subheadline: "Estatísticas mostram que 2/3 dos usuários recuperam o peso em 1 ano. A culpa não é sua, é da falta de um sistema de saída.",
                painTitle: "O Fantasma do Efeito Rebote",
                painText: "Perder peso perdendo músculo é a receita perfeita para engordar tudo de novo (e mais rápido). Construa um corpo blindado."
            };
        }

        return content;

    }, [userData]);

    if (!userData) return null;

    return (
        <div className="fixed inset-0 bg-white dark:bg-black z-[70] font-sans animate-fade-in flex flex-col h-[100dvh]">
            
            {/* 1. Header */}
            <header className="flex-none flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-black z-20">
                <div className="flex items-center gap-2">
                    <div className="bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded-md text-xs font-bold tracking-wider shadow-sm">
                        PRO
                    </div>
                    <span className="font-bold text-sm tracking-tight text-gray-500 dark:text-gray-400">Sistema Completo</span>
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
                    
                    {/* SEÇÃO 1: HERO (DOR + IDENTIFICAÇÃO) */}
                    <div className="text-left mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.1] mb-4">
                            {copy.headline}
                        </h1>
                        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                            {copy.subheadline}
                        </p>
                    </div>

                    {/* Timeline Emocional (O Ponto de Partida) */}
                    <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                        <TimelineItem 
                            step="0. Ponto Zero"
                            title="Hoje: A Frustração"
                            description="Você está investindo R$ 1.000+ em remédio todo mês, mas sem orientação, os resultados são lentos e os efeitos colaterais são intensos. A dúvida persiste: 'Será que estou fazendo tudo certo?'"
                            color="bg-red-500"
                            isActive
                        />
                        <TimelineItem 
                            step="1. O Ponto de Virada"
                            title="A Decisão Inteligente"
                            description="Você inicia com uma decisão. Fim da confusão. O app organiza sua nutrição e treinos especificamente para a biologia do GLP-1."
                            color="bg-blue-500"
                        />
                        <TimelineItem 
                            step="2. Aceleração"
                            title="Metabolismo Destravado"
                            description="Seu corpo responde com eficiência máxima. As roupas ficam largas, os efeitos colaterais somem e você recupera o controle total."
                            color="bg-green-500"
                            isLast
                        />
                    </div>

                    {/* SEÇÃO 2: AMPLIFICAÇÃO DA DOR (VISCERAL) */}
                    <PainAmplificationCard 
                        title={copy.painTitle}
                        text={copy.painText}
                    />

                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-8"></div>

                    {/* SEÇÃO 3: A PROMESSA (SOLUÇÃO SISTÊMICA) */}
                    <div className="mb-4">
                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2">Não é só um app de dieta.</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            É o sistema operacional completo que faltava para transformar seu tratamento em resultados permanentes.
                        </p>
                    </div>

                    <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <FeatureRow 
                            icon={<CameraIcon className="w-5 h-5" />}
                            title="CalorieCam IA"
                            description="Pare de adivinhar. Tire uma foto e saiba em segundos se a refeição acelera ou atrasa sua perda de peso."
                            color="bg-blue-500"
                        />
                        <FeatureRow 
                            icon={<FlameIcon className="w-5 h-5" />}
                            title="Personal Trainer Adaptativo"
                            description="Treine com segurança. Treinos que se adaptam à sua energia e aos efeitos colaterais do dia. Sem cobranças irreais."
                            color="bg-orange-500"
                        />
                        <FeatureRow 
                            icon={<BarChartIcon className="w-5 h-5" />}
                            title="Análise Inteligente"
                            description="Descubra quais hábitos realmente impactam seu progresso e quais são perda de tempo."
                            color="bg-purple-500"
                        />
                        <FeatureRow 
                            icon={<LockIcon className="w-5 h-5" />}
                            title="Protocolo Anti-Rebote"
                            description="O único sistema focado em garantir que o peso não volta quando você parar o medicamento."
                            color="bg-green-500"
                        />
                    </div>

                    {/* Authority Block */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <AuthorityBlock />
                        <TestimonialCard />
                    </div>

                    {/* Objection Handling */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                        <ObjectionHandler />
                    </div>

                </div>
            </div>

            {/* 3. Footer Action */}
            <div className="flex-none p-6 pt-4 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] w-full">
                <div className="max-w-md mx-auto">
                    <div className="mb-3 text-center">
                        <span className="text-sm font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full border border-orange-100 dark:border-orange-900/30">
                            Oferta de 7 Dias Grátis Termina em 24h
                        </span>
                    </div>
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
                    </button>
                    <p className="text-[10px] text-center text-gray-400 dark:text-gray-600 mt-3 font-medium">
                        Cancele a qualquer momento nas configurações.
                    </p>
                </div>
            </div>

        </div>
    );
};
