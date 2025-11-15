
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';

const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-red-600">Excluir Conta</h2>
                <p className="text-gray-600 mt-2">Esta ação é <strong>permanente</strong> e não pode ser desfeita. Todos os seus dados, incluindo progresso, fotos e planos, serão apagados para sempre.</p>
                <p className="text-gray-600 mt-4">Para confirmar, digite seu email: <strong className="font-mono">{userEmail}</strong></p>
                
                <input
                    type="email"
                    value={confirmationEmail}
                    onChange={(e) => setConfirmationEmail(e.target.value)}
                    className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />

                <div className="mt-6 flex flex-col gap-3">
                    <button onClick={handleDelete} disabled={!isMatch || isDeleting} className="w-full flex justify-center py-3 px-4 rounded-xl font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300">
                        {isDeleting ? <Spinner /> : 'Excluir minha conta permanentemente'}
                    </button>
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold">
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
    
    const [name, setName] = useState(userData?.name || '');
    const [password, setPassword] = useState('');
    
    const [nameLoading, setNameLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!userData || !session) {
        return <div className="p-6">Carregando...</div>;
    }

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setNameLoading(true);
        const { error } = await supabase.from('profiles').update({ name }).eq('id', userData.id);
        if (error) {
            showMessage('error', 'Falha ao atualizar o nome.');
        } else {
            await fetchData(); // Refresh context data
            showMessage('success', 'Nome atualizado com sucesso!');
        }
        setNameLoading(false);
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            showMessage('error', 'A senha deve ter no mínimo 6 caracteres.');
            return;
        }
        setPasswordLoading(true);
        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
            showMessage('error', 'Falha ao atualizar a senha.');
        } else {
            setPassword('');
            showMessage('success', 'Senha atualizada com sucesso!');
        }
        setPasswordLoading(false);
    };

    const handleSendResetLink = async () => {
        setResetLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(session.user.email!);
        if (error) {
            showMessage('error', 'Falha ao enviar o link.');
        } else {
            showMessage('success', 'Link de recuperação enviado para seu email.');
        }
        setResetLoading(false);
    };
    
    const handleDeleteAccount = async () => {
        // This is a simplified deletion process. In a real app, this MUST be an atomic transaction
        // in a server-side function (e.g., Supabase Edge Function) to ensure all data is removed
        // and the auth user is properly deleted.
        try {
            const userId = userData.id;
            // Delete from all related tables. The order might matter if there are no cascade deletes.
            await supabase.from('applications').delete().eq('user_id', userId);
            await supabase.from('weight_history').delete().eq('user_id', userId);
            await supabase.from('progress_photos').delete().eq('user_id', userId);
            await supabase.from('workout_plans').delete().eq('user_id', userId);
            await supabase.from('workout_history').delete().eq('user_id', userId);
            
            // Finally delete the profile
            await supabase.from('profiles').delete().eq('id', userId);

            // Sign out the user. The auth user remains, but with no profile data.
            // A cleanup job or edge function is needed to delete from auth.users.
            await supabase.auth.signOut();
            navigate('/auth', { replace: true });

        } catch (error: any) {
            setShowDeleteModal(false);
            showMessage('error', `Falha ao excluir a conta: ${error.message}`);
        }
    };


    return (
        <div className="p-4 sm:p-6 space-y-6 bg-white min-h-screen">
            <header className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="text-gray-600 p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Conta</h1>
            </header>

            {message && (
                <div className={`p-3 rounded-lg text-center font-semibold ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </div>
            )}
            
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Informações Pessoais</h2>
                <form onSubmit={handleUpdateName} className="bg-gray-100/60 p-4 rounded-xl">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome</label>
                    <div className="flex gap-3 mt-1">
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                        />
                        <button type="submit" disabled={nameLoading || name === userData.name} className="px-4 py-2 bg-black text-white rounded-md font-semibold disabled:bg-gray-400">
                            {nameLoading ? <Spinner /> : 'Salvar'}
                        </button>
                    </div>
                </form>
            </section>
            
            <section className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800">Segurança</h2>
                <form onSubmit={handleUpdatePassword} className="bg-gray-100/60 p-4 rounded-xl">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Nova Senha</label>
                     <div className="flex gap-3 mt-1">
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                        />
                        <button type="submit" disabled={passwordLoading || password.length < 6} className="px-4 py-2 bg-black text-white rounded-md font-semibold disabled:bg-gray-400">
                            {passwordLoading ? <Spinner /> : 'Mudar'}
                        </button>
                    </div>
                </form>

                <div className="bg-gray-100/60 p-4 rounded-xl">
                    <p className="font-medium text-gray-800">Recuperação de Senha</p>
                    <p className="text-sm text-gray-600 mb-3">Se você esqueceu sua senha, podemos enviar um link para redefini-la.</p>
                    <button onClick={handleSendResetLink} disabled={resetLoading} className="w-full bg-white border border-gray-300 py-2 rounded-md font-semibold text-gray-800 disabled:opacity-50">
                        {resetLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                    </button>
                </div>
            </section>

            <section className="pt-4 border-t border-red-200">
                <h2 className="text-lg font-semibold text-red-600">Zona de Perigo</h2>
                <div className="bg-red-50 p-4 rounded-xl mt-2">
                    <p className="font-medium text-red-800">Excluir Conta</p>
                    <p className="text-sm text-red-700 mb-3">Esta ação é irreversível e todos os seus dados serão perdidos.</p>
                    <button onClick={() => setShowDeleteModal(true)} className="w-full bg-red-600 text-white py-2 rounded-md font-semibold hover:bg-red-700">
                        Excluir Minha Conta
                    </button>
                </div>
            </section>
            
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
