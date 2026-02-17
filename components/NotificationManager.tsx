
import React, { useEffect, useRef } from 'react';
import { useAppContext } from './AppContext';
import { NOTIFICATION_MESSAGES, WEEKDAYS } from '../constants';
import { getFirebaseMessaging, VAPID_KEY } from '../firebaseClient';
import { getToken } from 'firebase/messaging';
import { supabase } from '../supabaseClient';

const getRandomMessage = (category: keyof typeof NOTIFICATION_MESSAGES) => {
    const messages = NOTIFICATION_MESSAGES[category];
    return messages[Math.floor(Math.random() * messages.length)];
};

export const NotificationManager: React.FC = () => {
    const { userData } = useAppContext();
    const lastCheckedMinute = useRef<string>('');
    const tokenSentToServer = useRef<boolean>(false);

    // 1. Função para Notificação Local (Fallback e uso imediato)
    const sendLocalNotification = async (title: string, body: string, tag?: string) => {
        if (!("Notification" in window)) return;
        
        if (Notification.permission === "granted") {
            try {
                // Ensure service worker is ready before trying to show notification
                const registration = await navigator.serviceWorker.ready;
                
                if (registration && 'showNotification' in registration) {
                    await registration.showNotification(title, {
                        body,
                        icon: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
                        badge: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
                        tag,
                        vibrate: [200, 100, 200],
                        requireInteraction: true,
                        data: { url: '/' }
                    } as any);
                } else {
                    new Notification(title, {
                        body,
                        icon: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
                        tag
                    });
                }
            } catch (e) {
                console.error("Local notification error:", e);
                new Notification(title, { body, tag });
            }
        }
    };

    // 2. Registro do Token FCM no Supabase (Para Push Remoto via Edge Function)
    const registerFcmToken = async () => {
        if (!userData || tokenSentToServer.current) return;

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const messaging = await getFirebaseMessaging();
                
                if (!messaging) {
                    console.log("Messaging not supported or failed to initialize");
                    return;
                }

                // CRITICAL FIX: Wait for the service worker to be ready
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    
                    // Obtém o token do Firebase
                    const currentToken = await getToken(messaging, { 
                        vapidKey: VAPID_KEY,
                        serviceWorkerRegistration: registration
                    });

                    if (currentToken) {
                        console.log('FCM Token obtido:', currentToken);
                        
                        // Salva na tabela user_devices
                        const { error } = await supabase
                            .from('user_devices')
                            .upsert({ 
                                user_id: userData.id,
                                token: currentToken,
                                platform: 'web',
                                last_active_at: new Date().toISOString()
                            }, { onConflict: 'token' });

                        if (!error) {
                            tokenSentToServer.current = true;
                            console.log('Token salvo no Supabase com sucesso.');
                        } else {
                            console.error('Erro ao salvar token no Supabase:', error);
                        }
                    } else {
                        console.log('Nenhum token de registro disponível.');
                    }
                }
            }
        } catch (err) {
            console.error('Um erro ocorreu ao recuperar o token.', err);
        }
    };

    // Effect para registrar o token quando o usuário logar/carregar
    useEffect(() => {
        if (userData && userData.notifications?.enabled) {
            registerFcmToken();
        }
    }, [userData]);

    // Effect para verificações locais (Backup do Edge Function ou para feedback imediato)
    useEffect(() => {
        if (!userData || !userData.notifications?.enabled) return;

        const checkTime = () => {
            const now = new Date();
            const currentHour = now.getHours().toString().padStart(2, '0');
            const currentMinute = now.getMinutes().toString().padStart(2, '0');
            const currentTimeStr = `${currentHour}:${currentMinute}`;
            
            if (currentTimeStr === lastCheckedMinute.current) return;
            lastCheckedMinute.current = currentTimeStr;

            const { notifications, medication } = userData;

            // Logica Local (Funciona mesmo offline ou se o push falhar)
            if (currentTimeStr === notifications.breakfastTime) sendLocalNotification("FitMind: Café da Manhã", getRandomMessage('breakfast'), 'meal-breakfast');
            if (currentTimeStr === notifications.lunchTime) sendLocalNotification("FitMind: Almoço", getRandomMessage('lunch'), 'meal-lunch');
            if (currentTimeStr === notifications.snackTime) sendLocalNotification("FitMind: Lanche", getRandomMessage('snack'), 'meal-snack');
            if (currentTimeStr === notifications.dinnerTime) sendLocalNotification("FitMind: Jantar", getRandomMessage('dinner'), 'meal-dinner');
            if (currentTimeStr === notifications.checkinTime) sendLocalNotification("FitMind: Check-in Diário", getRandomMessage('checkin'), 'wellness');

            if (currentTimeStr === notifications.medicationTime) {
                const todayName = WEEKDAYS[now.getDay()];
                const isDaily = userData.applicationFrequency === 'Diariamente';
                if (isDaily || todayName === medication.nextApplication) {
                    sendLocalNotification("FitMind: Hora da Aplicação", getRandomMessage('medication'), 'medication');
                }
            }

            if (notifications.hydrationInterval > 0) {
                const hour = now.getHours();
                const minute = now.getMinutes();
                if (hour >= 8 && hour <= 22 && minute === 0 && hour % notifications.hydrationInterval === 0) {
                     sendLocalNotification("FitMind: Hidratação", getRandomMessage('hydration'), 'water');
                }
            }
        };

        const interval = setInterval(checkTime, 30000);
        return () => clearInterval(interval);

    }, [userData]);

    return null;
};
