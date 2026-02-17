
import React, { useMemo } from 'react';
import { CheckCircleIcon, ShieldCheckIcon, CoffeeIcon, ScienceIcon, CameraIcon, FlameIcon, BarChartIcon, LockIcon } from './core/Icons';
import { useAppContext } from './AppContext';
import type { UserData } from '../types';

interface PreSubscriptionPageProps {
    onContinue: () => void;
    onClose: () => void;
    customUserData?: Partial<UserData>; // Add this prop
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

const TestimonialCard: React.FC<{ 
    name: string; 
    age: string; 
    quote: string; 
    contextText: string; 
}> = ({ name, age, quote, contextText }) => {
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    
    return (
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 mt-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                    {initials}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{name}, {age}</p>
                    <div className="flex items-center gap-1 text-yellow-500 text-xs">
                        ★★★★★ <span className="text-gray-400 ml-1">• Verificado</span>
                    </div>
                </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm italic leading-relaxed mb-3">
                "{quote}"
            </p>
            <p className="text-xs text-gray-400 font-medium">
                {contextText}
            </p>
        </div>
    );
};

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

export const PreSubscriptionPage: React.FC<PreSubscriptionPageProps> = ({ onContinue, onClose, customUserData }) => {
    const { userData: contextUserData } = useAppContext();
    
    // Prefer passed prop (from onboarding), fallback to context (from app)
    const userData = customUserData || contextUserData;

    // Lógica Central de Personalização (Mapa do Dinheiro & Prova Social)
    const copy = useMemo(() => {
        // Fallback genérico para evitar crash
        const defaultContent = {
            headline: "Transforme seu tratamento em resultados reais.",
            subheadline: "O sistema completo para usuários de GLP-1.",
            stepZeroTitle: "O Início",
            stepZeroDesc: "Você começou o tratamento e busca os melhores resultados.",
            testimonial: {
                name: "Ana P.",
                age: "34 anos",
                quote: "O FitMind me deu a segurança que eu precisava. Em 4 semanas, perdi 5kg e as náuseas desapareceram.",
                contextText: "Usando Ozempic + FitMind."
            }
        };

        if (!userData) return defaultContent;

        const { journeyDuration, biggestFrustration, monthlyInvestment, futureWorry } = userData;
        const name = userData.name ? userData.name.split(' ')[0] : 'Visitante';
        
        // Padrão: Perfil 1: O Iniciante Ansioso
        let content = {
            headline: `${name}, você não precisa fazer isso sozinho.`,
            subheadline: "Veja o plano passo a passo para usar seu GLP-1 com segurança e ter os resultados que você espera.",
            stepZeroTitle: "Hoje: A Incerteza",
            stepZeroDesc: "Você começou o tratamento com a esperança de mudar, mas agora a incerteza te assombra. Náuseas, dúvidas sobre o que comer, medo de errar... O começo não precisa ser assim. Existe um caminho seguro e guiado.",
            testimonial: {
                name: "Ana P.",
                age: "34 anos",
                quote: "Eu estava apavorada no começo. Tinha medo de comer a coisa errada e passar mal. O FitMind me deu a segurança que eu precisava. Em 4 semanas, perdi 5kg e as náuseas desapareceram.",
                contextText: "Usando Ozempic + FitMind. Superou o medo e insegurança inicial."
            }
        };

        // Perfil 3: O Investidor Frustrado (> R$ 1000)
        if (monthlyInvestment && (monthlyInvestment.includes('1.000') || monthlyInvestment.includes('2.000'))) {
            content = {
                headline: `${name}, seu investimento de R$ 1.000/mês precisa dar retorno.`,
                subheadline: "Veja o plano para garantir que cada centavo e cada dose do seu tratamento contem para o resultado final.",
                stepZeroTitle: "Hoje: O Desperdício",
                stepZeroDesc: "Você está investindo uma fortuna no seu tratamento, mas os resultados não estão vindo na mesma proporção. Cada semana sem progresso é dinheiro jogado fora. Você precisa de um sistema que maximize seu ROI.",
                testimonial: {
                    name: "Mariana S.",
                    age: "39 anos",
                    quote: "Eu estava gastando R$ 1.200 por mês e me sentia frustrada. O FitMind me mostrou que eu estava comendo pouca proteína e isso atrasava tudo. Em 2 meses, perdi 9kg. Finalmente senti que o investimento valeu a pena.",
                    contextText: "Usando Saxenda + FitMind. Otimizou seu investimento."
                }
            };
        }

        // Perfil 2: O Veterano Estagnado (> 3 meses e resultados lentos)
        else if (journeyDuration && (journeyDuration.includes('Mais de 6 meses') || journeyDuration.includes('3-6 meses')) && biggestFrustration?.includes('lentos')) {
            content = {
                headline: `${name}, sabemos que você já tentou de tudo.`,
                subheadline: "Veja por que 15.000 pessoas que estavam estagnadas como você finalmente destravaram seus resultados.",
                stepZeroTitle: "Hoje: A Frustração",
                stepZeroDesc: "Você já tentou 3 dietas diferentes, contou calorias, cortou carboidratos... e nada. O peso não se move. A frustração de estar estagnado, mesmo com o medicamento, é real. Mas a culpa não é sua.",
                testimonial: {
                    name: "Carlos F.",
                    age: "48 anos",
                    quote: "Eu perdi 10kg e depois travei por 3 meses. Estava prestes a desistir. A Análise Inteligente do FitMind mostrou que eu precisava de mais proteína. Ajustei e perdi mais 12kg. Foi inacreditável.",
                    contextText: "Usando Mounjaro + FitMind. Destravou o platô."
                }
            };
        }

        // Perfil 4: O Preocupado com o Futuro (Efeito Rebote)
        else if (futureWorry && (futureWorry.includes('Ganhar o peso') || futureWorry.includes('manter'))) {
            content = {
                headline: `${name}, e se você recuperar todo o peso quando parar o remédio?`,
                subheadline: "Resultados temporários não bastam. Veja o plano para garantir que sua transformação seja permanente.",
                stepZeroTitle: "Hoje: O Medo do Rebote",
                stepZeroDesc: "Você está feliz com os resultados, mas uma preocupação te assombra: \"E quando eu parar?\" O medo de recuperar todo o peso e voltar à estaca zero é paralisante. Você precisa de um plano de saída.",
                testimonial: {
                    name: "Juliana C.",
                    age: "41 anos",
                    quote: "Eu perdi 20kg com Ozempic e tinha pavor de parar. O Protocolo Anti-Rebote do FitMind foi minha salvação. Parei há 6 meses e não ganhei 1kg de volta. Me sinto livre.",
                    contextText: "Usando Wegovy + FitMind. Em manutenção há 6 meses."
                }
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

                    {/* Timeline Emocional */}
                    <div className="mb-10 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                        <TimelineItem 
                            step="0. Ponto Zero"
                            title={copy.stepZeroTitle}
                            description={copy.stepZeroDesc}
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

                    {/* Authority Block & Dynamic Testimonial */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <AuthorityBlock />
                        <TestimonialCard 
                            name={copy.testimonial.name}
                            age={copy.testimonial.age}
                            quote={copy.testimonial.quote}
                            contextText={copy.testimonial.contextText}
                        />
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
