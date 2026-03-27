import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastProvider';

const translateAuthError = (message: string) => {
  if (message.includes('New password should be different from the old password')) return 'A nova senha deve ser diferente da antiga.';
  if (message.includes('Password should be at least')) return 'A senha deve ter pelo menos 8 caracteres.';
  return 'Ocorreu um erro inesperado. Tente novamente.';
};

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    // Verificar se o usuário está logado (o link de recuperação loga o usuário temporariamente)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Wait a bit to see if session is being established from URL hash
        setTimeout(async () => {
          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          if (!delayedSession) {
            addToast("Sessão inválida ou expirada. Solicite a redefinição novamente.", "error");
            navigate('/auth');
          }
        }, 1000);
      }
    };
    checkSession();
  }, [navigate, addToast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setError(translateAuthError(error.message));
      setLoading(false);
    } else {
      setLoading(false);
      addToast("Senha redefinida com sucesso!", "success");
      navigate('/');
    }
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/auth', { replace: true });
    }
  };

  return (
    <div className="h-screen flex flex-col p-8 bg-white dark:bg-black overflow-y-auto animate-fade-in">
      <div className="pt-4">
        <button onClick={handleBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
      </div>

      <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-left mb-10">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Redefinir Senha</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Crie uma nova senha para sua conta.</p>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nova Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Mínimo 8 caracteres"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-lg font-semibold text-white bg-black dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:bg-gray-400 dark:disabled:bg-gray-600"
            >
              {loading ? 'Salvando...' : 'Redefinir Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
