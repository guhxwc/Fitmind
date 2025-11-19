
import React, { useState } from 'react';
import { ClockIcon, PersonStandingIcon, BarChartIcon, CalendarIcon, EditIcon, ArrowPathIcon, FlameIcon, ChevronLeftIcon, LockIcon, CheckCircleIcon } from '../core/Icons';
import { FastingQuiz } from './FastingQuiz';

type FastingTab = 'timer' | 'body' | 'stats' | 'calendar';

interface FastingPlanData {
    id: string;
    icon: string;
    label: string;
    shortDesc: string;
    fullDesc: string;
    fastingHours: number;
    eatingHours: number;
    tags: string[];
    users: string; // Social proof number
    difficulty: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Especial';
    scientificNote?: string; // From PDF
}

const FASTING_CATEGORIES: { title: string; plans: FastingPlanData[] }[] = [
  {
    title: 'Iniciante',
    plans: [
      { 
          id: '12:12', 
          icon: '🐣', 
          label: '12:12', 
          shortDesc: 'Nosso plano mais fácil. Comece de leve.',
          fullDesc: 'Quer experimentar o jejum intermitente? Uma boa ideia é começar com o plano 12:12! Ficar sem comer por 12 horas não deve ser uma mudança tão brusca e é ótimo para tentar se acostumar a uma alimentação restritiva. O corpo começa a esgotar os estoques de glicogênio.',
          fastingHours: 12,
          eatingHours: 12,
          tags: ['iniciante', 'manutenção de peso', 'adaptação'],
          users: '71.272 jejuantes',
          difficulty: 'Iniciante'
      },
      { 
          id: '13:11', 
          icon: '🐹', 
          label: '13:11', 
          shortDesc: 'Coma por 11h, jejue por 13h. Nada de lanchinho da madrugada!',
          fullDesc: 'Um passo pequeno além do 12:12. Ajuda a eliminar o hábito de comer tarde da noite, melhorando a qualidade do sono e a digestão antes de dormir.',
          fastingHours: 13,
          eatingHours: 11,
          tags: ['iniciante', 'sono melhor', 'digestão'],
          users: '24.103 jejuantes',
          difficulty: 'Iniciante'
      },
      { 
          id: '14:10', 
          icon: '🐰', 
          label: '14:10', 
          shortDesc: 'Comece devagar com 14h de jejum e 10h de alimentação.',
          fullDesc: 'O plano 14:10 é um excelente ponto de partida para a perda de peso. Estudos indicam melhorias na pressão arterial e nos níveis de colesterol (LDL) com este protocolo.',
          fastingHours: 14,
          eatingHours: 10,
          tags: ['iniciante', 'saúde cardíaca', 'leve perda de peso'],
          users: '156.932 jejuantes',
          difficulty: 'Iniciante',
          scientificNote: 'Baseado em evidências de melhoria cardiometabólica (Wilkinson et al., 2020).'
      },
      { 
          id: '15:9', 
          icon: '🐨', 
          label: '15:9', 
          shortDesc: 'Prepare-se para jejuns longos com períodos de jejum de 15h.',
          fullDesc: 'Um meio termo perfeito. Você começa a estender o período de queima de gordura sem o rigor total do 16:8. Ideal para quem acorda sem muita fome.',
          fastingHours: 15,
          eatingHours: 9,
          tags: ['iniciante', 'controle de glicose'],
          users: '32.441 jejuantes',
          difficulty: 'Iniciante'
      },
      { 
          id: '16:8', 
          icon: '🦊', 
          label: '16:8', 
          shortDesc: '16h de jejum, 8h de alimentação. Nosso plano mais popular!',
          fullDesc: 'O protocolo mais estudado e praticado. Alinha-se ao ritmo circadiano, melhora a sensibilidade à insulina, reduz a inflamação (TNF-α, IL-6) e promove a oxidação de gorduras.',
          fastingHours: 16,
          eatingHours: 8,
          tags: ['iniciante', 'queima de gordura', 'anti-inflamatório'],
          users: '1.204.392 jejuantes',
          difficulty: 'Iniciante',
          scientificNote: 'Reduz massa gorda mantendo massa muscular (Moro et al., 2016).'
      },
    ]
  },
  {
    title: 'Intermediário',
    plans: [
      { 
          id: '17:7', 
          icon: '🐶', 
          label: '17:7', 
          shortDesc: 'Difícil, mas com ótimos resultados! Dê uma chance ao 17:7.',
          fullDesc: 'Aumentando a janela de jejum, você prolonga o estado de cetose, onde o corpo usa gordura como fonte primária de energia de forma mais eficiente.',
          fastingHours: 17,
          eatingHours: 7,
          tags: ['intermediário', 'cetose leve', 'foco mental'],
          users: '45.100 jejuantes',
          difficulty: 'Intermediário'
      },
      { 
          id: '18:6', 
          icon: '🦁', 
          label: '18:6', 
          shortDesc: 'Pouca flexibilidade. O jejum de 18h é para os experientes.',
          fullDesc: 'Um jejum mais profundo. Estudos mostram maior redução de peso e gordura visceral. Pode aumentar a expressão de genes ligados à longevidade (Sirtuínas).',
          fastingHours: 18,
          eatingHours: 6,
          tags: ['intermediário', 'perda de peso', 'longevidade'],
          users: '210.558 jejuantes',
          difficulty: 'Intermediário',
          scientificNote: 'Potencializa a redução de insulina e melhora resistência ao estresse oxidativo (Sutton et al., 2018).'
      },
      { 
          id: '19:5', 
          icon: '🐮', 
          label: '19:5', 
          shortDesc: 'Jejum 19hr: moderadamente desafiador.',
          fullDesc: 'Quase um dia inteiro. Exige planejamento das refeições para garantir a ingestão de nutrientes em apenas 5 horas.',
          fastingHours: 19,
          eatingHours: 5,
          tags: ['intermediário', 'disciplina', 'detox'],
          users: '18.900 jejuantes',
          difficulty: 'Intermediário'
      },
      { 
        id: '20:4', 
        icon: '🐵', 
        label: '20:4', 
        shortDesc: '1-2 refeições por dia em um período de 4hr',
        fullDesc: 'Conhecida como Dieta do Guerreiro. Grande redução calórica natural. Pode aumentar níveis de autofagia (limpeza celular) e reparo de DNA.',
        fastingHours: 20,
        eatingHours: 4,
        tags: ['avançado', 'autofagia', 'guerreiro'],
        users: '89.221 jejuantes',
        difficulty: 'Avançado',
        scientificNote: 'Redução significativa de peso e gordura corporal (Cienfuegos et al., 2020).'
    },
    ]
  },
  {
    title: 'Avançado',
    plans: [
      { 
          id: '23:1', 
          icon: '🐸', 
          label: '23:1 (OMAD)', 
          shortDesc: 'Uma refeição por dia com o período de alimentação de 1 hora.',
          fullDesc: 'One Meal A Day (OMAD). Nível máximo de jejum diário. Maximiza a autofagia e a sensibilidade à insulina, mas requer cuidado nutricional extremo.',
          fastingHours: 23,
          eatingHours: 1,
          tags: ['expert', 'OMAD', 'reparo celular'],
          users: '65.302 jejuantes',
          difficulty: 'Avançado',
          scientificNote: 'Forte efeito metabólico, potencial para suportar função mitocondrial.'
      },
    ]
  },
];

const CardTabView: React.FC<{ activeTab: FastingTab; plan: string; icon?: string }> = ({ activeTab, plan, icon }) => {
    const [isFasting, setIsFasting] = useState(false);

    if (activeTab === 'timer') {
        return (
            <div className="flex flex-col items-center text-center p-6 flex-grow justify-around">
                 <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-white">
                        {isFasting ? "Você está em jejum" : "Prepare-se para jejuar"}
                    </h2>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
                
                <div className="relative my-4">
                    <div className="w-40 h-40 rounded-full bg-slate-700/50 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-slate-900/50 flex flex-col items-center justify-center">
                            <span className="text-6xl">{icon || (plan.includes(':') ? '⏱️' : '🗓️')}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-gray-400 font-medium">Meu relógio</p>
                    <p className="text-white text-3xl font-bold">{plan}</p>
                </div>

                <button onClick={() => setIsFasting(!isFasting)} className="bg-teal-500 text-slate-900 font-bold py-3 px-8 rounded-full flex items-center gap-2 my-4 transition-transform active:scale-95">
                    <ClockIcon className="w-5 h-5"/>
                    <span>{isFasting ? "Finalizar Jejum" : "Iniciar relógio"}</span>
                </button>

                <div className="flex justify-between w-full text-sm">
                    <div>
                        <p className="text-gray-400">Início do jejum</p>
                        <p className="text-white font-semibold">Hoje, 20:00</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400">Fim do jejum</p>
                        <p className="text-white font-semibold">Amanhã, 12:00</p>
                    </div>
                </div>
            </div>
        );
    }
    
    if (activeTab === 'body') {
        return (
            <div className="flex flex-col items-center text-center p-6 flex-grow justify-around">
                <div className="w-32 h-32 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
                    <div className="w-24 h-24 rounded-full bg-slate-900/50 flex flex-col items-center justify-center">
                         <ArrowPathIcon className="w-12 h-12 text-purple-400"/>
                    </div>
                </div>
                <p className="text-white font-semibold max-w-sm">Enquanto estiver de jejum, confira aqui por qual fase o seu corpo está passando.</p>
                
                <div className="flex gap-4 w-full mt-6">
                    <div className="bg-slate-700/50 rounded-xl p-3 flex-1">
                        <p className="font-semibold text-white">Queima de gordura</p>
                        <div className="flex items-center justify-center gap-2 bg-slate-900/50 text-white rounded-full py-1 px-3 mt-2">
                           <FlameIcon className="w-4 h-4 text-orange-400" /> <span className="font-mono">0min</span>
                        </div>
                    </div>
                     <div className="bg-slate-700/50 rounded-xl p-3 flex-1">
                        <p className="font-semibold text-white">Autofagia</p>
                        <div className="flex items-center justify-center gap-2 bg-slate-900/50 text-white rounded-full py-1 px-3 mt-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-400"><path d="m21.5 2-5.4 5.4"></path><path d="m2.5 22 5.4-5.4"></path><path d="m16.1 2-2.7 2.7"></path><path d="m7.9 22 2.7-2.7"></path><path d="m12 10.6 3.4-3.4"></path><path d="m8.6 17.4 3.4-3.4"></path><path d="M2 8.6l3.4 3.4"></path><path d="M12 13.4 8.6 10"></path><path d="M15.4 22l-3.4-3.4"></path><path d="M10 12l-3.4 3.4"></path><path d="m22 15.4-3.4-3.4"></path><path d="M13.4 12l3.4-3.4"></path></svg>
                            <span className="font-mono">0min</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    if (activeTab === 'stats') {
         return (
             <div className="flex flex-col items-center text-center p-6 flex-grow justify-around text-white">
                <h2 className="text-xl font-semibold">Complete seu primeiro dia de jejum para ver seu histórico.</h2>
                <div className="w-full my-6">
                    <div className="h-32 w-full flex flex-col justify-between">
                        <div className="flex items-end h-full relative">
                            <svg viewBox="0 0 300 100" className="w-full h-full absolute" preserveAspectRatio="none">
                                <path d="M0,80 Q50,50 100,60 T200,80 T300,50" stroke="#475569" fill="none" strokeWidth="2" />
                            </svg>
                            <div className="w-full flex justify-between items-center text-gray-400 text-xs font-semibold border-t border-dashed border-gray-600 pt-1">
                                <span>16h</span>
                            </div>
                        </div>
                         <div className="w-full flex justify-between items-center text-gray-400 text-xs font-semibold border-t border-dashed border-gray-600 pt-1 mt-4">
                                <span>12h</span>
                         </div>
                         <div className="w-full flex justify-between items-center text-gray-400 text-xs font-semibold border-t border-dashed border-gray-600 pt-1 mt-4">
                                <span>8h</span>
                         </div>
                         <div className="w-full flex justify-between items-center text-gray-400 text-xs font-semibold border-t border-dashed border-gray-600 pt-1 mt-4">
                                <span>4h</span>
                         </div>
                    </div>
                    <div className="flex justify-around mt-2 text-gray-400 font-semibold text-sm">
                        {['ter', 'qua', 'qui', 'sex', 'sáb', 'dom', 'seg'].map(day => (
                            <div key={day} className="flex flex-col items-center gap-1">
                                <div className="w-3 h-3 border-2 border-gray-600 rounded-full"></div>
                                <span>{day}.</span>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="flex gap-4 w-full">
                    <div className="bg-slate-700/50 rounded-xl p-3 flex-1">
                        <p className="font-semibold text-white">Total</p>
                        <div className="flex items-center justify-center gap-2 bg-slate-900/50 text-white rounded-full py-1 px-3 mt-2">
                           <ClockIcon className="w-4 h-4"/> <span>0h</span>
                        </div>
                    </div>
                     <div className="bg-slate-700/50 rounded-xl p-3 flex-1">
                        <p className="font-semibold text-white">Média diária</p>
                        <div className="flex items-center justify-center gap-2 bg-slate-900/50 text-white rounded-full py-1 px-3 mt-2">
                            <ClockIcon className="w-4 h-4"/> <span>0h</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'calendar') {
        const days = ['ter', 'qua', 'qui', 'sex', 'sáb', 'dom', 'seg'];
        return (
            <div className="flex flex-col items-center text-center p-6 flex-grow justify-around text-white">
                <h2 className="text-xl font-semibold">Jejum de 20:00 a 12:00.</h2>
                <div className="flex gap-4 text-xs my-4">
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-white"></div><span>Período de jejum</span></div>
                    <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-slate-600"></div><span>Período de alimentação</span></div>
                </div>

                <div className="w-full h-40 flex items-end justify-around gap-2 px-2">
                    {days.map(day => (
                        <div key={day} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full h-full bg-slate-600 rounded-full flex flex-col justify-end overflow-hidden">
                                 <div className="bg-white" style={{height: '66.66%'}}></div>
                            </div>
                             <span className="text-sm font-semibold text-gray-400 mt-1">{day}.</span>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between w-full text-sm mt-6">
                    <div>
                        <p className="text-gray-400">Início do jejum</p>
                        <p className="text-white font-semibold">Hoje, 20:00</p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400">Fim do jejum</p>
                        <p className="text-white font-semibold">Amanhã, 12:00</p>
                    </div>
                </div>
            </div>
        );
    }
    
    return null;
}

const FastingCard: React.FC<{plan: string; icon?: string}> = ({ plan, icon }) => {
    const [activeTab, setActiveTab] = useState<FastingTab>('timer');

    const navItems = [
        { id: 'timer' as FastingTab, icon: <ClockIcon /> },
        { id: 'body' as FastingTab, icon: <PersonStandingIcon /> },
        { id: 'stats' as FastingTab, icon: <BarChartIcon /> },
        { id: 'calendar' as FastingTab, icon: <CalendarIcon /> },
    ];
    
    return (
        <div className="bg-slate-800 text-white rounded-3xl shadow-lg overflow-hidden flex flex-col min-h-[500px]">
            <div className="p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Relógio de jejum</h2>
                <button className="flex items-center gap-2 text-teal-400 font-semibold">
                    <EditIcon className="w-4 h-4" /> {plan}
                </button>
            </div>

            <div className="relative flex-grow flex flex-col">
                 <div className="absolute inset-0 overflow-hidden">
                    <svg width="100%" height="100%" preserveAspectRatio="none" className="absolute bottom-0 text-slate-900/50">
                        <path d="M0,150 C150,200 250,100 500,150 L500,250 L0,250 Z" fill="currentColor"></path>
                    </svg>
                     <svg width="100%" height="100%" preserveAspectRatio="none" className="absolute bottom-0 text-slate-900/50" style={{transform: 'scaleX(-1)'}}>
                        <path d="M0,180 C150,230 250,130 500,180 L500,250 L0,250 Z" fill="currentColor"></path>
                    </svg>
                </div>
                <div className="relative flex-grow flex flex-col">
                    <CardTabView activeTab={activeTab} plan={plan} icon={icon} />
                </div>
            </div>

            <div className="bg-slate-900/50 p-2 flex justify-around items-center">
                {navItems.map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`p-3 rounded-full transition-colors ${activeTab === item.id ? 'bg-slate-700 text-white' : 'text-gray-400 hover:bg-slate-800'}`}
                    >
                        {item.icon}
                    </button>
                ))}
            </div>
        </div>
    );
};

const FastingDetailModal: React.FC<{ plan: FastingPlanData, onClose: () => void, onSelect: (id: string) => void }> = ({ plan, onClose, onSelect }) => {
    // Helper to render the bar chart of the day
    const renderHours = () => {
        const totalBars = 7; // Simplified representation like the screenshot
        const fastingBars = Math.round((plan.fastingHours / 24) * totalBars);
        
        return (
            <div className="flex justify-center items-end gap-3 h-24 my-6 px-4">
                {Array.from({length: totalBars}).map((_, i) => {
                    const isFasting = i < fastingBars;
                    return (
                        <div key={i} className={`w-4 rounded-full ${isFasting ? 'bg-white h-16' : 'bg-white/20 h-10'}`}></div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-[#1C1C1E] w-full max-w-md rounded-3xl p-6 flex flex-col relative text-white max-h-[90vh] overflow-y-auto hide-scrollbar" onClick={(e) => e.stopPropagation()}>
                
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <div className="flex flex-col items-center text-center mt-2">
                    <span className="text-6xl mb-4">{plan.icon}</span>
                    <h2 className="text-3xl font-bold">{plan.id}</h2>
                    <p className="text-gray-400 font-medium mt-1">{plan.shortDesc}</p>
                    
                    <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
                        <ClockIcon className="w-4 h-4" />
                        <span>{plan.users}</span>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 mt-4">
                        <span className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-300 uppercase tracking-wide">{plan.difficulty}</span>
                        {plan.tags.map(tag => (
                             <span key={tag} className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs font-semibold text-gray-300 capitalize">{tag}</span>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-800/50 rounded-2xl mt-6 p-4 text-center">
                    <p className="text-gray-300 text-sm mb-2">Jejum de 21:00 a {(21 + plan.fastingHours) % 24}:00</p>
                    {renderHours()}
                    <div className="flex justify-between text-xs text-gray-400 px-8">
                         <span>0h</span>
                         <span>6h</span>
                         <span>12h</span>
                         <span>18h</span>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="font-bold text-lg mb-2">Sobre este jejum</h3>
                    <p className="text-gray-300 leading-relaxed text-sm">{plan.fullDesc}</p>
                    
                    {plan.scientificNote && (
                        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800/50 rounded-xl">
                             <p className="text-blue-300 text-xs">🧬 <strong>Nota Científica:</strong> {plan.scientificNote}</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 pb-2 sticky bottom-0 bg-[#1C1C1E] pt-4">
                     <button 
                        onClick={() => onSelect(plan.id)}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircleIcon className="w-6 h-6 text-black" />
                        Definir como meu plano
                    </button>
                </div>
            </div>
        </div>
    );
}

const FastingPlansView: React.FC<{ onClose: () => void, onSelect: (plan: string) => void }> = ({ onClose, onSelect }) => {
  const [selectedDetail, setSelectedDetail] = useState<FastingPlanData | null>(null);

  const handleSelectPlan = (plan: FastingPlanData) => {
      setSelectedDetail(plan);
  }

  const handleConfirmPlan = (id: string) => {
      onSelect(id);
      setSelectedDetail(null);
      onClose(); // Close the full view as well
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 overflow-y-auto animate-fade-in">
      <div className="p-4 sm:p-6">
        <header className="flex items-center gap-4 mb-8 sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 py-2">
          <button onClick={onClose} className="text-blue-400 p-2 -ml-2 rounded-full hover:bg-gray-800">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-white text-center flex-grow mr-8">Relógios de jejum</h1>
        </header>

        <div className="space-y-8 pb-10">
          {FASTING_CATEGORIES.map((category) => (
            <div key={category.title}>
              <h2 className="text-lg font-bold text-white mb-4 px-1">{category.title}</h2>
              <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                {category.plans.map((plan) => (
                  <button 
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className="min-w-[280px] max-w-[280px] bg-[#1C1C1E] p-5 rounded-2xl flex items-start text-left relative group active:scale-95 transition-transform flex-shrink-0 border border-transparent hover:border-gray-700"
                  >
                    <div className="absolute top-3 right-3 text-gray-600">
                        <LockIcon className="w-4 h-4" />
                    </div>
                    <div className="mr-4">
                        <span className="text-4xl">{plan.icon}</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">{plan.label}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">{plan.shortDesc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedDetail && (
          <FastingDetailModal 
            plan={selectedDetail} 
            onClose={() => setSelectedDetail(null)} 
            onSelect={handleConfirmPlan}
          />
      )}
    </div>
  );
}

export const FastingView: React.FC = () => {
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [showAllPlans, setShowAllPlans] = useState(false);
    const [currentPlan, setCurrentPlan] = useState('16:8');

    const getPlanIcon = (planId: string) => {
        for (const cat of FASTING_CATEGORIES) {
            const plan = cat.plans.find(p => p.id === planId);
            if (plan) return plan.icon;
        }
        return undefined;
    };
    
    const currentIcon = getPlanIcon(currentPlan);

    const handlePlanUpdate = (plan: string) => {
        setCurrentPlan(plan);
        setIsQuizOpen(false);
        setShowAllPlans(false);
    }

    if (showAllPlans) {
        return <FastingPlansView onClose={() => setShowAllPlans(false)} onSelect={handlePlanUpdate} />;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <FastingCard plan={currentPlan} icon={currentIcon} />
            
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Quiz de jejum</h2>
                <div 
                    onClick={() => setIsQuizOpen(true)}
                    className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95"
                >
                    <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-3xl">📝</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Não sabe por onde começar?</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Faça o quiz e descubra qual jejum é o mais indicado para os seus objetivos e necessidades!</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Monitores populares</h2>
                    <button onClick={() => setShowAllPlans(true)} className="font-semibold text-blue-600 dark:text-blue-400">Mais</button>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                     <button onClick={() => setCurrentPlan('16:8')} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl text-left hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95">
                        <span className="text-4xl">🦊</span>
                        <h3 className="font-bold text-lg mt-2 text-gray-900 dark:text-white">16:8</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">16h de jejum, 8h de alimentação. Nosso plano mais popular!</p>
                     </button>
                     <button onClick={() => setCurrentPlan('14:10')} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl text-left hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors active:scale-95">
                        <span className="text-4xl">🐰</span>
                        <h3 className="font-bold text-lg mt-2 text-gray-900 dark:text-white">14:10</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Comece com este plano de jejum mais curto.</p>
                     </button>
                 </div>
            </div>

            <div>
                <a href="#" className="block text-center text-blue-600 dark:text-blue-400 font-semibold">Fontes para as recomendações nutricionais</a>
            </div>

            {isQuizOpen && (
                <FastingQuiz 
                    onComplete={handlePlanUpdate}
                    onClose={() => setIsQuizOpen(false)}
                />
            )}
        </div>
    );
};
