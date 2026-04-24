import React, { useState } from 'react';
import { 
  ArrowLeft, LayoutDashboard, Calendar, Activity, CheckCircle2, 
  MessageSquare, FileText, Stethoscope, PenTool, Settings, 
  Bell, Check, File, ActivitySquare, AlertTriangle, TrendingDown,
  XIcon
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../supabaseClient';
import { DietPlanEditor } from './DietPlanEditor';

export const PatientDashboard: React.FC<{ patient: any, onBack: () => void, chartData?: any[] }> = ({ patient, onBack }) => {
    
    const [chartData, setChartData] = React.useState<any[]>([]);
    const [showAnamnesisModal, setShowAnamnesisModal] = useState(false);
    const [activeView, setActiveView] = useState<null | 'diet'>(null);
    
    React.useEffect(() => {
        const fetchDeepData = async () => {
            const { data } = await supabase.from('weight_history').select('*').eq('user_id', patient.user_id).order('date', { ascending: true });
            if (data && data.length > 0) {
                 const mapped = data.map((w: any) => ({ date: new Date(w.date).toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'}), weight: w.weight }));
                 setChartData(mapped);
            }
        };
        fetchDeepData();
    }, [patient.user_id]);

    // Static data to match the mockup perfectly
    const adherenceData = [
        { name: 'Refeições', value: 78 },
        { name: 'Treinos', value: 85 },
        { name: 'Água', value: 72 },
        { name: 'Sono', value: 80 }
    ];

    const macrosData = [
        { name: 'Proteínas', value: 30, color: '#007AFF', amount: '112g' },
        { name: 'Carboidratos', value: 40, color: '#05CD99', amount: '152g' },
        { name: 'Gorduras', value: 30, color: '#FFCE20', amount: '56g' }
    ];

    return (
        <div className="fixed inset-0 bg-[#F9FAFC] dark:bg-[#0B0C10] z-[110] flex overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="hidden lg:flex w-[260px] bg-gradient-to-b from-white via-white/98 to-gray-50/30 dark:from-[#1C1C21] dark:to-[#111116] border-r border-[#E2E8F0] dark:border-[#2C2C35] flex-col z-[102] shadow-sm">
                <div className="p-6 pb-2 flex justify-start items-center">
                    <img src="https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Icon%20Fitmind/fitmind_horizontal_o.png" alt="Fitmind Logo" className="h-8 object-contain" />
                    <span className="ml-2 text-[10px] font-bold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-full">PRO</span>
                </div>
                
                <nav className="flex-1 px-4 mt-8 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#007AFF]/5 text-[#007AFF] font-bold text-[14px]">
                        <LayoutDashboard className="w-5 h-5" /> Visão Geral
                    </button>
                    <button 
                        onClick={() => setActiveView('diet')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[14px] transition-all ${activeView === 'diet' ? 'bg-[#007AFF]/5 text-[#007AFF]' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Calendar className="w-5 h-5" /> Plano Alimentar
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-semibold text-[14px]">
                        <Activity className="w-5 h-5" /> Evolução
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-semibold text-[14px]">
                        <CheckCircle2 className="w-5 h-5" /> Check-ins
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-semibold text-[14px]">
                        <MessageSquare className="w-5 h-5" /> Mensagens
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-semibold text-[14px]">
                        <FileText className="w-5 h-5" /> Materiais
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-semibold text-[14px]">
                        <Stethoscope className="w-5 h-5" /> Exames
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-semibold text-[14px]">
                        <PenTool className="w-5 h-5" /> Anotações
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-semibold text-[14px]">
                        <Settings className="w-5 h-5" /> Configurações
                    </button>
                </nav>

                <div className="p-5 border-t border-gray-100 mt-auto bg-gradient-to-b from-transparent via-white/80 to-white">
                    <div className="flex items-center gap-3 mb-5 px-1">
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 dark:bg-gray-900 shrink-0">
                            <img 
                                src="https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Allan/a363b4bf95e991cec48ec623905cfc44.png" 
                                alt="Dr. Allan" 
                                className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal scale-[1.2] translate-y-1.5 translate-x-0" 
                            />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-gray-900">Dr. Allan Stachuk</p>
                            <p className="text-[11px] text-gray-500 font-medium">Nutricionista</p>
                        </div>
                    </div>
                    <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-gray-200 text-gray-700 font-bold text-[13px] hover:bg-gray-50 shadow-sm transition-all">
                        <ArrowLeft className="w-4 h-4" /> Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 lg:px-10 py-8 relative -translate-x-[4px]">
                <div className="max-w-[1240px] mx-auto w-full">
                    {/* Header Top */}
                    <div className="flex items-center justify-between mb-8">
                        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Voltar para pacientes
                        </button>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-400 hover:text-gray-600">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Patient Banner */}
                    <div className="bg-white rounded-[24px] p-6 mb-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-[#007AFF] text-white rounded-full flex items-center justify-center text-xl font-bold tracking-wider shadow-md">
                                {patient.profiles?.name?.substring(0, 2).toUpperCase() || 'GH'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-[#141824] tracking-tight">{patient.profiles?.name || 'Gustavo Henrique'}</h1>
                                <p className="text-gray-500 text-[13px] font-medium mt-1">28 anos • Masculino</p>
                                <div className="flex flex-wrap items-center gap-2 mt-3">
                                    <span className="px-3 bg-green-50 text-green-600 text-[11px] font-bold rounded-lg h-7 flex items-center">Ativo</span>
                                    <span className="px-3 bg-gray-50 text-gray-600 border border-gray-100 text-[11px] font-bold rounded-lg h-7 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Plano Semestral
                                    </span>
                                    <span className="px-3 bg-gray-50 text-gray-600 border border-gray-100 text-[11px] font-bold rounded-lg h-7 flex items-center">
                                        Desde 12/04/2025
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="px-5 py-2.5 bg-white border border-gray-200 text-green-600 font-bold text-sm rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12.01 2.013c-5.512 0-9.998 4.486-9.998 9.998 0 1.954.55 3.842 1.597 5.467L2.014 22l4.632-1.587c1.57.94 3.393 1.436 5.362 1.436 5.513 0 9.998-4.487 9.998-9.998s-4.485-9.998-9.998-9.998zm0 18.006c-1.636 0-3.238-.42-4.635-1.21l-3.21 1.1.848-3.136c-.88-1.423-1.344-3.08-1.344-4.763 0-4.522 3.678-8.2 8.2-8.2s8.2 3.678 8.2 8.2-3.678 8.2-8.2 8.2zm4.568-6.19c-.25-.125-1.488-.735-1.72-.818-.23-.084-.4-.125-.568.125-.168.25-.65.818-.8 1.002-.148.184-.298.208-.548.084-2.122-1.045-3.518-2.67-4.322-4.048-.124-.208-.016-.32.11-.444.113-.11.25-.29.375-.436.126-.146.168-.25.25-.418.084-.168.042-.314-.02-.438-.063-.125-.568-1.37-.778-1.872-.204-.492-.41-.425-.568-.432h-.484c-.21 0-.548.084-.834.4-.29.314-1.108 1.087-1.108 2.652 0 1.565 1.135 3.08 1.294 3.288.158.21 2.235 3.51 5.412 4.88 2.26 1.036 3.23.95 3.8.847.66-.118 2.012-.822 2.296-1.616.284-.794.284-1.474.2-1.616-.085-.14-.315-.224-.565-.35z" />
                                </svg> 
                                WhatsApp
                            </button>
                            <button className="px-5 py-2.5 bg-[#007AFF] text-white font-bold text-sm rounded-xl flex items-center gap-2 hover:bg-[#0056b3] transition-colors shadow-sm">
                                <MessageSquare className="w-4 h-4" /> Enviar mensagem
                            </button>
                        </div>
                    </div>

                    {/* Top Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        {/* Resumo do paciente */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <h3 className="text-[14px] font-bold text-gray-900 mb-4">Resumo do paciente</h3>
                            <div className="grid grid-cols-3 gap-2 mb-6">
                                <div>
                                    <p className="text-[11px] text-gray-500 font-medium mb-1 truncate">Peso atual</p>
                                    <div className="flex items-end gap-1">
                                        <span className="text-xl font-extrabold text-gray-900 tracking-tight">82,4<span className="text-sm font-bold text-gray-600">kg</span></span>
                                        <TrendingDown className="w-3.5 h-3.5 text-green-500 mb-1" strokeWidth={3} />
                                    </div>
                                    <p className="text-[10px] font-bold text-green-500 mt-0.5 truncate">↓ 2,6 kg</p>
                                </div>
                                <div className="border-l border-gray-100 pl-3">
                                    <p className="text-[11px] text-gray-500 font-medium mb-1 truncate">Peso inicial</p>
                                    <span className="text-base font-bold text-gray-700">85,0</span><span className="text-xs font-bold text-gray-500 ml-0.5">kg</span>
                                </div>
                                <div className="border-l border-gray-100 pl-3">
                                    <p className="text-[11px] text-gray-500 font-medium mb-1 truncate">Objetivo</p>
                                    <span className="text-base font-bold text-gray-700">78,0</span><span className="text-xs font-bold text-gray-500 ml-0.5">kg</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[11px] font-bold mb-2">
                                    <span className="text-gray-700">% do objetivo</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-[#007AFF] h-full rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Anamnese */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                            <h3 className="text-[14px] font-bold text-gray-900 mb-4">Anamnese</h3>
                            <div className="flex flex-col items-center justify-center flex-1 w-full bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                                {patient.anamneses && patient.anamneses.length > 0 ? (
                                    <>
                                        <div className="w-12 h-12 bg-[#007AFF]/10 rounded-full flex items-center justify-center mb-3">
                                            <FileText className="w-6 h-6 text-[#007AFF]" />
                                        </div>
                                        <p className="text-[13px] font-bold text-gray-900 mb-4">Anamnese Preenchida</p>
                                        <button onClick={() => setShowAnamnesisModal(true)} className="px-5 py-2.5 bg-[#007AFF] text-white font-bold text-[13px] rounded-xl flex items-center gap-2 hover:bg-[#0056b3] transition-colors shadow-sm w-[90%] justify-center">
                                            Abrir Anamnese
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                            <AlertTriangle className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <p className="text-[12px] font-medium text-gray-500 text-center px-4 leading-relaxed">
                                            Paciente ainda não preencheu a anamnese pelo aplicativo.
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Alertas */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="text-[14px] font-bold text-gray-900">Alertas</h3>
                                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 flex flex-shrink-0 items-center justify-center text-red-500">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-900 line-clamp-1 leading-snug mb-0.5">Peso parado há 10 dias</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Ver evolução</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex flex-shrink-0 items-center justify-center text-orange-500">
                                        <AlertTriangle className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-900 line-clamp-1 leading-snug mb-0.5">Proteína abaixo da meta</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Média: 82g / dia</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex flex-shrink-0 items-center justify-center text-orange-500">
                                        <AlertTriangle className="w-4 h-4 rotate-180" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-900 line-clamp-1 leading-snug mb-0.5">Baixa ingestão de água</p>
                                        <p className="text-[10px] text-gray-500 font-medium">Média: 1.8L / dia</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Último check-in */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
                             <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[14px] font-bold text-gray-900">Último check-in</h3>
                             </div>
                             <div className="flex items-center justify-between mb-4">
                                 <span className="text-[13px] font-bold text-gray-900">Ontem às 21:30</span>
                                 <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest">Enviado</span>
                             </div>

                             <div className="space-y-3">
                                 {['Fome', 'Energia', 'Disposição'].map((k, i) => {
                                     const vals = [6, 7, 7];
                                     const val = vals[i];
                                     return (
                                        <div key={k} className="flex items-center gap-2">
                                            <span className="w-[52px] text-[11px] text-gray-600 font-medium">{k}</span>
                                            <div className="flex-1 bg-gray-100 rounded-full h-1">
                                                <div className="bg-[#007AFF] h-1 rounded-full" style={{ width: `${val * 10}%` }}></div>
                                            </div>
                                            <span className="w-7 text-right text-[10px] font-bold text-gray-500">{val}/10</span>
                                        </div>
                                     )
                                 })}
                             </div>
                             <button className="text-[12px] font-bold text-[#007AFF] mt-5 text-left hover:text-[#0056b3] transition-colors">
                                 Ver check-in completo
                             </button>
                        </div>
                    </div>

                    {/* Middle Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Evolução de peso Chart */}
                        <div className="lg:col-span-2 bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                             <div className="flex items-center justify-between mb-2">
                                <h3 className="text-[14px] font-bold text-gray-900">Evolução de peso</h3>
                                <div className="flex gap-1 bg-gray-50 p-1 rounded-xl">
                                    {['7D', '30D', '90D', 'Tudo'].map((t, i) => (
                                        <button key={t} className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${i === 1 ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                             </div>
                             <div className="h-[200px] w-full mt-4">
                                {chartData && chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData} margin={{ top: 15, right: 0, left: -25, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorWeightBlue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#007AFF" stopOpacity={0.15}/>
                                                <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <Area type="monotone" dataKey="weight" stroke="#007AFF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorWeightBlue)" activeDot={{ r: 6, fill: '#007AFF', stroke: 'white', strokeWidth: 2 }} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <span className="text-gray-400 text-sm font-medium">Dados de evolução insuficientes</span>
                                    </div>
                                )}
                             </div>
                             <div className="flex justify-between text-[11px] text-gray-400 mt-2 font-medium px-2">
                                 <span>12/04</span><span>16/04</span><span>20/04</span><span>24/04</span><span>28/04</span><span>02/05</span><span>06/05</span><span>10/05</span><span>12/05</span>
                             </div>
                        </div>

                        {/* Composição Corporal */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
                            <h3 className="text-[14px] font-bold text-gray-900 mb-6">Composição corporal</h3>
                            <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                                    <span className="text-[13px] font-medium text-gray-600">Massa magra</span>
                                    <span className="text-[14px] font-bold text-gray-900">62,1 kg</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                                    <span className="text-[13px] font-medium text-gray-600">Massa gorda</span>
                                    <span className="text-[14px] font-bold text-gray-900">20,3 kg</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                                    <span className="text-[13px] font-medium text-gray-600">% Gordura corporal</span>
                                    <span className="text-[14px] font-bold text-gray-900">24,6%</span>
                                </div>
                                <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                                    <span className="text-[13px] font-medium text-gray-600">IMC</span>
                                    <span className="text-[14px] font-bold text-gray-900">26,1</span>
                                </div>
                            </div>
                            <button className="text-[12px] font-bold text-[#007AFF] mt-5 text-left hover:underline">
                                Ver detalhes
                            </button>
                        </div>
                    </div>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Macros */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
                            <h3 className="text-[14px] font-bold text-gray-900 mb-1">Macros <span className="font-medium text-gray-400 font-normal ml-0.5">(média dos últimos 7 dias)</span></h3>
                            <div className="flex flex-col items-center gap-4 mt-4 flex-1 justify-center">
                                <div className="flex w-full items-center justify-between">
                                    <div className="w-[100px] h-[100px] relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={macrosData} innerRadius={35} outerRadius={50} dataKey="value" stroke="none">
                                                    {macrosData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex-1 pl-6 space-y-3.5">
                                        {macrosData.map(m => (
                                            <div key={m.name} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }}></div>
                                                    <span className="text-xs font-medium text-gray-600">{m.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-extrabold text-gray-900">{m.amount}</span> <span className="text-[10px] text-gray-400 ml-0.5">({m.value}%)</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-1.5">
                                <p className="text-xs text-gray-900 font-bold">Meta diária: <span className="font-medium text-gray-500">1800 kcal</span></p>
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                            <h3 className="text-[14px] font-bold text-gray-900 mb-5">Checklist do dia</h3>
                            <div className="bg-gray-50 rounded-lg p-1.5 mb-5 flex">
                                <div className="w-3/4 h-1.5 bg-[#05CD99] rounded-full mx-1 my-0.5"></div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded border flex items-center justify-center bg-[#05CD99] border-[#05CD99] text-white">
                                        <Check className="w-3 h-3" strokeWidth={4} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">3 refeições registradas</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded border flex items-center justify-center bg-[#05CD99] border-[#05CD99] text-white">
                                        <Check className="w-3 h-3" strokeWidth={4} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">Treino registrado</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded border border-gray-300">
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">2,5L de água</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded border flex items-center justify-center bg-[#05CD99] border-[#05CD99] text-white">
                                        <Check className="w-3 h-3" strokeWidth={4} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-600">Meta de proteína atingida</span>
                                </div>
                            </div>
                        </div>

                        {/* Ações rápidas */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
                            <h3 className="text-[14px] font-bold text-gray-900 mb-5">Ações rápidas</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={() => setActiveView('diet')}
                                    className="w-full flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-[#007AFF] hover:shadow-sm hover:bg-gray-50/50 transition-all group text-left"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center shrink-0">
                                        <LayoutDashboard className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">Nova dieta</span>
                                        <span className="text-[11px] font-medium text-gray-500 mt-0.5">Criar plano alimentar</span>
                                    </div>
                                </button>
                                <button className="w-full flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-[#05CD99] hover:shadow-sm hover:bg-gray-50/50 transition-all group text-left">
                                    <div className="w-10 h-10 rounded-xl bg-[#05CD99]/10 text-[#05CD99] flex items-center justify-center shrink-0">
                                        <ActivitySquare className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">Ajustar macros</span>
                                        <span className="text-[11px] font-medium text-gray-500 mt-0.5">Calorias, proteínas, etc.</span>
                                    </div>
                                </button>
                                <button className="w-full flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-red-400 hover:shadow-sm hover:bg-gray-50/50 transition-all group text-left">
                                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">Enviar orientação</span>
                                        <span className="text-[11px] font-medium text-gray-500 mt-0.5">Mensagem ou áudio</span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Materiais recentes */}
                        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
                            <h3 className="text-[14px] font-bold text-gray-900 mb-5">Materiais recentes</h3>
                            <div className="space-y-4 flex-1">
                                <div className="flex items-start gap-3">
                                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-gray-700 leading-snug mb-0.5">Plano alimentar - Semana 3</span>
                                        <span className="text-[10px] text-gray-400 font-medium">Enviado em 05/05/2025</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-gray-700 leading-snug mb-0.5">Guia de substituições</span>
                                        <span className="text-[10px] text-gray-400 font-medium">Enviado em 28/04/2025</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-gray-700 leading-snug mb-0.5">Estratégias para fome emocional</span>
                                        <span className="text-[10px] text-gray-400 font-medium">Enviado em 20/04/2025</span>
                                    </div>
                                </div>
                            </div>
                            <button className="text-[12px] font-bold text-[#007AFF] mt-6 text-left hover:underline">
                                Ver todos os materiais
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Diet Plan Editor Overlay */}
            {activeView === 'diet' && (
                <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0B0C10]">
                    <DietPlanEditor patient={patient} onBack={() => setActiveView(null)} />
                </div>
            )}

            {/* Anamnesis Full Screen Modal */}
            {showAnamnesisModal && patient.anamneses?.[0] && (
                <div className="fixed inset-0 z-[200] bg-white dark:bg-[#1C1C21] overflow-y-auto flex flex-col">
                    <div className="sticky top-0 bg-white/80 dark:bg-[#1C1C21]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowAnamnesisModal(false)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                                <XIcon className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Anamnese do Paciente</h2>
                        </div>
                        <span className="bg-[#007AFF]/10 text-[#007AFF] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Respondida</span>
                    </div>
                    
                    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Dados Básicos</h3>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 space-y-4">
                                        <div><span className="text-gray-500 text-sm">Objetivo:</span> <p className="font-bold text-gray-900 dark:text-white text-lg capitalize">{patient.anamneses[0].goal || '--'}</p></div>
                                        <div><span className="text-gray-500 text-sm">Peso Atual:</span> <p className="font-bold text-gray-900 dark:text-white capitalize">{patient.anamneses[0].current_weight || '--'} kg</p></div>
                                        <div><span className="text-gray-500 text-sm">Altura:</span> <p className="font-bold text-gray-900 dark:text-white capitalize">{patient.anamneses[0].height || '--'} cm</p></div>
                                        <div><span className="text-gray-500 text-sm">Nível de Atividade:</span> <p className="font-bold text-gray-900 dark:text-white capitalize">{patient.anamneses[0].activity_level || '--'}</p></div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Restrições e Preferências</h3>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 space-y-4">
                                        <div><span className="text-gray-500 text-sm">Restrições Alimentares:</span> 
                                             <p className="font-bold text-gray-900 dark:text-white">
                                                 {patient.anamneses[0].food_restrictions && patient.anamneses[0].food_restrictions.length > 0 
                                                     ? patient.anamneses[0].food_restrictions.join(', ') : 'Nenhuma'}
                                             </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Rotina</h3>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 space-y-4">
                                        <div><span className="text-gray-500 text-sm">Horário que acorda / Qualidade do Sono:</span> <p className="font-bold text-gray-900 dark:text-white capitalize">{patient.anamneses[0].wake_up_time || patient.anamneses[0].sleep_time || '--'}</p></div>
                                        <div><span className="text-gray-500 text-sm">Nível de Estresse:</span> <p className="font-bold text-gray-900 dark:text-white capitalize">{patient.anamneses[0].main_difficulties || '--'}</p></div>
                                    </div>
                                </div>
                                
                                {patient.anamneses[0].additional_info && (
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Informações Adicionais</h3>
                                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 space-y-4">
                                            {(() => {
                                                try {
                                                    const parsed = JSON.parse(patient.anamneses[0].additional_info);
                                                    return (
                                                        <>
                                                            <div><span className="text-gray-500 text-sm">Idade/Sexo:</span> <p className="font-bold text-gray-900 dark:text-white capitalize">{parsed.age || '--'} anos / {parsed.gender || '--'}</p></div>
                                                            <div><span className="text-gray-500 text-sm">Preferências (Gosta / Não Gosta):</span> <p className="font-bold text-gray-900 dark:text-white capitalize">{parsed.dietaryPreferences || '--'} / {parsed.dislikes || '--'}</p></div>
                                                            <div><span className="text-gray-500 text-sm">Histórico Médico:</span> <p className="font-bold text-gray-900 dark:text-white capitalize">{parsed.medicalHistory || '--'}</p></div>
                                                            <div><span className="text-gray-500 text-sm">Uso de Medicamentos:</span> <p className="font-bold text-gray-900 dark:text-white capitalize">{parsed.medications || '--'}</p></div>
                                                            <div><span className="text-gray-500 text-sm">Ingestão de Água:</span> <p className="font-bold text-gray-900 dark:text-white capitalize">{parsed.waterIntake || '--'}</p></div>
                                                        </>
                                                    );
                                                } catch (e) {
                                                    return <p className="text-sm">Erro ao processar as informações adicionais.</p>
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
