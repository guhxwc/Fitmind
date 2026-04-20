import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { XMarkIcon, HeartIcon, PlusIcon, EditIcon, CheckCircleIcon } from '../core/Icons';

export const NutriPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'pacientes' | 'indicados'>('pacientes');
    const [patients, setPatients] = useState<any[]>([]);
    const [referrals, setReferrals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchPatients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('consultations')
            .select(`
                id, status, next_review_at, notes, created_at,
                profiles:user_id (id, name, weight, target_weight),
                anamneses:user_id (*)
            `);
        if (!error && data) {
            setPatients(data);
        }
        setLoading(false);
    };

    const fetchReferrals = async () => {
        const { data, error } = await supabase
            .from('referrals')
            .select(`
                id, created_at, affiliate_ref, status,
                profiles:user_id (id, name, created_at, subscription_status)
            `);
        if (!error && data) {
            setReferrals(data);
        }
    };

    useEffect(() => {
        fetchPatients();
        fetchReferrals();
    }, []);

    const getDaysLeft = (dateString: string | null) => {
        if (!dateString) return null;
        const targetDate = new Date(dateString);
        const today = new Date();
        const diffTime = targetDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    if (selectedPatient) {
        return <PatientDetail patient={selectedPatient} onBack={() => setSelectedPatient(null)} onUpdate={fetchPatients} />;
    }

    return (
        <div className="fixed inset-0 bg-[#F2F2F7] dark:bg-[#000000] z-[100] flex overflow-hidden">
            
            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-[101] md:hidden backdrop-blur-[2px]" />
            )}

            {/* Left Sidebar Menu */}
            <aside className={`fixed md:relative inset-y-0 left-0 w-[260px] bg-white dark:bg-[#1C1C1E] border-r border-gray-200 dark:border-[#2C2C2E] flex flex-col z-[102] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                 <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <img src="https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Flavicon/fitmind_logo%20(1).png" alt="Fitmind Logo" className="h-6 object-contain" />
                        <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-400">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-3 mb-8">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-100 dark:border-gray-800 flex bg-gray-50 dark:bg-gray-900 shrink-0">
                            <img 
                                src="https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Allan/a363b4bf95e991cec48ec623905cfc44.png" 
                                alt="Dr. Allan" 
                                className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" 
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-[15px] text-gray-900 dark:text-white leading-tight truncate">Allan Stachuk</h2>
                            <p className="text-[12px] text-gray-500 font-medium">Painel Nutricionista</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <button 
                            onClick={() => { setActiveTab('pacientes'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-semibold transition-colors ${activeTab === 'pacientes' ? 'bg-[#007AFF] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2C2C2E]'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            Meus Pacientes
                        </button>
                        <button 
                            onClick={() => { setActiveTab('indicados'); setIsSidebarOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-semibold transition-colors ${activeTab === 'indicados' ? 'bg-[#007AFF] text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2C2C2E]'}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                            Indicações (Affiliate)
                        </button>
                    </nav>
                 </div>

                 <div className="mt-auto p-6 border-t border-gray-100 dark:border-[#2C2C2E]">
                     <button onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-[12px] font-semibold text-[14px] hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                         Sair do Painel
                     </button>
                 </div>
            </aside>

            {/* Right Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#F2F2F7] dark:bg-[#000000]">
                {/* Mobile Header */}
                <header className="md:hidden pt-safe-top bg-white dark:bg-[#1C1C1E] border-b border-gray-200 dark:border-[#2C2C2E] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-[#007AFF] active:scale-95 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h1 className="font-bold text-[18px] text-gray-900 dark:text-white tracking-tight">{activeTab === 'pacientes' ? 'Meus Pacientes' : 'Indicações'}</h1>
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="hidden md:flex pt-safe-top bg-[#F2F2F7] dark:bg-[#000000] px-6 py-6 pb-2 items-center justify-between">
                    <h1 className="font-bold text-2xl text-gray-900 dark:text-white tracking-tight">{activeTab === 'pacientes' ? 'Meus Pacientes' : 'Minhas Indicações'}</h1>
                </header>

                <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4 pb-12">
                {loading ? (
                    <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent flex items-center justify-center animate-spin rounded-full"></div></div>
                ) : activeTab === 'pacientes' ? (
                    <div className="space-y-4 pt-2">
                        {patients.length === 0 && <p className="text-center text-gray-500 mt-10 text-[15px]">Nenhum paciente encontrado.</p>}
                        {patients.map(p => {
                            const daysLeft = getDaysLeft(p.next_review_at);
                            
                            return (
                                <div key={p.id} onClick={() => setSelectedPatient(p)} className="group bg-white dark:bg-[#1C1C1E] rounded-[24px] p-4 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-[#2C2C2E] active:scale-[0.98] transition-transform cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 text-[#007AFF] rounded-full flex items-center justify-center font-bold text-[18px] border border-blue-200/50 dark:border-blue-700/30 shrink-0">
                                            {p.profiles?.name?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-bold text-gray-900 dark:text-white text-[17px] tracking-tight truncate max-w-[150px] sm:max-w-none">{p.profiles?.name || 'Paciente'}</h3>
                                                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${p.status === 'active' ? 'bg-[#E3F5E1] text-[#246A28] dark:bg-green-900/30 dark:text-green-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                                    {p.status === 'active' ? 'ATIVO' : 'PENDENTE'}
                                                </span>
                                                {p.anamneses && p.anamneses.length > 0 ? (
                                                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide bg-blue-100 text-[#007AFF] dark:bg-blue-900/30 dark:text-[#0A84FF] flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        ANAMNESE
                                                    </span>
                                                ) : (
                                                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                                        S/ ANAMNESE
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2.5 mt-1.5 text-[13px] text-gray-500 font-medium flex-wrap">
                                                <span className="flex items-center gap-1"><span className="text-gray-400 hidden sm:inline">Peso:</span> <strong className="text-gray-700 dark:text-gray-300">{p.profiles?.weight || '--'}kg</strong></span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                                <span className="flex items-center gap-1"><span className="text-gray-400 hidden sm:inline">Meta:</span> <strong className="text-gray-700 dark:text-gray-300">{p.profiles?.target_weight || '--'}kg</strong></span>
                                                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                                                <span className="flex items-center gap-1">
                                                    <span className="text-gray-400 hidden sm:inline">Reajuste:</span> 
                                                    <strong className={daysLeft !== null && daysLeft <= 0 ? 'text-red-500' : 'text-[#007AFF] dark:text-[#0A84FF]'}>{daysLeft !== null ? (daysLeft > 0 ? `em ${daysLeft}d` : 'Atrasado') : '--'}</strong>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 dark:bg-[#2C2C2E] text-gray-400 group-hover:bg-[#007AFF]/10 group-hover:text-[#007AFF] transition-colors shrink-0">
                                        <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="space-y-3 pt-2">
                        {referrals.length === 0 && <p className="text-center text-gray-500 mt-10 text-[15px]">Nenhum indicado encontrado.</p>}
                        {referrals.map(r => (
                            <div key={r.id} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-white/5 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-[16px] text-gray-900 dark:text-white tracking-tight">{r.profiles?.name || 'Venda Externa / Pixel'}</h3>
                                    <p className="text-[13px] text-gray-500 mt-0.5">Data: {new Date(r.created_at).toLocaleDateString('pt-BR')} • {r.status}</p>
                                </div>
                                <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-md ${r.profiles?.subscription_status && r.profiles?.subscription_status !== 'free' ? 'bg-[#E5F0FF] text-[#007AFF] dark:bg-[#007AFF]/20 dark:text-[#0A84FF]' : 'bg-[#F2F2F7] text-gray-600 dark:bg-[#2C2C2E] dark:text-gray-300'}`}>
                                    {r.profiles?.subscription_status && r.profiles?.subscription_status !== 'free' ? 'PRO' : 'Pendente'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                </main>
            </div>
        </div>
    );
};

import { AreaChart, Area, ResponsiveContainer } from 'recharts'; // Adding chart import

// ... keeping NutriPanel main component the same ...

const PatientDetail: React.FC<{ patient: any, onBack: () => void, onUpdate: () => void }> = ({ patient, onBack, onUpdate }) => {
    const [subTab, setSubTab] = useState<'anamnese' | 'editor'>('anamnese');
    const [editingType, setEditingType] = useState<'dieta' | 'metas' | 'mensagens' | null>(null);

    // Trackers
    const [weightHistory, setWeightHistory] = useState<any[]>([]);
    const [dailyRecords, setDailyRecords] = useState<any[]>([]);
    const [sideEffects, setSideEffects] = useState<any[]>([]);
    const [patientGoals, setPatientGoals] = useState<any>(null);
    const [timeframe, setTimeframe] = useState<'7' | '30' | '60' | 'all'>('7');

    useEffect(() => {
        const fetchDeepData = async () => {
            const [wRes, dRes, sRes, gRes] = await Promise.all([
                supabase.from('weight_history').select('*').eq('user_id', patient.user_id).order('date', { ascending: true }),
                supabase.from('daily_records').select('*').eq('user_id', patient.user_id).order('date', { ascending: false }).limit(30),
                supabase.from('side_effects').select('*').eq('user_id', patient.user_id).not('medication_taken', 'is', null).order('date', { ascending: false }).limit(1),
                supabase.from('custom_goals').select('*').eq('user_id', patient.user_id).maybeSingle()
            ]);
            
            if (wRes.data) setWeightHistory(wRes.data);
            if (dRes.data) setDailyRecords(dRes.data);
            if (sRes.data) setSideEffects(sRes.data);
            if (gRes.data) setPatientGoals(gRes.data);
        };
        fetchDeepData();
    }, [patient.user_id]);

    const getFilteredWeight = () => {
        if (timeframe === 'all') return weightHistory;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - parseInt(timeframe));
        return weightHistory.filter(w => new Date(w.date) >= cutoff);
    };

    const chartData = getFilteredWeight().map(w => ({ date: new Date(w.date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}), weight: w.weight }));

    const todayRecord = dailyRecords.length > 0 && dailyRecords[0].date === new Date().toISOString().split('T')[0] ? dailyRecords[0] : null;

    return (
        <div className="fixed inset-0 bg-[#F2F2F7] dark:bg-[#000000] z-[110] flex flex-col overflow-hidden">
             {/* Header Prêmium */}
             <header className="pt-safe-top bg-[#F2F2F7] dark:bg-[#000000] border-b border-gray-200 dark:border-[#1C1C1E] px-4 pb-3 pt-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-200 dark:hover:bg-[#1C1C1E] rounded-full active:scale-95 transition-transform flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#007AFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gray-200 dark:bg-[#2C2C2E] rounded-full flex items-center justify-center text-gray-700 dark:text-gray-300 font-bold text-sm">
                            {patient.profiles?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex flex-col">
                             <h1 className="font-semibold text-[16px] text-gray-900 dark:text-white leading-tight">{patient.profiles?.name}</h1>
                             <span className="text-[12px] text-gray-500 font-medium">Conta {patient.profiles?.subscription_status !== 'free' ? 'PRO' : 'Grátis'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto px-4 py-5 hide-scrollbar">
                
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Panel: Anamnese (Full Card) */}
                    <div className="w-full lg:w-[45%]">
                        <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2">Ficha Clínica (Anamnese)</h2>
                        <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-[#2C2C2E] overflow-hidden">
                            {patient.anamneses?.[0] ? (
                                (() => {
                                    const anamnesis = patient.anamneses[0];
                                    let dataToRender = null;
                                    try {
                                        if (anamnesis.additional_info) dataToRender = JSON.parse(anamnesis.additional_info);
                                    } catch(e) {}
                                    if (!dataToRender) dataToRender = anamnesis;

                                    const keyLabels: Record<string, string> = {
                                        gender: 'Gênero', age: 'Idade', weight: 'Peso (kg)', height: 'Altura (cm)',
                                        objective: 'Objetivo', activityLevel: 'Nível de Atividade', 
                                        trainingFrequency: 'Treino', dietaryPreferences: 'Preferências',
                                        dislikes: 'Aversões', allergies: 'Alergias',
                                        medicalHistory: 'Histórico Médico', medications: 'Medicamentos',
                                        sleep: 'Sono', stress: 'Stress/Dificuldades', waterIntake: 'Água Req.'
                                    };

                                    const entries = Object.entries(dataToRender).filter(([k, v]) => !(k === 'id' || k === 'user_id' || k === 'consultation_id' || k === 'created_at' || k === 'additional_info' || !v || v === ''));

                                    return (
                                        <div className="flex flex-col">
                                            {entries.map(([k, v], index) => {
                                                const label = keyLabels[k] || k.replace(/_/g, ' ').toUpperCase();
                                                const valueMsg = Array.isArray(v) ? v.join(', ') : String(v);
                                                const isLast = index === entries.length - 1;
                                                return (
                                                    <div key={k} className={`p-4 ${!isLast ? 'border-b border-gray-100 dark:border-[#2C2C2E]' : ''}`}>
                                                        <h4 className="text-[12px] font-medium text-gray-400 mb-0.5">{label}</h4>
                                                        <p className="text-[15px] font-semibold text-gray-900 dark:text-white leading-snug">{valueMsg}</p>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    );
                                })()
                            ) : (
                                <div className="p-10 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-[#2C2C2E] rounded-full flex items-center justify-center mb-3">
                                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    </div>
                                    <p className="font-semibold text-gray-900 dark:text-white">Sem Ficha</p>
                                    <p className="text-sm text-gray-500 mt-1">O paciente ainda não preencheu a anamnese.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Middle Column: Actions */}
                    <div className="w-full lg:w-[25%] space-y-4">
                        <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2">Ações Rápidas</h2>
                        
                        <button onClick={() => setEditingType('dieta')} className="w-full bg-[#10B981] hover:bg-[#059669] p-6 rounded-[24px] shadow-lg flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform text-white border border-green-600/20">
                            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="font-bold text-[18px]">Criar Dieta</h3>
                        </button>
                        
                        <button onClick={() => setEditingType('metas')} className="w-full bg-white dark:bg-[#1C1C1E] p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-[#2C2C2E] flex items-center justify-center gap-3 active:scale-95 transition-transform text-center">
                            <span className="font-bold text-[16px] text-gray-900 dark:text-white">Editar Metas APP</span>
                        </button>

                        <button onClick={() => setEditingType('mensagens')} className="w-full bg-white dark:bg-[#1C1C1E] p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-[#2C2C2E] flex items-center justify-center gap-3 active:scale-95 transition-transform text-center">
                            <span className="font-bold text-[16px] text-gray-900 dark:text-white">Chat Direto</span>
                        </button>
                    </div>

                    {/* Right Column: Tracker & Chart */}
                    <div className="w-full lg:w-[30%] space-y-6">
                        {/* Tracker Único */}
                        <div>
                            <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-3 ml-2">Progresso do Dia</h2>
                            <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-[24px] shadow-sm border border-gray-100 dark:border-[#2C2C2E] flex flex-col space-y-5">
                                {/* Proteina */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[13px] font-bold text-gray-600 dark:text-gray-300">Proteína Ext.</span>
                                        <span className="text-[13px] font-bold text-gray-900 dark:text-white">{todayRecord?.quick_add_protein_grams || 0}/{patientGoals?.protein_g || 150}g</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, Math.max(0, ((todayRecord?.quick_add_protein_grams || 0) / (patientGoals?.protein_g || 150)) * 100))}%` }}></div>
                                    </div>
                                </div>
                                {/* Agua */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[13px] font-bold text-gray-600 dark:text-gray-300">Água</span>
                                        <span className="text-[13px] font-bold text-gray-900 dark:text-white">{todayRecord?.water_liters || 0}/{((patientGoals?.water_ml || 3000)/1000).toFixed(1)}L</span>
                                    </div>
                                    <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, Math.max(0, ((todayRecord?.water_liters || 0) / ((patientGoals?.water_ml || 3000)/1000)) * 100))}%` }}></div>
                                    </div>
                                </div>
                                {/* Medicamento */}
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-[13px] font-bold text-gray-600 dark:text-gray-300">Remédio</span>
                                    </div>
                                    <div className="w-full bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                                        <span className="text-[14px] font-bold text-gray-900 dark:text-white line-clamp-1">{sideEffects.length > 0 ? sideEffects[0].medication_taken || 'Nenhum registrado' : 'Nenhum'}</span>
                                        {sideEffects.length > 0 && sideEffects[0].medication_dose && <span className="text-[12px] font-medium text-gray-500 mt-1 block">{sideEffects[0].medication_dose} (Hoje)</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div>
                             <div className="flex items-center justify-between mb-3 mx-2">
                                <h2 className="text-[13px] font-bold text-gray-500 uppercase tracking-widest m-0">Variação de Peso</h2>
                                <div className="flex bg-[#E3E3E8] dark:bg-[#2C2C2E] p-0.5 rounded-lg max-w-[200px]">
                                     {['7', '30', '60', 'all'].map(t => (
                                         <button key={t} onClick={() => setTimeframe(t as any)} className={`px-2 py-0.5 text-[10px] font-semibold rounded-md transition-all ${timeframe === t ? 'bg-white dark:bg-[#1C1C1E] text-black dark:text-white shadow-sm' : 'text-gray-500'}`}>
                                             {t === 'all' ? 'Tudo' : `${t}D`}
                                         </button>
                                     ))}
                                 </div>
                             </div>
                             <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-[24px] shadow-sm border border-gray-100 dark:border-[#2C2C2E]">
                                  {chartData.length > 1 ? (
                                      <div className="w-full h-[180px]">
                                          <ResponsiveContainer width="100%" height="100%">
                                              <AreaChart data={chartData}>
                                                  <defs>
                                                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                                                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                                                    </linearGradient>
                                                  </defs>
                                                  <Area type="monotone" dataKey="weight" stroke="#007AFF" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" />
                                              </AreaChart>
                                          </ResponsiveContainer>
                                      </div>
                                  ) : (
                                      <div className="w-full h-[180px] flex items-center justify-center">
                                          <span className="text-gray-400 font-medium text-sm">Dados insuficientes</span>
                                      </div>
                                  )}
                             </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Overlays para os Editores */}
            {editingType && (
                <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex flex-col justify-end">
                    <div className="bg-[#F2F2F7] dark:bg-[#000000] w-full max-h-[90vh] rounded-t-[32px] flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-gray-200 dark:border-[#2C2C2E] flex items-center justify-between bg-white dark:bg-[#1C1C1E]">
                            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
                                {editingType === 'dieta' && 'Estratégia Nutricional'}
                                {editingType === 'metas' && 'Metas & Revisão'}
                                {editingType === 'mensagens' && 'Mensagens do Especialista'}
                            </h2>
                            <button onClick={() => setEditingType(null)} className="p-2 bg-gray-100 dark:bg-[#2C2C2E] rounded-full active:scale-95"><XMarkIcon className="w-5 h-5" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 hide-scrollbar">
                            {editingType === 'dieta' && <DietEditor patient={patient} onUpdate={onUpdate} />}
                            {editingType === 'metas' && <GoalsEditor patient={patient} onUpdate={onUpdate} />}
                            {editingType === 'mensagens' && <MessagesEditor patient={patient} />}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DietEditor: React.FC<{ patient: any, onUpdate: () => void }> = ({ patient, onUpdate }) => {
    const [title, setTitle] = useState('Estratégia de Emagrecimento');
    const [meals, setMeals] = useState<{name: string, time: string, items: {name: string, quantity: string}[]}[]>([]);
    const [observations, setObservations] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchDiet = async () => {
             const { data } = await supabase.from('diet_plans').select('*').eq('user_id', patient.user_id).order('version', { ascending: false }).limit(1);
             if (data && data.length > 0) {
                 const plan = data[0].plan;
                 setTitle(data[0].title || '');
                 if (plan) {
                     setMeals(plan.meals || []);
                     setObservations(plan.observations || '');
                 }
             } else {
                 setMeals([{ name: 'Café da Manhã', time: '08:00', items: [{ name: 'Ovo', quantity: '2 unidades' }] }]);
             }
        };
        fetchDiet();
    }, [patient.user_id]);

    const addMeal = () => {
        setMeals([...meals, { name: 'Nova Refeição', time: '12:00', items: [] }]);
    };

    const addItem = (mealIndex: number) => {
        const m = [...meals];
        m[mealIndex].items.push({ name: 'Novo Alimento', quantity: '100g' });
        setMeals(m);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const plan = { meals, observations };
            const { error: dietError } = await supabase.from('diet_plans').insert([{
                user_id: patient.user_id,
                consultation_id: patient.id,
                nutritionist_id: patient.nutritionist_id || '6178130c-e47a-4534-a794-9b80b823766b',
                title,
                plan,
                version: 1,
                sent_at: new Date().toISOString()
            }]);
            
            if (!dietError) {
                await supabase.from('consultations').update({ status: 'active' }).eq('id', patient.id);
                onUpdate();
                alert('Dieta salva e enviada!');
            } else {
                alert('Erro ao salvar dieta.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 space-y-3">
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título da Dieta" className="w-full font-bold text-lg bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none pb-1 text-gray-900 dark:text-white" />
            </div>

            {meals.map((meal, mIdx) => (
                <div key={mIdx} className="bg-white dark:bg-[#1C1C1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 space-y-3">
                    <div className="flex gap-2">
                        <input value={meal.name} onChange={(e) => { const m = [...meals]; m[mIdx].name = e.target.value; setMeals(m); }} className="flex-1 font-bold bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none pb-1 text-gray-900 dark:text-white" />
                        <input value={meal.time} onChange={(e) => { const m = [...meals]; m[mIdx].time = e.target.value; setMeals(m); }} className="w-20 bg-transparent border-b border-gray-200 dark:border-gray-700 outline-none pb-1 text-gray-900 dark:text-white text-center" />
                        <button onClick={() => { const m = meals.filter((_, i) => i !== mIdx); setMeals(m); }} className="text-red-500"><XMarkIcon className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-2 mt-2">
                         {meal.items.map((item, iIdx) => (
                             <div key={iIdx} className="flex gap-2">
                                  <input value={item.name} onChange={(e) => { const m = [...meals]; m[mIdx].items[iIdx].name = e.target.value; setMeals(m); }} className="flex-1 text-sm bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 outline-none text-gray-900 dark:text-white" />
                                  <input value={item.quantity} onChange={(e) => { const m = [...meals]; m[mIdx].items[iIdx].quantity = e.target.value; setMeals(m); }} className="w-24 text-sm bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 outline-none text-gray-900 dark:text-white" />
                             </div>
                         ))}
                    </div>
                    <button onClick={() => addItem(mIdx)} className="text-xs text-blue-500 font-bold mt-2 flex items-center gap-1"><PlusIcon className="w-3 h-3"/> Add Alimento</button>
                </div>
            ))}

            <button onClick={addMeal} className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold py-3 rounded-xl transition-all border border-blue-200 dark:border-blue-800 border-dashed">
                + Adicionar Refeição
            </button>

            <textarea value={observations} onChange={e => setObservations(e.target.value)} placeholder="Observações..." className="w-full bg-white dark:bg-[#1C1C1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 outline-none min-h-[100px] text-gray-900 dark:text-white text-sm" />

            <button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50">
                {isSaving ? 'Salvando...' : 'Salvar e Enviar Dieta'}
            </button>
        </div>
    )
}

const GoalsEditor: React.FC<{ patient: any, onUpdate: () => void }> = ({ patient, onUpdate }) => {
    const [goals, setGoals] = useState({ calories: 2000, protein_g: 150, water_ml: 3000, carbs_g: 150, fat_g: 50 });
    const [nextReview, setNextReview] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchGoals = async () => {
             const [goalsRes, reviewRes] = await Promise.all([
                 supabase.from('custom_goals').select('*').eq('user_id', patient.user_id).maybeSingle(),
                 supabase.from('consultations').select('next_review_at').eq('id', patient.id).single()
             ]);
             if (goalsRes.data) {
                 setGoals({
                     calories: goalsRes.data.calories || 2000,
                     protein_g: goalsRes.data.protein_g || 150,
                     water_ml: goalsRes.data.water_ml || 3000,
                     carbs_g: goalsRes.data.carbs_g || 150,
                     fat_g: goalsRes.data.fat_g || 50
                 });
             }
             if (reviewRes.data?.next_review_at) {
                 setNextReview(reviewRes.data.next_review_at.split('T')[0]);
             }
        };
        fetchGoals();
    }, [patient]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await Promise.all([
                supabase.from('custom_goals').upsert([{
                    user_id: patient.user_id,
                    nutritionist_id: patient.nutritionist_id,
                    ...goals
                }], { onConflict: 'user_id' }),
                supabase.from('consultations').update({ next_review_at: nextReview || null }).eq('id', patient.id)
            ]);
            onUpdate();
            alert('Metas salvas!');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">Editor de Macros e Metas</h3>
                {Object.keys(goals).map((k) => (
                    <div key={k} className="flex flex-col">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{k.replace('_', ' ')}</label>
                        <input type="number" value={(goals as any)[k]} onChange={e => setGoals({...goals, [k]: Number(e.target.value)})} className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-[#1C1C1E] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                 <h3 className="font-bold text-gray-900 dark:text-white mb-2">Próxima Revisão</h3>
                 <input type="date" value={nextReview} onChange={e => setNextReview(e.target.value)} className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white" />
            </div>

             <button onClick={handleSave} disabled={isSaving} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50">
                {isSaving ? 'Salvando...' : 'Salvar Metas'}
            </button>
        </div>
    )
}

const MessagesEditor: React.FC<{ patient: any }> = ({ patient }) => {
    const [msg, setMsg] = useState('');
    const [messages, setMessages] = useState<any[]>([]);

    useEffect(() => {
        const fetchMessages = async () => {
             const { data } = await supabase.from('nutritionist_messages').select('*').eq('user_id', patient.user_id).order('created_at', { ascending: true });
             if (data) setMessages(data);
        };
        fetchMessages();
    }, [patient.user_id]);

    const handleSend = async () => {
        if (!msg.trim()) return;
        const newMsg = {
            user_id: patient.user_id,
            nutritionist_id: patient.nutritionist_id || '6178130c-e47a-4534-a794-9b80b823766b',
            message: msg
        };
        const { data, error } = await supabase.from('nutritionist_messages').insert([newMsg]).select();
        if (data && !error) {
             setMessages([...messages, data[0]]);
        }
        setMsg('');
    };

    return (
        <div className="flex flex-col h-[60vh]">
            <div className="flex-1 bg-white dark:bg-[#1C1C1E] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5 mb-4 overflow-y-auto space-y-3">
                 {messages.length === 0 ? (
                     <p className="text-sm text-gray-500 text-center mt-5">Sem mensagens anteriores</p>
                 ) : (
                     messages.map(m => (
                          <div key={m.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-sm text-gray-900 dark:text-white border border-gray-100 dark:border-gray-700">
                               <p>{m.message}</p>
                               <span className="text-[10px] text-gray-400 mt-1 block">{new Date(m.created_at).toLocaleString('pt-BR')}</span>
                          </div>
                     ))
                 )}
            </div>
            <div className="flex gap-2">
                <input 
                    type="text" 
                    value={msg} 
                    onChange={e => setMsg(e.target.value)} 
                    placeholder="Digite sua mensagem..."
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm outline-none focus:border-blue-500"
                />
                <button onClick={handleSend} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 flex-shrink-0">
                    Enviar
                </button>
            </div>
        </div>
    )
}
