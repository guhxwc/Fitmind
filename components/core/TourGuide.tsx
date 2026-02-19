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

        // Steps remodelados e com textos premium
        const commonSteps = [
            {
                title: 'Boas-vindas ao FitMind! 👋',
                intro: 'Seu assistente inteligente para acompanhar o tratamento GLP-1. Vamos fazer um tour rápido para você aproveitar ao máximo!',
            },
            {
                element: '#tour-weight-card',
                title: 'Sua Evolução ⚖️',
                intro: 'Acompanhe seu peso e o progresso em relação à sua meta. Cada grama conquistada importa.',
                position: 'top'
            },
            {
                element: '#tour-nutrition',
                title: 'Nutrição e Água 💧',
                intro: 'Mantenha a ingestão de proteínas alta e bata sua meta de água para evitar efeitos colaterais.',
                position: 'top'
            },
            {
                element: '#tour-smartlog',
                title: 'Registro Mágico ✨',
                intro: 'Basta descrever o que comeu (ou tirar uma foto no PRO). Nossa IA calcula todas as calorias e proteínas pra você.',
                position: 'top'
            },
            {
                element: '#tour-medication',
                title: 'Sua Medicação 💉',
                intro: 'Acompanhe a data da próxima dose e não perca o controle. Gerencie também o nível de medicação no corpo.',
                position: 'bottom'
            },
            {
                element: '#tour-fab',
                title: 'Ações Rápidas ⚡',
                intro: 'Toque aqui a qualquer momento para registrar refeições, peso, exercícios físicos ou efeitos colaterais.',
                position: 'left'
            },
            {
                element: '#tour-nav',
                title: 'Navegação 🧭',
                intro: 'Acesse Planos de Dieta, Treinos com IA e o Histórico Completo. Tudo estruturado para seus resultados.',
                position: 'top'
            },
            {
                title: 'Tudo pronto! 🚀',
                intro: 'Sua jornada rumo à sua melhor versão começa agora. Adicione seu primeiro registro do dia!',
            }
        ];

        const proSteps = [
            {
                title: 'Você é PRO! 🌟',
                intro: 'Sua conta foi atualizada com sucesso. Agora você tem o sistema completo para garantir resultados permanentes.',
            },
            {
                element: '#tour-smartlog',
                title: 'CalorieCam Liberada 📸',
                intro: 'Aponte a câmera para seu prato e deixe a Inteligência Artificial calcular todos os macros por você.',
                position: 'top'
            },
            {
                element: '#nav-workouts',
                title: 'Treinos Adaptativos 🏋️',
                intro: 'Seus treinos exclusivos gerados por IA já estão disponíveis. Evolua respeitando os limites do seu corpo.',
                position: 'top'
            }
        ];

        intro.setOptions({
            steps: type === 'initial' ? commonSteps : proSteps,
            showProgress: false, // Esconde a barra de progresso em favor dos bullets estilo iOS
            showBullets: true,
            exitOnOverlayClick: false,
            exitOnEsc: true,
            nextLabel: 'Avançar',
            prevLabel: 'Voltar',
            doneLabel: 'Começar Agora',
            skipLabel: '×', // Usando um símbolo de "X" simples e elegante
            disableInteraction: true,
            showSkipButton: true,
            scrollToElement: false, // Nós controlamos o scroll suave manualmente
        });

        const isElementInViewport = (el: HTMLElement) => {
            const rect = el.getBoundingClientRect();
            return (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );
        };

        const setOverlayOpacity = (opacity: string) => {
            const helperLayer = document.querySelector('.introjs-helperLayer') as HTMLElement;
            const tooltipReference = document.querySelector('.introjs-tooltipReferenceLayer') as HTMLElement;
            
            if (helperLayer) {
                helperLayer.style.opacity = opacity;
            }
            if (tooltipReference) {
                tooltipReference.style.opacity = opacity;
            }
        };

        // Scroll Handling Suave
        intro.onbeforechange(function(targetElement: HTMLElement) {
            return new Promise<void>((resolve) => {
                if (!targetElement) {
                    resolve();
                    return;
                }

                if (!isElementInViewport(targetElement)) {
                    // Esconde a tooltip antes de mover a tela para evitar efeito esticado feio
                    setOverlayOpacity('0');

                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });

                    // Aguarda o scroll finalizar checando a posição do eixo Y
                    let lastScrollPos = window.pageYOffset || document.documentElement.scrollTop;
                    let checkCount = 0;
                    
                    const scrollInterval = setInterval(() => {
                        const currentScrollPos = window.pageYOffset || document.documentElement.scrollTop;
                        
                        if (Math.abs(currentScrollPos - lastScrollPos) < 2) {
                            checkCount++;
                            if (checkCount > 3) { // Tela estabilizada
                                clearInterval(scrollInterval);
                                intro.refresh(); // Recalcula a posição
                                setTimeout(() => {
                                    setOverlayOpacity('1');
                                    resolve();
                                }, 150);
                            }
                        } else {
                            checkCount = 0;
                            lastScrollPos = currentScrollPos;
                        }
                    }, 100);

                    // Timeout de segurança caso o scroll fique preso
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

        // Delay para garantir que a UI carregou perfeitamente
        setTimeout(() => {
            intro.start();
        }, 800);
    };

    return null;
};