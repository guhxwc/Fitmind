
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

        // Specific steps as requested by the user
        const commonSteps = [
            // 1. Welcome
            {
                title: 'Bem-vindo ao FitMind!',
                intro: 'Seu assistente completo para acompanhar seu tratamento GLP-1 e evolução. Vamos conhecer o app!',
            },
            // 2. Weight Goal
            {
                element: '#tour-weight-card',
                title: 'Meta de Peso',
                intro: 'Aqui você acompanha seu peso atual em relação à sua meta e registra variações.',
                position: 'top'
            },
            // 3. Nutrition (Protein/Water)
            {
                element: '#tour-nutrition',
                title: 'Nutrição Diária',
                intro: 'Monitore sua ingestão de proteínas e hidratação, essenciais para o tratamento.',
                position: 'top'
            },
            // 4. Quick Action (Smart Log)
            {
                element: '#tour-smartlog',
                title: 'Registro Rápido',
                intro: 'Use a IA para registrar refeições apenas descrevendo ou tirando foto.',
                position: 'top'
            },
            // 5. Treatment (Medication Card)
            {
                element: '#tour-medication',
                title: 'Tratamento',
                intro: 'Visualize sua próxima dose e mantenha o controle do cronograma.',
                position: 'bottom'
            },
            // 6. Diet & Fasting (Nav Icon)
            {
                element: '#nav-meals',
                title: 'Dieta e Jejum',
                intro: 'Nesta aba, acesse seu plano alimentar e controle seus jejuns.',
                position: 'top'
            },
            // 7. Doses (Nav Icon)
            {
                element: '#nav-applications',
                title: 'Doses e Níveis',
                intro: 'Histórico completo de aplicações e estimativa do nível da medicação no corpo.',
                position: 'top'
            },
            // 8. Side Effects (Quick Action Btn)
            {
                element: '#tour-side-effects-btn',
                title: 'Efeitos Colaterais',
                intro: 'Registre sintomas rapidamente para receber dicas de alívio.',
                position: 'top'
            },
            // 9. Results/Graph (Nav Icon)
            {
                element: '#nav-progress',
                title: 'Resultados e Gráficos',
                intro: 'Acompanhe sua curva de peso, fotos de progresso e estatísticas corporais.',
                position: 'top'
            },
            // 10. History (Daily Records Section)
            {
                element: '#tour-daily-history',
                title: 'Histórico de Registros',
                intro: 'Tudo o que você fez hoje aparece aqui: refeições, treinos e doses.',
                position: 'top'
            },
            // 11. Settings (Nav Icon)
            {
                element: '#nav-settings',
                title: 'Configurações',
                intro: 'Ajuste suas metas, lembretes e dados da conta.',
                position: 'top'
            },
            // 12. Conclusion
            {
                title: 'Pronto para começar!',
                intro: 'Agora você conhece o FitMind. Registre sua primeira atividade e comece sua jornada!',
            }
        ];

        const proSteps = [
            {
                title: 'Bem-vindo ao PRO!',
                intro: 'Parabéns pela decisão! Agora você tem o sistema completo para garantir seus resultados.',
            },
            {
                element: '#tour-smartlog',
                title: 'CalorieCam Liberado',
                intro: 'Agora você pode usar a câmera para registrar alimentos instantaneamente. Experimente na sua próxima refeição!',
                position: 'top'
            },
            {
                element: '#nav-workouts',
                title: 'Treinos Personalizados',
                intro: 'Acesse seus planos de treino adaptativos nesta aba.',
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
            scrollToElement: false, // We handle scrolling manually for better control
            tooltipClass: document.documentElement.classList.contains('dark') ? 'dark-mode-tour' : '',
        });

        // Function to check if element is in viewport
        const isElementInViewport = (el: HTMLElement) => {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        };

        // Helper to manipulate Intro.js overlay opacity
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

        // Advanced Scroll Handler
        intro.onbeforechange(function(targetElement: HTMLElement) {
            return new Promise<void>((resolve) => {
                if (!targetElement) {
                    resolve();
                    return;
                }

                // SPECIAL HANDLING: Side Effects Button
                // Jump directly to view without smooth scroll animation (Snap behavior)
                if (targetElement.id === 'tour-side-effects-btn') {
                    // 1. Hide overlay to prevent visual glitches
                    setOverlayOpacity('0');

                    // 2. Ensure we are on the correct route
                    if (location.pathname !== '/') {
                        navigate('/');
                    }

                    // 3. Instant Snap (setTimeout allows React to render/route to settle)
                    setTimeout(() => {
                        const el = document.getElementById('tour-side-effects-btn');
                        if (el) {
                            el.scrollIntoView({
                                behavior: 'auto', // INSTANT SNAP (No animation)
                                block: 'center',
                                inline: 'nearest'
                            });
                            intro.refresh();
                            
                            // 4. Fade In
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

                // STANDARD HANDLING: Smooth Scroll for other elements
                // If not visible or partially visible
                if (!isElementInViewport(targetElement)) {
                    
                    // 1. Hide the highlighter immediately to prevent ugly jumping
                    setOverlayOpacity('0');

                    // 2. Scroll to element
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });

                    // 3. Wait for scroll to finish
                    let lastScrollPos = window.pageYOffset || document.documentElement.scrollTop;
                    let checkCount = 0;
                    
                    const scrollInterval = setInterval(() => {
                        const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
                        
                        // Check if scroll stopped (position hasn't changed in 100ms)
                        if (Math.abs(currentScrollPos - lastScrollPos) < 2) {
                            checkCount++;
                            // Confirm stability (wait ~300ms of stability)
                            if (checkCount > 3) {
                                clearInterval(scrollInterval);
                                
                                // 4. Refresh Intro.js position calculation now that we are steady
                                intro.refresh();
                                
                                // 5. Fade highlighter back in and resolve
                                setTimeout(() => {
                                    setOverlayOpacity('1');
                                    resolve();
                                }, 150);
                            }
                        } else {
                            checkCount = 0; // Reset if still moving
                            lastScrollPos = currentScrollPos;
                        }
                    }, 100);

                    // Safety timeout (max 1.5s scroll time)
                    setTimeout(() => {
                        clearInterval(scrollInterval);
                        intro.refresh();
                        setOverlayOpacity('1');
                        resolve();
                    }, 1500);
                } else {
                    // Element is visible, just proceed
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

        // Delay slightly to ensure DOM elements are rendered
        setTimeout(() => {
            intro.start();
        }, 1000);
    };

    return null; // This is a logic-only component
};
