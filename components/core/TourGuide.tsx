
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
            startTour('initial');
        } else if (triggerProTour === 'true') {
            startTour('pro');
            localStorage.removeItem('trigger_pro_tour');
        }

    }, [userData]);

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
                position: 'top'
            },
            {
                element: '#tour-nutrition',
                title: 'Nutrição Diária',
                intro: 'Monitore sua ingestão de proteínas e hidratação, essenciais para o tratamento.',
                position: 'top'
            },
            {
                element: '#tour-smartlog',
                title: 'Registro Rápido',
                intro: 'Use a IA para registrar refeições apenas descrevendo ou tirando foto.',
                position: 'top'
            },
            {
                element: '#tour-medication',
                title: 'Tratamento',
                intro: 'Visualize sua próxima dose e mantenha o controle do cronograma.',
                position: 'bottom'
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
                position: 'top'
            },
            {
                element: '#nav-workouts',
                title: 'Treinos Personalizados',
                intro: 'Acesse seus planos de treino adaptativos e inteligentes nesta aba.',
                position: 'top'
            }
        ];

        intro.setOptions({
            steps: type === 'initial' ? commonSteps : proSteps,
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

        const isElementSafeInViewport = (el: HTMLElement) => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            return (
                rect.top >= 70 &&
                rect.bottom <= (windowHeight - 120)
            );
        };

        const setOverlayOpacity = (opacity: string) => {
            const helperLayer = document.querySelector('.introjs-helperLayer') as HTMLElement;
            const tooltipReference = document.querySelector('.introjs-tooltipReferenceLayer') as HTMLElement;
            
            if (helperLayer) {
                helperLayer.style.transition = 'opacity-0.3s ease';
                helperLayer.style.opacity = opacity;
            }
            if (tooltipReference) {
                tooltipReference.style.transition = 'opacity 0.3s ease';
                tooltipReference.style.opacity = opacity;
            }
        };

        intro.onbeforechange(function(targetElement: HTMLElement) {
            return new Promise<void>((resolve) => {
                if (!targetElement) {
                    resolve();
                    return;
                }

                if (targetElement.id === 'tour-side-effects-btn') {
                    setOverlayOpacity('0');
                    if (location.pathname !== '/') navigate('/');

                    setTimeout(() => {
                        const el = document.getElementById('tour-side-effects-btn');
                        if (el) {
                            el.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'nearest' });
                            intro.refresh();
                            setTimeout(() => {
                                setOverlayOpacity('1');
                                resolve();
                            }, 100);
                        } else {
                            resolve();
                        }
                    }, 50);
                    return;
                }

                if (!isElementSafeInViewport(targetElement)) {
                    setOverlayOpacity('0');
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });

                    let lastTop = targetElement.getBoundingClientRect().top;
                    let checkCount = 0;
                    
                    const scrollInterval = setInterval(() => {
                        const currentTop = targetElement.getBoundingClientRect().top;
                        if (Math.abs(currentTop - lastTop) < 1) {
                            checkCount++;
                            if (checkCount > 2) {
                                clearInterval(scrollInterval);
                                intro.refresh();
                                setTimeout(() => {
                                    setOverlayOpacity('1');
                                    resolve();
                                }, 50);
                            }
                        } else {
                            checkCount = 0;
                            lastTop = currentTop;
                        }
                    }, 50);

                    setTimeout(() => {
                        clearInterval(scrollInterval);
                        intro.refresh();
                        setOverlayOpacity('1');
                        resolve();
                    }, 1500);
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
        }, 1000);
    };

    return null; 
};
