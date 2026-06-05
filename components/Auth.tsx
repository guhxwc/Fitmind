import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useToast } from './ToastProvider';
import { useAppContext } from './AppContext';
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { track, AnalyticsEvent } from '../lib/analytics';

// A simple Google icon component
const GoogleIcon = () => (
    <svg className="w-5 h-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);


const HeroSection = ({ onLoaded }: { onLoaded: () => void }) => {
  const AMPOLA_URL  = "https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/fitmind-assets/Ampola.png";
  const SERINGA_URL = "https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/fitmind-assets/Seringa.png";
  const VIDEO_URL   = "https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/fitmind-assets/Hero.mp4";

  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 3) {
      onLoaded();
    }
    // Also set a fallback timeout just in case it hangs
    const timer = setTimeout(onLoaded, 3000);
    return () => clearTimeout(timer);
  }, []);

  const floatVariantsLeft = {
    animate: {
      y: [0, -14, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const, repeatType: "loop" as const },
    },
  };

  const floatVariantsRight = {
    animate: {
      y: [0, 14, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const, repeatType: "loop" as const, delay: 0.5 },
    },
  };

  return (
    <div className="relative w-full flex items-center justify-center" style={{ height: 340 }}>
      <motion.div
        className="absolute left-0 z-0 flex items-center justify-center"
        style={{ width: 100, bottom: 0, top: 0 }}
        variants={floatVariantsLeft}
        animate="animate"
      >
        <img src={SERINGA_URL} alt="Seringa GLP-1"
          style={{ width: 200, maxWidth: 'none', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))', transform: 'rotate(45deg)', marginTop: '-240px' }} />
      </motion.div>

      <div style={{ width: '70%', maxWidth: 245, borderRadius: 28, overflow: 'hidden', boxShadow: '0 16px 48px rgba(0,0,0,0.22)', position: 'relative', zIndex: 5, background: 'transparent' }}>
        <video ref={videoRef} src={VIDEO_URL} autoPlay loop muted playsInline onCanPlayThrough={onLoaded} onLoadedData={onLoaded}
          style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 28, transform: 'scale(1.01)' }} />
      </div>

      <motion.div
        className="absolute right-[-12px] z-0 flex items-center justify-center"
        style={{ width: 100, bottom: 0, top: 0 }}
        variants={floatVariantsRight}
        animate="animate"
      >
        <img src={AMPOLA_URL} alt="Ampola GLP-1"
          style={{ width: 130, maxWidth: 'none', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))', marginTop: '160px' }} />
      </motion.div>
    </div>
  );
};

const translateAuthError = (message: string) => {
  if (message.includes('Invalid login credentials')) return 'Email ou senha incorretos.';
  if (message.includes('User already registered')) return 'Este email já está cadastrado.';
  if (message.includes('Password should be at least')) return 'A senha deve ter pelo menos 8 caracteres.';
  if (message.includes('Email not confirmed')) return 'Email não confirmado. Verifique sua caixa de entrada.';
  if (message.includes('Token has expired or is invalid')) return 'O código expirou ou é inválido.';
  if (message.includes('For security purposes, you can only request this after')) return 'Por segurança, aguarde alguns instantes antes de tentar novamente.';
  if (message.includes('Signups not allowed for this instance')) return 'Cadastros estão desativados no momento.';
  return 'Ocorreu um erro inesperado. Tente novamente.';
};

export const Auth: React.FC<{ defaultView?: 'welcome' | 'login_options' | 'signup_options' | 'login_email' | 'signup_email' | 'verify_email' | 'enter_token' }> = ({ defaultView = 'welcome' }) => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const [view, setView] = useState<'welcome' | 'login_options' | 'signup_options' | 'login_email' | 'signup_email' | 'verify_email' | 'enter_token'>(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (mode === 'signup_options' || mode === 'login_options' || mode === 'welcome') {
      return mode as any;
    }
    return defaultView;
  });
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    if (!mode) {
      setView(defaultView);
    }
  }, [defaultView]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (view === 'enter_token') {
      inputRefs.current[0]?.focus();
    }
  }, [view]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    track(AnalyticsEvent.oauthStarted, { provider: 'google' });

    // Preserva o código de indicação no redirectTo para que sobreviva ao OAuth
    // O Google redireciona de volta para esta URL, onde o App.tsx vai capturá-lo
    const currentRef = localStorage.getItem('affiliate_ref') || sessionStorage.getItem('affiliate_ref');
    const redirectUrl = currentRef
      ? `${window.location.origin}/?ref=${currentRef}`
      : window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    if (error) {
      track(AnalyticsEvent.loginFailed, { provider: 'google', reason: error.message });
      setError(translateAuthError(error.message));
      setLoading(false);
    }
    // On success, Supabase redirects.
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    track(AnalyticsEvent.loginAttempted, { provider: 'email' });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      track(AnalyticsEvent.loginFailed, { provider: 'email', reason: error.message });
      setError(translateAuthError(error.message));
    }
    // O onAuthStateChange em App.tsx cuidará do resto
    setLoading(false);
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Por favor, insira seu email para redefinir a senha.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    track(AnalyticsEvent.passwordResetRequested);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(translateAuthError(error.message));
    } else {
      setMessage("Link de redefinição de senha enviado para o seu email.");
    }
    setLoading(false);
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    track(AnalyticsEvent.signupStarted, {
      has_referral: !!(localStorage.getItem('affiliate_ref') || sessionStorage.getItem('affiliate_ref')),
    });

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      setLoading(false);
      return;
    }

    let userMetaData = {};
    const pendingOnboardingStr = localStorage.getItem('onboarding_userData');
    if (pendingOnboardingStr) {
      try {
        userMetaData = { onboarding_data: JSON.parse(pendingOnboardingStr) };
      } catch (e) {
        console.error("Erro ao fazer parse dos dados de onboarding", e);
      }
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: userMetaData
      }
    });

    if (signUpError) {
      console.error("Erro no SignUp:", signUpError);
      track(AnalyticsEvent.signupFailed, { reason: signUpError.message });
      setError(translateAuthError(signUpError.message));
      setLoading(false);
      return;
    }

    console.log("SignUp realizado com sucesso, aguardando confirmação.");
    track(AnalyticsEvent.signupCompleted, {
      provider: 'email',
      has_referral: !!(localStorage.getItem('affiliate_ref') || sessionStorage.getItem('affiliate_ref')),
    });
    setView('verify_email');
    setLoading(false);
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    console.log("Tentando reenviar email para:", email);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });

    if (error) {
      console.error("Erro ao reenviar email:", error);
      const match = error.message.match(/after (\d+) seconds/);
      if (match) {
        setResendCountdown(parseInt(match[1], 10));
      }
      setError(translateAuthError(error.message));
    } else {
      console.log("Email de reenvio disparado com sucesso.");
      setMessage(`Novo link enviado para ${email}.`);
    }
    setLoading(false);
  };

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const otp = token.join('');
    if (otp.length !== 6) {
      setError("O código deve ter 6 dígitos.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email', // 'email' type also works for verifying email after signup and logs the user in.
    });

    if (error) {
      setError(translateAuthError(error.message));
      setToken(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } else {
      addToast("Conta verificada e criada com sucesso!", "success");
    }
    // O onAuthStateChange em App.tsx cuidará do resto
    setLoading(false);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value) || value === '') {
      const newCode = [...token];
      newCode[index] = value;
      setToken(newCode);

      // Move focus to the next input
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && token[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^[0-9]{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setToken(newCode);
      inputRefs.current[5]?.focus();
    }
  };

  const renderLoginOrSignupView = (isSignupView: boolean) => {
    const handleSubmit = isSignupView ? handleSignUp : handleLogin;
    return (
        <div className="h-screen flex flex-col p-8 bg-white dark:bg-black overflow-y-auto">
          <div className="pt-4">
            <button onClick={() => { setView(isSignupView ? 'signup_options' : 'login_options'); setError(null); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          </div>

          <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
              <div className="text-left mb-10">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{isSignupView ? 'Criar sua conta' : 'Entrar na sua conta'}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Use seu email e senha para continuar.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="voce@email.com"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {isSignupView && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Senha</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`mt-1 block w-full px-3 py-3 border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        confirmPassword && password !== confirmPassword 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-300 dark:border-gray-600 focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white'
                      }`}
                      placeholder="••••••••"
                      required
                    />
                    {confirmPassword && password !== confirmPassword && (
                      <p className="mt-1 text-xs text-red-500">As senhas não coincidem.</p>
                    )}
                  </div>
                )}
                
                {!isSignupView && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                )}
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                {message && <p className="text-green-500 text-sm text-center">{message}</p>}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:bg-gray-400 dark:disabled:bg-gray-600"
                  >
                    {loading ? 'Aguarde...' : (isSignupView ? 'Criar Conta' : 'Entrar')}
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                {isSignupView ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Já tem uma conta?{' '}
                    <button onClick={() => { setView('login_options'); setError(null); }} className="font-semibold text-black dark:text-white hover:underline">
                      Entre agora
                    </button>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Não tem uma conta?{' '}
                    <button onClick={() => { setView('signup_options'); setError(null); }} className="font-semibold text-black dark:text-white hover:underline">
                      Cadastre-se agora
                    </button>
                  </p>
                )}
              </div>
          </div>
        </div>
    );
  };

  switch (view) {
    case 'login_email':
      return renderLoginOrSignupView(false);
    case 'signup_email':
      return renderLoginOrSignupView(true);
    case 'login_options':
      return (
        <div className="h-screen flex flex-col p-8 bg-white dark:bg-black overflow-y-auto">
          <div className="pt-4">
            <button onClick={() => { setView('welcome'); setError(null); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          </div>
          <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-10 text-center">Acesse sua conta</h1>
            <div className="space-y-4">
              <button onClick={handleGoogleLogin} disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all shadow-sm disabled:opacity-60">
                <GoogleIcon /> Entrar com Google
              </button>
              <button onClick={() => setView('login_email')} disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all shadow-sm disabled:opacity-60">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Entrar com e-mail
              </button>
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-6">{error}</p>}
          </div>
        </div>
      );
    case 'signup_options':
      return (
        <div className="h-screen flex flex-col p-8 bg-white dark:bg-black overflow-y-auto">
          <div className="pt-4 mb-8">
            <button onClick={() => { navigate(-1); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 text-center">Crie sua conta pra resgatar o seu plano personalizado</h1>
          </div>
          <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="space-y-4">
              <button onClick={handleGoogleLogin} disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all shadow-sm disabled:opacity-60">
                <GoogleIcon /> Cadastrar com Google
              </button>
              <button onClick={() => setView('signup_email')} disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-gray-200 dark:border-gray-700 rounded-2xl text-base font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 transition-all shadow-sm disabled:opacity-60">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                Cadastrar com e-mail
              </button>
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-6">{error}</p>}
          </div>
        </div>
      );
    case 'verify_email':
      return (
        <div className="h-screen flex flex-col justify-center p-8 bg-white dark:bg-black text-center animate-fade-in">
          <div className="max-w-md mx-auto w-full">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 animate-bounce-slow">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/><rect width="20" height="16" x="2" y="4" rx="2"/></svg>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black border-4 border-white dark:border-black">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Verifique seu email</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg">
              Enviamos um link de confirmação para:
            </p>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 inline-block">
              <span className="font-bold text-gray-900 dark:text-gray-100">{email}</span>
            </div>

            <p className="text-gray-500 dark:text-gray-400 mt-6 leading-relaxed">
              Por favor, clique no botão <span className="text-blue-600 dark:text-blue-400 font-bold">"Entrar no FitMind"</span> no email que enviamos para ativar sua conta.
            </p>
            
            <div className="mt-10 space-y-6">
              <button 
                onClick={() => window.location.reload()} 
                className="w-full py-4 px-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all hover:opacity-90"
              >
                Já confirmei meu email
              </button>
              
              <div className="pt-2 flex flex-col gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">Não recebeu o email ou o link expirou?</p>
                <button 
                  onClick={handleResendEmail}
                  disabled={loading || resendCountdown > 0}
                  className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 dark:border-gray-600 dark:border-t-white rounded-full animate-spin"></div>
                      Enviando...
                    </>
                  ) : resendCountdown > 0 ? (
                    `Reenviar em ${resendCountdown}s`
                  ) : 'Reenviar link de confirmação'}
                </button>
                {message && view === 'verify_email' && (
                  <p className="text-blue-600 dark:text-blue-400 text-sm font-medium animate-fade-in flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    {message}
                  </p>
                )}
                {error && view === 'verify_email' && (
                  <p className="text-red-500 text-sm animate-shake">{error}</p>
                )}
              </div>

              <button 
                onClick={() => { setView('signup_options'); setError(null); setMessage(null); }} 
                className="w-full py-2 px-4 text-gray-500 dark:text-gray-400 font-medium hover:text-gray-900 dark:hover:text-gray-100 transition-colors text-sm"
              >
                Usar outro email
              </button>
            </div>
          </div>
        </div>
      );
    case 'enter_token':
       return (
        <div className="h-screen flex flex-col justify-center p-8 bg-white dark:bg-black">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Verifique seu email</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">{message}</p>

          <form onSubmit={handleVerifyCode} className="mt-8">
              <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {token.map((digit, index) => (
                      <input
                          key={index}
                          ref={el => { if (el) inputRefs.current[index] = el }}
                          type="tel"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleTokenChange(e, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          className="w-12 h-14 text-center text-2xl font-bold bg-gray-100 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                  ))}
              </div>
              
              {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}

              <div className="pt-6">
                  <button
                      type="submit"
                      disabled={loading || token.join('').length !== 6}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none disabled:bg-gray-400 dark:disabled:bg-gray-600"
                  >
                      {loading ? 'Verificando...' : 'Confirmar Código'}
                  </button>
              </div>
          </form>

          <div className="mt-6 text-center">
              <button onClick={() => { setView('signup_options'); setError(null); }} className="font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  Usar outro email
              </button>
          </div>
        </div>
      );
    case 'welcome':
    default:
      return (
        <>
          <AnimatePresence>
            {!isVideoLoaded && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-black"
              >
                <Loader2 className="w-10 h-10 animate-spin text-gray-400 mb-4" />
                {/* Git Trigger */}
                <p className="text-gray-500 font-medium">Carregando...</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="min-h-[100dvh] flex flex-col bg-white dark:bg-black overflow-x-hidden overflow-y-auto">
            <div className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-10">
              <HeroSection onLoaded={() => setIsVideoLoaded(true)} />
            </div>
            <div className="px-6 pb-12 flex flex-col gap-0 mt-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-black tracking-tight text-black dark:text-white leading-tight">
                  Bem-vindo ao <span className="font-black">FitMind</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-base">O App #1 para acompanhar seu tratamento</p>
              </div>
              <div className="space-y-3">
                <button onClick={() => navigate('/onboarding')} disabled={loading}
                  className="w-full flex justify-center items-center py-4 px-4 rounded-2xl text-lg font-bold text-white bg-black dark:bg-white dark:text-black hover:opacity-90 active:scale-95 transition-all shadow-md disabled:opacity-60">
                  Começar
                </button>
              </div>
              <div className="mt-5 text-center">
                  <button onClick={() => setView('login_options')} className="text-base text-gray-500 dark:text-gray-400 font-medium hover:text-black dark:hover:text-white underline underline-offset-4">Já tenho uma conta</button>
              </div>
            </div>
          </div>
        </>
      );
  }
};