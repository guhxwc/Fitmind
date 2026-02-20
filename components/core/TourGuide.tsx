
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

        const setOverlayOpacity = (opacity: string) => {
            const helperLayer = document.querySelector('.introjs-helperLayer') as HTMLElement;
            const tooltipReference = document.querySelector('.introjs-tooltipReferenceLayer') as HTMLElement;
            
            if (helperLayer) {
                helperLayer.style.transition = 'opacity 0.3s ease';
                helperLayer.style.opacity = opacity;
            }
            if (tooltipReference) {
                tooltipReference.style.transition = 'opacity 0.3s ease';
                tooltipReference.style.opacity = opacity;
            }
        };

        const scrollAndResolve = (el: HTMLElement, resolve: () => void) => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            
            // Check if element is reasonably in view
            const isSafe = rect.top >= 80 && rect.bottom <= (windowHeight - 100);

            if (!isSafe) {
                setOverlayOpacity('0');
                
                // Find the scrollable container (main)
                const scrollContainer = document.querySelector('main.flex-grow') || document.documentElement;
                
                // Calculate position to scroll to center
                const containerRect = scrollContainer.getBoundingClientRect();
                const absoluteElementTop = rect.top - containerRect.top + scrollContainer.scrollTop;
                const middle = absoluteElementTop - (containerRect.height / 2) + (rect.height / 2);
                
                scrollContainer.scrollTo({
                    top: Math.max(0, middle),
                    behavior: 'smooth'
                });

                // Wait for scroll to finish
                setTimeout(() => {
                    intro.refresh();
                    setOverlayOpacity('1');
                    resolve();
                }, 600);
            } else {
                resolve();
            }
        };

        intro.onbeforechange(function(this: any, targetElement: HTMLElement) {
            return new Promise<void>((resolve) => {
                const currentStepIndex = this._currentStep;
                const currentStepData = steps[currentStepIndex];
                
                // If the element is supposed to be on the home page, ensure we are there
                if (currentStepData.element && (currentStepData.element as string).startsWith('#tour-')) {
                    if (window.location.pathname !== '/') {
                        setOverlayOpacity('0');
                        navigate('/');
                        setTimeout(() => {
                            const el = document.querySelector(currentStepData.element as string) as HTMLElement;
                            if (el) {
                                scrollAndResolve(el, resolve);
                            } else {
                                resolve();
                            }
                        }, 300);
                        return;
                    }
                }

                if (!targetElement && currentStepData.element) {
                     // Try to find it again just in case
                     const el = document.querySelector(currentStepData.element as string) as HTMLElement;
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

        intro.oncomplete(() => {
            localStorage.setItem('has_seen_onboarding', 'true');
            isRunning.current = false;
        });

        intro.onexit(() => {
            localStorage.setItem('has_seen_onboarding', 'true');
            isRunning.current = false;
        });

        setTimeout(() => {
            intro.start();
        }, 500);
    };

    return null; 
};
