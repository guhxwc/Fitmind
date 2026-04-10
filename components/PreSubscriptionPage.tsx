
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
    isLast?: boolean;
    isActive?: boolean;
}> = ({ step, title, description, isLast, isActive }) => (
    <div className="relative pl-10 pb-10 last:pb-0">
        {!isLast && (
            <div className="absolute left-[11px] top-8 bottom-[-8px] w-[2px] bg-gray-100 dark:bg-gray-800"></div>
        )}
        
        <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-[3px] flex items-center justify-center bg-white dark:bg-black ${isActive ? 'border-blue-500' : 'border-gray-200 dark:border-gray-700'}`}>
            {isActive && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
        </div>

        <div>
            <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-blue-500' : 'text-gray-400'}`}>{step}</span>
                {isActive && <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Você está aqui</span>}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2 leading-tight">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {description}
            </p>
        </div>
    </div>
);

const FeatureRow: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex items-start gap-4 p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-900/20 border border-gray-100 dark:border-gray-800/50 transition-all hover:bg-gray-50 dark:hover:bg-gray-900/40">
        <div className="p-2.5 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex-shrink-0">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">{title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
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
        <div className="relative p-6 rounded-2xl bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-gray-800 shadow-sm mt-4">
            <div className="absolute top-4 right-4 text-gray-100 dark:text-gray-800/50 text-6xl font-serif leading-none">"</div>
            <div className="relative z-10">
                <div className="flex items-center gap-1 text-yellow-400 text-sm mb-3">
                    ★★★★★
                </div>
                <p className="text-gray-800 dark:text-gray-200 text-base italic leading-relaxed mb-5 font-medium">
                    "{quote}"
                </p>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300 text-sm">
                        {initials}
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{name}, {age}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{contextText}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NutritionistBlock: React.FC = () => (
    <div className="mt-8 relative p-6 rounded-[28px] bg-gradient-to-b from-gray-50 to-white dark:from-[#1C1C1E] dark:to-[#0A0A0A] border border-gray-200 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
        {/* Badge flutuante */}
        <div className="absolute -top-3 left-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm flex items-center gap-1.5">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            Validação Clínica
        </div>
        
        <div className="flex items-start gap-4 mt-2">
            <div className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center shrink-0 shadow-sm">
                <span className="text-lg font-medium text-gray-900 dark:text-white">AS</span>
            </div>
            <div>
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-extrabold text-gray-900 dark:text-white text-base tracking-tight">Allan Stachuk</h3>
                    <span className="text-blue-500"><CheckCircleIcon className="w-4 h-4" /></span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Nutricionista Oficial • CRN 13901</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium italic">
                    "O método FitMind foi rigorosamente estruturado e validado clinicamente para garantir máxima segurança e resultados no seu tratamento."
                </p>
            </div>
        </div>
    </div>
);

const ObjectionHandler: React.FC = () => (
    <div className="mt-8 grid grid-cols-2 gap-3">
        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-center">
            <ShieldCheckIcon className="w-6 h-6 text-gray-900 dark:text-white mx-auto mb-3"/>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Garantia Blindada</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">14 dias para testar. Cancele com 1 clique.</p>
        </div>
        <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 text-center">
            <CoffeeIcon className="w-6 h-6 text-gray-900 dark:text-white mx-auto mb-3"/>
            <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">Custo-Benefício</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">O plano anual custa centavos por dia.</p>
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
        <div className="fixed inset-0 bg-white dark:bg-[#0A0A0A] z-[70] font-sans animate-fade-in flex flex-col h-[100dvh]">
            
            {/* 1. Header */}
            <header className="flex-none flex justify-between items-center p-6 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md z-20 sticky top-0">
                <div className="flex items-center gap-2">
                    <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase">
                        PRO
                    </div>
                    <span className="font-bold text-sm tracking-tight text-gray-900 dark:text-white">Sistema Completo</span>
                </div>
                <button 
                    onClick={onClose} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </header>

            {/* 2. Scrollable Content */}
            <div className="flex-grow overflow-y-auto hide-scrollbar bg-white dark:bg-[#0A0A0A] min-h-0">
                <div className="max-w-md mx-auto px-6 py-4 pb-40">
                    
                    {/* SEÇÃO 1: HERO (DOR + IDENTIFICAÇÃO) */}
                    <div className="text-left mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15] mb-4">
                            {copy.headline}
                        </h1>
                        <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                            {copy.subheadline}
                        </p>
                    </div>

                    {/* Timeline Emocional */}
                    <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                        <TimelineItem 
                            step="0. Ponto Zero"
                            title={copy.stepZeroTitle}
                            description={copy.stepZeroDesc}
                            isActive
                        />
                        <TimelineItem 
                            step="1. O Ponto de Virada"
                            title="A Decisão Inteligente"
                            description="Você inicia com uma decisão. Fim da confusão. O app organiza sua nutrição e treinos especificamente para a biologia do GLP-1."
                        />
                        <TimelineItem 
                            step="2. Aceleração"
                            title="Metabolismo Destravado"
                            description="Seu corpo responde com eficiência máxima. As roupas ficam largas, os efeitos colaterais somem e você recupera o controle total."
                            isLast
                        />
                    </div>

                    <div className="w-full h-px bg-gray-100 dark:bg-gray-800/50 my-12"></div>

                    {/* SEÇÃO 3: A PROMESSA (SOLUÇÃO SISTÊMICA) */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Não é só um app de dieta.</h2>
                        <p className="text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
                            É o sistema operacional completo que faltava para transformar seu tratamento em resultados permanentes.
                        </p>
                    </div>

                    <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                        <FeatureRow 
                            icon={<CameraIcon className="w-5 h-5" />}
                            title="CalorieCam IA"
                            description="Pare de adivinhar. Tire uma foto e saiba em segundos se a refeição acelera ou atrasa sua perda de peso."
                        />
                        <FeatureRow 
                            icon={<FlameIcon className="w-5 h-5" />}
                            title="Personal Trainer Adaptativo"
                            description="Treine com segurança. Treinos que se adaptam à sua energia e aos efeitos colaterais do dia. Sem cobranças irreais."
                        />
                        <FeatureRow 
                            icon={<BarChartIcon className="w-5 h-5" />}
                            title="Análise Inteligente"
                            description="Descubra quais hábitos realmente impactam seu progresso e quais são perda de tempo."
                        />
                        <FeatureRow 
                            icon={<LockIcon className="w-5 h-5" />}
                            title="Protocolo Anti-Rebote"
                            description="O único sistema focado em garantir que o peso não volta quando você parar o medicamento."
                        />
                    </div>

                    {/* Authority Block & Dynamic Testimonial */}
                    <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <NutritionistBlock />
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
            <div className="flex-none p-6 pt-4 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-900 z-30 w-full">
                <div className="max-w-md mx-auto">
                    <div className="mb-4 text-center">
                        <span className="text-[10px] font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                            Oferta de 14 Dias Grátis Termina Esse Mês
                        </span>
                    </div>
                    <button 
                        onClick={onContinue}
                        className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-4 rounded-2xl text-lg font-bold shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        Começar Minha Transformação
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                    <p className="text-[11px] text-center text-gray-400 dark:text-gray-500 mt-4 font-medium">
                        Cancele a qualquer momento nas configurações.
                    </p>
                </div>
            </div>

        </div>
    );
};
