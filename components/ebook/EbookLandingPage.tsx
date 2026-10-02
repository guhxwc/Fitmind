import React, { useState, useEffect, useRef } from 'react';
import './ebook.css';
import { startEbookCheckout, trackEvent } from './ebookConfig';
import { useEbookTracking, ebookState, ebookTrack } from './ebookTracking';
import { EbookCancelPoll } from './EbookCancelPoll';
import { useEbookFontsAndMeta } from './useEbookFontsAndMeta';

interface QuestionOption {
  t: string;
  e: string;
  v: string | number;
}

interface Question {
  id: string;
  q: string;
  sub?: string;
  opts: QuestionOption[];
}

const QUESTIONS: Question[] = [
  {
    id: 'tempo',
    q: 'Há quanto tempo você usa a caneta?',
    opts: [
      { t: 'Ainda vou começar', e: '🗓️', v: 'antes' },
      { t: 'Menos de 1 mês', e: '🌱', v: 'inicio' },
      { t: 'De 1 a 6 meses', e: '📈', v: 'meio' },
      { t: 'Mais de 6 meses', e: '🏁', v: 'longo' }
    ]
  },
  {
    id: 'refeicoes',
    q: 'Em quantas refeições do dia você come proteína de verdade?',
    sub: 'Frango, carne, ovo, peixe, iogurte, queijo',
    opts: [
      { t: 'Em 1 ou nenhuma', e: '🍽️', v: 3 },
      { t: 'Em 2', e: '🥚', v: 2 },
      { t: 'Em 3 ou mais', e: '💪', v: 0 },
      { t: 'Sinceramente, não sei', e: '🤷', v: 2 }
    ]
  },
  {
    id: 'estomago',
    q: 'Como anda o seu estômago?',
    opts: [
      { t: 'Tenho enjoo com frequência', e: '🤢', v: 'enjoo' },
      { t: 'Encho com poucas garfadas', e: '🥄', v: 'cheio' },
      { t: 'Esqueço de comer, não sinto fome', e: '⏰', v: 'esquece' },
      { t: 'Está tudo tranquilo', e: '🙂', v: 'ok' }
    ]
  },
  {
    id: 'medo',
    q: 'O que mais te preocupa agora?',
    opts: [
      { t: 'Perder músculo e ficar flácida(o)', e: '🏋️', v: 'musculo' },
      { t: 'Queda de cabelo e cansaço', e: '💇', v: 'cabelo' },
      { t: 'Peso travado', e: '⚖️', v: 'travado' },
      { t: 'Recuperar o peso quando parar', e: '🔁', v: 'efeito' }
    ]
  },
  {
    id: 'cozinha',
    q: 'E na cozinha, você é:',
    opts: [
      { t: 'Sem tempo nenhum', e: '⚡', v: 'semtempo' },
      { t: 'Cozinho o básico', e: '🍳', v: 'basico' },
      { t: 'Gosto de cozinhar', e: '👩‍🍳', v: 'gosta' }
    ]
  }
];

export const EbookLandingPage: React.FC = () => {
  useEbookTracking('landing');

  useEbookFontsAndMeta({
    title: 'Prato Cheio de Proteína | 38 receitas para quem usa caneta GLP-1'
  });

  const [step, setStep] = useState<number>(-1); // -1: intro, 0..4: questions, 5: loading, 6: result
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [meterPercent, setMeterPercent] = useState<number>(0);
  const [showSticky, setShowSticky] = useState<boolean>(false);
  const heroRef = useRef<HTMLElement | null>(null);

  const loadingMessages = [
    'Analisando suas respostas…',
    'Cruzando com o seu perfil…',
    'Separando as receitas certas para você…'
  ];

  // Sticky CTA scroll detection (garante aparição fixa ao rolar em qualquer tela)
  useEffect(() => {
    const handleScroll = () => {
      const root = document.getElementById('root');
      const scrollTop = root ? root.scrollTop : (window.scrollY || document.documentElement.scrollTop || 0);
      const heroEl = heroRef.current;
      const heroHeight = heroEl ? heroEl.offsetHeight : 450;
      // Ao rolar além de metade do hero (ou 280px), ativa o botão fixo
      setShowSticky(scrollTop > Math.min(heroHeight * 0.5, 280));
    };

    handleScroll();

    // No app, quem rola é o #root; o listener com capture no document captura a rolagem de forma garantida
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Loading animation transition
  useEffect(() => {
    if (step === 5) {
      setLoadingMsgIndex(0);
      const iv = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 700);

      const to = setTimeout(() => {
        clearInterval(iv);
        setStep(6);
      }, 2100);

      return () => {
        clearInterval(iv);
        clearTimeout(to);
      };
    }
  }, [step]);

  // Result meter animation
  useEffect(() => {
    if (step === 6) {
      const s = computeScore();
      const level = s >= 4 ? 'alto' : s >= 2 ? 'moderado' : 'baixo';
      const targetPos = level === 'alto' ? 88 : level === 'moderado' ? 55 : 18;

      trackEvent('quiz_complete', { perfil: level, ...answers });

      const raf = requestAnimationFrame(() => {
        setMeterPercent(targetPos);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [step]);

  // Rastreio do quiz: cada pergunta vista e o resultado
  useEffect(() => {
    if (step >= 0 && step <= 4) {
      ebookState.quizStarted = true;
      ebookState.quizStep = step;
      ebookState.questionShownAt = Date.now();
      ebookTrack('quiz_step_view', { step: step + 1, question_id: QUESTIONS[step]?.id });
    } else if (step === 6) {
      ebookState.quizCompleted = true;
    }
  }, [step]);

  const handleStartQuiz = () => {
    trackEvent('quiz_start');
    ebookState.quizStarted = true;
    setStep(0);
  };

  const handleSelectOption = (questionId: string, val: any) => {
    ebookTrack('quiz_answer', {
      step: step + 1,
      question_id: questionId,
      answer: String(val),
      seconds_on_question: ebookState.questionShownAt ? Math.round((Date.now() - ebookState.questionShownAt) / 100) / 10 : null,
    });
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    setTimeout(() => {
      setStep((curr) => {
        const next = curr + 1;
        if (next >= QUESTIONS.length) {
          return 5; // loading
        }
        return next;
      });
    }, 220);
  };

  const handleBack = () => {
    ebookTrack('quiz_back', { from_step: step + 1 });
    setStep((curr) => Math.max(0, curr - 1));
  };

  const computeScore = (): number => {
    let s = Number(answers.refeicoes || 0);
    if (answers.estomago === 'enjoo' || answers.estomago === 'cheio' || answers.estomago === 'esquece') {
      s += 2;
    }
    if (answers.tempo === 'inicio' || answers.tempo === 'longo') {
      s += 1;
    }
    return s;
  };

  const [checkoutState, setCheckoutState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [checkoutError, setCheckoutError] = useState<string>('');
  const [checkoutCanceled, setCheckoutCanceled] = useState<boolean>(() => {
    try { return new URLSearchParams(window.location.search).get('checkout') === 'cancelado'; } catch { return false; }
  });

  const handleCheckoutClick = async (e: React.MouseEvent, origin: string) => {
    e.preventDefault();
    if (checkoutState === 'loading') return;
    const s = computeScore();
    const level = step === 6 ? (s >= 4 ? 'alto' : s >= 2 ? 'moderado' : 'baixo') : null;
    trackEvent('checkout_click', { origem: origin, perfil: level });
    ebookState.clickedBuy = true;
    ebookState.checkoutPhase = 'creating';
    setCheckoutCanceled(false);
    setCheckoutState('loading');
    try {
      await startEbookCheckout({ quizProfile: level });
      // o redirecionamento acontece dentro de startEbookCheckout
    } catch (err: any) {
      setCheckoutError(err?.message || 'Não foi possível abrir o pagamento. Tente novamente.');
      setCheckoutState('error');
      ebookState.checkoutPhase = 'error';
      trackEvent('checkout_error', { origem: origin });
    }
  };

  // Se o usuário voltar do Stripe pelo botão "voltar" do navegador, destrava os botões
  useEffect(() => {
    const onShow = () => { setCheckoutState('idle'); ebookState.checkoutPhase = 'idle'; };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  // Profile data
  const s = computeScore();
  const level = s >= 4 ? 'alto' : s >= 2 ? 'moderado' : 'baixo';
  const profileInfo = {
    alto: {
      tag: 'Risco alto de faltar proteína',
      bg: '#FBE3E2',
      c: '#A33A37',
      title: 'Seu prato está leve demais',
      desc: 'Pelas suas respostas, a proteína provavelmente está bem abaixo do que o seu corpo precisa agora. É o cenário em que o tratamento leva músculo, energia e cabelo junto com a gordura.'
    },
    moderado: {
      tag: 'Risco moderado',
      bg: '#FCF1DC',
      c: '#8A5F10',
      title: 'No caminho, mas com lacunas',
      desc: 'Você já acerta em parte do dia, mas a proteína fica irregular. Pequenos ajustes no café da manhã e no lanche costumam fechar essa conta.'
    },
    baixo: {
      tag: 'Risco baixo',
      bg: '#DDF2E8',
      c: '#1F6E4A',
      title: 'Boa base. Agora é constância',
      desc: 'Você está fazendo muita coisa certa. O desafio é não cair na monotonia e manter isso nos dias de enjoo e de correria.'
    }
  }[level];

  const getRecommendations = () => {
    const recs: string[] = [];
    const estMap: Record<string, string> = {
      enjoo: '<b>Cardápio do dia difícil</b> e receitas geladas (picolé proteico, shake de gengibre) para comer mesmo nos dias de enjoo.',
      cheio: '<b>Regra da proteína primeiro</b> e receitas pequenas com 20 a 30 g de proteína por porção, para render mais em poucas garfadas.',
      esquece: '<b>Cardápio de 7 dias pronto</b> para você não depender da fome para lembrar de comer.',
      ok: '<b>Tabela rápida de proteína</b> para bater sua meta sem precisar pensar.'
    };
    if (answers.estomago && estMap[answers.estomago]) recs.push(estMap[answers.estomago]);

    const medoMap: Record<string, string> = {
      musculo: '<b>Proteína + treino de força</b>: a dupla que segura o músculo enquanto a gordura vai embora (dicas 1 e 10).',
      cabelo: '<b>Proteína distribuída no dia</b> e o que conversar com seu médico sobre exames (dicas 1 e 12).',
      travado: '<b>O que checar quando o peso trava</b> antes de se desesperar (dica 11).',
      efeito: '<b>Receitas que viram hábito</b>: comida normal, de mercado, para manter depois do tratamento.'
    };
    if (answers.medo && medoMap[answers.medo]) recs.push(medoMap[answers.medo]);

    const cozMap: Record<string, string> = {
      semtempo: '<b>Receitas de até 10 minutos</b> e o roteiro de marmitas: 1 hora no domingo resolve a semana.',
      basico: '<b>Receitas com 4 a 6 ingredientes</b> e passo a passo curto, sem técnica difícil.',
      gosta: '<b>Escondidinho, moqueca light e estrogonofe fit</b> para comer bem sem sair da linha.'
    };
    if (answers.cozinha && cozMap[answers.cozinha]) recs.push(cozMap[answers.cozinha]);

    return recs;
  };

  return (
    <div className="fm-ebook">
      {/* TOP BAR */}
      <header className="top">
        <div className="wrap">
          <img src="/logo-fitmind.webp" alt="FitMind" width="93" height="34" />
          <span>Guia prático para quem usa caneta GLP-1</span>
        </div>
      </header>

      {/* HERO + QUIZ */}
      <section className="hero" ref={heroRef}>
        <div className="wrap hero-grid">
          <div>
            <h1>Você come pouco. Mas está comendo proteína suficiente?</h1>
            <p className="lead">
              Com a fome baixa, o prato encolhe e a proteína some junto. O{' '}
              <strong>Prato Cheio de Proteína</strong> traz 38 receitas simples, cardápio de 7 dias e
              um plano para os dias de enjoo.{' '}
              <span className="hero-price-tag">
                De <s className="price-old">R$ 34</s> por apenas <strong>R$ 9,99.</strong>
              </span>
            </p>
            <div className="hero-ctas">
              <a
                href="#quiz"
                className="btn btn-buy"
                onClick={(e) => {
                  if (step < 0) handleStartQuiz();
                }}
              >
                Fazer o teste de 30 segundos
              </a>
              <a href="#oferta" className="btn btn-ghost">
                Ver o ebook
              </a>
            </div>
            <div className="hero-meta">
              <span>38 receitas testáveis em casa</span>
              <span>Ingredientes de mercado</span>
              <span>Acesso imediato</span>
            </div>
          </div>

          {/* QUIZ CARD */}
          <div className="quiz" id="quiz" aria-live="polite">
            {step === -1 && (
              <div className="q-intro">
                <h3>Teste rápido: quanta proteína falta no seu prato?</h3>
                <p>
                  Responda 5 perguntas rápidas e veja seu nível de risco de faltar proteína, com
                  recomendações para o seu caso.
                </p>
                <ul>
                  <li>
                    <b>1.</b> Leva menos de 30 segundos
                  </li>
                  <li>
                    <b>2.</b> Resultado na hora, sem cadastro
                  </li>
                  <li>
                    <b>3.</b> Recomendações do ebook para o seu perfil
                  </li>
                </ul>
                <button className="btn btn-buy" onClick={handleStartQuiz}>
                  Começar o teste
                </button>
              </div>
            )}

            {step >= 0 && step < QUESTIONS.length && (
              <>
                <div className="q-progress">
                  <i style={{ width: `${Math.round(((step + 1) / QUESTIONS.length) * 100)}%` }}></i>
                </div>
                <div className="q-step">
                  Pergunta {step + 1} de {QUESTIONS.length}
                </div>
                <div className="q-title">
                  {QUESTIONS[step].q}
                  {QUESTIONS[step].sub && (
                    <div style={{ font: '500 14px var(--body)', color: 'var(--muted)', marginTop: '6px' }}>
                      {QUESTIONS[step].sub}
                    </div>
                  )}
                </div>
                <div className="q-opts">
                  {QUESTIONS[step].opts.map((opt, i) => (
                    <button
                      key={i}
                      className={`q-opt ${answers[QUESTIONS[step].id] === opt.v ? 'picked' : ''}`}
                      onClick={() => handleSelectOption(QUESTIONS[step].id, opt.v)}
                    >
                      <span className="emo" aria-hidden="true">
                        {opt.e}
                      </span>
                      {opt.t}
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button className="q-back" onClick={handleBack}>
                    ← Voltar
                  </button>
                )}
              </>
            )}

            {step === 5 && (
              <div className="q-loading">
                <div className="ring"></div>
                <p>{loadingMessages[loadingMsgIndex]}</p>
              </div>
            )}

            {step === 6 && (
              <>
                <span className="res-tag" style={{ background: profileInfo.bg, color: profileInfo.c }}>
                  {profileInfo.tag}
                </span>
                <div className="res-title">{profileInfo.title}</div>
                <p className="res-desc">{profileInfo.desc}</p>
                <div className="meter">
                  <div className="meter-bar">
                    <i style={{ left: `${meterPercent}%` }}></i>
                  </div>
                  <div className="meter-lbl">
                    <span>Baixo</span>
                    <span>Moderado</span>
                    <span>Alto</span>
                  </div>
                </div>
                <ul className="res-list">
                  {getRecommendations().map((rec, i) => (
                    <li key={i} dangerouslySetInnerHTML={{ __html: rec }} />
                  ))}
                </ul>
                <a
                  href="#"
                  className="btn btn-buy"
                  onClick={(e) => handleCheckoutClick(e, 'quiz_resultado')}
                >
                  Quero as 38 receitas por R$ 9,99
                </a>
                <p className="res-note">Resultado orientativo, não é avaliação nutricional.</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* DOR */}
      <section className="pain">
        <div className="wrap pain-grid">
          <div>
            <div className="stat">9 em 10</div>
            <p className="stat-cap">pessoas usando GLP-1 podem não estar batendo a meta diária de proteína.</p>
            <p className="stat-src">
              Análise de dados de mais de 5.700 dias de alimentação, apresentada no Congresso Europeu de Obesidade.
            </p>
          </div>
          <div>
            <h2>A caneta tira a fome. Ela não escolhe o que vai no seu prato.</h2>
            <div className="pain-list">
              <div className="pain-item">
                <div className="ic">😮‍💨</div>
                <div>
                  <h3>Cansaço que não passa</h3>
                  <p>Pouca comida e pouca proteína deixam o dia pesado, mesmo com o peso descendo.</p>
                </div>
              </div>
              <div className="pain-item">
                <div className="ic">💇‍♀️</div>
                <div>
                  <h3>Cabelo caindo e pele flácida</h3>
                  <p>Sinais comuns de quem perde peso rápido sem proteína suficiente.</p>
                </div>
              </div>
              <div className="pain-item">
                <div className="ic">⚖️</div>
                <div>
                  <h3>Peso travado</h3>
                  <p>Semanas sem mexer na balança e nenhuma pista do motivo.</p>
                </div>
              </div>
              <div className="pain-item">
                <div className="ic">🤢</div>
                <div>
                  <h3>Enjoo depois de comer</h3>
                  <p>Fritura, gordura e prato grande viram mal-estar. E aí a pessoa para de comer de vez.</p>
                </div>
              </div>
            </div>
            <p className="pain-turn">
              O objetivo não é só perder peso. É perder gordura e manter o músculo. Isso começa no prato.
            </p>
          </div>
        </div>
      </section>

      {/* DENTRO */}
      <section className="inside">
        <div className="wrap">
          <h2>Tudo que você precisa para montar o prato certo</h2>
          <p className="sub">
            Receitas pensadas para quem enche rápido: porções pequenas, muita proteína e nada de ingrediente difícil de achar.
          </p>
          <div className="shelf">
            <div className="col">
              <div className="num">10</div>
              <h3>Cafés da manhã</h3>
              <ul>
                <li>Crepioca de frango</li>
                <li>Panqueca de banana e aveia</li>
                <li>Overnight proteico</li>
                <li>Muffin de ovo para a semana</li>
              </ul>
            </div>
            <div className="col">
              <div className="num">10</div>
              <h3>Almoços</h3>
              <ul>
                <li>Estrogonofe fit</li>
                <li>Escondidinho de mandioquinha</li>
                <li>Frango xadrez light</li>
                <li>Tilápia assada com legumes</li>
              </ul>
            </div>
            <div className="col">
              <div className="num">8</div>
              <h3>Jantares</h3>
              <ul>
                <li>Creme de abóbora com frango</li>
                <li>Pizza de frigideira</li>
                <li>Moqueca light</li>
                <li>Canja proteica</li>
              </ul>
            </div>
            <div className="col">
              <div className="num">10</div>
              <h3>Lanches e dias difíceis</h3>
              <ul>
                <li>Brigadeiro proteico</li>
                <li>Picolé de iogurte</li>
                <li>Shake de gengibre e limão</li>
                <li>Gelatina proteica</li>
              </ul>
            </div>
          </div>
          <div className="extras">
            <div className="extra">
              <h3>Cardápio de 7 dias</h3>
              <p>Café, almoço, lanche e jantar da semana inteira, já montados com as receitas do ebook.</p>
            </div>
            <div className="extra">
              <h3>Cardápio do dia difícil</h3>
              <p>O que comer no enjoo e logo depois da aplicação: leve, gelado e sem gordura.</p>
            </div>
            <div className="extra">
              <h3>12 dicas de ouro + checklist</h3>
              <p>Tabela de proteína por alimento, lista de compras e marmitas de domingo em 1 hora.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PREVIEW */}
      <section className="preview">
        <div className="wrap">
          <div className="prev-grid">
            <div>
              <h2>Receita de verdade, com proteína contada</h2>
              <p className="sub">
                Toda receita mostra rendimento, tempo e quanto de proteína tem na porção. Você sabe exatamente o que está comendo.
              </p>
            </div>
            <article className="recipe" aria-label="Exemplo de receita do ebook">
              <div className="recipe-head">
                <h3>Crepioca de frango</h3>
                <div className="facts">
                  <span>1 porção</span>
                  <span>10 min</span>
                  <span className="p">~26 g de proteína</span>
                </div>
              </div>
              <div className="recipe-body">
                <div>
                  <h4>Ingredientes</h4>
                  <ul>
                    <li>1 ovo</li>
                    <li>2 col. (sopa) de goma de tapioca</li>
                    <li>1 col. (sopa) de requeijão light</li>
                    <li>60 g de frango desfiado</li>
                  </ul>
                </div>
                <div>
                  <h4>Preparo</h4>
                  <ol>
                    <li>Bata ovo, tapioca e requeijão.</li>
                    <li>Despeje na frigideira quente e vire quando firmar.</li>
                    <li>Recheie com o frango e dobre.</li>
                  </ol>
                </div>
              </div>
              <div className="recipe-more">
                <p className="blur" aria-hidden="true">
                  Panqueca de banana, aveia e whey · Overnight proteico · Omelete de forno com espinafre · Mingau proteico · Muffin de ovo
                </p>
                <div className="lock">+ 37 receitas no ebook completo</div>
              </div>
            </article>
          </div>

          <div className="menu" role="region" aria-label="Prévia do cardápio de 7 dias" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Dia</th>
                  <th>Café da manhã</th>
                  <th>Almoço</th>
                  <th>Lanche</th>
                  <th>Jantar</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Segunda</b></td>
                  <td>Omelete de forno</td>
                  <td>Frango cremoso</td>
                  <td>Iogurte com fruta</td>
                  <td>Creme de abóbora com frango</td>
                </tr>
                <tr>
                  <td><b>Terça</b></td>
                  <td>Overnight proteico</td>
                  <td>Tilápia com legumes</td>
                  <td>Ovos recheados</td>
                  <td>Wrap de frango</td>
                </tr>
                <tr className="hide" aria-hidden="true">
                  <td><b>Quarta</b></td>
                  <td>Crepioca de frango</td>
                  <td>Bowl de carne e feijão</td>
                  <td>Pudim de chia</td>
                  <td>Abobrinha recheada</td>
                </tr>
                <tr className="hide" aria-hidden="true">
                  <td><b>Quinta</b></td>
                  <td>Mingau proteico</td>
                  <td>Estrogonofe fit</td>
                  <td>Pasta de atum</td>
                  <td>Canja proteica</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* PARA QUEM */}
      <section>
        <div className="wrap who-grid">
          <div className="who yes">
            <h3>É para você se</h3>
            <ul>
              <li>Usa ou vai começar a usar caneta GLP-1</li>
              <li>Enche com poucas garfadas e não sabe o que priorizar</li>
              <li>Quer perder gordura sem perder músculo, cabelo e disposição</li>
              <li>Quer receita rápida, com ingrediente de mercado</li>
              <li>Tem dias de enjoo e não sabe o que comer neles</li>
            </ul>
          </div>
          <div className="who no">
            <h3>Não é para você se</h3>
            <ul>
              <li>Procura dieta milagrosa ou promessa de quilos por semana</li>
              <li>Quer substituir o acompanhamento do seu médico</li>
              <li>Não pretende ir para a cozinha nem uma vez por semana</li>
            </ul>
          </div>
        </div>
      </section>

      {/* AUTORIDADE */}
      <section className="auth">
        <div className="wrap auth-grid">
          <div className="avatar">
            <img
              src="/allan-stachuk.webp"
              alt="Allan Stachuk, nutricionista parceiro do FitMind"
              loading="lazy"
            />
          </div>
          <div>
            <h2>Feito por quem acompanha o tratamento todos os dias</h2>
            <p>
              O Prato Cheio de Proteína foi criado pela equipe do FitMind, o app brasileiro feito para quem usa caneta GLP-1. A gente vê de perto onde as pessoas travam: proteína baixa, pouca água e nenhuma ideia do que comer nos dias ruins. Este guia resolve essa parte.
            </p>
            <span className="cred">Com nutricionista parceiro: Allan Stachuk, CRN 13901</span>
          </div>
        </div>
      </section>

      {/* OFERTA */}
      <section className="offer" id="oferta">
        <div className="wrap">
          <div className="card">
            <div>
              <h2>Coloque em perspectiva</h2>
              <div className="anchor">
                <div>
                  <span>Caneta GLP-1, por mês</span>
                  <span>~R$ 1.000</span>
                </div>
                <div>
                  <span>Uma consulta nutricional particular</span>
                  <span>R$ 150 a 300</span>
                </div>
                <div>
                  <span>Um lanche na rua</span>
                  <span>R$ 25</span>
                </div>
                <div className="me">
                  <span>38 receitas + cardápios + dicas</span>
                  <span>
                    <s className="price-old">R$ 34</s> R$ 9,99
                  </span>
                </div>
              </div>
              <p style={{ marginTop: '22px', color: 'var(--muted)' }}>
                Você já investe no tratamento. Garantir que a comida acompanhe custa menos que um lanche.
              </p>
            </div>
            <div className="price-box">
              <div className="discount-pill">70% DE DESCONTO</div>
              <p className="was">
                De <s className="price-old">R$ 34,00</s> por apenas
              </p>
              <div className="price">
                <small>R$</small>
                <b>9</b>
                <small className="cents">,99</small>
              </div>
              <p className="per">Dá menos de R$ 0,26 por receita</p>
              <a
                href="#"
                className="btn btn-buy"
                onClick={(e) => handleCheckoutClick(e, 'offer_box')}
              >
                Quero o Prato Cheio de Proteína
              </a>
              <div className="pay">
                <span>Pix</span>
                <span>Cartão</span>
                <span>Entrega por e-mail na hora</span>
              </div>
              <div className="guarantee">
                <div className="seal">7d</div>
                <p>
                  <b>Garantia de 7 dias.</b> Não gostou? Peça o reembolso dentro de 7 dias e devolvemos 100% do valor. Sem pergunta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq">
        <div className="narrow">
          <h2>Perguntas frequentes</h2>
          <details>
            <summary>Como recebo o ebook?</summary>
            <p>Logo depois da confirmação do pagamento, você recebe o link de acesso no e-mail. No Pix, costuma chegar em poucos minutos.</p>
          </details>
          <details>
            <summary>Serve para qualquer caneta GLP-1?</summary>
            <p>Sim. As receitas e dicas foram pensadas para quem tem a fome reduzida e o estômago mais lento, que é o efeito comum dessas medicações.</p>
          </details>
          <details>
            <summary>Preciso de whey protein?</summary>
            <p>Não. Algumas receitas usam whey como opção para aumentar a proteína, mas a maioria usa só frango, ovo, carne, peixe, iogurte e queijos.</p>
          </details>
          <details>
            <summary>Substitui meu nutricionista?</summary>
            <p>Não. O ebook é um guia prático e educativo. Se você ainda não tem acompanhamento, dentro do FitMind existe a opção de consulta online com nutricionista.</p>
          </details>
          <details>
            <summary>Consigo ler no celular?</summary>
            <p>Sim. O ebook abre no celular, no computador e pode ser impresso.</p>
          </details>
          <details>
            <summary>E se eu não gostar?</summary>
            <p>Você tem 7 dias de garantia. Pediu o reembolso dentro do prazo, recebe o valor de volta.</p>
          </details>
        </div>
      </section>

      {/* FINAL */}
      <section className="final">
        <div className="wrap">
          <h2>Mais proteína no prato. Sem precisar comer mais.</h2>
          <p>
            38 receitas, cardápio de 7 dias, cardápio para os dias de enjoo e as 12 dicas que mais fazem diferença. De <s className="price-old">R$ 34</s> por apenas <strong>R$ 9,99</strong>, com 7 dias de garantia.
          </p>
          <a
            href="#"
            className="btn btn-buy"
            onClick={(e) => handleCheckoutClick(e, 'final_cta')}
          >
            Quero o ebook por R$ 9,99
          </a>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <span>© FitMind Health · fitmindhealth.com.br</span>
          <span>Conteúdo educativo. Não substitui orientação médica ou nutricional.</span>
        </div>
      </footer>

      {/* CHECKOUT: carregando / erro */}
      {checkoutState !== 'idle' && (
        <div className="checkout-overlay" role="dialog" aria-modal="true" aria-live="assertive">
          <div className="checkout-box">
            {checkoutState === 'loading' ? (
              <>
                <div className="ring" aria-hidden="true"></div>
                <p><b>Abrindo pagamento seguro…</b></p>
                <p className="small">Você será levado ao checkout do Stripe.</p>
              </>
            ) : (
              <>
                <p><b>{checkoutError}</b></p>
                <button className="btn btn-buy" onClick={(e) => handleCheckoutClick(e, 'retry')}>Tentar de novo</button>
                <button className="checkout-close" onClick={() => setCheckoutState('idle')}>Fechar</button>
              </>
            )}
          </div>
        </div>
      )}

      {checkoutCanceled && (
        <div className="checkout-canceled" role="status">
          <span>O pagamento não foi concluído. Seu preço de R$ 9,99 continua disponível.</span>
          <button onClick={(e) => handleCheckoutClick(e, 'cancel_banner')}>Tentar de novo</button>
          <button className="x" aria-label="Fechar aviso" onClick={() => setCheckoutCanceled(false)}>×</button>
        </div>
      )}

      {checkoutCanceled && <EbookCancelPoll />}

      {/* STICKY MOBILE */}
      <div className={`sticky ${showSticky ? 'show' : ''}`} id="sticky">
        <div className="t">
          <div className="sticky-price-row">
            <s className="price-old">R$ 34</s>
            <b>R$ 9,99</b>
          </div>
          <span>38 receitas + cardápios</span>
        </div>
        <a
          href="#"
          className="btn btn-buy"
          onClick={(e) => handleCheckoutClick(e, 'sticky_mobile')}
        >
          Comprar agora
        </a>
      </div>
    </div>
  );
};

export default EbookLandingPage;
