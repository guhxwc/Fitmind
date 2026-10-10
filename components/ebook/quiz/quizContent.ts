// Conteúdo e lógica do quiz de upsell do FitMind (pós-ebook).
// As chaves e os valores das respostas são os mesmos aceitos pela função quiz-api.
// Regra: a prévia só mostra o que sai das respostas. Nada de número inventado.

export type QuestionKey = 'objetivo' | 'refeicoes' | 'proteina' | 'agua' | 'dificuldade' | 'rotina';
export type Answers = Partial<Record<QuestionKey, string | string[]>>;

export type IconName =
  | 'flame' | 'dumbbell' | 'leaf' | 'calendar' | 'utensils' | 'help' | 'alert' | 'check'
  | 'droplet' | 'droplets' | 'waves' | 'syringe' | 'clock' | 'zap' | 'shuffle' | 'camera'
  | 'bell' | 'chart' | 'frown' | 'sun' | 'moon' | 'coffee';

export interface QuizOption { value: string; label: string; hint?: string; icon: IconName }
export interface QuizQuestion {
  key: QuestionKey;
  eyebrow: string;
  title: string;
  subtitle?: string;
  multi?: boolean;
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  {
    key: 'objetivo',
    eyebrow: 'Seu objetivo',
    title: 'O que você mais quer agora?',
    options: [
      { value: 'perder_gordura', label: 'Perder gordura', hint: 'e ver a balança andar', icon: 'flame' },
      { value: 'manter_musculo', label: 'Emagrecer sem perder músculo', hint: 'manter o corpo firme', icon: 'dumbbell' },
      { value: 'menos_efeitos', label: 'Sentir menos enjoo e mal-estar', hint: 'comer sem passar mal', icon: 'leaf' },
      { value: 'constancia', label: 'Ter constância', hint: 'parar de começar e desandar', icon: 'calendar' },
    ],
  },
  {
    key: 'refeicoes',
    eyebrow: 'Sua alimentação',
    title: 'Com a caneta, quantas refeições você consegue fazer por dia?',
    subtitle: 'Conta tudo: café, almoço, lanche, jantar.',
    options: [
      { value: '1_2', label: '1 ou 2', hint: 'a fome quase sumiu', icon: 'utensils' },
      { value: '3', label: '3 refeições', icon: 'utensils' },
      { value: '4_5', label: '4 ou 5', hint: 'pouquinho, várias vezes', icon: 'utensils' },
      { value: 'irregular', label: 'Varia muito', hint: 'tem dia que nem lembro de comer', icon: 'shuffle' },
    ],
  },
  {
    key: 'proteina',
    eyebrow: 'Proteína',
    title: 'Você sabe quanta proteína come em um dia?',
    subtitle: 'Tudo bem não saber. Quase ninguém sabe.',
    options: [
      { value: 'nao_sei', label: 'Não faço ideia', icon: 'help' },
      { value: 'pouca', label: 'Sei que como pouca', icon: 'alert' },
      { value: 'acho_que_ok', label: 'Acho que como o suficiente', icon: 'check' },
    ],
  },
  {
    key: 'agua',
    eyebrow: 'Hidratação',
    title: 'E água? Quanto você bebe num dia normal?',
    options: [
      { value: 'menos_1l', label: 'Menos de 1 litro', icon: 'droplet' },
      { value: '1_2l', label: 'De 1 a 2 litros', icon: 'droplets' },
      { value: 'mais_2l', label: 'Mais de 2 litros', icon: 'waves' },
      { value: 'nao_sei', label: 'Nunca reparei', icon: 'help' },
    ],
  },
  {
    key: 'dificuldade',
    eyebrow: 'Dificuldades',
    title: 'O que mais atrapalha sua alimentação hoje?',
    subtitle: 'Pode marcar mais de uma.',
    multi: true,
    options: [
      { value: 'pouca_fome', label: 'Quase não sinto fome', icon: 'utensils' },
      { value: 'enjoo', label: 'Enjoo depois de comer', icon: 'frown' },
      { value: 'nao_sei_proteina', label: 'Não sei quanta proteína tem no prato', icon: 'help' },
      { value: 'esqueco_agua', label: 'Esqueço de beber água', icon: 'droplet' },
      { value: 'esqueco_dose', label: 'Já esqueci ou atrasei a dose', icon: 'syringe' },
      { value: 'sem_tempo', label: 'Falta de tempo', icon: 'clock' },
    ],
  },
  {
    key: 'rotina',
    eyebrow: 'Sua rotina',
    title: 'Como é o seu dia a dia?',
    options: [
      { value: 'muito_corrida', label: 'Corrido', hint: 'como o que der, quando der', icon: 'zap' },
      { value: 'regular', label: 'Organizado', hint: 'tenho horários mais ou menos fixos', icon: 'sun' },
      { value: 'irregular', label: 'Imprevisível', hint: 'cada dia é de um jeito', icon: 'shuffle' },
    ],
  },
];

// Telas curtas entre as perguntas: mostram um recurso real do FitMind ligado ao que a pessoa acabou de responder.
export interface FeatureBreak { afterKey: QuestionKey; icon: IconName; tag: string; title: (a: Answers) => string; body: (a: Answers) => string }

export const FEATURE_BREAKS: FeatureBreak[] = [
  {
    afterKey: 'proteina',
    icon: 'camera',
    tag: 'No FitMind',
    title: (a) => a.proteina === 'acho_que_ok' ? 'Que tal ter certeza?' : 'Uma foto resolve isso',
    body: () => 'Você tira uma foto do prato e o FitMind mostra as calorias e a proteína dele. Sem pesar comida, sem tabela, sem conta de cabeça.',
  },
  {
    afterKey: 'dificuldade',
    icon: 'bell',
    tag: 'No FitMind',
    title: (a) => {
      const d = arr(a.dificuldade);
      if (d.includes('esqueco_dose')) return 'A dose não fica mais na memória';
      if (d.includes('esqueco_agua') || a.agua === 'menos_1l') return 'Ele lembra da água por você';
      return 'Lembretes que trabalham por você';
    },
    body: () => 'O app lembra de beber água ao longo do dia e avisa no dia da sua dose. Você só confirma.',
  },
];

export const arr = (v?: string | string[]) => (Array.isArray(v) ? v : v ? [v] : []);

// ── Prévia personalizada ─────────────────────────────────────────────────────

export interface PlanInsight { icon: IconName; title: string; body: string }
export interface MealSlot { label: string; icon: IconName }
export interface Plan {
  headline: string;
  focus: PlanInsight;               // o ponto de atenção principal (aberto)
  meals: { title: string; note: string; slots: MealSlot[] }; // estrutura de refeições (aberta)
  water: PlanInsight;               // hidratação (aberta)
  unlockedCount: number;
  locked: { icon: IconName; title: string; teaser: string }[];
  checklist: string[];              // linhas da tela "montando seu plano"
}

const OBJETIVO_TXT: Record<string, string> = {
  perder_gordura: 'perder gordura',
  manter_musculo: 'emagrecer sem perder músculo',
  menos_efeitos: 'comer sem passar mal',
  constancia: 'manter a constância',
};

export function buildPlan(a: Answers): Plan {
  const dif = arr(a.dificuldade);
  const pouquinho = a.refeicoes === '1_2' || dif.includes('pouca_fome');
  const proteinaIncerta = a.proteina !== 'acho_que_ok' || dif.includes('nao_sei_proteina');

  // 1. Ponto de atenção principal
  let focus: PlanInsight;
  if (pouquinho && proteinaIncerta) {
    focus = {
      icon: 'alert',
      title: 'Cada garfada precisa contar',
      body: 'Com pouca fome, você come pouco. Se a proteína não vier primeiro no prato, o corpo pode tirar do músculo o que falta. Seu foco: proteína em todas as refeições, mesmo nas pequenas.',
    };
  } else if (dif.includes('enjoo') || a.objetivo === 'menos_efeitos') {
    focus = {
      icon: 'leaf',
      title: 'Comer pouco, várias vezes',
      body: 'Porções menores e mais espaçadas costumam pesar menos no estômago. Seu foco: refeições leves, com proteína, sem pular o dia inteiro.',
    };
  } else if (proteinaIncerta) {
    focus = {
      icon: 'help',
      title: 'Você ainda não sabe quanta proteína come',
      body: 'E sem saber, não dá para corrigir. Seu foco: medir a proteína do prato por alguns dias e ver onde está faltando.',
    };
  } else if (a.objetivo === 'constancia' || a.rotina === 'irregular') {
    focus = {
      icon: 'calendar',
      title: 'Rotina simples que não quebra',
      body: 'Na rotina que muda todo dia, plano complicado não dura. Seu foco: registrar rápido, com foto, e não perder a sequência.',
    };
  } else {
    focus = {
      icon: 'check',
      title: 'Confirmar que está dando certo',
      body: 'Você já se cuida. Agora é ver peso, proteína e água juntos para saber o que está funcionando e manter.',
    };
  }

  // 2. Estrutura de refeições (sai direto da resposta)
  let slots: MealSlot[];
  let mealsTitle: string;
  if (a.refeicoes === '1_2') {
    mealsTitle = '2 refeições + 1 lanche de proteína';
    slots = [{ label: 'Almoço', icon: 'sun' }, { label: 'Lanche', icon: 'coffee' }, { label: 'Jantar', icon: 'moon' }];
  } else if (a.refeicoes === '4_5') {
    mealsTitle = 'Várias refeições pequenas';
    slots = [{ label: 'Café', icon: 'coffee' }, { label: 'Almoço', icon: 'sun' }, { label: 'Lanche', icon: 'coffee' }, { label: 'Jantar', icon: 'moon' }];
  } else if (a.refeicoes === 'irregular') {
    mealsTitle = '3 âncoras no dia';
    slots = [{ label: 'Manhã', icon: 'coffee' }, { label: 'Tarde', icon: 'sun' }, { label: 'Noite', icon: 'moon' }];
  } else {
    mealsTitle = '3 refeições com proteína';
    slots = [{ label: 'Café', icon: 'coffee' }, { label: 'Almoço', icon: 'sun' }, { label: 'Jantar', icon: 'moon' }];
  }
  const mealsNote = a.rotina === 'muito_corrida' || dif.includes('sem_tempo')
    ? 'Registro em segundos: uma foto e pronto.'
    : 'Cada refeição registrada com uma foto do prato.';

  // 3. Água
  let water: PlanInsight;
  if (a.agua === 'menos_1l' || dif.includes('esqueco_agua')) {
    water = { icon: 'droplet', title: 'Água: abaixo do ideal', body: 'Você contou que bebe pouco ou esquece. O app espalha lembretes pelo seu dia até você bater a sua meta.' };
  } else if (a.agua === 'nao_sei') {
    water = { icon: 'droplet', title: 'Água: hora de medir', body: 'Você nunca reparou quanto bebe. O app registra cada copo e mostra se você está chegando lá.' };
  } else {
    water = { icon: 'droplets', title: 'Água: bom começo', body: 'Você já bebe uma boa quantidade. O app ajuda a manter isso todos os dias, inclusive nos corridos.' };
  }

  const locked = [
    { icon: 'flame' as IconName, title: 'Sua meta diária de proteína e calorias', teaser: 'Calculada com o seu peso e a sua altura' },
    { icon: 'syringe' as IconName, title: 'Lembrete do dia da sua dose', teaser: dif.includes('esqueco_dose') ? 'Você disse que já esqueceu ou atrasou' : 'Para nunca atrasar uma aplicação' },
    { icon: 'chart' as IconName, title: 'Seu painel de evolução', teaser: 'Peso, proteína e água no mesmo gráfico' },
  ];

  const checklist = [
    `Objetivo: ${OBJETIVO_TXT[String(a.objetivo)] ?? 'definido'}`,
    `Organizando ${mealsTitle.toLowerCase()}`,
    'Ajustando os lembretes de água',
    dif.includes('esqueco_dose') ? 'Preparando o lembrete da dose' : 'Preparando os lembretes do tratamento',
    'Montando sua prévia',
  ];

  return {
    headline: OBJETIVO_TXT[String(a.objetivo)]
      ? `Seu plano para ${OBJETIVO_TXT[String(a.objetivo)]}`
      : 'Seu plano FitMind',
    focus,
    meals: { title: mealsTitle, note: mealsNote, slots },
    water,
    unlockedCount: 3,
    locked,
    checklist,
  };
}

// ── Oferta ───────────────────────────────────────────────────────────────────

export const OFFER = {
  price: 'R$ 49',
  period: '/mês',
  perDay: 'Menos de R$ 1,70 por dia',
  billing: 'Cobrança mensal de R$ 49. Renova todo mês até você cancelar. Você cancela quando quiser, pelo app.',
  features: [
    { icon: 'camera' as IconName, title: 'Foto do prato', body: 'Calorias e proteína de cada refeição em segundos' },
    { icon: 'bell' as IconName, title: 'Lembretes de água e da dose', body: 'O app lembra por você' },
    { icon: 'chart' as IconName, title: 'Peso, proteína e água juntos', body: 'Você vê o que está funcionando' },
    { icon: 'calendar' as IconName, title: 'Sua evolução semana a semana', body: 'Do primeiro dia até a meta' },
  ],
  cta: 'Desbloquear meu FitMind',
};
