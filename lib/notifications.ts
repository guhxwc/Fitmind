import { UserData, Meal, WeightEntry } from '../types';

export type NotificationType = 'modal' | 'toast';

export interface NotificationAction {
  label: string;
  action: string; // Route path, 'dismiss', 'snooze', 'camera', etc.
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  priority: number; // Lower number = higher priority
  title: string | ((data: any) => string);
  body: string | ((data: any) => string);
  primaryAction?: NotificationAction;
  secondaryAction?: NotificationAction;
  evaluateTrigger: (context: NotificationContext) => boolean;
}

export interface NotificationContext {
  userData: UserData | null;
  meals: Meal[];
  currentWater: number;
  weightHistory: WeightEntry[];
  currentTime: Date;
  sessionStart: Date;
  isFirstTimeOpening: boolean;
  hasCompletedOnboarding: boolean;
  daysSinceSignup: number;
  isSubscriber: boolean;
  subscriberDays: number;
  lastWeightRecordDate: Date | null;
  lastDoseDate: Date | null;
  doseDayOfWeek: number; // 0-6
  hasLoggedSideEffectToday: boolean;
  hasStrongSideEffect: boolean;
  proteinProgress: number; // 0-1
  proteinGoal: number; // in grams
  waterProgress: number; // ml
  weightDiff: number | null; // negative means lost weight
  currentPath: string;
}

// Message variations for weight changes to keep UX fresh
const WEIGHT_LOSS_MESSAGES = [
  { title: (diff: string) => `Você perdeu ${diff}kg! 🔥`, body: 'Seu acompanhamento tá funcionando. Continue registrando pra manter o ritmo.' },
  { title: (diff: string) => `Menos ${diff}kg na balança! 📉`, body: 'Cada grama conta na sua jornada. A IA do FitMind está orgulhosa!' },
  { title: (diff: string) => `Resultado incrível: -${diff}kg! ✨`, body: 'Sua dedicação está pagando o preço. Continue firme na meta de proteína!' },
  { title: (diff: string) => `Uau! ${diff}kg a menos hoje. 🚀`, body: 'O GLP-1 e seu esforço são uma combinação imbatível. Bora pra cima!' },
  { title: (diff: string) => `Progresso real: -${diff}kg! 🎯`, body: 'Você está mais perto do seu objetivo. Não esqueça da água hoje!' },
];

const WEIGHT_GAIN_MESSAGES = [
  { title: 'Calma, faz parte do processo 🧘', body: 'Variações de peso são normais, principalmente nos primeiros dias de GLP-1.' },
  { title: 'Peso subiu um pouco? Sem pânico! 🛑', body: 'Retenção de líquido ou ciclo hormonal podem influenciar. Foque na tendência.' },
  { title: 'A balança oscilou hoje? Tudo bem. ⚖️', body: 'O importante é a constância. Amanhã é um novo dia para bater as metas.' },
  { title: 'Oscilações são normais na jornada. 🌊', body: 'Não deixe um número isolado te desanimar. Sua saúde vai além da balança.' },
  { title: 'Mantenha o foco no longo prazo! 🔭', body: 'Pequenos desvios acontecem. O que importa é o que você faz na maioria dos dias.' },
];

export const NOTIFICATIONS: AppNotification[] = [
  // ---------------------------------------------------------
  // PRIORIDADE 1: ONBOARDING (20-22)
  // ---------------------------------------------------------
  {
    id: 'welcome_onboarding',
    type: 'modal',
    priority: 1,
    title: 'Bem-vindo ao FitMind! 👋',
    body: 'Vamos configurar seu perfil em 30 segundos pra IA personalizar tudo pra você.',
    primaryAction: { label: 'Começar', action: '/onboarding' },
    evaluateTrigger: (ctx) => ctx.isFirstTimeOpening && !ctx.hasCompletedOnboarding,
  },
  {
    id: 'onboarding_complete',
    type: 'modal',
    priority: 1,
    title: 'Tudo pronto!',
    body: 'Sua primeira missão: registre seu peso agora e tire uma foto da sua próxima refeição. A IA faz o resto.',
    primaryAction: { label: 'Registrar peso', action: 'weight' },
    secondaryAction: { label: 'Explorar o app', action: 'never_again' },
    evaluateTrigger: (ctx) => ctx.hasCompletedOnboarding && ctx.weightHistory.length === 0 && ctx.currentPath === '/',
  },
  {
    id: 'day2_no_records',
    type: 'modal',
    priority: 1,
    title: 'Ainda não começou?',
    body: 'O primeiro passo é o mais difícil. Registre só uma coisa hoje — seu peso ou uma refeição. Leva 10 segundos.',
    primaryAction: { label: 'Registrar agora', action: 'weight' },
    secondaryAction: { label: 'Ver como funciona', action: '/settings/help' },
    evaluateTrigger: (ctx) => ctx.daysSinceSignup === 1 && ctx.weightHistory.length === 0 && ctx.meals.length === 0,
  },

  // ---------------------------------------------------------
  // PRIORIDADE 2: DOSE (12-13)
  // ---------------------------------------------------------
  {
    id: 'dose_day',
    type: 'modal',
    priority: 2,
    title: 'Hoje é dia da sua aplicação',
    body: 'Não esqueça de registrar a dose depois de aplicar. Isso ajuda a IA a entender seus resultados.',
    primaryAction: { label: 'Registrar dose', action: '/applications' },
    secondaryAction: { label: 'Lembrar mais tarde', action: 'snooze' },
    evaluateTrigger: (ctx) => ctx.currentTime.getDay() === ctx.doseDayOfWeek && ctx.lastDoseDate?.toDateString() !== ctx.currentTime.toDateString(),
  },
  {
    id: 'dose_late',
    type: 'modal',
    priority: 2,
    title: 'Sua aplicação está atrasada',
    body: 'Você deveria ter aplicado ontem. Regularidade é chave pro resultado do tratamento. Registre quando fizer a aplicação.',
    primaryAction: { label: 'Já apliquei, registrar', action: '/applications' },
    secondaryAction: { label: 'Vou aplicar agora', action: 'dismiss' },
    evaluateTrigger: (ctx) => {
        const expectedDay = ctx.doseDayOfWeek;
        const currentDay = ctx.currentTime.getDay();
        const isLate = (currentDay === (expectedDay + 1) % 7) || (currentDay === (expectedDay + 2) % 7);
        const appliedRecently = ctx.lastDoseDate && (ctx.currentTime.getTime() - ctx.lastDoseDate.getTime() < 3 * 24 * 60 * 60 * 1000);
        return isLate && !appliedRecently;
    },
  },

  // ---------------------------------------------------------
  // PRIORIDADE 3: PESO (1-2)
  // ---------------------------------------------------------
  {
    id: 'weight_missing_today',
    type: 'modal',
    priority: 3,
    title: 'Você ainda não pesou hoje',
    body: 'Registrar seu peso diariamente é o que separa quem tem resultado de quem só tenta. Leva 5 segundos.',
    primaryAction: { label: 'Pesar agora', action: 'weight' },
    secondaryAction: { label: 'Lembrar amanhã', action: 'snooze_tomorrow' },
    evaluateTrigger: (ctx) => {
        const isPast18h = ctx.currentTime.getHours() >= 18;
        const weighedToday = ctx.lastWeightRecordDate?.toDateString() === ctx.currentTime.toDateString();
        return isPast18h && !weighedToday;
    },
  },
  {
    id: 'weight_missing_3days',
    type: 'modal',
    priority: 3,
    title: 'Faz 3 dias que você não registra seu peso',
    body: 'Sem dados, a IA não consegue ajustar seu plano. Bora voltar pro ritmo?',
    primaryAction: { label: 'Registrar peso', action: 'weight' },
    secondaryAction: { label: 'Agora não', action: 'dismiss' },
    evaluateTrigger: (ctx) => {
        if (!ctx.lastWeightRecordDate) return false;
        const daysSinceLastWeight = Math.floor((ctx.currentTime.getTime() - ctx.lastWeightRecordDate.getTime()) / (1000 * 3600 * 24));
        return daysSinceLastWeight >= 3;
    },
  },

  // ---------------------------------------------------------
  // PRIORIDADE 4: PROTEÍNA E REFEIÇÕES (8-10)
  // ---------------------------------------------------------
  {
    id: 'no_meals_12h',
    type: 'modal',
    priority: 4,
    title: 'O que você comeu hoje? 🍽️',
    body: 'Tire uma foto da sua refeição e descubra em segundos quantas calorias e proteínas ela tem. A IA analisa tudo pra você.',
    primaryAction: { label: '📸 Tirar foto agora', action: 'camera' },
    secondaryAction: { label: 'Testar depois', action: 'dismiss' },
    evaluateTrigger: (ctx) => {
        const isPast12h = ctx.currentTime.getHours() >= 12;
        const hasMealsToday = ctx.meals.some(m => new Date(m.id).toDateString() === ctx.currentTime.toDateString());
        return isPast12h && !hasMealsToday;
    },
  },
  {
    id: 'first_time_meals',
    type: 'modal',
    priority: 4,
    title: 'Sabia que uma foto resolve?',
    body: 'Aponte a câmera pro seu prato e a IA do FitMind calcula proteínas, calorias, carboidratos e gorduras na hora. Sem digitar nada.',
    primaryAction: { label: '📸 Experimentar agora', action: 'camera' },
    secondaryAction: { label: 'Depois', action: 'never_again' },
    evaluateTrigger: (ctx) => ctx.currentPath === '/meals' && ctx.meals.length === 0,
  },
  {
    id: 'low_protein_20h',
    type: 'modal',
    priority: 4,
    title: 'Sua proteína tá baixa hoje',
    body: (ctx: NotificationContext) => `Você consumiu só ${Math.round(ctx.proteinProgress * ctx.proteinGoal)}g de ${ctx.proteinGoal}g. Perder músculo com GLP-1 acontece quando a proteína fica abaixo do ideal. Que tal um shake ou ovos antes de dormir?`,
    primaryAction: { label: 'Ver sugestões', action: '/meals' },
    secondaryAction: { label: 'Entendi', action: 'dismiss' },
    evaluateTrigger: (ctx) => {
        const isPast20h = ctx.currentTime.getHours() >= 20;
        return isPast20h && ctx.proteinProgress < 0.6;
    },
  },

  // ---------------------------------------------------------
  // PRIORIDADE 5: ÁGUA (5-6)
  // ---------------------------------------------------------
  {
    id: 'no_water_14h',
    type: 'modal',
    priority: 5,
    title: 'Você bebeu água hoje?',
    body: 'Quem usa GLP-1 desidrata mais rápido. A meta é pelo menos 2L por dia pra evitar dor de cabeça e enjoo.',
    primaryAction: { label: 'Registrar água', action: '/' },
    secondaryAction: { label: 'Depois', action: 'dismiss' },
    evaluateTrigger: (ctx) => {
        const isPast14h = ctx.currentTime.getHours() >= 14;
        return isPast14h && ctx.waterProgress === 0;
    },
  },
  {
    id: 'low_water_18h',
    type: 'modal',
    priority: 5,
    title: (ctx: NotificationContext) => `Só ${ctx.waterProgress}ml até agora?`,
    body: 'Tá abaixo do mínimo recomendado pra quem usa caneta. Bebe mais um copo agora e registra.',
    primaryAction: { label: 'Já bebi, registrar', action: '/' },
    secondaryAction: { label: 'Lembrar em 1h', action: 'snooze_1h' },
    evaluateTrigger: (ctx) => {
        const isPast18h = ctx.currentTime.getHours() >= 18;
        return isPast18h && ctx.waterProgress > 0 && ctx.waterProgress < 1000;
    },
  },

  // ---------------------------------------------------------
  // PRIORIDADE 6: REFERRAL & RENTENTION (15-19)
  // ---------------------------------------------------------
  {
    id: 'trial_day_5',
    type: 'modal',
    priority: 6,
    title: 'Seu teste grátis acaba em 2 dias',
    body: 'Quer continuar sem pagar? Indique 1 amigo que usa caneta emagrecedora. Quando ele se cadastrar, você ganha 30 dias grátis.',
    primaryAction: { label: 'Indicar amigo', action: 'share_referral' },
    secondaryAction: { label: 'Assinar agora', action: '/assinatura' },
    evaluateTrigger: (ctx) => !ctx.isSubscriber && ctx.daysSinceSignup === 5,
  },
  {
    id: 'trial_countdown_last_day',
    type: 'modal',
    priority: 6,
    title: 'Seu teste grátis termina hoje! ⏳',
    body: 'Não perca o acesso à sua evolução. Sabia que você pode ganhar 1 mês de FitMind PRO inteiramente grátis? Basta indicar um amigo que também usa medicação GLP-1.',
    primaryAction: { label: 'Ganhar 1 Mês Grátis', action: 'share_referral' },
    secondaryAction: { label: 'Agora não, obrigado', action: 'dismiss' },
    evaluateTrigger: (ctx) => !ctx.isSubscriber && ctx.daysSinceSignup === 6,
  },
  {
    id: 'trial_ended',
    type: 'modal',
    priority: 6,
    title: 'Seu período grátis acabou',
    body: 'Seus dados estão salvos. Assine por R$49/mês pra continuar seu acompanhamento. Ou indique 1 amigo = +7 dias grátis.',
    primaryAction: { label: 'Assinar R$49/mês', action: '/assinatura' },
    secondaryAction: { label: 'Indicar e ganhar +7 dias', action: 'share_referral' },
    evaluateTrigger: (ctx) => !ctx.isSubscriber && ctx.daysSinceSignup === 7,
  },
  {
    id: 'sub_14_days',
    type: 'modal',
    priority: 6,
    title: 'Conhece alguém que usa Monjaro?',
    body: 'Manda seu link exclusivo e vocês dois ganham 1 semana grátis. Você ajuda um amigo e economiza.',
    primaryAction: { label: 'Compartilhar link', action: 'share_referral' },
    secondaryAction: { label: 'Agora não', action: 'snooze_7d' },
    evaluateTrigger: (ctx) => ctx.isSubscriber && ctx.subscriberDays === 14,
  },
  {
    id: 'sub_30_days',
    type: 'modal',
    priority: 6,
    title: '1 mês de FitMind! 🎉',
    body: (ctx: NotificationContext) => `Você já tem ${ctx.subscriberDays} dias de acompanhamento. Que tal contar sua experiência?`,
    primaryAction: { label: 'Mandar feedback', action: 'whatsapp_feedback' },
    secondaryAction: { label: 'Indicar amigo', action: 'share_referral' },
    evaluateTrigger: (ctx) => ctx.isSubscriber && ctx.subscriberDays === 30,
  },
  {
    id: 'weight_lost_referral',
    type: 'modal',
    priority: 6,
    title: 'Seu resultado foi incrível essa semana!',
    body: 'Que tal compartilhar o FitMind com alguém que também usa caneta? Seu link exclusivo dá 7 dias grátis pra pessoa.',
    primaryAction: { label: 'Compartilhar agora', action: 'share_referral' },
    secondaryAction: { label: 'Talvez depois', action: 'dismiss' },
    evaluateTrigger: (ctx) => ctx.weightDiff !== null && ctx.weightDiff < 0 && ctx.currentTime.getDay() === 5, // Example: trigger on Fridays if lost weight
  },

  // ---------------------------------------------------------
  // PRIORIDADE 7: UPSELL (23-25)
  // ---------------------------------------------------------
  {
    id: 'upsell_consult_14d',
    type: 'modal',
    priority: 7,
    title: 'Quer resultados 3x mais rápidos?',
    body: 'Agende uma consulta com nosso nutricionista especialista em GLP-1. Ele vai montar um plano sob medida pro seu corpo e sua medicação.',
    primaryAction: { label: 'Conhecer consulta — R$197', action: '/upsell-consulta' },
    secondaryAction: { label: 'Agora não', action: 'snooze_14d' },
    evaluateTrigger: (ctx) => ctx.isSubscriber && ctx.subscriberDays >= 14,
  },
  {
    id: 'upsell_side_effects',
    type: 'modal',
    priority: 7,
    title: 'Efeitos colaterais te incomodando?',
    body: 'Um nutricionista especialista em GLP-1 pode ajustar sua alimentação pra reduzir náuseas e desconforto. Agende uma consulta.',
    primaryAction: { label: 'Ver consulta', action: '/upsell-consulta' },
    secondaryAction: { label: 'Estou bem', action: 'dismiss' },
    evaluateTrigger: (ctx) => ctx.hasStrongSideEffect,
  },
  {
    id: 'upsell_low_protein_streak',
    type: 'modal',
    priority: 7,
    title: 'Sua proteína tá consistentemente baixa',
    body: 'Isso pode causar perda de músculo. Um nutricionista especialista em caneta emagrecedora pode criar um plano específico pra você. Quer agendar?',
    primaryAction: { label: 'Agendar consulta', action: '/upsell-consulta' },
    secondaryAction: { label: 'Vou tentar melhorar sozinho', action: 'snooze_7d' },
    evaluateTrigger: (ctx) => false, // Needs historical streak tracking, hard to evaluate statelessly
  },

  // ---------------------------------------------------------
  // TOASTS / CELEBRAÇÕES (Priority 0)
  // ---------------------------------------------------------
  /* Weight notifications disabled in favor of WeightMilestoneModal
  {
    id: 'weight_lost_toast',
    type: 'toast',
    priority: 0,
    title: (ctx: NotificationContext) => {
      const diff = Math.abs(ctx.weightDiff || 0).toFixed(1);
      const index = Math.floor(ctx.currentTime.getTime() / (1000 * 60 * 60)) % WEIGHT_LOSS_MESSAGES.length;
      const msg = WEIGHT_LOSS_MESSAGES[index];
      return typeof msg.title === 'function' ? msg.title(diff) : msg.title;
    },
    body: (ctx: NotificationContext) => {
      const index = Math.floor(ctx.currentTime.getTime() / (1000 * 60 * 60)) % WEIGHT_LOSS_MESSAGES.length;
      return WEIGHT_LOSS_MESSAGES[index].body;
    },
    primaryAction: { label: 'Ver meu progresso', action: '/progress' },
    evaluateTrigger: (ctx) => ctx.weightDiff !== null && ctx.weightDiff < 0,
  },
  {
    id: 'weight_gained_toast',
    type: 'toast',
    priority: 0,
    title: (ctx: NotificationContext) => {
      const index = Math.floor(ctx.currentTime.getTime() / (1000 * 60 * 60)) % WEIGHT_GAIN_MESSAGES.length;
      return WEIGHT_GAIN_MESSAGES[index].title;
    },
    body: (ctx: NotificationContext) => {
      const index = Math.floor(ctx.currentTime.getTime() / (1000 * 60 * 60)) % WEIGHT_GAIN_MESSAGES.length;
      return WEIGHT_GAIN_MESSAGES[index].body;
    },
    primaryAction: { label: 'Entendi', action: 'dismiss' },
    evaluateTrigger: (ctx) => ctx.weightDiff !== null && ctx.weightDiff > 0,
  },
  */
  {
    id: 'water_goal_toast',
    type: 'toast',
    priority: 0,
    title: 'Meta de água batida! 💧',
    body: (ctx: NotificationContext) => `Você bebeu ${ctx.waterProgress / 1000}L hoje. Seu corpo agradece — hidratação reduz efeitos colaterais do GLP-1.`,
    primaryAction: { label: 'Show!', action: 'dismiss' },
    evaluateTrigger: (ctx) => ctx.waterProgress >= 2000,
  },
  {
    id: 'protein_goal_toast',
    type: 'toast',
    priority: 0,
    title: 'Meta de proteína batida! 💪',
    body: (ctx: NotificationContext) => `${Math.round(ctx.proteinProgress * ctx.proteinGoal)}g de proteína hoje. Seus músculos estão protegidos. Continue assim!`,
    primaryAction: { label: 'Boa!', action: 'dismiss' },
    evaluateTrigger: (ctx) => ctx.proteinProgress >= 1,
  },
  {
    id: 'side_effect_toast',
    type: 'toast',
    priority: 0,
    title: 'Efeito colateral registrado ✓',
    body: 'O FitMind vai analisar padrões dos seus efeitos colaterais pra te ajudar a minimizá-los. Continue registrando.',
    primaryAction: { label: 'Ok', action: 'dismiss' },
    evaluateTrigger: (ctx) => ctx.hasLoggedSideEffectToday,
  },
];
