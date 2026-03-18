
import type { Medication, UserData } from './types';

export const MEDICATIONS: Medication[] = [
  { name: 'Mounjaro', doses: ['2,5 mg', '5 mg', '7,5 mg', '10 mg', '12,5 mg', '15 mg'] },
  { name: 'Ozempic', doses: ['0,25 mg', '0,5 mg', '1 mg', '2 mg'] },
  { name: 'Wegovy', doses: ['0,25 mg', '0,5 mg', '1 mg', '1,7 mg', '2,4 mg'] },
  { name: 'Saxenda', doses: ['0,6 mg', '1,2 mg', '1,8 mg', '2,4 mg', '3 mg'] },
  { name: 'Outra', doses: [] },
];

export const WEEKDAYS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export const DEFAULT_USER_DATA: Omit<UserData, 'id'> = {
  name: '',
  gender: 'Prefiro não dizer',
  age: 25,
  height: 170,
  weight: 80,
  startWeight: 80,
  targetWeight: 70,
  activityLevel: 'Sedentário',
  glpStatus: 'using',
  applicationFrequency: 'Semanalmente',
  pace: 0.5,
  motivation: [],
  // Funnel Defaults
  journeyDuration: '',
  biggestFrustration: '',
  futureWorry: '',
  oneThingGuaranteed: '',
  dreamOutcome: '',
  monthlyInvestment: '',
  
  medication: {
    name: 'Ozempic',
    dose: '0,5 mg',
    nextApplication: 'Domingo',
    defaultSite: 'Abdômen',
  },
  
  notifications: {
      enabled: false,
      medicationTime: '09:00',
      breakfastTime: '08:00',
      lunchTime: '12:30',
      snackTime: '16:00',
      dinnerTime: '19:30',
      hydrationInterval: 2, // Every 2 hours
      checkinTime: '20:00',
  },

  goals: {
    water: 2.8,
    protein: 120,
    calories: 1800,
    fiber: 25,
    carbs: 150,
    fats: 60,
    steps: 5000,
    exerciseMinutes: 30,
  },
  streak: 0,
  lastActivityDate: null,
};

// --- Notification Templates ---

export const NOTIFICATION_MESSAGES = {
    breakfast: [
        "Comece o dia com energia! ☀️ Seu café da manhã é crucial para o sucesso do seu tratamento. Registre no FitMind!",
        "Ative seu metabolismo! 🚀 Um café da manhã nutritivo impulsiona seus resultados. Registre agora no app!"
    ],
    lunch: [
        "Recarregue para a tarde! 🥗 Seu almoço é a chave para manter o foco e a saciedade. Registre no FitMind!",
        "Combustível para seus objetivos! 🎯 Um almoço equilibrado faz a diferença. Registre sua refeição no app!"
    ],
    snack: [
        "Controle a fome, otimize seus resultados. 🍎 Seu lanche da tarde é estratégico. Registre no FitMind!",
        "Pequena pausa, grande impacto. ✨ Um lanche inteligente mantém sua energia em alta. Registre no app!"
    ],
    dinner: [
        "Feche o dia com inteligência. 🍽️ Um jantar leve apoia seu descanso e recuperação. Registre no FitMind!",
        "Nutrição noturna para resultados duradouros. 🌙 Seu jantar é parte essencial do plano. Registre no app!"
    ],
    hydration: [
        "Hidrate-se para mais vitalidade! 💧 A água é sua aliada no tratamento. Registre no FitMind!",
        "Otimize seu bem-estar! 🌊 Manter-se hidratado acelera seus resultados. Beba água e registre no app!"
    ],
    medication: [
        "Sua dose agora! 💊 A consistência da medicação é vital para seu progresso. Registre no FitMind!",
        "Não perca o timing! ⏰ Sua medicação é um passo crucial hoje. Registre no app e mantenha o controle!"
    ],
    checkin: [
        "Como você se sente? 🤔 Seu feedback sobre efeitos colaterais é valioso para seu bem-estar. Registre no FitMind!",
        "Monitore seu corpo, otimize seu tratamento. 🩺 Registrar seus sintomas nos ajuda a te apoiar melhor. Faça seu check-in no app!"
    ],
    progress: [
        "Parabéns pela consistência! 🎉 Cada registro te aproxima dos seus objetivos. Continue no FitMind!",
        "Seu esforço está gerando resultados! 📈 Continue registrando e veja sua evolução no FitMind. Você está no caminho certo!"
    ]
};
