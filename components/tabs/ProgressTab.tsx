
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ProgressPhoto, UserData, SideEffectName, SideEffectEntry } from '../../types';
import { CameraIcon, TrashIcon, ScaleIcon, CheckCircleIcon, WavesIcon, UserCircleIcon, PlusIcon, ArrowPathIcon, ShieldCheckIcon, ChevronRightIcon, XMarkIcon, HelpCircleIcon } from '../core/Icons';
import { StreakBadge } from '../core/StreakBadge';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import Portal from '../core/Portal';
import { RegisterWeightModal } from '../RegisterWeightModal';

// --- Utilitários de Formatação e Cálculo ---
const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
const formatFullDate = (isoString: string) => new Date(isoString).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

const calculateTMB = (user: UserData) => {
    // Fórmula de Mifflin-St Jeor (Padrão Ouro para TMB)
    const s = user.gender === 'Masculino' ? 5 : -161;
    const tmb = (10 * user.weight) + (6.25 * user.height) - (5 * user.age) + s;
    return Math.round(tmb);
};

const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { label: 'Abaixo do Peso', color: 'text-blue-500' };
    if (imc < 24.9) return { label: 'Peso Ideal', color: 'text-green-500' };
    if (imc < 29.9) return { label: 'Sobrepeso', color: 'text-yellow-500' };
    if (imc < 34.9) return { label: 'Obesidade Grau I', color: 'text-orange-500' };
    if (imc < 39.9) return { label: 'Obesidade Grau II', color: 'text-red-500' };
    return { label: 'Obesidade Grau III', color: 'text-red-700' };
};

// --- Configuração de Efeitos (Ícones e Cores) ---
const EFFECT_CONFIG: Record<string, { icon: string, color: string, bg: string }> = {
    'Náusea': { icon: '🤢', color: 'bg-green-500', bg: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    'Dor de cabeça': { icon: '🤕', color: 'bg-red-500', bg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    'Fadiga': { icon: '😴', color: 'bg-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
    'Apetite reduzido': { icon: '🤐', color: 'bg-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    'Tontura': { icon: '😵‍💫', color: 'bg-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    'Constipação': { icon: '🧻', color: 'bg-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
    'Diarreia': { icon: '🌊', color: 'bg-cyan-500', bg: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400' },
    'default': { icon: '📝', color: 'bg-gray-500', bg: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' }
};

const INTENSITY_COLORS: Record<string, string> = {
    'Leve': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
    'Moderado': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    'Severo': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800'
};

const EFFECT_TIPS: Record<string, string> = {
    'Náusea': 'Chá de gengibre ou mascar um pedaço pequeno de gengibre ajuda muito. Evite deitar logo após comer e fracione as refeições.',
    'Dor de cabeça': 'Na maioria dos casos com GLP-1, é desidratação. Tome 500ml de água agora. Se não passar em 1h, considere um analgésico comum.',
    'Fadiga': 'Seu corpo está se adaptando metabolicamente. Não force treinos pesados hoje. Priorize dormir 30min mais cedo.',
    'Apetite reduzido': 'É o efeito esperado. Foque em comer proteínas (ovos, frango, iogurte) primeiro para não perder massa muscular.',
    'Tontura': 'Pode ser queda de pressão ou açúcar (hipoglicemia). Coma uma fruta ou uma pitada de sal agora e levante-se devagar.',
    'Constipação': 'Aumente a água para 3L hoje. Caminhar ajuda o movimento intestinal. Fibras como psyllium ou mamão são essenciais.',
    'Diarreia': 'Hidrate-se com soro caseiro ou água de coco. Evite alimentos gordurosos e laticínios. Banana e arroz branco ajudam.',
    'Nenhum': 'Ótimo! Continue mantendo sua hidratação e alimentação equilibrada.'
};

// --- Subcomponentes Visuais ---

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, subtext?: string, color?: string }> = ({ icon, label, value, subtext, color = "bg-white dark:bg-gray-900" }) => (
    <div className={`p-4 rounded-[24px] shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between ${color} relative overflow-hidden group transition-transform active:scale-[0.98]`}>
        <div className="flex justify-between items-start z-10">
            <div className="p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl backdrop-blur-md">{icon}</div>
        </div>
        <div className="mt-3 z-10">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{label}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {subtext && <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-1">{subtext}</p>}
        </div>
    </div>
);

const SymptomRow: React.FC<{ name: string, count: number, maxCount: number, onClick: () => void }> = ({ name, count, maxCount, onClick }) => {
    const config = EFFECT_CONFIG[name] || EFFECT_CONFIG['default'];
    const percentage = Math.max((count / maxCount) * 100, 5); // Mínimo de 5% para visibilidade

    return (
        <button onClick={onClick} className="flex items-center gap-3 py-2 w-full group active:scale-[0.99] transition-transform">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${config.bg}`}>
                {config.icon}
            </div>
            <div className="flex-grow min-w-0 text-left">
                <div className="flex justify-between items-end mb-1.5">
                    <span className="font-bold text-gray-900 dark:text-white text-sm truncate pr-2 flex items-center gap-1">
                        {name}
                        <ChevronRightIcon className="w-3 h-3 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </span>
                    <span className="font-semibold text-gray-500 dark:text-gray-400 text-xs">{count}x</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${config.color} transition-all duration-1000 ease-out`} 
                        style={{ width: `${percentage}%` }}
                    ></div>
                </div>
            </div>
        </button>
    );
}

const SymptomHistoryModal: React.FC<{ 
    symptomName: string; 
    entries: SideEffectEntry[]; 
    onClose: () => void 
}> = ({ symptomName, entries, onClose }) => {
    const [showAdvice, setShowAdvice] = useState(false);
    const config = EFFECT_CONFIG[symptomName] || EFFECT_CONFIG['default'];
    const advice = EFFECT_TIPS[symptomName] || EFFECT_TIPS['default'];

    // Filter and flat map to get specific occurrences of this symptom
    const history = useMemo(() => {
        return entries
            .filter(entry => entry.effects.some(e => e.name === symptomName))
            .map(entry => {
                const effect = entry.effects.find(e => e.name === symptomName);
                return {
                    date: entry.date,
                    intensity: effect?.intensity || 'Leve',
                    duration: effect?.duration,
                    notes: entry.notes
                };
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [entries, symptomName]);

    return (
        <Portal>
            <div className="fixed inset-0 bg-black/60 z-[70] flex items-end justify-center p-0 sm:p-4 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md h-[80vh] rounded-t-[32px] sm:rounded-[32px] flex flex-col animate-slide-up shadow-2xl relative" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white dark:bg-[#1C1C1E] z-10 rounded-t-[32px]">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${config.bg}`}>
                                {config.icon}
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white leading-tight">{symptomName}</h2>
                                <button 
                                    onClick={() => setShowAdvice(!showAdvice)}
                                    className="flex items-center gap-1.5 mt-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full transition-colors active:scale-95"
                                >
                                    <HelpCircleIcon className="w-3.5 h-3.5" />
                                    O que fazer?
                                </button>
                            </div>
                        </div>
                        <button onClick={onClose} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* List */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        
                        {/* Advice Card */}
                        {showAdvice && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-2xl mb-4 animate-pop-in">
                                <div className="flex items-start gap-3">
                                    <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">Dica de Especialista</h3>
                                        <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                                            {advice}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-2">
                            Histórico ({history.length})
                        </p>

                        {history.map((item, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {formatFullDate(item.date)}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border uppercase tracking-wider ${INTENSITY_COLORS[item.intensity] || 'bg-gray-100 text-gray-600'}`}>
                                        {item.intensity}
                                    </span>
                                </div>
                                
                                {item.duration && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-black/20 px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-700/50">
                                            ⏱ {item.duration}
                                        </div>
                                    </div>
                                )}

                                {item.notes && (
                                    <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-black/20 p-3 rounded-xl italic leading-relaxed border border-gray-100 dark:border-gray-800/50">
                                        "{item.notes}"
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {history.length === 0 && (
                            <div className="text-center py-10 text-gray-400 dark:text-gray-600">
                                <p>Nenhum registro detalhado encontrado.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Portal>
    );
};

const SinglePhotoViewerModal: React.FC<{photo: ProgressPhoto, onClose: () => void, onDelete: (photo: ProgressPhoto) => void}> = ({ photo, onClose, onDelete }) => (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md" onClick={onClose}>
        <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <img 
                src={photo.photo_url} 
                alt={`Progresso ${formatDate(photo.date)}`} 
                className="w-full h-auto object-contain rounded-2xl shadow-2xl max-h-[80vh]" 
            />
            <div className="absolute -bottom-16 left-0 right-0 flex justify-center gap-4">
                <button onClick={onClose} className="bg-white/20 backdrop-blur-md text-white p-4 rounded-full hover:bg-white/30 transition-all">
                    <ArrowPathIcon className="w-6 h-6" />
                </button>
                <button onClick={() => onDelete(photo)} className="bg-red-500/80 backdrop-blur-md text-white p-4 rounded-full hover:bg-red-600 transition-all">
                    <TrashIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    </div>
);

const PhotoComparisonModal: React.FC<{ photos: ProgressPhoto[]; onClose: () => void; }> = ({ photos, onClose }) => {
    const [selectedPhotos, setSelectedPhotos] = useState<ProgressPhoto[]>([]);
    const [view, setView] = useState<'select' | 'compare'>('select');

    const handleSelectPhoto = (photo: ProgressPhoto) => {
        if (selectedPhotos.some(p => p.id === photo.id)) {
            setSelectedPhotos(prev => prev.filter(p => p.id !== photo.id));
        } else if (selectedPhotos.length < 2) {
            setSelectedPhotos(prev => [...prev, photo].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        }
    };

    const sortedPhotos = [...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-t-[32px] sm:rounded-[32px] w-full max-w-md h-[90vh] sm:h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                {view === 'select' ? (
                    <>
                        <header className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Selecionar 2 Fotos</h2>
                            <button onClick={onClose} className="text-gray-500 dark:text-gray-400">Fechar</button>
                        </header>
                        <div className="flex-grow overflow-y-auto p-4 grid grid-cols-3 gap-2 content-start">
                            {sortedPhotos.map(photo => {
                                const isSelected = selectedPhotos.some(p => p.id === photo.id);
                                return (
                                    <button key={photo.id} onClick={() => handleSelectPhoto(photo)} className="relative aspect-square rounded-xl overflow-hidden group">
                                        <img src={photo.photo_url} alt="" className={`w-full h-full object-cover transition-all duration-300 ${isSelected ? 'scale-100 opacity-100' : 'opacity-70'}`} />
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-blue-500/20 border-4 border-blue-500 flex items-center justify-center">
                                                <div className="bg-blue-500 text-white rounded-full p-1"><CheckCircleIcon className="w-5 h-5"/></div>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="p-6 pt-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                            <button 
                                onClick={() => setView('compare')} 
                                disabled={selectedPhotos.length !== 2} 
                                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg disabled:opacity-50 transition-all"
                            >
                                Comparar Fotos
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <header className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <button onClick={() => setView('select')} className="text-blue-500 font-semibold">Voltar</button>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Comparação</h2>
                            <div className="w-10"></div>
                        </header>
                        <div className="flex-grow p-4 flex items-center justify-center gap-2 overflow-hidden bg-gray-50 dark:bg-black">
                            {selectedPhotos.map((photo, idx) => (
                                <div key={photo.id} className="flex-1 h-full flex flex-col">
                                    <div className="flex-grow relative rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800">
                                         <img src={photo.photo_url} className="absolute inset-0 w-full h-full object-cover" alt="" />
                                    </div>
                                    <p className="text-center font-bold mt-3 text-gray-900 dark:text-white text-sm bg-white dark:bg-gray-800 py-2 rounded-lg shadow-sm">
                                        {formatDate(photo.date)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// --- Componente Principal ---

export const ProgressTab: React.FC = () => {
  const { userData, weightHistory, setWeightHistory, progressPhotos, setProgressPhotos, updateStreak, sideEffects, theme } = useAppContext();
  const { addToast } = useToast();
  
  // Estados
  const [view, setView] = useState<'overview' | 'photos'>('overview');
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<ProgressPhoto | null>(null);
  const [viewingSymptom, setViewingSymptom] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  if (!userData) return null;

  // Dados Computados
  const sortedWeight = useMemo(() => {
      let data = [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Se não houver histórico, cria um ponto com o peso atual (para visualização)
      if (data.length === 0 && userData?.weight) {
          data.push({ 
              id: -1, 
              user_id: userData.id, 
              date: new Date().toISOString(), 
              weight: userData.weight 
          });
      }

      // Se houver apenas 1 ponto, duplica para criar uma linha reta (visualização de "início")
      if (data.length === 1) {
          const point = data[0];
          const pastDate = new Date(point.date);
          pastDate.setDate(pastDate.getDate() - 14); // Simula 14 dias atrás
          
          data = [
              { ...point, id: -2, date: pastDate.toISOString() },
              point
          ];
      }
      return data;
  }, [weightHistory, userData]);

  const currentWeight = userData.weight || 0;
  const startWeight = sortedWeight.length > 0 ? sortedWeight[0].weight : currentWeight;
  const lostWeight = startWeight - currentWeight;
  const imc = (currentWeight / ((userData.height / 100) ** 2)).toFixed(1);
  const tmb = calculateTMB(userData);
  
  // Dados de Colaterais para Lista Visual (Top 5)
  const sideEffectStats = useMemo(() => {
      const counts: Record<string, number> = {};
      sideEffects.forEach(entry => {
          entry.effects.forEach(e => {
              counts[e.name] = (counts[e.name] || 0) + 1;
          });
      });
      
      const sorted = Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);
        
      const maxCount = sorted.length > 0 ? sorted[0].count : 0;
      
      return {
          items: sorted.slice(0, 5),
          maxCount: maxCount
      };
  }, [sideEffects]);

  const handleAddWeight = async (newWeight: number) => {
      if(!userData) return;
      const { data } = await supabase.from('weight_history').insert({ user_id: userData.id, date: new Date().toISOString(), weight: newWeight }).select();
      if(data) {
          setWeightHistory(prev => [...prev, data[0]].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          setIsWeightModalOpen(false);
          updateStreak();
          addToast("Peso registrado!", "success");
      }
  };

  const handleAddPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.[0] || !userData) return;
      const file = e.target.files[0];
      const path = `${userData.id}/${Date.now()}_${file.name}`;
      
      addToast("Enviando foto...", "info");
      
      const { error: uploadError } = await supabase.storage.from('progress_photos').upload(path, file);
      if (uploadError) {
          addToast("Erro ao enviar foto.", "error");
          return;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('progress_photos').getPublicUrl(path);
      const { data, error } = await supabase.from('progress_photos').insert({ user_id: userData.id, date: new Date().toISOString(), photo_url: publicUrl }).select();
      
      if(data) {
          setProgressPhotos(prev => [data[0], ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          addToast("Foto adicionada!", "success");
      } else if (error) {
          console.error(error);
          addToast("Erro ao salvar registro.", "error");
      }
  };

  const handleDeletePhoto = async (photo: ProgressPhoto) => {
      if (window.confirm("Tem certeza que deseja excluir esta foto?")) {
          const url = new URL(photo.photo_url);
          const path = url.pathname.split('/progress_photos/')[1];
          await supabase.storage.from('progress_photos').remove([path]);
          await supabase.from('progress_photos').delete().eq('id', photo.id);
          setProgressPhotos(prev => prev.filter(p => p.id !== photo.id));
          setViewingPhoto(null);
          addToast("Foto excluída.", "success");
      }
  }
  
  const sortedPhotos = useMemo(() => [...progressPhotos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [progressPhotos]);

  return (
    <div className="px-5 pb-24 animate-fade-in min-h-screen">
      <header className="pt-4 mb-8 flex justify-between items-end">
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Progresso</p>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Saúde</h1>
        </div>
        <div className="flex flex-col items-end gap-3">
            <StreakBadge />
            <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
                <button onClick={() => setView('overview')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${view === 'overview' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Dados</button>
                <button onClick={() => setView('photos')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${view === 'photos' ? 'bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>Fotos</button>
            </div>
        </div>
      </header>

      {view === 'overview' ? (
          <div className="space-y-6">
              {/* Painel Principal de Métricas */}
              <div className="grid grid-cols-2 gap-3">
                  <StatCard 
                    icon={<ScaleIcon className="w-6 h-6 text-blue-500"/>} 
                    label="Peso Atual" 
                    value={`${currentWeight} kg`} 
                    subtext={lostWeight > 0 ? `Perdidos: ${lostWeight.toFixed(1)} kg` : `Ganho: ${Math.abs(lostWeight).toFixed(1)} kg`}
                    color="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900"
                  />
                  <StatCard 
                    icon={<UserCircleIcon className="w-6 h-6 text-purple-500"/>} 
                    label="IMC Atual" 
                    value={imc} 
                    subtext={getIMCStatus(Number(imc)).label}
                    color="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900"
                  />
                  <StatCard 
                    icon={<WavesIcon className="w-6 h-6 text-orange-500"/>} 
                    label="Metabolismo (TMB)" 
                    value={`${tmb} kcal`} 
                    subtext="Gasto em repouso"
                    color="bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900"
                  />
                  <div 
                    onClick={() => setIsWeightModalOpen(true)}
                    className="p-4 rounded-[24px] border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-all active:scale-95"
                  >
                      <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-2 shadow-lg">
                          <PlusIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">Pesar Agora</span>
                  </div>
              </div>

              {/* Gráfico de Peso */}
              <section className="bg-white dark:bg-gray-900 p-6 rounded-[24px] shadow-soft border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Evolução do Peso</h3>
                    <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-1 rounded-md">Últimos 30 dias</span>
                  </div>
                  <div className="h-64 w-full -ml-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sortedWeight}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} unit="kg" width={40} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }}
                                labelFormatter={(label) => formatDate(label as string)}
                            />
                            <Area type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorWeight)" animationDuration={1500} />
                        </AreaChart>
                    </ResponsiveContainer>
                  </div>
              </section>

              {/* Lista Visual de Efeitos Colaterais (REDESIGNED) */}
              <section className="bg-white dark:bg-gray-900 p-6 rounded-[24px] shadow-soft border border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-end mb-5">
                      <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sintomas Recentes</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Toque para ver o histórico</p>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-1.5 rounded-lg">
                          <ShieldCheckIcon className="w-5 h-5"/>
                      </div>
                  </div>
                  
                  {sideEffectStats.items.length > 0 ? (
                      <div className="space-y-4">
                          {sideEffectStats.items.map((item, index) => (
                              <SymptomRow 
                                  key={index} 
                                  name={item.name} 
                                  count={item.count} 
                                  maxCount={sideEffectStats.maxCount}
                                  onClick={() => setViewingSymptom(item.name)}
                              />
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
                              ✨
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Nenhum sintoma relatado</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Continue acompanhando para monitorar sua saúde.</p>
                      </div>
                  )}
              </section>
          </div>
      ) : (
          <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => photoInputRef.current?.click()}
                    className="bg-black dark:bg-white text-white dark:text-black p-4 rounded-[20px] font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                  >
                      <CameraIcon className="w-5 h-5" />
                      Adicionar Foto
                  </button>
                  <button 
                    onClick={() => setIsComparisonModalOpen(true)}
                    disabled={progressPhotos.length < 2}
                    className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 p-4 rounded-[20px] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
                  >
                      <ArrowPathIcon className="w-5 h-5" />
                      Comparar
                  </button>
              </div>
              <input type="file" accept="image/*" ref={photoInputRef} onChange={handleAddPhoto} className="hidden" />
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sortedPhotos.length > 0 ? sortedPhotos.map(photo => (
                      <div key={photo.id} onClick={() => setViewingPhoto(photo)} className="aspect-[3/4] rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm">
                          <img src={photo.photo_url} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                              <p className="text-white font-bold text-sm">{formatDate(photo.date)}</p>
                          </div>
                      </div>
                  )) : (
                      <div className="col-span-2 py-12 text-center text-gray-400 dark:text-gray-600 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                          <CameraIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Nenhuma foto ainda.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {isWeightModalOpen && <RegisterWeightModal onSave={handleAddWeight} onClose={() => setIsWeightModalOpen(false)} />}
      {viewingPhoto && <SinglePhotoViewerModal photo={viewingPhoto} onClose={() => setViewingPhoto(null)} onDelete={handleDeletePhoto} />}
      {isComparisonModalOpen && <PhotoComparisonModal photos={progressPhotos} onClose={() => setIsComparisonModalOpen(false)} />}
      
      {viewingSymptom && (
          <SymptomHistoryModal 
              symptomName={viewingSymptom} 
              entries={sideEffects} 
              onClose={() => setViewingSymptom(null)} 
          />
      )}
    </div>
  );
};
