
import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// --- CONFIGURAÇÃO DO FIREBASE ---
// As chaves são lidas das variáveis de ambiente (process.env)
// Configure seu arquivo .env com estas variáveis
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "SUA_API_KEY_AQUI",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "seu-projeto.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "seu-projeto",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "seu-projeto.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "SEU_SENDER_ID",
  appId: process.env.FIREBASE_APP_ID || "SEU_APP_ID"
};

// Chave Vapid para Web Push
export const VAPID_KEY = process.env.FIREBASE_VAPID_KEY || "SUA_VAPID_KEY_AQUI"; 

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
