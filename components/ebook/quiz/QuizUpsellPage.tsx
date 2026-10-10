// Funil de upsell pós-ebook: quiz → montando o plano → prévia com partes bloqueadas → oferta R$ 49/mês.
// mode="test" (rota /ebook/quiz-teste): roda inteiro no navegador, sem backend e sem tracking.
// mode="livetest" (rota /ebook/quiz-live): backend de verdade com sessão de teste (cobra o produto de teste).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Flame, Dumbbell, Leaf, CalendarCheck, UtensilsCrossed, CircleHelp, TriangleAlert, Check, Droplet, Droplets,
  Waves, Syringe, Clock, Zap, Shuffle, Camera, Bell, ChartLine, Frown, Sun, Moon, Coffee, Lock, ChevronLeft,
  Sparkles, ShieldCheck, CreditCard, Mail, ArrowRight, BookOpen, RotateCcw, type LucideIcon,
} from 'lucide-react';
import './quiz.css';
import { useEbookFontsAndMeta } from '../useEbookFontsAndMeta';
import { QUESTIONS, FEATURE_BREAKS, OFFER, buildPlan, arr, type Answers, type IconName, type QuestionKey } from './quizContent';
import { createQuizApi, type QuizMode, type QuizStatus } from './quizApi';

const ICONS: Record<IconName, LucideIcon> = {
  flame: Flame, dumbbell: Dumbbell, leaf: Leaf, calendar: CalendarCheck, utensils: UtensilsCrossed, help: CircleHelp,
  alert: TriangleAlert, check: Check, droplet: Droplet, droplets: Droplets, waves: Waves, syringe: Syringe, clock: Clock,
  zap: Zap, shuffle: Shuffle, camera: Camera, bell: Bell, chart: ChartLine, frown: Frown, sun: Sun, moon: Moon, coffee: Coffee,
};
const Icon: React.FC<{ name: IconName; size?: number }> = ({ name, size = 22 }) => {
  const C = ICONS[name];
  return <C size={size} strokeWidth={2} />;
};

type Screen =
  | { kind: 'intro' }
  | { kind: 'question'; index: number }
  | { kind: 'break'; index: number; afterIndex: number }
  | { kind: 'processing' }
  | { kind: 'result' }
  | { kind: 'checkout_test' }
  | { kind: 'success' }
  | { kind: 'goodbye' };

const TOTAL = QUESTIONS.length;
const slide = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, x: -28, transition: { duration: 0.18 } },
};

const EXAMPLE_ANSWERS: Answers = {
  objetivo: 'manter_musculo', refeicoes: '1_2', proteina: 'nao_sei', agua: 'menos_1l',
  dificuldade: ['pouca_fome', 'esqueco_agua', 'esqueco_dose'], rotina: 'muito_corrida',
};

export const QuizUpsellPage: React.FC<{ mode?: QuizMode }> = ({ mode = 'test' }) => {
  useEbookFontsAndMeta({ title: 'Seu plano FitMind | FitMind', noindex: true });
  const api = useMemo(() => createQuizApi(mode), [mode]);
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

  const [screen, setScreen] = useState<Screen>(() => {
    const q = params.get('quiz');
    if (q === 'ok') return { kind: 'success' };
    return { kind: 'intro' };
  });
  const [answers, setAnswers] = useState<Answers>(() => (mode === 'test' && params.get('quiz') ? EXAMPLE_ANSWERS : {}));
  const [email, setEmail] = useState<string | null>(null);
  const [cameBack, setCameBack] = useState(params.get('quiz') === 'voltar');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  useEffect(() => {
    api.start(params.get('session_id'), params.get('qt')).then((r) => {
      setEmail(r.emailMasked ?? null);
      if (r.answers && Object.keys(r.answers).length) setAnswers((a) => ({ ...r.answers, ...a }));
    });
    if (params.get('quiz') === 'ok') api.trackSubscribed(params.get('sid'));
    if (params.get('quiz') === 'voltar') setScreen({ kind: 'result' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [screen.kind, (screen as any).index]);

  const plan = useMemo(() => buildPlan(answers), [answers]);

  // ── navegação ────────────────────────────────────────────────────────────
  const started = useRef(false);
  const begin = () => {
    if (started.current) return;
    started.current = true;
    api.save({ event: 'quiz_start', step: 0, consent: true });
  };

  const nextFrom = (index: number, a: Answers) => {
    const key = QUESTIONS[index].key;
    api.save({ answers: { [key]: a[key] } as Answers, step: index + 1, event: 'quiz_answer' });
    const brk = FEATURE_BREAKS.findIndex((b) => b.afterKey === key);
    if (brk >= 0) return setScreen({ kind: 'break', index: brk, afterIndex: index });
    advance(index, a);
  };

  const advance = (index: number, a: Answers) => {
    if (index + 1 < TOTAL) return setScreen({ kind: 'question', index: index + 1 });
    api.save({ answers: a, step: TOTAL, event: 'quiz_complete', complete: true });
    setScreen({ kind: 'processing' });
  };

  const back = () => {
    if (screen.kind === 'question') {
      if (screen.index <= 1) return setScreen({ kind: 'intro' }); // a pergunta 1 fica na tela inicial
      const prevKey = QUESTIONS[screen.index - 1].key;
      const brk = FEATURE_BREAKS.findIndex((b) => b.afterKey === prevKey);
      if (brk >= 0) return setScreen({ kind: 'break', index: brk, afterIndex: screen.index - 1 });
      return setScreen({ kind: 'question', index: screen.index - 1 });
    }
    if (screen.kind === 'break') return setScreen({ kind: 'question', index: screen.afterIndex });
  };

  const pick = (key: QuestionKey, value: string, multi?: boolean) => {
    if (multi) {
      const cur = arr(answers[key]);
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      setAnswers({ ...answers, [key]: next });
      return;
    }
    const next = { ...answers, [key]: value };
    setAnswers(next);
    const index = QUESTIONS.findIndex((q) => q.key === key);
    window.setTimeout(() => nextFrom(index, next), 260);
  };

  const unlock = async () => {
    setCheckoutError(null);
    api.save({ event: 'checkout_click', step: TOTAL + 2 });
    if (mode === 'test') return setScreen({ kind: 'checkout_test' });
    try {
      setLoadingCheckout(true);
      const url = await api.checkout();
      if (url) window.location.href = url;
    } catch (e: any) {
      setCheckoutError('Não conseguimos abrir o pagamento. Tente de novo em alguns segundos.');
      setLoadingCheckout(false);
    }
  };

  const decline = () => { api.save({ event: 'offer_decline', step: TOTAL + 2 }); setScreen({ kind: 'goodbye' }); };

  // ── progresso ────────────────────────────────────────────────────────────
  const progress = (() => {
    if (screen.kind === 'question') return (screen.index) / TOTAL;
    if (screen.kind === 'break') return (screen.afterIndex + 1) / TOTAL;
    if (screen.kind === 'processing') return 1;
    return 0;
  })();
  const showTop = screen.kind === 'question' || screen.kind === 'break';

  return (
    <div className="fmq">
      {mode === 'test' && <TestBar onReset={() => { setAnswers({}); setCameBack(false); setScreen({ kind: 'intro' }); }}
        onJumpResult={() => { setAnswers(EXAMPLE_ANSWERS); setScreen({ kind: 'result' }); }}
        onJumpSuccess={() => { setAnswers(EXAMPLE_ANSWERS); setScreen({ kind: 'success' }); }} />}

      {mode === 'livetest' && <div className="fmq-livebar">TESTE REAL · o pagamento cobra o produto de teste (R$ 1) · e-mail fixo do servidor</div>}

      <header className="fmq-top">
        <div className="fmq-col fmq-top-row">
          {showTop ? (
            <button className="fmq-back" onClick={back} aria-label="Voltar"><ChevronLeft size={22} /></button>
          ) : <span className="fmq-back-ph" />}
          <img src="/logo-fitmind.webp" alt="FitMind" className="fmq-logo" width={87} height={32} />
          <span className="fmq-back-ph" />
        </div>
        {showTop && (
          <div className="fmq-col">
            <div className="fmq-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
              {QUESTIONS.map((_, i) => {
                const fill = Math.min(1, Math.max(0, progress * TOTAL - i));
                return <span key={i}><i style={{ transform: `scaleX(${fill})` }} /></span>;
              })}
            </div>
          </div>
        )}
      </header>

      <main className="fmq-col fmq-main">
        <AnimatePresence mode="wait">
          {screen.kind === 'intro' && (
            <motion.section key="intro" {...slide} className="fmq-intro">
              <div className="fmq-confirm"><span className="fmq-confirm-dot"><Check size={14} strokeWidth={3} /></span>
                <span>{email ? <>Pedido confirmado. Seu ebook está a caminho de <b>{email}</b></> : <>Pedido confirmado. Seu ebook está a caminho do seu e-mail</>}</span>
              </div>

              <h1 className="fmq-h1">Sua dieta com a caneta está boa ou pode <em>melhorar ainda mais?</em></h1>
              <p className="fmq-lead">{TOTAL} perguntas rápidas. No final, você vê o que ajustar.</p>

              {(() => {
                const q = QUESTIONS[0];
                const sel = arr(answers[q.key]);
                return (
                  <div className="fmq-qcard">
                    <div className="fmq-qcard-top">
                      <span>Pergunta 1 de {TOTAL}</span>
                      <div className="fmq-mini-progress" aria-hidden>{QUESTIONS.map((_, i) => <i key={i} className={i === 0 ? 'on' : ''} />)}</div>
                    </div>
                    <h2 className="fmq-qcard-title">{q.title}</h2>
                    <div className="fmq-options" role="radiogroup" aria-label={q.title}>
                      {q.options.map((o) => {
                        const on = sel.includes(o.value);
                        return (
                          <button key={o.value} type="button" role="radio" aria-checked={on}
                            className={`fmq-opt fmq-opt-sm${on ? ' on' : ''}`} onClick={() => { begin(); pick(q.key, o.value); }}>
                            <span className="fmq-opt-ico"><Icon name={o.icon} size={20} /></span>
                            <span className="fmq-opt-txt"><b>{o.label}</b></span>
                            <span className="fmq-opt-mark">{on && <Check size={14} strokeWidth={3} />}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              <p className="fmq-micro">Leva menos de 1 minuto · sem cadastro</p>
              <p className="fmq-legal">Usamos suas respostas só para personalizar o resultado. Veja a <a href="/privacy" target="_blank" rel="noreferrer">política de privacidade</a>.</p>
            </motion.section>
          )}

          {screen.kind === 'question' && (() => {
            const q = QUESTIONS[screen.index];
            const selected = arr(answers[q.key]);
            return (
              <motion.section key={`q-${screen.index}`} {...slide} className="fmq-q">
                <p className="fmq-eyebrow">Pergunta {screen.index + 1} de {TOTAL} · {q.eyebrow}</p>
                <h2 className="fmq-h2">{q.title}</h2>
                {q.subtitle && <p className="fmq-sub">{q.subtitle}</p>}
                <div className="fmq-options" role={q.multi ? 'group' : 'radiogroup'} aria-label={q.title}>
                  {q.options.map((o) => {
                    const on = selected.includes(o.value);
                    return (
                      <button key={o.value} type="button" role={q.multi ? 'checkbox' : 'radio'} aria-checked={on}
                        className={`fmq-opt${on ? ' on' : ''}`} onClick={() => pick(q.key, o.value, q.multi)}>
                        <span className="fmq-opt-ico"><Icon name={o.icon} /></span>
                        <span className="fmq-opt-txt"><b>{o.label}</b>{o.hint && <small>{o.hint}</small>}</span>
                        <span className={`fmq-opt-mark${q.multi ? ' sq' : ''}`}>{on && <Check size={14} strokeWidth={3} />}</span>
                      </button>
                    );
                  })}
                </div>
                {q.multi && (
                  <div className="fmq-sticky">
                    <button className="fmq-btn fmq-btn-primary" disabled={!selected.length} onClick={() => nextFrom(screen.index, answers)}>
                      Continuar <ArrowRight size={20} />
                    </button>
                  </div>
                )}
              </motion.section>
            );
          })()}

          {screen.kind === 'break' && (() => {
            const b = FEATURE_BREAKS[screen.index];
            return (
              <motion.section key={`b-${screen.index}`} {...slide} className="fmq-break">
                <div className="fmq-break-art" aria-hidden>
                  {b.icon === 'camera' ? <PhotoMock /> : <ReminderMock dose={arr(answers.dificuldade).includes('esqueco_dose')} />}
                </div>
                <p className="fmq-tag"><Sparkles size={14} /> {b.tag}</p>
                <h2 className="fmq-h2">{b.title(answers)}</h2>
                <p className="fmq-sub">{b.body(answers)}</p>
                <div className="fmq-sticky">
                  <button className="fmq-btn fmq-btn-primary" onClick={() => advance(screen.afterIndex, answers)}>Continuar <ArrowRight size={20} /></button>
                </div>
              </motion.section>
            );
          })()}

          {screen.kind === 'processing' && (
            <motion.section key="proc" {...slide} className="fmq-proc">
              <Processing lines={plan.checklist} onDone={() => { api.save({ event: 'preview_view', step: TOTAL + 1 }); setScreen({ kind: 'result' }); }} />
            </motion.section>
          )}

          {screen.kind === 'result' && (
            <motion.section key="result" {...slide}>
              <Result plan={plan} email={email} cameBack={cameBack} onUnlock={unlock} onDecline={decline}
                loading={loadingCheckout} error={checkoutError} onOfferSeen={() => api.save({ event: 'offer_view', step: TOTAL + 2 })} />
            </motion.section>
          )}

          {screen.kind === 'checkout_test' && (
            <motion.section key="ct" {...slide} className="fmq-center">
              <div className="fmq-card fmq-test-card">
                <p className="fmq-tag"><CreditCard size={14} /> Modo teste</p>
                <h2 className="fmq-h2">Aqui abre o checkout do Stripe</h2>
                <p className="fmq-sub">Assinatura de R$ 49/mês, só cartão, com o e-mail do pedido já preenchido. Nenhuma cobrança é feita nesta rota.</p>
                <button className="fmq-btn fmq-btn-primary" onClick={() => setScreen({ kind: 'success' })}>Simular pagamento aprovado</button>
                <button className="fmq-btn fmq-btn-ghost" onClick={() => { setCameBack(true); setScreen({ kind: 'result' }); }}>Simular desistência no checkout</button>
              </div>
            </motion.section>
          )}

          {screen.kind === 'success' && (
            <motion.section key="ok" {...slide}>
              <Success email={email} api={api} />
            </motion.section>
          )}

          {screen.kind === 'goodbye' && (
            <motion.section key="bye" {...slide} className="fmq-center fmq-bye">
              <span className="fmq-bye-ico"><BookOpen size={28} /></span>
              <h2 className="fmq-h2">Tudo certo. Seu ebook é seu.</h2>
              <p className="fmq-sub">Ele já está no seu e-mail{email ? <> (<b>{email}</b>)</> : null}. Comece pelas 12 dicas de ouro e pelo cardápio de 7 dias.</p>
              <p className="fmq-sub">Se um dia quiser saber, com uma foto, quanta proteína tem no seu prato, o FitMind continua aqui.</p>
              <button className="fmq-btn fmq-btn-ghost" onClick={() => setScreen({ kind: 'result' })}><RotateCcw size={18} /> Rever meu plano</button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

// ── Telas internas ──────────────────────────────────────────────────────────

const Processing: React.FC<{ lines: string[]; onDone: () => void }> = ({ lines, onDone }) => {
  const [done, setDone] = useState(0);
  const [pct, setPct] = useState(0);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    const total = 4200;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / total);
      setPct(p);
      setDone(Math.floor(p * lines.length + 0.0001));
      if (p < 1) raf = requestAnimationFrame(tick);
      else window.setTimeout(() => doneRef.current(), 450);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lines.length]);
  const R = 52, C = 2 * Math.PI * R;
  return (
    <div className="fmq-proc-in">
      <div className="fmq-ring">
        <svg viewBox="0 0 120 120" width="132" height="132" aria-hidden>
          <circle cx="60" cy="60" r={R} className="bg" />
          <circle cx="60" cy="60" r={R} className="fg" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} />
        </svg>
        <b>{Math.round(pct * 100)}%</b>
      </div>
      <h2 className="fmq-h2">Montando o seu plano…</h2>
      <ul className="fmq-checklist">
        {lines.map((l, i) => (
          <li key={l} className={i < done ? 'ok' : i === done ? 'now' : ''}>
            <span>{i < done ? <Check size={14} strokeWidth={3} /> : null}</span>{l}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Result: React.FC<{
  plan: ReturnType<typeof buildPlan>; email: string | null; cameBack: boolean; loading: boolean; error: string | null;
  onUnlock: () => void; onDecline: () => void; onOfferSeen: () => void;
}> = ({ plan, email, cameBack, loading, error, onUnlock, onDecline, onOfferSeen }) => {
  const offerRef = useRef<HTMLDivElement>(null);
  const [offerVisible, setOfferVisible] = useState(false);
  const seen = useRef(false);
  useEffect(() => {
    const el = offerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => {
      setOfferVisible(e.isIntersecting);
      if (e.isIntersecting && !seen.current) { seen.current = true; onOfferSeen(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [onOfferSeen]);

  return (
    <div className="fmq-result">
      {cameBack && <div className="fmq-banner">Seu plano continua aqui. Quando quiser, é só desbloquear.</div>}
      <p className="fmq-tag"><Sparkles size={14} /> Sua prévia está pronta</p>
      <h1 className="fmq-h1">{plan.headline}</h1>
      <p className="fmq-lead">Montado com as suas 6 respostas. <b>3 partes já liberadas</b>, 3 esperando por você no app.</p>

      <div className="fmq-phone">
        <div className="fmq-phone-head"><img src="/logo-fitmind.webp" alt="" width={70} height={26} /><span>Seu plano · hoje</span></div>

        <div className="fmq-tile fmq-tile-focus">
          <span className="fmq-tile-ico"><Icon name={plan.focus.icon} /></span>
          <div><small>Seu ponto de atenção nº 1</small><h3>{plan.focus.title}</h3><p>{plan.focus.body}</p></div>
        </div>

        <div className="fmq-tile">
          <div className="fmq-tile-head"><span className="fmq-tile-ico sm"><Icon name="utensils" size={18} /></span>
            <div><small>Suas refeições</small><h3>{plan.meals.title}</h3></div></div>
          <div className="fmq-slots">
            {plan.meals.slots.map((s) => (
              <div key={s.label} className="fmq-slot"><Icon name={s.icon} size={18} /><b>{s.label}</b><span><Camera size={12} /> foto</span></div>
            ))}
          </div>
          <p className="fmq-tile-note">{plan.meals.note}</p>
        </div>

        <div className="fmq-tile">
          <div className="fmq-tile-head"><span className="fmq-tile-ico sm water"><Icon name={plan.water.icon} size={18} /></span>
            <div><small>Hidratação</small><h3>{plan.water.title}</h3></div></div>
          <p className="fmq-tile-note">{plan.water.body}</p>
        </div>

        {plan.locked.map((l) => (
          <button key={l.title} type="button" className="fmq-tile fmq-locked" onClick={() => offerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            <div className="fmq-blur" aria-hidden>
              <div className="fmq-tile-head"><span className="fmq-tile-ico sm"><Icon name={l.icon} size={18} /></span>
                <div><i className="sk w60" /><i className="sk w40" /></div></div>
              <div className="fmq-sk-bars"><i /><i /><i /><i /><i /><i /><i /></div>
            </div>
            <div className="fmq-lock">
              <span className="fmq-lock-ico"><Lock size={16} /></span>
              <div><b>{l.title}</b><small>{l.teaser}</small></div>
            </div>
          </button>
        ))}
      </div>

      <div className="fmq-bridge">
        <p className="fmq-eyebrow">Do ebook para o dia a dia</p>
        <h2 className="fmq-h2">O ebook foi o primeiro passo. O FitMind é o que vem depois.</h2>
        <p className="fmq-sub">O ebook te deu as receitas. O FitMind mostra, todo dia, se elas estão funcionando: se a proteína bateu, se a água chegou, se a dose está em dia.</p>
      </div>

      <div className="fmq-offer" ref={offerRef} id="oferta">
        <div className="fmq-offer-head">
          <p className="fmq-tag light"><Lock size={14} /> Plano completo</p>
          <h2>Desbloqueie o seu plano no FitMind</h2>
        </div>
        <ul className="fmq-feats">
          {OFFER.features.map((f) => (
            <li key={f.title}><span><Icon name={f.icon} size={18} /></span><div><b>{f.title}</b><small>{f.body}</small></div></li>
          ))}
        </ul>
        <div className="fmq-price">
          <div><b>{OFFER.price}</b><span>{OFFER.period}</span></div>
          <p>{OFFER.perDay}</p>
        </div>
        <p className="fmq-anchor">Você já investe no tratamento todo mês. O FitMind é o que ajuda esse investimento a render.</p>
        <button className="fmq-btn fmq-btn-primary fmq-btn-xl" onClick={onUnlock} disabled={loading}>
          {loading ? 'Abrindo o pagamento…' : <>{OFFER.cta} <ArrowRight size={20} /></>}
        </button>
        {error && <p className="fmq-error">{error}</p>}
        <p className="fmq-billing">{OFFER.billing}</p>
        <p className="fmq-secure"><ShieldCheck size={15} /> Pagamento seguro pelo Stripe</p>
        <p className="fmq-allan"><img src="/allan-stachuk.webp" alt="" width={28} height={28} />Com nutricionista parceiro: Allan Stachuk, CRN 13901</p>
      </div>

      <div className="fmq-next">
        <h3>Como funciona depois do pagamento</h3>
        <ol>
          <li><span>1</span><div><b>Você confirma o pagamento</b><small>Leva menos de 1 minuto</small></div></li>
          <li><span>2</span><div><b>Entra no app com o mesmo e-mail</b><small>{email ? <>Use <b>{email}</b>. É ele que libera o seu acesso.</> : 'O e-mail do pedido libera o seu acesso.'}</small></div></li>
          <li><span>3</span><div><b>Completa seu perfil e começa hoje</b><small>A primeira foto do prato já mostra a proteína</small></div></li>
        </ol>
      </div>

      <button className="fmq-decline" onClick={onDecline}>Agora não, quero ficar só com o ebook</button>

      <AnimatePresence>
        {!offerVisible && (
          <motion.div className="fmq-sticky fmq-sticky-offer" initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }}>
            <div className="fmq-sticky-price"><b>{OFFER.price}</b><span>{OFFER.period}</span></div>
            <button className="fmq-btn fmq-btn-primary" onClick={onUnlock} disabled={loading}>Desbloquear <ArrowRight size={18} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Success: React.FC<{ email: string | null; api: ReturnType<typeof createQuizApi> }> = ({ email, api }) => {
  const [status, setStatus] = useState<QuizStatus | null>(null);
  useEffect(() => {
    try {
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.3 }, colors: ['#4CA0DF', '#1A4572', '#DCEBF8', '#2E9E6B'] });
    } catch { /* ignore */ }
  }, []);
  // o webhook confirma o pagamento alguns segundos depois do redirecionamento: consulta até ~40s
  useEffect(() => {
    if (api.mode === 'test') return;
    let alive = true;
    let tries = 0;
    const tick = async () => {
      const st = await api.status();
      if (!alive) return;
      if (st) setStatus(st);
      tries += 1;
      if (tries < 20 && !(st && st.applied)) window.setTimeout(tick, 2000);
    };
    tick();
    return () => { alive = false; };
  }, [api]);

  const mail = status?.emailMasked ?? email;
  const applied = !!status?.applied;
  const review = !!status?.needsReview;
  return (
    <div className="fmq-success">
      <span className="fmq-success-ico"><Check size={34} strokeWidth={3} /></span>
      {applied ? (
        <>
          <h1 className="fmq-h1">Pagamento recebido. Seu plano está liberado.</h1>
          <p className="fmq-lead">Entre no FitMind com o mesmo e-mail do pagamento e complete seu perfil. O plano completo já está ativo na sua conta.</p>
        </>
      ) : review ? (
        <>
          <h1 className="fmq-h1">Pagamento recebido. Estamos conferindo sua conta.</h1>
          <p className="fmq-lead">Já existe uma assinatura ativa nessa conta, então vamos conferir antes de liberar. Responda o e-mail do ebook que resolvemos rápido.</p>
        </>
      ) : (
        <>
          <h1 className="fmq-h1">Pagamento recebido. Falta um passo.</h1>
          <p className="fmq-lead">Entre no FitMind com o mesmo e-mail do pagamento. Assim que você confirmar esse e-mail, seu plano completo é liberado.</p>
        </>
      )}
      <div className="fmq-card fmq-email-card">
        <Mail size={20} />
        <div><small>Use este e-mail</small><b>{mail ?? 'o e-mail do pagamento'}</b></div>
      </div>
      <ol className="fmq-next-inline">
        <li><Check size={14} strokeWidth={3} /> Ebook entregue</li>
        <li><Check size={14} strokeWidth={3} /> Assinatura paga</li>
        <li className="now"><span>3</span> Entrar e completar o perfil</li>
      </ol>
      <a className="fmq-btn fmq-btn-primary fmq-btn-xl" href="/auth">Entrar no FitMind <ArrowRight size={20} /></a>
      <p className="fmq-micro">Não achou o e-mail de confirmação? Olhe a caixa de spam ou responda o e-mail do ebook.</p>
    </div>
  );
};

// ── Ilustrações das telas de recurso (feitas em código, sem imagem) ─────────

const PhotoMock: React.FC = () => (
  <div className="fmq-mock-photo">
    <div className="frame"><i className="tl" /><i className="tr" /><i className="bl" /><i className="br" /></div>
    <img className="plate-img" src="/ebook/prato-quiz.webp" alt="" width={260} height={260} />
    <div className="scan" />
    <div className="chip p"><b>Proteína</b><span>calculada</span></div>
    <div className="chip k"><b>Calorias</b><span>calculadas</span></div>
    <div className="shutter"><Camera size={18} /></div>
  </div>
);

const ReminderMock: React.FC<{ dose: boolean }> = ({ dose }) => (
  <div className="fmq-mock-notes">
    <div className="note"><span className="ni water"><Droplet size={16} /></span><div><b>Hora da água</b><small>Mais um copo para chegar na sua meta</small></div><em>agora</em></div>
    <div className="note d2"><span className="ni"><Syringe size={16} /></span><div><b>{dose ? 'Hoje é dia da sua dose' : 'Dia da aplicação'}</b><small>Confirme quando aplicar</small></div><em>8:00</em></div>
    <div className="note d3"><span className="ni ok"><Camera size={16} /></span><div><b>Registre o almoço</b><small>Uma foto e pronto</small></div><em>12:30</em></div>
    <div className="note d4"><span className="ni water"><Droplet size={16} /></span><div><b>Hora da água</b><small>Faltam 2 copos para a sua meta</small></div><em>15:00</em></div>
  </div>
);

const TestBar: React.FC<{ onReset: () => void; onJumpResult: () => void; onJumpSuccess: () => void }> = ({ onReset, onJumpResult, onJumpSuccess }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`fmq-testbar${open ? ' open' : ''}`}>
      <button onClick={() => setOpen(!open)}>TESTE</button>
      {open && (
        <div>
          <button onClick={() => { onReset(); setOpen(false); }}>Recomeçar</button>
          <button onClick={() => { onJumpResult(); setOpen(false); }}>Ir para a prévia</button>
          <button onClick={() => { onJumpSuccess(); setOpen(false); }}>Tela pós-pagamento</button>
        </div>
      )}
    </div>
  );
};

export default QuizUpsellPage;
