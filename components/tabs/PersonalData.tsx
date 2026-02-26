import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { ChevronLeftIcon, CameraIcon, UserCircleIcon } from '../core/Icons';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';

export const PersonalData: React.FC = () => {
    const { userData, session, fetchData } = useAppContext();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(userData?.name || '');
    const [isSaving, setIsSaving] = useState(false);

    if (!userData || !session) return null;

    const handleSave = async () => {
        setIsSaving(true);
        
        const { error } = await supabase.from('profiles').update({
            name: name
        }).eq('id', userData.id);

        if (error) {
            addToast("Erro ao salvar dados.", "error");
        } else {
            await fetchData();
            addToast("Dados atualizados com sucesso!", "success");
            navigate('/settings/account');
        }
        setIsSaving(false);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !userData) return;
        const file = e.target.files[0];
        const path = `${userData.id}/profile_${Date.now()}_${file.name}`;
        
        addToast("Enviando foto...", "info");
        
        const { error: uploadError } = await supabase.storage.from('progress_photos').upload(path, file);
        if (uploadError) {
            addToast("Erro ao enviar foto.", "error");
            return;
        }
        
        const { data: { publicUrl } } = supabase.storage.from('progress_photos').getPublicUrl(path);
        
        const { error } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userData.id);
        
        if (!error) {
            await fetchData();
            addToast("Foto atualizada!", "success");
        } else {
            addToast("Erro ao salvar foto.", "error");
        }
    };

    return (
        <div className="min-h-screen bg-[#F2F2F7] dark:bg-black font-sans pb-24 animate-fade-in">
            <header className="sticky top-0 z-20 bg-[#F2F2F7]/90 dark:bg-black/90 backdrop-blur-md px-4 py-4 flex items-center justify-between relative">
                <div className="flex-1 flex justify-start z-10">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-900 dark:text-white flex items-center">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                </div>
                <h1 className="absolute left-0 right-0 text-center text-[17px] font-bold text-gray-900 dark:text-white pointer-events-none">Dados pessoais</h1>
                <div className="flex-1 flex justify-end z-10"></div>
            </header>

            <div className="max-w-md mx-auto px-5 pt-6">
                
                {/* Profile Picture */}
                <div className="flex justify-center mb-10">
                    <div className="relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-4xl font-bold text-gray-300 dark:text-gray-500 shadow-sm overflow-hidden">
                            {(userData as any).avatar_url ? (
                                <img src={(userData as any).avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircleIcon className="w-12 h-12" />
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-black text-white p-1.5 rounded-full border-2 border-[#F2F2F7] dark:border-black">
                            <CameraIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        ref={fileInputRef} 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                    />
                </div>

                {/* Form Fields */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 ml-1">
                            Nome do usuário
                        </label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white dark:bg-[#1C1C1E] rounded-2xl px-4 py-4 text-[17px] text-gray-900 dark:text-white focus:outline-none shadow-sm"
                            placeholder="Seu nome"
                        />
                    </div>

                    <div>
                        <label className="block text-[13px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 ml-1">
                            E-mail
                        </label>
                        <input 
                            type="email" 
                            value={session.user.email}
                            disabled
                            className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-4 text-[17px] text-gray-500 dark:text-gray-400 focus:outline-none shadow-sm opacity-70"
                        />
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-[17px] active:scale-[0.98] transition-transform disabled:opacity-70 mt-10 shadow-md"
                >
                    {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
            </div>
        </div>
    );
};
