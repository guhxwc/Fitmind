import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LOGO_URL = 'https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Icon%20Fitmind/logo%20painel.png';
const ALLAN_PHOTO = 'https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Allan/a363b4bf95e991cec48ec623905cfc44.png';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const accent = '#007AFF';

    // ── Scroll animations ────────────────────────────────────────────────
    useEffect(() => {
        // Progress bar
        const bar = document.createElement('div');
        bar.className = 'fm-scroll-progress';
        document.body.appendChild(bar);

        // IntersectionObserver for entrance triggers
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('in-view');
                    if (e.target.classList.contains('sv-form')) {
                        setTimeout(() => e.target.classList.add('quiz-selected'), 600);
                    }
                }
            });
        }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

        const observeAll = () => {
            ['.fm-hero-copy', '.fm-strip-inner', '.fm-section-head', '.fm-feature', '.fm-step', '.fm-pitch', '.fm-testimonial', '.fm-faq-item', '.sv-form']
                .forEach((sel) => {
                    document.querySelectorAll(sel).forEach((el, i) => {
                        (el as HTMLElement).style.setProperty('--anim-i', String(i));
                        io.observe(el);
                    });
                });
        };

        // Headline word reveal
        const h1 = document.querySelector('.fm-landing .fm-h1');
        if (h1 && !h1.getAttribute('data-split')) {
            h1.setAttribute('data-split', '1');
            const walk = (node: ChildNode) => {
                if (node.nodeType === 3) {
                    const words = (node.textContent || '').split(/(\s+)/);
                    const frag = document.createDocumentFragment();
                    words.forEach((w) => {
                        if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w));
                        else if (w.length) {
                            const span = document.createElement('span');
                            span.className = 'fm-word';
                            span.textContent = w;
                            frag.appendChild(span);
                        }
                    });
                    node.parentNode?.replaceChild(frag, node);
                } else if (node.nodeType === 1) {
                    Array.from(node.childNodes).forEach(walk);
                }
            };
            walk(h1 as ChildNode);
            h1.querySelectorAll('.fm-word').forEach((w, i) => {
                (w as HTMLElement).style.setProperty('--w-i', String(i));
            });
            requestAnimationFrame(() => h1.classList.add('fm-h1-ready'));
        }

        observeAll();

        // Parallax + scroll progress
        const isMobile = matchMedia('(max-width: 720px)').matches;
        const paraScale = isMobile ? 0.5 : 1;
        const phoneScreen = document.querySelector('.fm-landing .fm-screen-scroll') as HTMLElement | null;

        const cards = Array.from(document.querySelectorAll('.fm-landing .fm-floating-card')).map((el, i) => ({
            el: el as HTMLElement,
            speed: (i % 2 === 0 ? 0.18 : -0.14) * paraScale,
            rotSpeed: (i % 2 === 0 ? 0.03 : -0.025) * paraScale,
        }));

        const onScroll = () => {
            const docH = document.documentElement.scrollHeight - window.innerHeight;
            const pct = docH > 0 ? window.scrollY / docH : 0;
            bar.style.transform = `scaleX(${pct})`;

            const heroEl = document.querySelector('.fm-landing .fm-hero') as HTMLElement | null;
            if (heroEl) {
                const rect = heroEl.getBoundingClientRect();
                if (rect.bottom > 0 && rect.top < window.innerHeight) {
                    cards.forEach((s) => {
                        const offset = -rect.top;
                        s.el.style.setProperty('--scroll-y', `${offset * s.speed}px`);
                        s.el.style.setProperty('--scroll-rot', `${offset * s.rotSpeed}deg`);
                    });
                    if (phoneScreen) {
                        const heroScrollPct = Math.min(Math.max(-rect.top / rect.height, 0), 1);
                        const maxScroll = phoneScreen.scrollHeight - phoneScreen.clientHeight;
                        phoneScreen.scrollTop = heroScrollPct * maxScroll * 1.25;
                    }
                }
            }
        };
        onScroll();
        const onScrollRaf = () => requestAnimationFrame(onScroll);
        window.addEventListener('scroll', onScrollRaf, { passive: true });
        window.addEventListener('resize', onScroll);

        // Cleanup
        return () => {
            bar.remove();
            io.disconnect();
            window.removeEventListener('scroll', onScrollRaf);
            window.removeEventListener('resize', onScroll);
        };
    }, []);

    const goAuth = () => navigate('/auth');
    const goConsult = () => navigate('/assinaturas');

    return (
        <div className="fm-landing">
            {/* NAV */}
            <nav className="fm-nav">
                <div className="fm-nav-inner">
                    <a className="fm-logo" onClick={goAuth} style={{ cursor: 'pointer' }}>
                        <img src={LOGO_URL} alt="FitMind" />
                    </a>
                    <div className="fm-nav-links">
                        <a href="#recursos">Recursos</a>
                        <a href="#como-funciona">Como funciona</a>
                        <a href="#nutricionista">Consulta</a>
                        <a href="#faq">FAQ</a>
                    </div>
                    <div className="fm-nav-cta">
                        <button className="fm-link" onClick={goAuth}>Entrar</button>
                        <button className="fm-btn fm-btn-primary fm-btn-sm" onClick={goAuth}>Criar meu plano grátis</button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <header className="fm-hero">
                <div className="fm-hero-bg-glow" style={{ background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)` }}></div>
                <div className="fm-hero-inner">
                    <div className="fm-hero-copy">
                        <div className="fm-pill">
                            <span className="fm-pill-icon" style={{ color: accent }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </span>
                            <span>O Sistema #1 para usuários de <strong>GLP-1</strong></span>
                        </div>
                        <h1 className="fm-h1">
                            Acompanhe seu tratamento com <span className="fm-h1-accent" style={{ color: accent }}>Ozempic, wegovy e Mounjaro</span>
                        </h1>
                        <p className="fm-lede">
                            O primeiro sistema operacional completo para quem usa <strong>Ozempic, Mounjaro e Wegovy</strong>. Acompanhe peso, dieta, sintomas e treinos — validado clinicamente.
                        </p>
                        <div className="fm-hero-actions">
                            <button className="fm-btn fm-btn-primary fm-btn-lg" onClick={goAuth}>
                                Criar meu plano grátis
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                            </button>
                            <div className="fm-hero-sub">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                <span>Acesso imediato · Cancele quando quiser</span>
                            </div>
                        </div>
                        <div className="fm-hero-trust">
                            <div className="fm-trust-shield">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                            </div>
                            <div>
                                <div className="fm-trust-title">Método validado clinicamente</div>
                                <div className="fm-trust-text">Por <strong>Allan Stachuk</strong> · Nutricionista CRN 13901</div>
                            </div>
                        </div>
                    </div>

                    <div className="fm-hero-phone-wrap">
                        <div className="fm-phone-glow" style={{ background: `radial-gradient(circle, ${accent}33 0%, transparent 65%)` }}></div>
                        <PhoneMockup accent={accent} />
                        <FloatingCard top="18%" style={{ left: 'calc(50% + 170px)', ['--rot' as any]: '6deg' }}>
                            <div className="fm-fc-icon" style={{ background: '#FF950022', color: '#FF9500' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/></svg>
                            </div>
                            <div>
                                <div className="fm-fc-title">12 dias</div>
                                <div className="fm-fc-sub">Sequência ativa</div>
                            </div>
                        </FloatingCard>
                        <FloatingCard bottom="22%" style={{ right: 'calc(50% + 170px)', ['--rot' as any]: '-5deg' }}>
                            <div className="fm-fc-icon" style={{ background: '#34C75922', color: '#34C759' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
                            </div>
                            <div>
                                <div className="fm-fc-title">-4,8 kg</div>
                                <div className="fm-fc-sub">Últimas 3 semanas</div>
                            </div>
                        </FloatingCard>
                    </div>
                </div>
            </header>

            {/* STRIP */}
            <section className="fm-strip">
                <div className="fm-strip-inner">
                    <span className="fm-strip-label">Compatível com</span>
                    <div className="fm-strip-items">
                        <div className="fm-strip-item">Ozempic®</div>
                        <div className="fm-strip-dot"></div>
                        <div className="fm-strip-item">Mounjaro®</div>
                        <div className="fm-strip-dot"></div>
                        <div className="fm-strip-item">Wegovy®</div>
                        <div className="fm-strip-dot"></div>
                        <div className="fm-strip-item">Saxenda®</div>
                        <div className="fm-strip-dot"></div>
                        <div className="fm-strip-item">Trulicity®</div>
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section id="recursos" className="fm-section">
                <div className="fm-container">
                    <div className="fm-section-head">
                        <span className="fm-eyebrow">Recursos</span>
                        <h2 className="fm-h2">Tudo o que faltava para seu tratamento dar certo.</h2>
                        <p className="fm-section-sub">Quatro sistemas integrados que trabalham com a sua biologia — não contra ela.</p>
                    </div>
                    <div className="fm-feature-grid">
                        <FeatureCard color="#007AFF" tag="01" title="CalorieCam IA" desc="Tire uma foto da refeição. Em segundos: calorias, proteína, carboidratos e se ela acelera ou atrasa seu progresso.">
                            <FCCalorieCam />
                        </FeatureCard>
                        <FeatureCard color="#FF9500" tag="02" title="Treinos Adaptativos" desc="Exercícios que respeitam náuseas, fadiga e nível de energia do dia. Nunca mais cobranças irreais.">
                            <FCWorkout />
                        </FeatureCard>
                        <FeatureCard color="#AF52DE" tag="03" title="Análise Inteligente" desc="Gráficos que mostram quais hábitos realmente movem seu peso — e quais são perda de tempo.">
                            <FCAnalysis />
                        </FeatureCard>
                        <FeatureCard color="#34C759" tag="04" title="Protocolo Anti-Rebote" desc="O único método focado em garantir que o peso não volta quando você parar o medicamento.">
                            <FCAntiRebote />
                        </FeatureCard>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="como-funciona" className="fm-section fm-section-alt">
                <div className="fm-container">
                    <div className="fm-section-head fm-section-head-left">
                        <span className="fm-eyebrow">Como funciona</span>
                        <h2 className="fm-h2">Três passos. Resultado guiado.</h2>
                    </div>
                    <div className="fm-steps">
                        <Step n="01" title="Conte sua jornada" desc="Em 2 minutos você responde sobre medicação, dose, sintomas e objetivo. O plano nasce daí.">
                            <StepFormVisual />
                        </Step>
                        <Step n="02" title="Receba seu protocolo" desc="Dieta, treino e janela de aplicação adaptados ao seu GLP-1, dose e nível de energia." accent>
                            <StepProtocolVisual accent={accent} />
                        </Step>
                        <Step n="03" title="Ajuste e evolua" desc="A IA aprende com cada registro e ajusta o plano semanalmente. Você só precisa seguir.">
                            <StepEvolveVisual />
                        </Step>
                    </div>
                </div>
            </section>

            {/* ALLAN PITCH */}
            <section id="nutricionista" className="fm-section fm-section-pitch">
                <div className="fm-container">
                    <div className="fm-pitch">
                        <div className="fm-pitch-photo-col">
                            <div className="fm-pitch-photo-wrap">
                                <div className="fm-pitch-glow" style={{ background: `radial-gradient(circle, ${accent}33 0%, transparent 65%)` }}></div>
                                <img className="fm-pitch-photo" src={ALLAN_PHOTO} alt="Allan Stachuk — Nutricionista CRN 13901" />
                                <div className="fm-pitch-photo-card fm-pitch-card-crn">
                                    <div className="fm-pitch-card-eye">REGISTRO PROFISSIONAL</div>
                                    <div className="fm-pitch-card-val">CRN 13901</div>
                                </div>
                                <div className="fm-pitch-photo-card fm-pitch-card-name">
                                    <div className="fm-pitch-card-name-top">
                                        <strong>Allan Stachuk</strong>
                                        <span className="fm-pitch-verified">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill={accent}><path d="M12 2 9.5 4 6 4l-.5 3.5L2 9l1.5 3.5L2 16l3.5 1.5L6 21l3.5 0 2.5 3 2.5-3 3.5 0 .5-3.5L22 16l-1.5-3.5L22 9l-3.5-1.5L18 4l-3.5 0z"/><path d="m8 12 3 3 5-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                                        </span>
                                    </div>
                                    <div className="fm-pitch-card-name-sub">Nutricionista Especialista em GLP-1</div>
                                </div>
                            </div>
                        </div>
                        <div className="fm-pitch-content">
                            <div className="fm-pitch-eyebrow" style={{ background: `${accent}14`, color: accent }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                                CONSULTORIA PROFISSIONAL
                            </div>
                            <h2 className="fm-pitch-title">
                                Quer um plano <span style={{ color: accent }}>feito 100% por um profissional</span>?
                            </h2>
                            <p className="fm-pitch-quote">
                                "Cada protocolo do FitMind foi analisado e validado, especificamente para usuários de GLP-1. Se você quer ir além do app, eu mesmo monto seu plano de nutrição, treino e acompanhamento — personalizado pro seu corpo, sua medicação e seus resultados."
                            </p>
                            <div className="fm-pitch-features">
                                <PitchFeature accent={accent} title="Plano 100% personalizado" desc="Dieta, treino e acompanhamento criados sob medida pra você." />
                                <PitchFeature accent={accent} title="Acompanhamento direto" desc="Mensagens diretas com Allan pelo WhatsApp." />
                                <PitchFeature accent={accent} title="Validação clínica" desc="Protocolos saudáveis para Ozempic, Mounjaro e Wegovy." />
                            </div>
                            <div className="fm-pitch-cta">
                                <button className="fm-btn fm-btn-primary fm-btn-lg" style={{ background: accent }} onClick={goConsult}>
                                    Conhecer a consulta
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                                </button>
                                <div className="fm-pitch-sign">
                                    Desenvolvido e validado por <strong>nutricionistas especialistas em GLP-1</strong>.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="fm-section fm-section-alt">
                <div className="fm-container">
                    <div className="fm-section-head">
                        <span className="fm-eyebrow">Histórias reais</span>
                        <h2 className="fm-h2">Histórias reais. Resultados que sustentam.</h2>
                    </div>
                    <div className="fm-testimonials">
                        {TESTIMONIALS.map((tt, i) => (
                            <article key={i} className="fm-testimonial">
                                <div className="fm-test-stars">★★★★★</div>
                                <p className="fm-test-quote">"{tt.quote}"</p>
                                <div className="fm-test-foot">
                                    <div className="fm-test-avatar" style={{ background: tt.color }}>{tt.init}</div>
                                    <div className="fm-test-meta">
                                        <div className="fm-test-name">{tt.name}, {tt.age}</div>
                                        <div className="fm-test-drug">{tt.drug}</div>
                                    </div>
                                    <div className="fm-test-metric">
                                        <div className="fm-test-val">{tt.metric}</div>
                                        <div className="fm-test-period">{tt.period}</div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <FAQSection />

            {/* FOOTER */}
            <footer className="fm-footer">
                <div className="fm-container">
                    <div className="fm-footer-inner">
                        <div className="fm-footer-brand">
                            <a className="fm-logo" onClick={goAuth} style={{ cursor: 'pointer' }}>
                                <img src={LOGO_URL} alt="FitMind" />
                            </a>
                            <p>O sistema operacional para usuários de GLP-1.</p>
                        </div>
                        <div className="fm-footer-cols">
                            <div>
                                <h4>Produto</h4>
                                <a href="#recursos">Recursos</a>
                                <button onClick={goConsult}>Consulta</button>
                                <a href="#como-funciona">Como funciona</a>
                            </div>
                            <div>
                                <h4>Empresa</h4>
                                <a>Sobre</a>
                                <a>Blog</a>
                                <a>Imprensa</a>
                            </div>
                            <div>
                                <h4>Legal</h4>
                                <button onClick={() => navigate('/terms')}>Termos</button>
                                <button onClick={() => navigate('/privacy')}>Privacidade</button>
                                <a href="mailto:contato@fitmindhealth.com.br">Suporte</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="fm-footer-bottom">
                    <div className="fm-footer-bottom-inner">
                        <span>© 2026 FitMind. Todos os direitos reservados.</span>
                        <span>Feito com 🩺 no Brasil · CNPJ 65.458.597/0001-68</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

// ─── Sub-components ─────────────────────────────────────────────────────

const FloatingCard: React.FC<{ children: React.ReactNode; top?: string; right?: string; bottom?: string; left?: string; style?: React.CSSProperties }> = ({ children, top, right, bottom, left, style }) => (
    <div className="fm-floating-card" style={{ top, right, bottom, left, ...style }}>{children}</div>
);

const FeatureCard: React.FC<{ color: string; tag: string; title: string; desc: string; children: React.ReactNode }> = ({ color, tag, title, desc, children }) => (
    <article className="fm-feature">
        <div className="fm-feature-visual" style={{ background: `linear-gradient(135deg, ${color}14 0%, ${color}05 100%)` }}>
            <div className="fm-feature-tag" style={{ color }}>{tag}</div>
            {children}
        </div>
        <div className="fm-feature-body">
            <h3 className="fm-feature-title">{title}</h3>
            <p className="fm-feature-desc">{desc}</p>
        </div>
    </article>
);

const FCCalorieCam = () => (
    <div className="fc-ill">
        <div className="fc-cam-frame">
            <div className="fc-cam-corner tl"></div><div className="fc-cam-corner tr"></div>
            <div className="fc-cam-corner bl"></div><div className="fc-cam-corner br"></div>
            <div>🥗</div>
            <div className="fc-cam-scan"></div>
        </div>
        <div className="fc-cam-results">
            <div className="fc-cam-row"><span>Salada caesar</span><span className="fc-cam-val">412 kcal</span></div>
            <div className="fc-cam-row"><span>Proteína</span><span className="fc-cam-val" style={{ color: '#007AFF' }}>28g</span></div>
            <div className="fc-cam-row"><span>Carboidratos</span><span className="fc-cam-val">18g</span></div>
            <div className="fc-cam-row fc-cam-verdict">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                <span>Acelera sua perda de peso</span>
            </div>
        </div>
    </div>
);

const FCWorkout = () => (
    <div className="fc-ill">
        <div className="fc-wk-card">
            <div className="fc-wk-tag" style={{ background: '#FF950022', color: '#FF9500' }}>Hoje · Energia baixa</div>
            <div className="fc-wk-title">Treino leve · 18 min</div>
            <div className="fc-wk-items">
                <div className="fc-wk-item"><span>•</span> Caminhada controlada</div>
                <div className="fc-wk-item"><span>•</span> Alongamento ativo</div>
                <div className="fc-wk-item"><span>•</span> Respiração diafragmática</div>
            </div>
            <div className="fc-wk-bar"><div className="fc-wk-fill" style={{ width: '62%' }}></div></div>
        </div>
    </div>
);

const FCAnalysis = () => (
    <div className="fc-ill fc-ill-chart">
        <svg viewBox="0 0 240 120" preserveAspectRatio="none">
            <defs>
                <linearGradient id="chartg" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#AF52DE" stopOpacity="0.35"/>
                    <stop offset="100%" stopColor="#AF52DE" stopOpacity="0"/>
                </linearGradient>
            </defs>
            <path d="M0,90 C30,80 50,70 80,68 C110,66 130,50 160,40 C190,30 215,22 240,15 L240,120 L0,120 Z" fill="url(#chartg)"/>
            <path d="M0,90 C30,80 50,70 80,68 C110,66 130,50 160,40 C190,30 215,22 240,15" fill="none" stroke="#AF52DE" strokeWidth="2.5"/>
            <circle cx="80" cy="68" r="3.5" fill="#fff" stroke="#AF52DE" strokeWidth="2"/>
            <circle cx="160" cy="40" r="3.5" fill="#fff" stroke="#AF52DE" strokeWidth="2"/>
            <circle cx="240" cy="15" r="4.5" fill="#AF52DE"/>
        </svg>
        <div className="fc-chart-labels"><span>Mar</span><span>Abr</span><span>Mai</span></div>
        <div className="fc-chart-stat">
            <div className="fc-chart-val">-8,2 kg</div>
            <div className="fc-chart-sub">90 dias</div>
        </div>
    </div>
);

const FCAntiRebote = () => (
    <div className="fc-ill">
        <div className="fc-shield-card">
            <div className="fc-shield-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div className="fc-shield-week">
                {['S1','S2','S3','S4','S5','S6'].map((w, i) => (
                    <div key={w} className={`fc-shield-pill ${i < 4 ? 'done' : ''}`}>{w}</div>
                ))}
            </div>
            <div className="fc-shield-foot">
                <span>Fase: Estabilização</span>
                <span className="fc-shield-pct">67%</span>
            </div>
        </div>
    </div>
);

const Step: React.FC<{ n: string; title: string; desc: string; children: React.ReactNode; accent?: boolean }> = ({ n, title, desc, children, accent }) => (
    <div className={`fm-step ${accent ? 'fm-step-accent' : ''}`}>
        <div className="fm-step-visual">{children}</div>
        <div className="fm-step-num">{n}</div>
        <h3 className="fm-step-title">{title}</h3>
        <p className="fm-step-desc">{desc}</p>
    </div>
);

const StepFormVisual = () => (
    <div className="sv sv-form">
        <div className="sv-form-question">Qual GLP-1 você usa?</div>
        <div className="sv-form-options">
            <div className="sv-form-opt sv-active">
                <span className="sv-form-opt-text">Mounjaro</span>
                <span className="sv-form-check">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </span>
            </div>
            <div className="sv-form-opt"><span className="sv-form-opt-text">Ozempic</span></div>
            <div className="sv-form-opt"><span className="sv-form-opt-text">Wegovy</span></div>
        </div>
        <div className="sv-form-foot">
            <div className="sv-form-bar"><div className="sv-form-fill"></div></div>
            <div className="sv-form-step">4 / 12</div>
        </div>
    </div>
);

const StepProtocolVisual: React.FC<{ accent: string }> = ({ accent }) => (
    <div className="sv">
        <div className="sv-prot-card">
            <div className="sv-prot-head"><span className="sv-prot-dot" style={{ background: accent }}></span>Plano semanal · 7,5 mg</div>
            <div className="sv-prot-row"><span>Proteína</span><strong>120g/dia</strong></div>
            <div className="sv-prot-row"><span>Calorias</span><strong>1.800 kcal</strong></div>
            <div className="sv-prot-row"><span>Treinos</span><strong>4× / semana</strong></div>
        </div>
    </div>
);

const StepEvolveVisual = () => (
    <div className="sv sv-evolve">
        <svg viewBox="0 0 160 70" preserveAspectRatio="none">
            <path d="M0,55 C20,52 35,40 55,38 C75,36 90,28 110,22 C130,16 145,12 160,8" fill="none" stroke="#34C759" strokeWidth="2.5"/>
            <circle cx="160" cy="8" r="3.5" fill="#34C759"/>
        </svg>
        <div className="sv-evolve-meta">
            <div><span className="sv-dot" style={{ background: '#34C759' }}></span>Peso</div>
            <div><span className="sv-dot" style={{ background: '#FF9500' }}></span>Cintura</div>
        </div>
    </div>
);

const PitchFeature: React.FC<{ accent: string; title: string; desc: string }> = ({ accent, title, desc }) => (
    <div className="fm-pitch-feature">
        <div className="fm-pitch-feature-check" style={{ background: `${accent}14`, color: accent }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div>
            <div className="fm-pitch-feature-title">{title}</div>
            <div className="fm-pitch-feature-desc">{desc}</div>
        </div>
    </div>
);

const TESTIMONIALS = [
    { init: 'AP', name: 'Ana Paula', age: '34 anos', color: '#FFB340', drug: 'Ozempic + FitMind', quote: 'Eu estava apavorada no começo. Tinha medo de comer a coisa errada e passar mal. O FitMind me deu a segurança que eu precisava. Em 4 semanas, perdi 5kg e as náuseas desapareceram.', metric: '-5 kg', period: '4 semanas' },
    { init: 'CF', name: 'Carlos F.', age: '48 anos', color: '#5AC8FA', drug: 'Mounjaro + FitMind', quote: 'Travei por 3 meses depois dos primeiros 10kg. A Análise Inteligente mostrou que faltava proteína. Ajustei e perdi mais 12kg. Foi inacreditável.', metric: '-22 kg', period: '8 meses' },
    { init: 'JC', name: 'Juliana C.', age: '41 anos', color: '#AF52DE', drug: 'Wegovy + FitMind', quote: 'O Protocolo Anti-Rebote do FitMind foi minha salvação. Parei o remédio há 6 meses e não ganhei 1kg de volta. Me sinto livre.', metric: '0 kg', period: 'ganho pós-tratamento' },
];

const FAQ_ITEMS = [
    { q: 'Funciona se eu não estiver usando GLP-1?', a: 'Sim, mas o FitMind foi otimizado para usuários de Ozempic, Mounjaro, Wegovy, Saxenda e Trulicity. Você ainda terá acesso a todos os recursos de nutrição e treino.' },
    { q: 'Posso cancelar quando quiser?', a: 'Sim. Cancele em 1 clique nas configurações. Sem fidelidade, sem ligações, sem perguntas.' },
    { q: 'É seguro registrar minha medicação?', a: 'Seus dados são criptografados de ponta a ponta. Nunca compartilhamos informações com terceiros. Validado pela LGPD.' },
    { q: 'Preciso de nutricionista além do app?', a: 'O FitMind complementa o trabalho do seu nutricionista. Geramos relatórios completos que você pode levar para sua consulta.' },
    { q: 'Funciona depois que eu parar o remédio?', a: 'Esse é o ponto forte. Nosso Protocolo Anti-Rebote é desenhado especificamente para a fase pós-tratamento.' },
];

const FAQSection = () => {
    const [open, setOpen] = useState(0);
    return (
        <section id="faq" className="fm-section fm-section-alt">
            <div className="fm-container fm-faq-container">
                <div className="fm-section-head fm-section-head-left">
                    <span className="fm-eyebrow">FAQ</span>
                    <h2 className="fm-h2">Perguntas honestas, respostas diretas.</h2>
                </div>
                <div className="fm-faq">
                    {FAQ_ITEMS.map((item, i) => (
                        <div key={i} className={`fm-faq-item ${open === i ? 'open' : ''}`}>
                            <button className="fm-faq-q" onClick={() => setOpen(open === i ? -1 : i)}>
                                <span>{item.q}</span>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                            <div className="fm-faq-a"><p>{item.a}</p></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// ─── PhoneMockup (replica of Summary tab) ───────────────────────────────

const PhoneMockup: React.FC<{ accent: string }> = ({ accent }) => (
    <div className="fm-phone">
        <div className="fm-phone-frame">
            <div className="fm-phone-notch"></div>
            <div className="fm-phone-screen">
                <div className="fm-status">
                    <span>9:41</span>
                    <div className="fm-status-right">
                        <svg width="16" height="10" viewBox="0 0 16 10" fill="currentColor"><path d="M1 8h2v1H1zM4 6h2v3H4zM7 4h2v5H7zM10 2h2v7h-2zM13 0h2v9h-2z"/></svg>
                        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M1 5a8 8 0 0112 0M3 7a5 5 0 018 0M6 9h2"/></svg>
                        <svg width="22" height="10" viewBox="0 0 22 10" fill="currentColor"><rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="currentColor" fill="none"/><rect x="2" y="2" width="14" height="6" rx="1"/><rect x="19.5" y="3" width="1.5" height="4" rx="0.5"/></svg>
                    </div>
                </div>

                <div className="fm-screen-scroll">
                    <header className="sumHeader">
                        <div>
                            <button className="sumDatePill">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                HOJE
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                            </button>
                            <div className="sumTitle">Resumo</div>
                        </div>
                        <div className="sumHeaderRight">
                            <div className="sumStreak">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <defs>
                                        <linearGradient id="streakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#FFB300"/>
                                            <stop offset="35%" stopColor="#FF6B00"/>
                                            <stop offset="100%" stopColor="#E61A00"/>
                                        </linearGradient>
                                    </defs>
                                    <path d="M12 2C12 2 5 8.5 5 14.5C5 18.64 8.13 22 12 22C15.87 22 19 18.64 19 14.5C19 8.5 12 2 12 2Z" fill="url(#streakGrad)"/>
                                    <path d="M12 8.5C12 8.5 8 12.5 8 16C8 18.21 9.79 20 12 20C14.21 20 16 18.21 16 16C16 12.5 12 8.5 12 8.5Z" fill="#FFD700"/>
                                </svg>
                                <span>12</span>
                            </div>
                            <div className="sumAvatar">M</div>
                        </div>
                    </header>

                    <div className="sumDoseCard">
                        <div className="sumDoseLeft">
                            <div className="sumDoseHead">
                                <span className="sumPing">
                                    <span className="sumPingDot" style={{ background: accent }}></span>
                                    <span className="sumPingRing" style={{ background: accent }}></span>
                                </span>
                                <span>PRÓXIMA DOSE</span>
                            </div>
                            <div className="sumDoseDay">Domingo</div>
                            <div className="sumDoseMed">Ozempic • 0,5 mg</div>
                        </div>
                        <div className="sumDoseSyringe">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m18 2 4 4"/><path d="m17 7 3-3"/><path d="M19 9 8.7 19.3c-1 1-2.5 1-3.4 0l-.6-.6c-1-1-1-2.5 0-3.4L15 5"/><path d="m9 11 4 4"/><path d="m5 19-3 3"/><path d="m14 4 6 6"/>
                            </svg>
                        </div>
                        <div className="sumDoseBlob" style={{ background: `${accent}1A` }}></div>
                    </div>

                    <div className="sumBentoRow">
                        <DonutCardApp label="PROTEÍNA" value="84" goal="120" unit="g" color="#FF9500" pct={0.70} />
                        <DonutCardApp label="HIDRATAÇÃO" value="1,8" goal="2,8" unit="L" color={accent} pct={0.64} />
                    </div>

                    <div className="sumWeightCard">
                        <div className="sumWeightLabel">CONTROLE DE PESO</div>
                        <div className="sumWeightRow">
                            <button className="sumWeightBtn sumWeightBtnGhost">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                            <div className="sumWeightNum"><span>78,4</span><em>kg</em></div>
                            <button className="sumWeightBtn sumWeightBtnDark">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                        </div>
                        <div className="sumWeightBar"><div className="sumWeightFill" style={{ width: '53%', background: accent }}></div></div>
                        <div className="sumWeightMeta"><span>ATUAL</span><span>META: 70KG</span></div>
                    </div>

                    <button className="sumSmartLog">
                        <div className="sumSmartIcon" style={{ background: `${accent}1A`, color: accent }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>
                        </div>
                        <div className="sumSmartText">
                            <div className="sumSmartTitle">Registro Inteligente</div>
                            <div className="sumSmartSub">Descreva o que comeu para a IA</div>
                        </div>
                        <div className="sumSmartChev">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </div>
                    </button>

                    <div className="sumSectionHead">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v5a4 4 0 0 0 8 0V2"/><path d="M7 2v20"/><path d="M15 2v20"/><path d="M15 2h1a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5h-1"/></svg>
                        <span>Refeições</span>
                    </div>

                    <MealCardApp emoji="☕" name="Café da manhã" cal={412} goal={360} color="#FF9500" />
                    <MealCardApp emoji="🥗" name="Almoço" cal={580} goal={630} color="#EAB308" />
                    <MealCardApp emoji="🍽️" name="Jantar" cal={0} goal={540} color="#AF52DE" />
                </div>

                <div className="sumTabbar">
                    <TabIcon active accent={accent} label="Resumo">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
                    </TabIcon>
                    <TabIcon label="Dieta">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M3 2v5a4 4 0 0 0 8 0V2"/><path d="M7 2v20"/><path d="M15 2v20"/><path d="M15 2h1a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5h-1"/></svg>
                    </TabIcon>
                    <TabIcon label="Treino">
                        <svg viewBox="0 0 512 512" fill="currentColor" width="20" height="20"><rect x="110" y="228" width="292" height="56"/><rect x="110" y="96" width="56" height="320" rx="28"/><rect x="46" y="146" width="48" height="220" rx="24"/><rect x="346" y="96" width="56" height="320" rx="28"/><rect x="418" y="146" width="48" height="220" rx="24"/></svg>
                    </TabIcon>
                    <TabIcon label="Progresso">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
                    </TabIcon>
                </div>
            </div>
        </div>
    </div>
);

const DonutCardApp: React.FC<{ label: string; value: string; goal: string; unit: string; color: string; pct: number }> = ({ label, value, goal, unit, color, pct }) => {
    const R = 22;
    const C = 2 * Math.PI * R;
    return (
        <div className="sumDonutCard">
            <div className="sumDonutHead">
                <div className="sumDonutLabel" style={{ color }}>{label}</div>
                <div className="sumDonutIcon" style={{ background: `${color}1F`, color }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
                </div>
            </div>
            <div className="sumDonutChart">
                <svg viewBox="0 0 60 60" width="62" height="62">
                    <circle cx="30" cy="30" r={R} fill="none" stroke="rgba(229,229,234,0.6)" strokeWidth="5"/>
                    <circle cx="30" cy="30" r={R} fill="none" stroke={color} strokeWidth="5" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} strokeLinecap="round" transform="rotate(-90 30 30)"/>
                </svg>
                <div className="sumDonutCenter">
                    <div className="sumDonutValue">{value}</div>
                    <div className="sumDonutGoal">de {goal}{unit}</div>
                </div>
            </div>
            <div className="sumDonutBtns">
                <button className="sumDonutBtn"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
                <button className="sumDonutBtn"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
            </div>
        </div>
    );
};

const MealCardApp: React.FC<{ emoji: string; name: string; cal: number; goal: number; color: string }> = ({ emoji, name, cal, goal, color }) => {
    const pct = Math.min((cal / goal) * 100, 100);
    return (
        <div className="sumMealCard">
            <div className="sumMealIcon" style={{ background: color }}>{emoji}</div>
            <div className="sumMealMid">
                <div className="sumMealName">{name}</div>
                <div className="sumMealCal"><strong style={{ color }}>{cal}</strong> / {goal} kcal</div>
                <div className="sumMealBar"><div className="sumMealFill" style={{ width: `${pct}%`, background: color }}></div></div>
            </div>
            <button className="sumMealPlus">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
        </div>
    );
};

const TabIcon: React.FC<{ active?: boolean; accent?: string; label: string; children: React.ReactNode }> = ({ active, accent, label, children }) => (
    <div className={`sumTab ${active ? 'sumTabActive' : ''}`} style={active ? { color: accent } : {}}>
        {children}
        <span>{label}</span>
    </div>
);
