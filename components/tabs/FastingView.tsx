
import React, { useState, useEffect } from 'react';
import { ClockIcon, PersonStandingIcon, BarChartIcon, CalendarIcon, EditIcon, ArrowPathIcon, FlameIcon, ChevronLeftIcon, CheckCircleIcon, ShieldCheckIcon, LeafIcon } from '../core/Icons';
import { FastingQuiz } from './FastingQuiz';
import { useAppContext } from '../AppContext';
import Portal from '../core/Portal';

// --- Types & Data ---

interface FastingPlanData {
    id: string;
    icon: string;
    label: string;
    subtitle: string; // Short description for card
    fastingHours: number;
    eatingHours: number;
    difficulty: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Expert';
    
    // Detailed Content
    description: string; // Intro text
    mechanism: string; // How it works clinically
    execution: string[]; // Step by step tutorial
    benefits: string[];
    risks: string[];
    scientificNote?: string;
}

const FASTING_CATEGORIES: { title: string; color: string; plans: FastingPlanData[] }[] = [
  {
    title: 'Iniciante & Adaptação',
    color: 'text-green-500',
    plans: [
      { 
          id: '12:12', 
          icon: '🌅', 
          label: '12:12 Circadiano', 
          subtitle: 'Alinhado com o sol. O mais natural.',
          fastingHours: 12, eatingHours: 12, difficulty: 'Iniciante',
          description: 'A porta de entrada para o jejum. Você basicamente para de comer após o jantar e só come no café da manhã do dia seguinte.',
          mechanism: 'Permite que o sistema digestivo descanse por 12 horas completas, o suficiente para esgotar parte do glicogênio hepático e iniciar uma leve cetose ao acordar.',
          execution: [
              'Jante até as 20:00.',
              'Não consuma calorias (apenas água, chá, café sem açúcar) até as 08:00 da manhã seguinte.',
              'Tome seu café da manhã normalmente.'
          ],
          benefits: ['Melhora o sono e ritmo circadiano', 'Reduz inchaço matinal', 'Fácil adaptação social'],
          risks: ['Risco muito baixo', 'Pode causar leve fome antes de dormir nos primeiros dias'],
          scientificNote: 'Estudos mostram melhora na digestão e qualidade do sono.'
      },
      { 
          id: '13:11', 
          icon: '🍵', 
          label: '13:11 Leve', 
          subtitle: 'Um pequeno passo além do básico.',
          fastingHours: 13, eatingHours: 11, difficulty: 'Iniciante',
          description: 'Ideal para quem já se adaptou ao 12:12 e quer eliminar o hábito de beliscar tarde da noite.',
          mechanism: 'Aumenta ligeiramente o tempo de queima de gordura pela manhã.',
          execution: [
              'Termine o jantar às 19:30.',
              'Jejum até as 08:30 do dia seguinte.',
              'Hidrate-se bem ao acordar.'
          ],
          benefits: ['Maior controle do apetite noturno', 'Desinchaço'],
          risks: ['Leve dor de cabeça se não beber água suficiente']
      },
      { 
          id: '14:10', 
          icon: '🥑', 
          label: '14:10 Metabólico', 
          subtitle: 'Protocolo clínico padrão inicial.',
          fastingHours: 14, eatingHours: 10, difficulty: 'Iniciante',
          description: 'O ponto ideal entre facilidade e resultado metabólico. Muito usado em estudos de obesidade e diabetes leve.',
          mechanism: 'Neste ponto, o corpo começa a usar gordura como fonte primária de energia nas últimas 2 horas do jejum.',
          execution: [
              'Jantar às 20:00.',
              'Pular o café da manhã cedo.',
              'Primeira refeição às 10:00 da manhã.'
          ],
          benefits: ['Redução da pressão arterial', 'Melhora da sensibilidade à insulina', 'Sustentável a longo prazo'],
          risks: ['Fome no meio da manhã', 'Irritabilidade leve na adaptação'],
          scientificNote: 'Baseado em evidências de melhoria cardiometabólica (Wilkinson et al., 2020).'
      },
    ]
  },
  {
    title: 'Queima de Gordura',
    color: 'text-orange-500',
    plans: [
      { 
          id: '15:9', 
          icon: '🏃', 
          label: '15:9 Ativo', 
          subtitle: 'A porta de entrada para a queima acelerada.',
          fastingHours: 15, eatingHours: 9, difficulty: 'Intermediário',
          description: 'Um meio termo perfeito para quem treina pela manhã em jejum.',
          mechanism: 'Otimiza a oxidação de lipídios durante exercícios aeróbicos matinais.',
          execution: [
              'Jantar às 20:00.',
              'Treino leve pela manhã em jejum.',
              'Almoço/Desjejum às 11:00.'
          ],
          benefits: ['Flexibilidade de horários', 'Energia estável'],
          risks: ['Tontura se o treino for muito intenso sem adaptação']
      },
      { 
          id: '16:8', 
          icon: '🔥', 
          label: '16:8 Leangains', 
          subtitle: 'O padrão ouro. Resultados comprovados.',
          fastingHours: 16, eatingHours: 8, difficulty: 'Intermediário',
          description: 'O protocolo mais popular do mundo. Divide o dia em 8h de alimentação e 16h de jejum.',
          mechanism: 'Maximiza a queima de gordura sem sacrificar massa muscular, pois mantém o GH (Hormônio do Crescimento) elevado.',
          execution: [
              'Opção A: Comer das 12:00 às 20:00 (Pula café da manhã).',
              'Opção B: Comer das 08:00 às 16:00 (Pula jantar).',
              'Nas 8h de janela, faça 2 a 3 refeições ricas em proteína.'
          ],
          benefits: ['Queima de gordura visceral', 'Definição muscular', 'Simplicidade (pula uma refeição)'],
          risks: ['Compulsão alimentar na janela se não planejar bem', 'Exige disciplina social'],
          scientificNote: 'Reduz massa gorda mantendo massa muscular (Moro et al., 2016).'
      },
      { 
          id: '17:7', 
          icon: '⚡', 
          label: '17:7 Cetose', 
          subtitle: 'Para quebrar platôs de peso.',
          fastingHours: 17, eatingHours: 7, difficulty: 'Intermediário',
          description: 'Uma hora extra que faz diferença para quem estagnou no 16:8.',
          mechanism: 'Aprofunda a cetose nutricional, forçando o uso de estoques antigos de gordura.',
          execution: [
              'Janela de alimentação das 13:00 às 20:00.',
              'Foco em gorduras boas e proteínas na primeira refeição para não disparar insulina.'
          ],
          benefits: ['Quebra de platô', 'Clareza mental intensa'],
          risks: ['Pode atrapalhar o sono se comer muito tarde']
      },
    ]
  },
  {
    title: 'Autofagia & Longevidade',
    color: 'text-purple-500',
    plans: [
      { 
          id: '18:6', 
          icon: '🧬', 
          label: '18:6 Autofagia', 
          subtitle: 'Limpeza celular profunda.',
          fastingHours: 18, eatingHours: 6, difficulty: 'Avançado',
          description: 'Onde a mágica da renovação celular começa a acontecer com mais força.',
          mechanism: 'Redução drástica de insulina permite o início da autofagia (reciclagem de células velhas).',
          execution: [
              'Almoço às 14:00.',
              'Jantar/Lanche até as 20:00.',
              'Apenas líquidos não calóricos no resto do tempo.'
          ],
          benefits: ['Anti-envelhecimento', 'Pele mais limpa', 'Imunidade'],
          risks: ['Dificuldade em bater as proteínas do dia em 6h'],
          scientificNote: 'Melhora resistência ao estresse oxidativo.'
      },
      { 
          id: '19:5', 
          icon: '🧘', 
          label: '19:5 Foco', 
          subtitle: 'Clareza mental elevada.',
          fastingHours: 19, eatingHours: 5, difficulty: 'Avançado',
          description: 'Ideal para dias de trabalho intenso onde você precisa de foco total.',
          mechanism: 'Aumento de noradrenalina e BDNF (fator neurotrófico) melhora a função cognitiva.',
          execution: [
              'Pequena janela de alimentação no final da tarde (ex: 15h às 20h).',
              'Foco total nas tarefas durante o dia.'
          ],
          benefits: ['Produtividade máxima', 'Desinflamação sistêmica'],
          risks: ['Pode causar ansiedade em pessoas predispostas']
      },
      { 
        id: '20:4', 
        icon: '⚔️', 
        label: '20:4 Guerreiro', 
        subtitle: 'Dieta do Guerreiro.',
        fastingHours: 20, eatingHours: 4, difficulty: 'Avançado',
        description: 'Baseado em guerreiros antigos: jejuar o dia todo e banquetear à noite.',
        mechanism: 'Explora o sistema nervoso simpático durante o dia (alerta) e parassimpático à noite (digestão/relaxamento).',
        execution: [
            'Durante o dia: Pequenas porções de vegetais crus ou frutas (opcional, mas o jejum estrito é melhor).',
            'Janela de 4h à noite: Uma refeição gigante e completa.'
        ],
        benefits: ['Liberdade alimentar durante a janela', 'Alta queima calórica'],
        risks: ['Digestão pesada antes de dormir', 'Risco de refluxo']
      },
    ]
  },
  {
    title: 'Expert & Prolongado',
    color: 'text-red-500',
    plans: [
      { 
          id: '21:3', 
          icon: '🚀', 
          label: '21:3 Pré-OMAD', 
          subtitle: 'Quase uma refeição só.',
          fastingHours: 21, eatingHours: 3, difficulty: 'Expert',
          description: 'Para quem quer os benefícios do OMAD mas precisa de mais tempo para comer.',
          mechanism: 'Insulina basal mínima.',
          execution: ['Janela das 17h às 20h.', 'Foque em densidade nutricional alta.'],
          benefits: ['Preparo para jejuns longos'],
          risks: ['Hipoglicemia em usuários de medicação']
      },
      { 
          id: '22:2', 
          icon: '🏔️', 
          label: '22:2 Pico', 
          subtitle: 'Janela estrita.',
          fastingHours: 22, eatingHours: 2, difficulty: 'Expert',
          description: 'Limite extremo do jejum diário.',
          mechanism: 'Forte estímulo à lipólise.',
          execution: ['Comer em uma janela de 2h.'],
          benefits: ['Disciplina mental'],
          risks: ['Difícil socialização']
      },
      { 
          id: '23:1', 
          icon: '🍽️', 
          label: 'OMAD (23:1)', 
          subtitle: 'Uma refeição por dia.',
          fastingHours: 23, eatingHours: 1, difficulty: 'Expert',
          description: 'One Meal A Day. A forma mais simples e extrema de jejum intermitente diário.',
          mechanism: 'Mantém o corpo em estado de queima de gordura por 23h. Estômago diminui de tamanho.',
          execution: [
              'Escolha uma hora do dia (ex: almoço ou jantar).',
              'Coma todos os seus nutrientes nessa hora.',
              'Não coma nada nas outras 23 horas.'
          ],
          benefits: ['Perda de peso rápida', 'Praticidade total', 'Economia de tempo'],
          risks: ['Deficiência nutricional se a refeição for pobre', 'Dilatação gástrica se comer demais de uma vez'],
          scientificNote: 'Forte efeito metabólico e mitocondrial.'
      },
      { 
          id: '24h', 
          icon: '🛑', 
          label: 'Eat-Stop-Eat (24h)', 
          subtitle: 'Reset completo semanal.',
          fastingHours: 24, eatingHours: 0, difficulty: 'Expert',
          description: 'Jejum de jantar a jantar. Feito 1 ou 2 vezes na semana.',
          mechanism: 'Cria um déficit calórico semanal agressivo sem alterar a dieta dos outros dias.',
          execution: [
              'Jante hoje às 20h.',
              'Só coma novamente no jantar de amanhã às 20h.',
              'Dias normais: alimentação padrão.'
          ],
          benefits: ['Flexibilidade social', 'Reset do paladar'],
          risks: ['Irritabilidade extrema', 'Dor de cabeça'],
      },
      { 
          id: '36h', 
          icon: '🧘‍♂️', 
          label: 'Monk Fast (36h)', 
          subtitle: 'Apenas água.',
          fastingHours: 36, eatingHours: 0, difficulty: 'Expert',
          description: 'Jejum do Monge. Promove autofagia profunda e redefinição do sistema imunológico.',
          mechanism: 'Esgota completamente glicogênio hepático e muscular. Cetose profunda.',
          execution: [
              'Pare de comer após o jantar de domingo.',
              'Passe a segunda-feira inteira em jejum.',
              'Coma no café da manhã de terça-feira.'
          ],
          benefits: ['Autofagia máxima', 'Perda de gordura teimosa'],
          risks: ['Perda de massa magra se frequente', 'Desbalanço eletrolítico (necessário sal/minerais)'],
      },
    ]
  },
];

const BIOLOGICAL_STAGES = [
    { start: 0, end: 4, title: "Digestão", description: "Níveis de açúcar no sangue sobem. Insulina é liberada.", icon: "🍽️" },
    { start: 4, end: 8, title: "Queda de Insulina", description: "O açúcar no sangue normaliza. O corpo para de estocar gordura.", icon: "📉" },
    { start: 8, end: 12, title: "Gliconeogênese", description: "O corpo começa a produzir glicose e despertar a queima de gordura.", icon: "🔥" },
    { start: 12, end: 18, title: "Cetose Leve", description: "O corpo muda o combustível principal de açúcar para gordura.", icon: "⚡" },
    { start: 18, end: 24, title: "Autofagia", description: "Modo de limpeza celular. Reciclagem de componentes velhas.", icon: "🧬" },
    { start: 24, end: 72, title: "Pico de GH", description: "Hormônio do crescimento aumenta para preservar músculo.", icon: "💪" },
];

// --- Detail Modal ---

const FastingDetailModal: React.FC<{ plan: FastingPlanData, onClose: () => void, onSelect: (id: string) => void }> = ({ plan, onClose, onSelect }) => {
    const [activeTab, setActiveTab] = useState<'guia' | 'beneficios' | 'cuidados'>('guia');

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center p-0 sm:p-4 animate-fade-in backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] flex flex-col relative text-gray-900 dark:text-white max-h-[95vh] shadow-2xl" onClick={(e) => e.stopPropagation()}>
                
                {/* Header Compacto com Imagem/Icone */}
                <div className="relative p-6 pb-0 flex flex-col items-center border-b border-gray-100 dark:border-gray-800">
                    <button onClick={onClose} className="absolute top-6 right-6 bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-5xl shadow-lg mb-4">
                        {plan.icon}
                    </div>
                    
                    <h2 className="text-2xl font-bold tracking-tight text-center">{plan.label}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6 text-center max-w-xs">{plan.description}</p>

                    {/* Stats Row */}
                    <div className="flex gap-4 w-full justify-center mb-6">
                        <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl w-24">
                            <span className="text-xs text-gray-400 font-bold uppercase">Jejum</span>
                            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{plan.fastingHours}h</span>
                        </div>
                        <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl w-24">
                            <span className="text-xs text-gray-400 font-bold uppercase">Janela</span>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">{plan.eatingHours}h</span>
                        </div>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex w-full mb-0 border-b border-gray-200 dark:border-gray-700">
                        <button onClick={() => setActiveTab('guia')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'guia' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Guia</button>
                        <button onClick={() => setActiveTab('beneficios')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'beneficios' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Benefícios</button>
                        <button onClick={() => setActiveTab('cuidados')} className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'cuidados' ? 'border-black dark:border-white text-black dark:text-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>Cuidados</button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 overflow-y-auto hide-scrollbar flex-grow min-h-0 bg-white dark:bg-[#1C1C1E]">
                    {activeTab === 'guia' && (
                        <div className="space-y-6 animate-fade-in">
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-400 mb-3 flex items-center gap-2"><ClockIcon className="w-4 h-4" /> Como Funciona</h3>
                                <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700">{plan.mechanism}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-bold uppercase text-gray-400 mb-3 flex items-center gap-2"><CheckCircleIcon className="w-4 h-4" /> Passo a Passo</h3>
                                <ul className="space-y-3">
                                    {plan.execution.map((step, idx) => (
                                        <li key={idx} className="flex gap-3 text-sm text-gray-800 dark:text-gray-200">
                                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                                            <span className="pt-0.5">{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'beneficios' && (
                        <div className="space-y-4 animate-fade-in">
                            {plan.benefits.map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                                    <LeafIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">{benefit}</p>
                                </div>
                            ))}
                            {plan.scientificNote && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Nota Científica</p>
                                    <p className="text-xs text-blue-800 dark:text-blue-200 italic">"{plan.scientificNote}"</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'cuidados' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                                <h4 className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm mb-2">
                                    <ShieldCheckIcon className="w-4 h-4"/> Atenção aos Riscos
                                </h4>
                                <ul className="space-y-2">
                                    {plan.risks.map((risk, idx) => (
                                        <li key={idx} className="text-sm text-red-800 dark:text-red-200 flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0"></span>
                                            {risk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-xs text-gray-400 text-center px-4">
                                Se você usa medicamentos para diabetes (como Ozempic/Mounjaro), consulte seu médico antes de fazer jejuns prolongados (&gt;16h).
                            </p>
                        </div>
                    )}
                </div>

                <div className="p-6 pt-4 bg-white dark:bg-[#1C1C1E] border-t border-gray-100 dark:border-gray-800">
                     <button 
                        onClick={() => onSelect(plan.id)}
                        className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-2xl text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        Iniciar este Plano
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Library List View ---

const FastingPlansView: React.FC<{ onClose: () => void, onSelect: (plan: string) => void }> = ({ onClose, onSelect }) => {
  const [selectedDetail, setSelectedDetail] = useState<FastingPlanData | null>(null);

  const handleConfirmPlan = (id: string) => {
      onSelect(id);
      setSelectedDetail(null);
      onClose();
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-gray-50 dark:bg-black z-[100] overflow-y-auto overscroll-none animate-slide-up">
        <div className="p-5 pb-20 min-h-full">
          <header className="flex items-center justify-between mb-8 sticky top-0 bg-gray-50/95 dark:bg-black/95 backdrop-blur-md z-20 pt-12 pb-2 -mx-5 px-5">
            <div className="flex items-center gap-4">
                <button onClick={onClose} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-2 rounded-full text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors">
                  <ChevronLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Biblioteca</h1>
            </div>
          </header>

          <div className="space-y-8">
            {FASTING_CATEGORIES.map((category) => (
              <section key={category.title}>
                <div className="flex items-center gap-2 mb-4 px-1">
                    <h2 className={`text-sm font-bold uppercase tracking-widest ${category.color}`}>
                        {category.title}
                    </h2>
                    <div className="h-[1px] flex-grow bg-gray-200 dark:bg-gray-800"></div>
                </div>
                
                <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-4 -mx-5 px-5 snap-x overscroll-x-contain">
                  {category.plans.map((plan) => (
                    <button 
                      key={plan.id}
                      onClick={() => setSelectedDetail(plan)}
                      className="min-w-[240px] w-[240px] bg-white dark:bg-gray-900 rounded-[24px] p-5 flex flex-col items-start text-left relative group active:scale-[0.98] transition-all border border-gray-100 dark:border-gray-800 shadow-sm snap-center"
                    >
                      <div className="flex justify-between items-start w-full mb-3">
                          <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                              {plan.icon}
                          </div>
                          <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-lg">
                              {plan.fastingHours}h
                          </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-1">{plan.label}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{plan.subtitle}</p>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>

      {selectedDetail && (
          <FastingDetailModal 
            plan={selectedDetail} 
            onClose={() => setSelectedDetail(null)} 
            onSelect={handleConfirmPlan}
          />
      )}
    </Portal>
  );
}

// --- Icons Helper ---
// Redefining ChevronRight locally for this file if not exported, otherwise ensure it's in Icons.tsx
const ChevronRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>
);


// --- Main Component ---

const ScientificSourceFooter: React.FC = () => (
    <div className="mt-8 text-center px-6 pb-6">
        <div className="inline-flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
            <p className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-bold">Base Científica</p>
            <a 
                href="https://www.hopkinsmedicine.org/health/wellness-and-prevention/intermittent-fasting-what-is-it-and-how-does-it-work" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border-b border-dashed border-gray-300 dark:border-gray-700 pb-0.5"
            >
                Johns Hopkins Medicine & New England Journal of Medicine
            </a>
        </div>
    </div>
);

export const FastingView: React.FC = () => {
    const { userData, meals } = useAppContext();
    const [isQuizOpen, setIsQuizOpen] = useState(false);
    const [showAllPlans, setShowAllPlans] = useState(false);
    
    // Timer State
    const [currentPlanId, setCurrentPlanId] = useState<string>(localStorage.getItem('fastingPlanId') || '16:8');
    const [isFasting, setIsFasting] = useState<boolean>(localStorage.getItem('isFasting') === 'true');
    const [startTime, setStartTime] = useState<number | null>(localStorage.getItem('fastingStartTime') ? parseInt(localStorage.getItem('fastingStartTime')!) : null);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(Date.now());

    // Get current plan object
    const getCurrentPlan = () => {
        for (const cat of FASTING_CATEGORIES) {
            const found = cat.plans.find(p => p.id === currentPlanId);
            if (found) return found;
        }
        return FASTING_CATEGORIES[1].plans[1]; // Default 16:8
    };
    const plan = getCurrentPlan();

    // Caloric Progress
    const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
    const goalCalories = userData?.goals?.calories || 2000;
    const caloriesProgress = Math.min((totalCalories / goalCalories) * 100, 100);

    useEffect(() => {
        let interval: any;
        if (isFasting && startTime) {
            interval = setInterval(() => {
                const now = Date.now();
                setElapsedTime(now - startTime);
            }, 1000);
        } else {
            setElapsedTime(0);
            interval = setInterval(() => {
                setCurrentTime(Date.now());
            }, 60000); // Update current time every minute when not fasting
        }
        return () => clearInterval(interval);
    }, [isFasting, startTime]);

    useEffect(() => {
        if (isFasting && startTime) {
            setElapsedTime(Date.now() - startTime);
        }
    }, []);

    const toggleFasting = () => {
        if (isFasting) {
            setIsFasting(false);
            setStartTime(null);
            setElapsedTime(0);
            localStorage.setItem('isFasting', 'false');
            localStorage.removeItem('fastingStartTime');
        } else {
            const now = Date.now();
            setIsFasting(true);
            setStartTime(now);
            localStorage.setItem('isFasting', 'true');
            localStorage.setItem('fastingStartTime', now.toString());
        }
    };

    const handlePlanUpdate = (newPlanId: string) => {
        setCurrentPlanId(newPlanId);
        localStorage.setItem('fastingPlanId', newPlanId);
        setIsQuizOpen(false);
        setShowAllPlans(false);
    }

    // Calculations
    const totalSeconds = plan.fastingHours * 3600;
    const elapsedSeconds = Math.floor(elapsedTime / 1000);
    const progress = Math.min((elapsedSeconds / totalSeconds) * 100, 100);
    const hoursElapsed = Math.floor(elapsedSeconds / 3600);
    const minutesElapsed = Math.floor((elapsedSeconds % 3600) / 60);
    const secondsElapsed = elapsedSeconds % 60;

    // Current Biological Stage
    const currentStage = BIOLOGICAL_STAGES.find(s => hoursElapsed >= s.start && hoursElapsed < s.end) || BIOLOGICAL_STAGES[BIOLOGICAL_STAGES.length - 1];

    // Circular Progress Data
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    if (showAllPlans) {
        return <FastingPlansView onClose={() => setShowAllPlans(false)} onSelect={handlePlanUpdate} />;
    }

    return (
        <div className="px-5 space-y-6 pb-24 animate-fade-in min-h-screen bg-gray-50 dark:bg-black">
            
            {/* Header */}
            <header className="pt-12 pb-2 flex justify-between items-center sticky top-0 bg-gray-50/90 dark:bg-black/90 backdrop-blur-md z-10 -mx-5 px-5">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Jejum</h1>
            </header>

            {/* Hero / Timer Section */}
            <div className="flex flex-col items-center justify-center pt-2 relative">
                <div className="relative w-[280px] h-[280px] flex items-center justify-center">
                    {/* Background Circle */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
                        <circle
                            cx="140"
                            cy="140"
                            r={radius}
                            className="stroke-gray-200 dark:stroke-gray-800"
                            strokeWidth="20"
                            fill="transparent"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="140"
                            cy="140"
                            r={radius}
                            className={`transition-all duration-1000 ease-linear stroke-blue-500`}
                            strokeWidth="20"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </svg>
                    
                    {/* Inner Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        {isFasting ? (
                            <>
                                <span className="text-gray-500 dark:text-gray-400 font-medium text-sm mb-1">Tempo Decorrido</span>
                                <div className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums tracking-tight">
                                    {hoursElapsed}:{minutesElapsed.toString().padStart(2, '0')}:{secondsElapsed.toString().padStart(2, '0')}
                                </div>
                                <span className="text-blue-500 font-semibold mt-2 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
                                    Meta: {plan.fastingHours}h
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-3">
                                    <span className="text-4xl">{plan.icon}</span>
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Pronto para jejuar?</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{plan.label}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <button 
                    onClick={toggleFasting}
                    className={`mt-8 w-full max-w-xs py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${isFasting ? 'bg-red-500 text-white shadow-red-500/30' : 'bg-black dark:bg-white text-white dark:text-black shadow-black/20 dark:shadow-white/10'}`}
                >
                    {isFasting ? 'Encerrar Jejum' : 'Iniciar Agora'}
                </button>

                {/* Pre-start Suggestion */}
                {!isFasting && (
                    <div className="mt-6 w-full max-w-xs bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl flex flex-col items-center text-center animate-fade-in">
                        <div className="flex items-center gap-2 mb-2">
                            <ClockIcon className="w-4 h-4 text-blue-500" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Sugestão de Rotina</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            Início às <strong className="text-gray-900 dark:text-white">20:00</strong> • Término às <strong className="text-gray-900 dark:text-white">{((20 + plan.fastingHours) % 24).toString().padStart(2, '0')}:00</strong>
                        </p>
                        <div className="h-[1px] w-full bg-gray-200 dark:bg-gray-700 my-3"></div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Se iniciar agora, sua meta será às <strong className="text-gray-700 dark:text-gray-300">{new Date(currentTime + plan.fastingHours * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                        </p>
                    </div>
                )}
            </div>

            {/* Active Fast Guide */}
            {isFasting && startTime && (
                <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5 space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Seu Plano: {plan.label}</h3>
                        <span className="text-2xl">{plan.icon}</span>
                    </div>

                    {/* Horários */}
                    <div>
                        <h4 className="text-sm font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
                            <ClockIcon className="w-4 h-4" /> Horários
                        </h4>
                        <div className="flex gap-3">
                            <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <span className="block text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Início</span>
                                <span className="block text-xl font-bold text-gray-900 dark:text-white">
                                    {new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="block text-xs text-gray-400 mt-0.5">
                                    {new Date(startTime).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                            <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                                <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Meta ({plan.fastingHours}h)</span>
                                <span className="block text-xl font-bold text-blue-700 dark:text-blue-300">
                                    {new Date(startTime + plan.fastingHours * 3600 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="block text-xs text-blue-500/70 dark:text-blue-400/70 mt-0.5">
                                    {new Date(startTime + plan.fastingHours * 3600 * 1000).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800"></div>

                    {/* Como fazer */}
                    <div>
                        <h4 className="text-sm font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4" /> Como Fazer
                        </h4>
                        <ul className="space-y-2">
                            {plan.execution.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-blue-500 font-bold mt-0.5">{idx + 1}.</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="h-[1px] w-full bg-gray-100 dark:bg-gray-800"></div>

                    {/* Benefícios */}
                    <div>
                        <h4 className="text-sm font-bold uppercase text-gray-400 mb-3 flex items-center gap-2">
                            <ShieldCheckIcon className="w-4 h-4" /> Benefícios
                        </h4>
                        <ul className="space-y-2">
                            {plan.benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    <span>{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Current Biological Stage */}
            <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">O que está acontecendo?</h3>
                    <span className="text-2xl">{isFasting ? currentStage.icon : '🤔'}</span>
                </div>
                {isFasting ? (
                    <div className="animate-fade-in">
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mb-1">{currentStage.title}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{currentStage.description}</p>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{width: `${Math.min(((hoursElapsed - currentStage.start) / (currentStage.end - currentStage.start)) * 100, 100)}%`}}></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">Próxima fase em {Math.max(0, currentStage.end - hoursElapsed)}h</p>
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Inicie o cronômetro para acompanhar as fases biológicas do seu corpo em tempo real.</p>
                )}
            </div>

            {/* Caloric Progress Card */}
            <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                            <FlameIcon className="w-4 h-4" />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Progresso Calórico</h3>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{Math.round(totalCalories)} / {goalCalories} kcal</span>
                </div>
                
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2.5 rounded-full overflow-hidden mb-2">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${caloriesProgress > 100 ? 'bg-red-500' : 'bg-orange-500'}`} 
                        style={{width: `${Math.min(caloriesProgress, 100)}%`}}
                    ></div>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {caloriesProgress >= 100 
                        ? "Você atingiu sua meta calórica de hoje." 
                        : `Faltam ${Math.round(goalCalories - totalCalories)} kcal para sua meta diária.`}
                </p>
            </div>

            {/* Plan Selector & Quiz */}
            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowAllPlans(true)} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[24px] shadow-sm border border-gray-100 dark:border-white/5 text-left active:scale-95 transition-transform flex flex-col justify-between h-full">
                    <div className="bg-orange-100 dark:bg-orange-900/30 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 mb-3">
                        <EditIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase">Plano Atual</p>
                        <p className="font-bold text-gray-900 dark:text-white text-lg truncate">{plan.id}</p>
                    </div>
                </button>
                <button onClick={() => setIsQuizOpen(true)} className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-[24px] shadow-lg shadow-blue-500/20 text-left active:scale-95 transition-transform text-white flex flex-col justify-between h-full">
                    <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-3 backdrop-blur-md">
                        <span className="text-lg">📝</span>
                    </div>
                    <div>
                        <p className="text-xs text-blue-100 font-bold uppercase">Dúvidas?</p>
                        <p className="font-bold text-white text-lg leading-tight">Quiz de Jejum</p>
                    </div>
                </button>
            </div>

            <ScientificSourceFooter />

            {isQuizOpen && (
                <FastingQuiz 
                    onComplete={handlePlanUpdate}
                    onClose={() => setIsQuizOpen(false)}
                />
            )}
        </div>
    );
};
