
import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// --- CONFIGURAÇÃO DO FIREBASE ---
// SUBSTITUA COM SUAS CHAVES DO CONSOLE FIREBASE
// Vá em: Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};

// Esta é a chave "Vapid Key" (Web Push Certificates)
// Vá em: Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration
export const VAPID_KEY = "SUA_VAPID_KEY_AQUI"; 

const app = initializeApp(firebaseConfig);

// Função segura para obter o messaging apenas se suportado
export const getFirebaseMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
    console.warn("Firebase Messaging não é suportado neste navegador.");
    return null;
  } catch (err) {
    console.error("Erro ao verificar suporte do Firebase Messaging:", err);
    return null;
  }
};
