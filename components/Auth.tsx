import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// A simple Google icon component
const GoogleIcon = () => (
    <svg className="w-5 h-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
);


export const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'enter_token'>('landing');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (view === 'enter_token') {
      inputRefs.current[0]?.focus();
    }
  }, [view]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
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

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
    });

    if (otpError) {
      setError(otpError.message);
    } else {
      setMessage(`Um código de verificação foi enviado para ${email}.`);
      setView('enter_token');
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
        <div className="h-screen flex flex-col p-8 bg-white dark:bg-black">
          <div className="pt-4">
            <button onClick={() => { setView('landing'); setError(null); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          </div>

          <div className="flex-grow flex flex-col justify-center">
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
                          ref={el => inputRefs.current[index] = el}
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
        <div className="h-screen flex flex-col justify-center p-8 bg-white dark:bg-black">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gray-900 dark:bg-gray-100 rounded-3xl mb-4 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Bem-vindo ao FitMind</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Sua jornada de saúde começa aqui.</p>
          </div>

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