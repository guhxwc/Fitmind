
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import type { ProgressPhoto, UserData } from '../../types';
import { CameraIcon, TrashIcon, ScaleIcon, CheckCircleIcon, WavesIcon, UserCircleIcon, PlusIcon, ArrowPathIcon } from '../core/Icons';
import { StreakBadge } from '../core/StreakBadge';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';

// --- Utilitários de Formatação e Cálculo ---
const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

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

const RegisterWeightModal: React.FC<{onClose: () => void, onSave: (weight: number) => void}> = ({ onClose, onSave }) => {
    const [weight, setWeight] = useState('');
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-[32px] p-6 w-full max-w-sm shadow-2xl animate-pop-in" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Registrar Peso</h2>
                <div className="relative my-8">
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full h-24 px-4 text-center text-5xl font-bold bg-gray-100 dark:bg-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
                        placeholder="0.0"
                        autoFocus
                    />
                    <span className="absolute bottom-4 right-6 text-xl font-bold text-gray-400 dark:text-gray-500 pointer-events-none">kg</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-2xl font-bold text-lg">Cancelar</button>
                    <button onClick={() => onSave(parseFloat(weight))} disabled={!weight} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg disabled:opacity-50 shadow-lg">Salvar</button>
                </div>
            </div>
        </div>
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
  // O peso inicial é o primeiro do array sortedWeight (que agora sempre tem pelo menos 2 itens se userData.weight existir)
  // Mas para o cálculo de "Perdidos", queremos o peso real histórico mais antigo ou o atual se não houver histórico.
  // Se o histórico real estiver vazio, sortedWeight tem dados fakes iguais ao atual, então lost = 0. Correto.
  const startWeight = sortedWeight.length > 0 ? sortedWeight[0].weight : currentWeight;
  const lostWeight = startWeight - currentWeight;
  const imc = (currentWeight / ((userData.height / 100) ** 2)).toFixed(1);
  const tmb = calculateTMB(userData);
  
  // Dados de Colaterais para Gráfico
  const sideEffectStats = useMemo(() => {
      const counts: Record<string, number> = {};
      sideEffects.forEach(entry => {
          entry.effects.forEach(e => {
              counts[e.name] = (counts[e.name] || 0) + 1;
          });
      });
      return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4); // Top 4
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

              {/* Efeitos Colaterais */}
              {sideEffectStats.length > 0 && (
                <section className="bg-white dark:bg-gray-900 p-6 rounded-[24px] shadow-soft border border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Efeitos Colaterais Frequentes</h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sideEffectStats} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} width={100} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: theme === 'dark' ? '#1f2937' : '#fff' }} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                                    {sideEffectStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#f87171', '#fb923c', '#fbbf24', '#60a5fa'][index % 4]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
              )}
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
    </div>
  );
};
