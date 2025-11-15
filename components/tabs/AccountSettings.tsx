import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';

const Spinner: React.FC<{className?: string}> = ({ className }) => (
    <svg className={`animate-spin h-5 w-5 ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


// The confirmation modal for deleting account
const DeleteAccountModal: React.FC<{
    userEmail: string;
    onClose: () => void;
    onConfirm: () => Promise<void>;
}> = ({ userEmail, onClose, onConfirm }) => {
    const [confirmationEmail, setConfirmationEmail] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const isMatch = confirmationEmail === userEmail;

    const handleDelete = async () => {
        if (!isMatch) return;
        setIsDeleting(true);
        await onConfirm();
        // isDeleting will be true until the user is logged out.
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-red-600">Excluir Conta</h2>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Esta ação é <strong>permanente</strong> e não pode ser desfeita. Todos os seus dados, incluindo progresso, fotos e planos, serão apagados para sempre.</p>
                <p className="text-gray-600 dark:text-gray-300 mt-4">Para confirmar, digite seu email: <strong className="font-mono">{userEmail}</strong></p>
                
                <input
                    type="email"
                    value={confirmationEmail}
                    onChange={(e) => setConfirmationEmail(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />

                <div className="mt-6 flex flex-col gap-3">
                    <button onClick={handleDelete} disabled={!isMatch || isDeleting} className="w-full flex justify-center py-3 px-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300">
                        {isDeleting ? <Spinner className="text-white"/> : 'Excluir minha conta permanentemente'}
                    </button>
                    <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};


// The main component
export const AccountSettings: React.FC = () => {
    const { userData, session, fetchData } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();
    
    const [name, setName] = useState(userData?.name || '');
    const [password, setPassword] = useState('');
    
    const [nameLoading, setNameLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!userData || !session) {
        return <div className="p-6 text-gray-800 dark:text-gray-200">Carregando...</div>;
    }

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setNameLoading(true);
        const { error } = await supabase.from('profiles').update({ name }).eq('id', userData.id);
        if (error) {
            addToast('Falha ao atualizar o nome.', 'error');
        } else {
            await fetchData(); // Refresh context data
            addToast('Nome atualizado com sucesso!', 'success');
        }
        setNameLoading(false);
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            addToast('A senha deve ter no mínimo 6 caracteres.', 'error');
            return;
        }
        setPasswordLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            addToast('Falha ao atualizar a senha.', 'error');
        } else {
            setPassword('');
            addToast('Senha atualizada com sucesso!', 'success');
        }
        setPasswordLoading(false);
    };

    const handleSendResetLink = async () => {
        setResetLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(session.user.email!);
        if (error) {
            addToast('Falha ao enviar o link.', 'error');
        } else {
            addToast('Link de recuperação enviado para seu email.', 'success');
        }
        setResetLoading(false);
    };
    
    const handleDeleteAccount = async () => {
        try {
            const userId = userData.id;
            // cascade delete is setup in supabase, so only deleting from profiles is needed.
            // but to be safe, we can delete from all tables.
            await supabase.from('applications').delete().eq('user_id', userId);
            await supabase.from('weight_history').delete().eq('user_id', userId);
            await supabase.from('progress_photos').delete().eq('user_id', userId);
            await supabase.from('workout_plans').delete().eq('user_id', userId);
            await supabase.from('workout_history').delete().eq('user_id', userId);
            await supabase.from('daily_notes').delete().eq('user_id', userId);
            await supabase.from('side_effects').delete().eq('user_id', userId);
            await supabase.from('profiles').delete().eq('id', userId);

            // Supabase edge function will delete stripe customer on profile delete.
            
            await supabase.auth.signOut();
            navigate('/auth', { replace: true });

        } catch (error: any) {
            setShowDeleteModal(false);
            addToast(`Falha ao excluir a conta: ${error.message}`, 'error');
        }
    };


    return (
        <div className="p-4 sm:p-6 bg-gray-100 dark:bg-black min-h-screen font-sans">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="text-gray-600 dark:text-gray-300 p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Conta</h1>
            </header>

            <div className="space-y-8">
                {/* Personal Info Group */}
                <div>
                    <h2 className="px-4 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Informações Pessoais</h2>
                    <form onSubmit={handleUpdateName} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                        <div className="flex items-center justify-between p-3 sm:p-4">
                            <label htmlFor="name" className="text-base text-gray-800 dark:text-gray-200">Nome</label>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-32 sm:w-48 text-right text-base text-gray-600 dark:text-gray-300 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                                />
                                <button type="submit" disabled={nameLoading || name === userData.name} className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-semibold text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 enabled:hover:bg-gray-300 dark:enabled:hover:bg-gray-600 transition-colors">
                                    {nameLoading ? <Spinner className="text-gray-600 dark:text-gray-300"/> : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Security Group */}
                <div>
                    <h2 className="px-4 pb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Segurança</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                        <form onSubmit={handleUpdatePassword} className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                            <label htmlFor="password" className="text-base text-gray-800 dark:text-gray-200">Nova Senha</label>
                            <div className="flex items-center gap-2 sm:gap-4">
                                <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                className="w-32 sm:w-48 text-right text-base text-gray-600 dark:text-gray-300 bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-sm"
                                />
                                <button type="submit" disabled={passwordLoading || password.length < 6} className="px-4 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full font-semibold text-sm disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 enabled:hover:bg-gray-300 dark:enabled:hover:bg-gray-600 transition-colors">
                                {passwordLoading ? <Spinner className="text-gray-600 dark:text-gray-300"/> : 'Mudar'}
                                </button>
                            </div>
                        </form>
                        
                        <div className="p-2">
                             <button onClick={handleSendResetLink} disabled={resetLoading} className="w-full p-2 text-center text-base text-blue-600 dark:text-blue-400 font-medium disabled:opacity-50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                {resetLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                            </button>
                        </div>
                    </div>
                    <p className="px-4 pt-2 text-xs text-gray-500 dark:text-gray-400">
                       Se você esqueceu sua senha, podemos enviar um link para redefini-la.
                    </p>
                </div>

                {/* Danger Zone Group */}
                <div>
                    <h2 className="px-4 pb-2 text-xs font-semibold text-red-500 uppercase tracking-wider">Zona de Perigo</h2>
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                         <div className="p-2">
                            <button onClick={() => setShowDeleteModal(true)} className="w-full p-2 text-center text-base text-red-600 dark:text-red-500 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                                Excluir Conta
                            </button>
                        </div>
                    </div>
                     <p className="px-4 pt-2 text-xs text-gray-500 dark:text-gray-400">
                        Esta ação é irreversível e todos os seus dados serão perdidos.
                    </p>
                </div>
            </div>
            
            {showDeleteModal && (
                <DeleteAccountModal 
                    userEmail={session.user.email!}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteAccount}
                />
            )}
        </div>
    );
};