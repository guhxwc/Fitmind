import React, { useState, useEffect } from 'react';
import './ebook.css';
import { EBOOK_CONFIG, trackEvent, getEbookOrderStatus } from './ebookConfig';
import { useEbookTracking } from './ebookTracking';
import { useEbookFontsAndMeta } from './useEbookFontsAndMeta';
import { metaTrack } from '../../lib/metaPixel';

type PlanType = 'mensal' | 'trimestral' | 'semestral';

const PLAN_LABELS: Record<PlanType, string> = {
  mensal: 'Quero a consultoria mensal com o Allan',
  trimestral: 'Quero a consultoria trimestral com o Allan',
  semestral: 'Quero a consultoria semestral com o Allan'
};

export const EbookUpsellPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('trimestral');

  useEbookTracking('upsell');

  useEbookFontsAndMeta({
    title: 'Seu ebook está a caminho | FitMind',
    noindex: true
  });

  const [orderInfo, setOrderInfo] = useState<{ status?: string; email?: string | null }>({});

  useEffect(() => {
    trackEvent('upsell_view', { session_id: new URLSearchParams(window.location.search).get('session_id') });
  }, []);

  // Confirma a compra: mostra o e-mail (mascarado), dispara o Purchase uma única vez
  // e acompanha o status até o e-mail ser entregue (Pix pode levar alguns segundos).
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) return;

    let cancelled = false;
    let tries = 0;

    const firePurchase = (value?: number | null, currency?: string) => {
      const key = `ebook_purchase_${sessionId}`;
      try { if (sessionStorage.getItem(key)) return; sessionStorage.setItem(key, '1'); } catch { /* ignore */ }
      const v = value ?? EBOOK_CONFIG.PRICE_VALUE;
      const c = currency ?? EBOOK_CONFIG.CURRENCY;
      trackEvent('ebook_purchase', { value: v, currency: c, session_id: sessionId });
      metaTrack('Purchase', { value: v, currency: c, content_name: 'Ebook Prato Cheio de Proteína', content_type: 'product', num_items: 1 }, sessionId);
    };

    const poll = async () => {
      tries++;
      const r = await getEbookOrderStatus(sessionId);
      if (cancelled) return;
      if (r.found) {
        setOrderInfo({ status: r.status, email: r.email_masked });
        if (r.status && ['paid', 'sending', 'delivered', 'failed'].includes(r.status)) firePurchase(r.value, r.currency);
        if (r.status === 'delivered' || r.status === 'failed') return;
      }
      if (tries < 12) setTimeout(poll, 4000); // até ~48s
    };
    poll();
    return () => { cancelled = true; };
  }, []);

  const goToSite = (eventName: string, props?: Record<string, any>) => {
    trackEvent(eventName, props);
    window.location.href = EBOOK_CONFIG.UPSELL_REDIRECT_URL;
  };

  const handleSelectPlan = (plan: PlanType) => {
    setSelectedPlan(plan);
  };

  const handleKeyDownPlan = (e: React.KeyboardEvent, currentPlan: PlanType) => {
    const plans: PlanType[] = ['mensal', 'trimestral', 'semestral'];
    let idx = plans.indexOf(currentPlan);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextPlan = plans[(idx + 1) % plans.length];
      setSelectedPlan(nextPlan);
      const el = document.querySelector(`[data-plan="${nextPlan}"]`) as HTMLElement | null;
      el?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevPlan = plans[(idx - 1 + plans.length) % plans.length];
      setSelectedPlan(prevPlan);
      const el = document.querySelector(`[data-plan="${prevPlan}"]`) as HTMLElement | null;
      el?.focus();
    }
  };

  // Todos os CTAs do upsell levam para o site principal
  const handleBuyPlan = (e: React.MouseEvent) => {
    e.preventDefault();
    goToSite('upsell_accept', { plano: selectedPlan });
  };

  const handleAppOnly = (e: React.MouseEvent) => {
    e.preventDefault();
    goToSite('downsell_app_click');
  };

  const handleNoThanks = (e: React.MouseEvent) => {
    e.preventDefault();
    goToSite('upsell_decline');
  };

  return (
    <div className="fm-ebook">
      {/* STEPS BAR */}
      <div className="steps" aria-label="Progresso do pedido">
        <div className="wrap-upsell">
          <span className="done">✓ Pedido confirmado</span>
          <span className="bar">
            <i></i>
          </span>
          <span>Etapa 2 de 2: oferta para quem comprou o ebook</span>
        </div>
      </div>

      {/* HEADER */}
      <header className="upsell-header">
        <div className="wrap-upsell">
          <img src="/logo-fitmind.webp" alt="FitMind" width="87" height="32" />
          <div className="pre">
            {orderInfo.status === 'delivered' && orderInfo.email
              ? `✓ Ebook enviado para ${orderInfo.email}`
              : orderInfo.status === 'pending'
                ? '⏳ Aguardando a confirmação do pagamento. O ebook chega no seu e-mail assim que for aprovado.'
                : orderInfo.email
                  ? `✓ Seu ebook está a caminho de ${orderInfo.email}`
                  : '✓ Seu ebook já está a caminho do seu e-mail'}
          </div>
          <h1>Agora que você tem as receitas, falta organizar o tratamento</h1>
          <p className="lead">
            O ebook mostra o que comer. O FitMind mostra se você está comendo, bebendo e se cuidando o suficiente, todo dia. Antes de fechar esta página, veja o que muda quando você não faz isso sozinho(a).
          </p>
        </div>
      </header>

      <main className="wrap-upsell">
        {/* VERSUS */}
        <div className="versus">
          <div className="col a">
            <h3>Só com o ebook</h3>
            <ul>
              <li>Receitas e cardápio modelo, iguais para todo mundo</li>
              <li>Meta de proteína estimada por referência geral</li>
              <li>Você descobre sozinho(a) o que ajustar quando o peso trava</li>
              <li>Dúvidas do dia a dia sobre alimentação ficam sem resposta</li>
            </ul>
          </div>
          <div className="col b">
            <h3>Com o FitMind</h3>
            <ul>
              <li>Proteína, água e refeições registradas por foto, com metas diárias</li>
              <li>Lembrete de dose e registro de sintomas depois de cada aplicação</li>
              <li>Histórico para descobrir por que o peso travou</li>
              <li>Opção de consultoria com nutricionista, que acompanha seus registros no app</li>
            </ul>
          </div>
        </div>

        {/* STEP 1: APP */}
        <section className="app" aria-labelledby="app-t">
          <div className="mock" aria-hidden="true">
            <div className="fm-phone-glow"></div>
            <div className="fm-phone">
              <div className="fm-phone-frame">
                <div className="fm-phone-notch"></div>
                <div className="fm-phone-screen">
                  <div className="fm-status">
                    <span>9:41</span>
                    <div className="fm-status-right">
                      <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor">
                        <path d="M1 8h2v1H1zM4 6h2v3H4zM7 4h2v5H7zM10 2h2v7h-2zM13 0h2v9h-2z" />
                      </svg>
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <path d="M1 5a8 8 0 0112 0M3 7a5 5 0 018 0M6 9h2" />
                      </svg>
                      <svg width="22" height="10" viewBox="0 0 22 10" fill="currentColor">
                        <rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="currentColor" fill="none" />
                        <rect x="2" y="2" width="14" height="6" rx="1" />
                        <rect x="19.5" y="3" width="1.5" height="4" rx="0.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="fm-screen-scroll">
                    <div className="sumHeader">
                      <div>
                        <div className="sumDatePill">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          HOJE
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </div>
                        <div className="sumTitle">Resumo</div>
                      </div>
                      <div className="sumHeaderRight">
                        <div className="sumStreak">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <defs>
                              <linearGradient id="streakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#FFB300" />
                                <stop offset="35%" stopColor="#FF6B00" />
                                <stop offset="100%" stopColor="#E61A00" />
                              </linearGradient>
                            </defs>
                            <path d="M12 2C12 2 5 8.5 5 14.5C5 18.64 8.13 22 12 22C15.87 22 19 18.64 19 14.5C19 8.5 12 2 12 2Z" fill="url(#streakGrad)" />
                            <path d="M12 8.5C12 8.5 8 12.5 8 16C8 18.21 9.79 20 12 20C14.21 20 16 18.21 16 16C16 12.5 12 8.5 12 8.5Z" fill="#FFD700" />
                          </svg>
                          <span>12</span>
                        </div>
                        <div className="sumAvatar">M</div>
                      </div>
                    </div>

                    <div className="sumDoseCard">
                      <div className="sumDoseLeft">
                        <div className="sumDoseHead">
                          <span className="sumPing">
                            <span className="sumPingDot" style={{ background: '#4CA0DF' }}></span>
                            <span className="sumPingRing" style={{ background: '#4CA0DF' }}></span>
                          </span>
                          <span>PRÓXIMA DOSE</span>
                        </div>
                        <div className="sumDoseDay">Domingo</div>
                        <div className="sumDoseMed">GLP-1 • 0,5 mg</div>
                      </div>
                      <div className="sumDoseSyringe">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m18 2 4 4" />
                          <path d="m17 7 3-3" />
                          <path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5" />
                          <path d="m9 11 4 4" />
                          <path d="m5 19-3 3" />
                          <path d="m14 4 6 6" />
                        </svg>
                      </div>
                      <div className="sumDoseBlob" style={{ background: '#4CA0DF1A' }}></div>
                    </div>

                    <div className="sumBentoRow">
                      <div className="sumDonutCard">
                        <div className="sumDonutHead">
                          <div className="sumDonutLabel" style={{ color: '#FF9500' }}>PROTEÍNA</div>
                          <div className="sumDonutIcon" style={{ background: '#FF95001F', color: '#FF9500' }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6" /></svg>
                          </div>
                        </div>
                        <div className="sumDonutChart">
                          <svg viewBox="0 0 60 60" width="62" height="62">
                            <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(229,229,234,0.6)" strokeWidth="5" />
                            <circle cx="30" cy="30" r="22" fill="none" stroke="#FF9500" strokeWidth="5" strokeDasharray="138.23" strokeDashoffset="41.47" strokeLinecap="round" transform="rotate(-90 30 30)" />
                          </svg>
                          <div className="sumDonutCenter">
                            <div className="sumDonutValue">84</div>
                            <div className="sumDonutGoal">de 120g</div>
                          </div>
                        </div>
                        <div className="sumDonutBtns">
                          <span className="sumDonutBtn">−</span>
                          <span className="sumDonutBtn">+</span>
                        </div>
                      </div>

                      <div className="sumDonutCard">
                        <div className="sumDonutHead">
                          <div className="sumDonutLabel" style={{ color: '#4CA0DF' }}>HIDRATAÇÃO</div>
                          <div className="sumDonutIcon" style={{ background: '#4CA0DF1F', color: '#4CA0DF' }}>
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6" /></svg>
                          </div>
                        </div>
                        <div className="sumDonutChart">
                          <svg viewBox="0 0 60 60" width="62" height="62">
                            <circle cx="30" cy="30" r="22" fill="none" stroke="rgba(229,229,234,0.6)" strokeWidth="5" />
                            <circle cx="30" cy="30" r="22" fill="none" stroke="#4CA0DF" strokeWidth="5" strokeDasharray="138.23" strokeDashoffset="49.76" strokeLinecap="round" transform="rotate(-90 30 30)" />
                          </svg>
                          <div className="sumDonutCenter">
                            <div className="sumDonutValue">1,8</div>
                            <div className="sumDonutGoal">de 2,8L</div>
                          </div>
                        </div>
                        <div className="sumDonutBtns">
                          <span className="sumDonutBtn">−</span>
                          <span className="sumDonutBtn">+</span>
                        </div>
                      </div>
                    </div>

                    <div className="sumWeightCard">
                      <div className="sumWeightLabel">CONTROLE DE PESO</div>
                      <div className="sumWeightRow">
                        <div className="sumWeightBtn sumWeightBtnGhost">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </div>
                        <div className="sumWeightNum">
                          <span>78,4</span><em>kg</em>
                        </div>
                        <div className="sumWeightBtn sumWeightBtnDark">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                        </div>
                      </div>
                      <div className="sumWeightBar">
                        <div className="sumWeightFill" style={{ width: '53%', background: '#4CA0DF' }}></div>
                      </div>
                      <div className="sumWeightMeta">
                        <span>ATUAL</span>
                        <span>META: 70KG</span>
                      </div>
                    </div>

                    <div className="sumSmartLog">
                      <div className="sumSmartIcon" style={{ background: '#4CA0DF1A', color: '#4CA0DF' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
                        </svg>
                      </div>
                      <div className="sumSmartText">
                        <div className="sumSmartTitle">Registro Inteligente</div>
                        <div className="sumSmartSub">Descreva o que comeu para a IA</div>
                      </div>
                      <div className="sumSmartChev">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </div>
                    </div>

                    <div className="sumSectionHead">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 2v5a4 4 0 0 0 8 0V2" />
                        <path d="M7 2v20" />
                        <path d="M15 2v20" />
                        <path d="M15 2h1a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5h-1" />
                      </svg>
                      <span>Refeições</span>
                    </div>

                    <div className="sumMealCard">
                      <div className="sumMealIcon" style={{ background: '#FF9500' }}>☕</div>
                      <div className="sumMealMid">
                        <div className="sumMealName">Café da manhã</div>
                        <div className="sumMealCal"><strong style={{ color: '#FF9500' }}>412</strong> / 360 kcal</div>
                        <div className="sumMealBar"><div className="sumMealFill" style={{ width: '100%', background: '#FF9500' }}></div></div>
                      </div>
                      <span className="sumMealPlus">+</span>
                    </div>

                    <div className="sumMealCard">
                      <div className="sumMealIcon" style={{ background: '#EAB308' }}>🥗</div>
                      <div className="sumMealMid">
                        <div className="sumMealName">Almoço</div>
                        <div className="sumMealCal"><strong style={{ color: '#EAB308' }}>580</strong> / 630 kcal</div>
                        <div className="sumMealBar"><div className="sumMealFill" style={{ width: '92%', background: '#EAB308' }}></div></div>
                      </div>
                      <span className="sumMealPlus">+</span>
                    </div>

                    <div className="sumMealCard">
                      <div className="sumMealIcon" style={{ background: '#AF52DE' }}>🍽️</div>
                      <div className="sumMealMid">
                        <div className="sumMealName">Jantar</div>
                        <div className="sumMealCal"><strong style={{ color: '#AF52DE' }}>0</strong> / 540 kcal</div>
                        <div className="sumMealBar"><div className="sumMealFill" style={{ width: '0%', background: '#AF52DE' }}></div></div>
                      </div>
                      <span className="sumMealPlus">+</span>
                    </div>
                  </div>

                  <div className="sumTabbar">
                    <div className="sumTab sumTabActive" style={{ color: '#4CA0DF' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                        <rect width="7" height="7" x="3" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="3" rx="1" />
                        <rect width="7" height="7" x="3" y="14" rx="1" />
                        <rect width="7" height="7" x="14" y="14" rx="1" />
                      </svg>
                      <span>Resumo</span>
                    </div>
                    <div className="sumTab">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                        <path d="M3 2v5a4 4 0 0 0 8 0V2" />
                        <path d="M7 2v20" />
                        <path d="M15 2v20" />
                        <path d="M15 2h1a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5h-1" />
                      </svg>
                      <span>Dieta</span>
                    </div>
                    <div className="sumTab">
                      <svg viewBox="0 0 512 512" fill="currentColor" width="20" height="20">
                        <rect x="110" y="228" width="292" height="56" />
                        <rect x="110" y="96" width="56" height="320" rx="28" />
                        <rect x="46" y="146" width="48" height="220" rx="24" />
                        <rect x="346" y="96" width="56" height="320" rx="28" />
                        <rect x="418" y="146" width="48" height="220" rx="24" />
                      </svg>
                      <span>Treino</span>
                    </div>
                    <div className="sumTab">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                        <line x1="12" y1="20" x2="12" y2="10" />
                        <line x1="18" y1="20" x2="18" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="16" />
                      </svg>
                      <span>Progresso</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="step-label">
              <b>1</b> O app FitMind
            </div>
            <h2 id="app-t">Seu tratamento inteiro no bolso</h2>
            <p className="desc">
              O companheiro diário de quem usa caneta GLP-1. As receitas do ebook viram rotina quando você vê, todo dia, quanto já comeu e bebeu.
            </p>
            <ul>
              <li>Registro de refeições por foto, com proteína estimada</li>
              <li>Metas de proteína e água com lembretes</li>
              <li>Lembrete de dose e registro de sintomas</li>
              <li>Controle de peso e histórico para entender o peso travado</li>
            </ul>
            <div className="app-price">
              <div>
                <div className="lbl">Assinatura do app FitMind</div>
                <div className="val">
                  <small>R$</small>
                  <b>49</b>
                  <span>/mês</span>
                </div>
                <div className="perday">R$ 1,63 por dia. Menos de 5% do que você investe na caneta.</div>
              </div>
              <a href="#" className="btn" onClick={handleAppOnly}>
                Assinar o FitMind
              </a>
            </div>
          </div>
        </section>

        {/* STEP 2 DIVIDER */}
        <div className="divider">
          <div className="step-label">
            <b>2</b> Quer ir além do app?
          </div>
          <h2>Consultoria nutricional com o Allan</h2>
          <p>Para quem quer um plano montado por um profissional, com dieta e cardápios feitos para o próprio corpo.</p>
        </div>

        {/* GAP */}
        <div className="gap">
          <div className="big">29 dias</div>
          <h2>é o tempo que o seu tratamento fica sem ninguém olhando</h2>
          <p>
            No modelo tradicional, você vê o nutricionista uma vez por mês e o resto do mês é por sua conta. No FitMind, seus registros de proteína, água e sintomas ficam no app, e o nutricionista acompanha o que acontece entre uma consulta e outra.
          </p>
        </div>

        {/* ALLAN SECTION */}
        <section className="allan" aria-labelledby="allan-t">
          <div className="photo">
            <svg className="deco" viewBox="0 0 260 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <circle cx="130" cy="120" r="92" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="1.4" />
              <circle cx="130" cy="120" r="128" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.2" />
              <circle cx="130" cy="120" r="166" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1" />
              <path d="M-10 250 H70 L86 222 L100 272 L116 196 L132 250 H270" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <img src="/allan-stachuk.webp" alt="Allan Stachuk, nutricionista parceiro do FitMind" loading="lazy" />
            <div className="crn-card">
              Registro profissional<b>CRN 13901</b>
            </div>
          </div>
          <div className="txt">
            <h2 id="allan-t">Allan Stachuk</h2>
            <p className="crn">Nutricionista parceiro, CRN 13901</p>
            <ul>
              <li>Consulta e avaliação inicial completas</li>
              <li>Plano alimentar personalizado</li>
              <li>Cardápios próprios para você</li>
              <li>Ajustes conforme sua evolução</li>
              <li>Mensagens diretas pelo WhatsApp</li>
              <li>100% online, sem sair de casa</li>
            </ul>
          </div>
        </section>

        {/* PLANS SECTION */}
        <section className="plans" aria-labelledby="plans-t">
          <h2 id="plans-t">Planos da consultoria com o Allan</h2>
          <p className="sub">Todos incluem consulta, dieta personalizada e atendimento online.</p>
          <p className="plans-note">
            <b>Atenção:</b> os valores abaixo são da <b>consultoria nutricional com Allan Stachuk</b>. Eles não são o preço do app. A assinatura do app FitMind é a do passo 1, R$ 49/mês.
          </p>

          <div className="plan-grid" role="radiogroup" aria-label="Planos da consultoria com o Allan">
            <button
              className="plan"
              role="radio"
              aria-checked={selectedPlan === 'mensal'}
              data-plan="mensal"
              onClick={() => handleSelectPlan('mensal')}
              onKeyDown={(e) => handleKeyDownPlan(e, 'mensal')}
            >
              <div className="name">
                Mensal <span className="radio"></span>
              </div>
              <div className="kind">Consultoria com o Allan</div>
              <div className="price">
                <small>R$</small>
                <b>197</b>
              </div>
              <div className="tot">por mês</div>
              <span className="day">R$ 6,57 por dia</span>
            </button>

            <button
              className="plan"
              role="radio"
              aria-checked={selectedPlan === 'trimestral'}
              data-plan="trimestral"
              onClick={() => handleSelectPlan('trimestral')}
              onKeyDown={(e) => handleKeyDownPlan(e, 'trimestral')}
            >
              <span className="badge">Mais escolhido</span>
              <div className="name">
                Trimestral <span className="radio"></span>
              </div>
              <div className="kind">Consultoria com o Allan</div>
              <div className="price">
                <small>3x R$</small>
                <b>187</b>
              </div>
              <div className="tot">Total R$ 561 · 3 meses</div>
              <span className="day">R$ 6,23 por dia</span>
            </button>

            <button
              className="plan"
              role="radio"
              aria-checked={selectedPlan === 'semestral'}
              data-plan="semestral"
              onClick={() => handleSelectPlan('semestral')}
              onKeyDown={(e) => handleKeyDownPlan(e, 'semestral')}
            >
              <span className="badge eco">Maior economia</span>
              <div className="name">
                Semestral <span className="radio"></span>
              </div>
              <div className="kind">Consultoria com o Allan</div>
              <div className="price">
                <small>3x R$</small>
                <b>327</b>
              </div>
              <div className="tot">Total R$ 981 · 6 meses</div>
              <span className="day">R$ 5,45 por dia</span>
              <div className="save">Economia de R$ 201 vs. mensal</div>
            </button>
          </div>

          <div className="cta-box">
            <a href="#" className="btn" onClick={handleBuyPlan}>
              {PLAN_LABELS[selectedPlan]}
            </a>
            <p className="fine">
              Para comparar: a caneta custa em média R$ 33 por dia. A consultoria custa a partir de R$ 5,45.
            </p>
          </div>
        </section>

        <div className="alt">
          <a href="#" className="no" onClick={handleNoThanks}>
            Não, obrigado. Vou seguir só com o ebook por enquanto.
          </a>
        </div>
      </main>

      <footer className="upsell-footer">
        <div className="wrap-upsell">
          © FitMind Health · fitmindhealth.com.br · O acompanhamento nutricional não substitui o acompanhamento médico do seu tratamento.
        </div>
      </footer>
    </div>
  );
};

export default EbookUpsellPage;
