
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../AppContext';

// Declare Intro.js global
declare const introJs: any;

export const TourGuide: React.FC = () => {
    const { userData } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();
    const isRunning = useRef(false);

    useEffect(() => {
        if (!userData || isRunning.current) return;

        // Check Local Storage Logic
        const hasSeenIntro = localStorage.getItem('has_seen_onboarding');
        const triggerProTour = localStorage.getItem('trigger_pro_tour');

        if (!hasSeenIntro) {
            if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => startTour('initial'), 500);
            } else {
                startTour('initial');
            }
        } else if (triggerProTour === 'true') {
            if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => startTour('pro'), 500);
            } else {
                startTour('pro');
            }
            localStorage.removeItem('trigger_pro_tour');
        }

    }, [userData, location.pathname, navigate]);

    const startTour = (type: 'initial' | 'pro') => {
        if (typeof introJs === 'undefined') return;
        isRunning.current = true;

        const intro = introJs();

        // 1. Common Steps for all new users
        const commonSteps = [
            {
                title: 'Bem-vindo ao FitMind!',
                intro: 'Seu assistente completo para acompanhar seu tratamento GLP-1 e evolução. Vamos conhecer o app!',
            },
            {
                element: '#tour-weight-card',
                title: 'Meta de Peso',
                intro: 'Aqui você acompanha seu peso atual em relação à sua meta e registra variações.',
                position: 'bottom'
            },
            {
                element: '#tour-nutrition',
                title: 'Nutrição Diária',
                intro: 'Monitore sua ingestão de proteínas e hidratação, essenciais para o tratamento.',
                position: 'bottom'
            },
            {
                element: '#tour-smartlog',
                title: 'Registro Rápido',
                intro: 'Use a IA para registrar refeições apenas descrevendo ou tirando foto.',
                position: 'bottom'
            },
            {
                element: '#tour-medication',
                title: 'Tratamento',
                intro: 'Visualize sua próxima dose e mantenha o controle do cronograma.',
                position: 'top'
            },
            {
                element: '#nav-meals',
                title: 'Dieta e Jejum',
                intro: 'Nesta aba, acesse seu plano alimentar e controle seus jejuns.',
                position: 'top'
            },
            {
                element: '#nav-applications',
                title: 'Doses e Níveis',
                intro: 'Histórico completo de aplicações e estimativa do nível da medicação no corpo.',
                position: 'top'
            },
            {
                element: '#tour-side-effects-btn',
                title: 'Efeitos Colaterais',
                intro: 'Registre sintomas rapidamente para receber dicas de alívio.',
                position: 'top'
            },
            {
                element: '#nav-progress',
                title: 'Resultados e Gráficos',
                intro: 'Acompanhe sua curva de peso, fotos de progresso e estatísticas corporais.',
                position: 'top'
            },
            {
                element: '#tour-daily-history',
                title: 'Histórico de Registros',
                intro: 'Tudo o que você fez hoje aparece aqui: refeições, treinos e doses.',
                position: 'top'
            },
            {
                element: '#nav-settings',
                title: 'Configurações',
                intro: 'Ajuste suas metas, lembretes e dados da conta.',
                position: 'top'
            },
            {
                title: 'Pronto para começar!',
                intro: 'Agora você conhece o FitMind. Registre sua primeira atividade e comece sua jornada!',
            }
        ];

        // 2. PRO Steps (No welcome text, direct to features)
        const proSteps = [
            {
                element: '#tour-smartlog',
                title: 'CalorieCam Desbloqueado!',
                intro: 'Agora você pode usar a câmera para registrar alimentos instantaneamente. Experimente na sua próxima refeição!',
                position: 'bottom'
            },
            {
                element: '#nav-workouts',
                title: 'Treinos Personalizados',
                intro: 'Acesse seus planos de treino adaptativos e inteligentes nesta aba.',
                position: 'top'
            }
        ];

        const steps = type === 'initial' ? commonSteps : proSteps;

        intro.setOptions({
            steps: steps,
            showProgress: true,
            showBullets: false,
            exitOnOverlayClick: false,
            exitOnEsc: true,
            nextLabel: 'Próximo',
            prevLabel: 'Voltar',
            doneLabel: 'Começar',
            skipLabel: 'Pular',
            disableInteraction: true,
            showSkipButton: true,
            scrollToElement: false, 
            tooltipClass: document.documentElement.classList.contains('dark') ? 'dark-mode-tour' : '',
        });

        const isFullyVisible = (el: HTMLElement) => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const windowWidth = window.innerWidth || document.documentElement.clientWidth;
            
            // Strict 100% visibility check
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= windowHeight &&
                rect.right <= windowWidth
            );
        };

        const scrollAndResolve = (el: HTMLElement, resolve: () => void) => {
            const performScroll = () => {
                if (isFullyVisible(el)) {
                    intro.refresh();
                    resolve();
                    return;
                }

                // Use smooth scroll to center the element
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Polling to detect when scroll stops and element is visible
                let lastTop = el.getBoundingClientRect().top;
                let sameCount = 0;
                let startTime = Date.now();
                
                const checkScroll = () => {
                    const rect = el.getBoundingClientRect();
                    const isVisible = isFullyVisible(el);
                    
                    if (isVisible) {
                        intro.refresh();
                        setTimeout(resolve, 200); // Stability buffer
                        return;
                    }
                    
                    // Timeout after 3 seconds to avoid infinite loop
                    if (Date.now() - startTime > 3000) {
                        intro.refresh();
                        resolve();
                        return;
                    }

                    // Check if scroll position has stabilized
                    if (Math.abs(rect.top - lastTop) < 0.5) {
                        sameCount++;
                    } else {
                        sameCount = 0;
                        lastTop = rect.top;
                    }

                    if (sameCount > 10) { // Scroll likely stopped
                        // If still not visible after scroll stops, force jump (fallback)
                        if (!isVisible) {
                             el.scrollIntoView({ behavior: 'auto', block: 'center' });
                             intro.refresh();
                             setTimeout(resolve, 100);
                        } else {
                             intro.refresh();
                             resolve();
                        }
                    } else {
                        requestAnimationFrame(checkScroll);
                    }
                };
                requestAnimationFrame(checkScroll);
            };

            // 1. Handle specific collapsible sections (Accordion/Expandable)
            // Check if element is inside a collapsed section
            const collapsedParent = el.closest('[aria-expanded="false"], .collapsed'); // Generic check
            if (collapsedParent) {
                 const toggle = collapsedParent.querySelector('button, [role="button"]');
                 if (toggle instanceof HTMLElement) {
                     toggle.click();
                     setTimeout(() => scrollAndResolve(el, resolve), 300); // Retry after expansion
                     return;
                 }
            }

            // Specific for this app's SummaryTab "Ver mais"
            if (el.id === 'tour-daily-history' || el.closest('#tour-daily-history')) {
                const section = document.getElementById('tour-daily-history');
                if (section) {
                    const buttons = Array.from(section.querySelectorAll('button'));
                    const verMaisBtn = buttons.find(b => b.innerText.includes('Ver mais'));
                    
                    if (verMaisBtn) {
                        verMaisBtn.click();
                        setTimeout(performScroll, 400); // Wait for expansion
                        return;
                    }
                }
            }

            // 2. Handle generic hidden elements (offsetParent === null usually means hidden)
            if (el.offsetParent === null) {
                let parent = el.parentElement;
                while (parent && parent !== document.body) {
                    // Try to find a toggle button in the parent chain
                    const buttons = Array.from(parent.querySelectorAll('button'));
                    const toggle = buttons.find(b => 
                        b.innerText.includes('Ver mais') || 
                        b.innerText.includes('Expandir') ||
                        b.innerText.includes('Mostrar') ||
                        b.getAttribute('aria-expanded') === 'false'
                    );

                    if (toggle) {
                        toggle.click();
                        setTimeout(() => scrollAndResolve(el, resolve), 400); // Retry
                        return;
                    }
                    parent = parent.parentElement;
                }
            }

            performScroll();
        };

        intro.onbeforechange(function(this: any, targetElement: HTMLElement) {
            return new Promise<void>((resolve) => {
                const currentStepIndex = this._currentStep;
                const currentStepData = steps[currentStepIndex];
                
                if (!currentStepData) {
                    resolve();
                    return;
                }
                
                const elementSelector = currentStepData.element;

                // If the element is supposed to be on the home page, ensure we are there
                if (elementSelector && typeof elementSelector === 'string' && elementSelector.startsWith('#tour-')) {
                    if (window.location.pathname !== '/') {
                        navigate('/');
                        setTimeout(() => {
                            const el = document.querySelector(elementSelector) as HTMLElement;
                            if (el) {
                                scrollAndResolve(el, resolve);
                            } else {
                                resolve();
                            }
                        }, 300);
                        return;
                    }
                }

                if (!targetElement && elementSelector && typeof elementSelector === 'string') {
                     // Try to find it again just in case
                     const el = document.querySelector(elementSelector) as HTMLElement;
                     if (el) {
                         scrollAndResolve(el, resolve);
                         return;
                     }
                }

                if (targetElement) {
                    scrollAndResolve(targetElement, resolve);
                } else {
                    resolve();
                }
            });
        });

        const handleScroll = () => {
            if (intro) {
                intro.refresh();
            }
        };

        const scrollContainer = document.querySelector('main.flex-grow');
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        }

        const cleanup = () => {
            if (scrollContainer) {
                scrollContainer.removeEventListener('scroll', handleScroll);
            }
            localStorage.setItem('has_seen_onboarding', 'true');
            isRunning.current = false;
        };

        intro.oncomplete(cleanup);
        intro.onexit(cleanup);

        setTimeout(() => {
            intro.start();
        }, 500);
    };

    return null; 
};
