
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
                element: '#tour-calendar',
                title: 'Calendário',
                intro: 'Navegue entre os dias para ver seu histórico ou planejar o futuro.',
                position: 'bottom'
            },
            {
                element: '#tour-summary-header',
                title: 'Resumo Diário',
                intro: 'Aqui você tem uma visão geral do seu dia, com as principais métricas e ações.',
                position: 'bottom'
            },
            {
                element: '#tour-streak',
                title: 'Sua Constância',
                intro: 'Acompanhe quantos dias seguidos você está focado no seu objetivo. Não quebre o ciclo!',
                position: 'bottom'
            },
            {
                element: '#tour-weight-card',
                title: 'Meta de Peso',
                intro: 'Acompanhe seu peso atual em relação à sua meta e registre variações rapidamente.',
                position: 'bottom'
            },
            {
                element: '#tour-nutrition',
                title: 'Nutrição Diária',
                intro: 'Monitore sua ingestão de proteínas e hidratação, pilares fundamentais do tratamento.',
                position: 'bottom'
            },
            {
                element: '#tour-smartlog',
                title: 'Registro Inteligente',
                intro: 'Use nossa IA para registrar refeições apenas descrevendo o que comeu. Simples assim!',
                position: 'bottom'
            },
            {
                element: '#tour-quick-log',
                title: 'Ações Rápidas',
                intro: 'Atalhos diretos para registrar refeições, atividades e efeitos colaterais.',
                position: 'top'
            },
            {
                element: '#tour-fab',
                title: 'Menu de Ações',
                intro: 'Acesse rapidamente as funções mais importantes do app de qualquer lugar.',
                position: 'left'
            },
            {
                element: '#tour-doses-main',
                title: 'Protocolo e Doses',
                intro: 'Gerencie seu cronograma de aplicações e acompanhe os níveis da medicação no seu corpo.',
                position: 'bottom',
                route: '/applications'
            },
            {
                element: '#tour-diet-main',
                title: 'Alimentação e Jejum',
                intro: 'Acesse seu plano alimentar personalizado e controle seus períodos de jejum intermitente.',
                position: 'bottom',
                route: '/meals'
            },
            {
                element: '#tour-workouts-main',
                title: 'Treinos Inteligentes',
                intro: 'Seu plano de exercícios adaptativo, focado em manter sua massa muscular durante o processo.',
                position: 'bottom',
                route: '/workouts'
            },
            {
                element: '#tour-progress-main',
                title: 'Evolução Corporal',
                intro: 'Visualize sua jornada através de gráficos de peso, medidas e fotos de progresso.',
                position: 'bottom',
                route: '/progress'
            },
            {
                element: '#tour-settings-main',
                title: 'Configurações',
                intro: 'Personalize suas metas, lembretes e gerencie sua conta.',
                position: 'bottom',
                route: '/settings'
            },
            {
                title: 'Tudo Pronto!',
                intro: 'Agora você está pronto para transformar sua saúde com o FitMind. Vamos começar?',
            }
        ];

        // 2. PRO Steps
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
            
            return (
                rect.top >= -50 && // Allow slightly off-screen top if we're scrolling
                rect.left >= 0 &&
                rect.bottom <= windowHeight + 50 &&
                rect.right <= windowWidth
            );
        };

        const waitForElement = (selector: string, timeout = 5000): Promise<HTMLElement | null> => {
            return new Promise((resolve) => {
                const startTime = Date.now();
                const check = () => {
                    const el = document.querySelector(selector) as HTMLElement;
                    // Ensure it's rendered, has size, and is not hidden
                    if (el && el.offsetParent !== null && el.getBoundingClientRect().width > 0) {
                        resolve(el);
                    } else if (Date.now() - startTime > timeout) {
                        resolve(null);
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
        };

        const scrollAndResolve = (el: HTMLElement, resolve: () => void) => {
            const scrollContainer = document.querySelector('main.flex-grow');
            
            const performScroll = () => {
                // If element is near the top of the page, scroll to absolute top
                const rect = el.getBoundingClientRect();
                
                // If the element is within the first 300px of the document or its container
                if (rect.top < 300 && scrollContainer) {
                    scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }

                // Polling to detect when scroll stops
                let lastTop = el.getBoundingClientRect().top;
                let sameCount = 0;
                let startTime = Date.now();
                
                const checkScroll = () => {
                    const rect = el.getBoundingClientRect();
                    const isVisible = isFullyVisible(el);
                    
                    if (isVisible) {
                        intro.refresh();
                        setTimeout(resolve, 400); // Stability buffer
                        return;
                    }
                    
                    if (Date.now() - startTime > 3000) {
                        // Force jump if smooth scroll fails
                        if (rect.top < 300 && scrollContainer) {
                            scrollContainer.scrollTo({ top: 0, behavior: 'auto' });
                        } else {
                            el.scrollIntoView({ behavior: 'auto', block: 'center' });
                        }
                        intro.refresh();
                        setTimeout(resolve, 200);
                        return;
                    }

                    if (Math.abs(rect.top - lastTop) < 1) {
                        sameCount++;
                    } else {
                        sameCount = 0;
                        lastTop = rect.top;
                    }

                    if (sameCount > 20) { 
                        intro.refresh();
                        setTimeout(resolve, 200);
                    } else {
                        requestAnimationFrame(checkScroll);
                    }
                };
                requestAnimationFrame(checkScroll);
            };

            // Handle specific collapsible sections
            const collapsedParent = el.closest('[aria-expanded="false"], .collapsed');
            if (collapsedParent) {
                 const toggle = collapsedParent.querySelector('button, [role="button"]');
                 if (toggle instanceof HTMLElement) {
                     toggle.click();
                     setTimeout(() => scrollAndResolve(el, resolve), 400);
                     return;
                 }
            }

            performScroll();
        };

        intro.onbeforechange(function(this: any, targetElement: HTMLElement) {
            const currentStepIndex = this._currentStep;
            const currentStepData = steps[currentStepIndex] as any;
            
            if (!currentStepData) return Promise.resolve();
            
            const elementSelector = currentStepData.element;
            const targetRoute = currentStepData.route;

            return new Promise<void>(async (resolve) => {
                // 1. Handle route changes
                if (targetRoute && window.location.pathname !== targetRoute) {
                    navigate(targetRoute);
                    
                    // Wait for route change and element to appear
                    const el = await waitForElement(elementSelector);
                    if (el) {
                        scrollAndResolve(el, resolve);
                    } else {
                        // Skip step if element never appears on the new page
                        this.nextStep();
                        resolve();
                    }
                    return;
                }

                // 2. If element is missing but specified, try to wait for it
                if (!targetElement && elementSelector) {
                    const el = await waitForElement(elementSelector);
                    if (el) {
                        scrollAndResolve(el, resolve);
                    } else {
                        // Skip step if element never appears
                        this.nextStep();
                        resolve();
                    }
                    return;
                }

                // 3. If element exists, ensure it's scrolled into view
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
