
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useToast } from './ToastProvider';
import { motion, AnimatePresence } from "framer-motion";
import { Syringe, Dumbbell, TrendingUp, Apple } from "lucide-react";

// A simple Google icon component
const GoogleIcon = () => (
    <svg className="w-5 h-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);


const AuthAnimation = () => {
  const [step, setStep] = useState(0);

  // Roteiro de animação com os novos tempos (mais rápido nos ícones, normal no retorno)
  const sequence = [
    { duration: 2500 }, // 0: Intro (FitMind no centro - Velocidade normal)
    {
      icon: Syringe,
      title: "Controle suas doses",
      sub: "Nunca mais esqueça de tomar suas doses.",
      duration: 2200, // Mais rápido
    }, // 1: Seringa
    {
      icon: Dumbbell,
      title: "Proteja seus músculos",
      sub: "Perca gordura sem perder massa muscular.",
      duration: 2200, // Mais rápido
    }, // 2: Alter
    {
      icon: TrendingUp,
      title: "Acompanhe seu progresso",
      sub: "",
      duration: 1800, // Bem rápido
    }, // 3: Gráfico
    {
      icon: Apple,
      title: "Otimize sua dieta",
      sub: "",
      duration: 1800, // Bem rápido
    }, // 4: Maçã
    { duration: 2800 }, // 5: Partículas e descida da Logo (Retorna à velocidade normal/suave)
  ];

  // Controlador de tempo do loop
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep((prev) => (prev + 1) % sequence.length);
    }, sequence[step].duration);

    return () => clearTimeout(timer);
  }, [step]);

  const CurrentIcon = sequence[step]?.icon;

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-[400px] overflow-hidden font-sans text-black dark:text-white mb-4">
      
      {/* ====================================================
        TEXTO "FitMind" (Logo Topo / Centro)
        ==================================================== 
      */}
      <motion.div
        animate={{
          y: step === 0 ? 0 : step === 5 ? 0 : -180,
          scale: step === 0 ? 1.5 : step === 5 ? 0.5 : 0.8,
          opacity: step === 5 ? 0 : 1,
        }}
        transition={{ 
          duration: step === 0 || step === 5 ? 1.2 : 0.6, // Mais suave ao descer/aparecer, mais rápido ao subir
          ease: "easeInOut" 
        }}
        className="absolute z-10 flex text-black dark:text-white text-5xl cursor-default"
      >
        <span className="font-black tracking-tighter">Fit</span>
        <span className="font-light tracking-tight">Mind</span>
      </motion.div>

      {/* ====================================================
        ÍCONES E TEXTOS CENTRAIS (Passos 1 a 4)
        ==================================================== 
      */}
      <div className="relative flex flex-col items-center justify-center w-full max-w-lg mt-10 h-80">
        <AnimatePresence mode="popLayout">
          {step > 0 && step < 5 && CurrentIcon && (
            <motion.div
              key={`icon-${step}`}
              initial={{ scale: 0.2, rotate: -90, opacity: 0, filter: "blur(8px)" }}
              animate={{ scale: 1, rotate: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{
                scale: 0.2,
                rotate: 90,
                opacity: 0,
                filter: "blur(8px)",
                position: "absolute",
              }}
              transition={{ type: "spring", stiffness: 250, damping: 25 }} // Mola um pouquinho mais rígida pra ser mais rápido
              className="absolute top-0 flex justify-center"
            >
              <CurrentIcon size={120} strokeWidth={1} className="text-black dark:text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="popLayout">
          {step > 0 && step < 5 && (
            <motion.div
              key={`text-${step}`}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0, position: "absolute" }}
              transition={{ delay: 0.1, duration: 0.4, ease: "easeOut" }} // Textos entram mais rápido também
              className="absolute top-40 text-center flex flex-col items-center px-6 w-full"
            >
              <h2 className="text-3xl md:text-3xl font-extrabold tracking-tight text-black dark:text-white mb-4">
                {sequence[step].title}
              </h2>
              {sequence[step].sub && (
                <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl font-medium max-w-sm leading-snug">
                  {sequence[step].sub}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ====================================================
        PARTÍCULAS DE LUZ (Passo 5 - Dissolução suave)
        ==================================================== 
      */}
      <AnimatePresence>
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: [0, 180, 360] }}
            exit={{ opacity: 0 }}
            transition={{
              rotate: { duration: 2.5, ease: "easeInOut" }, // Rotação mais suave
              opacity: { duration: 0.4 }
            }}
            className="absolute z-40 w-40 h-40 flex items-center justify-center"
          >
            {[0, 90, 180, 270].map((angle, i) => (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 0 }}
                animate={{
                  x: [0, Math.cos((angle * Math.PI) / 180) * 100, 0],
                  y: [0, Math.sin((angle * Math.PI) / 180) * 100, 0],
                  scale: [0, 1.5, 1, 0],
                }}
                transition={{ duration: 2.5, ease: "easeInOut" }} // Partículas acompanham o tempo relaxado
                className="absolute w-4 h-4 bg-black dark:bg-white rounded-full"
                style={{
                  boxShadow: "0 0 20px 5px rgba(0, 0, 0, 0.4)",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
    </div>
  );
}

export const Auth: React.FC = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'enter_token' | 'verify_email'>('landing');
  const [emailSentAutomatically, setEmailSentAutomatically] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (view === 'enter_token') {
      inputRefs.current[0]?.focus();
    }
    
    if (view === 'verify_email' && !emailSentAutomatically) {
      handleResendEmail();
      setEmailSentAutomatically(true);
    }
  }, [view, emailSentAutomatically]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // On success, Supabase redirects.
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    // O onAuthStateChange em App.tsx cuidará do resto
    setLoading(false);
  };

  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      }
    });

    if (signUpError) {
      console.error("Erro no SignUp:", signUpError);
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    console.log("SignUp realizado com sucesso, aguardando confirmação.");
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
      setError(error.message);
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
      setError(error.message);
      setToken(Array(6).fill(''));
      inputRefs.current[0]?.focus();
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
            <button onClick={() => { setView('landing'); setError(null); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
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
                      className="mt-1 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                )}
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

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
          </div>
        </div>
    );
  };

  switch (view) {
    case 'login':
      return renderLoginOrSignupView(false);
    case 'signup':
      return renderLoginOrSignupView(true);
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
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-900 dark:border-gray-600 dark:border-t-white rounded-full animate-spin"></div>
                      Enviando...
                    </>
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
                onClick={() => { setView('signup'); setEmailSentAutomatically(false); setError(null); setMessage(null); }} 
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
              <button onClick={() => { setView('signup'); setError(null); }} className="font-medium text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                  Usar outro email
              </button>
          </div>
        </div>
      );
    case 'landing':
    default:
      return (
        <div className="h-screen flex flex-col justify-center p-8 pb-32 bg-white dark:bg-black">
          <AuthAnimation />

          <div className="space-y-4">
            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none disabled:bg-gray-200 dark:disabled:bg-gray-700"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            <button
                onClick={() => setView('login')}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
                Entrar com Email
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Não tem uma conta?{' '}
                <button onClick={() => setView('signup')} className="font-semibold text-black dark:text-white hover:underline">
                    Cadastre-se
                </button>
            </p>
          </div>
        </div>
      );
  }
};
