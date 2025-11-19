import React, { useState, useMemo, useRef, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import type { ProgressPhoto } from '../../types';
import { CameraIcon, PlusIcon, TrashIcon, ArrowPathIcon, ScaleIcon, CheckCircleIcon } from '../core/Icons';
import { useAppContext } from '../AppContext';
import { useToast } from '../ToastProvider';
import { CalendarView } from './CalendarView';
import { ReportsView } from './ReportsView';

const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button onClick={onClick} className={`w-1/3 py-2 rounded-lg font-semibold transition-all text-base active:scale-[0.98] ${isActive ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
        {label}
    </button>
);

const SinglePhotoViewerModal: React.FC<{photo: ProgressPhoto, onClose: () => void, onDelete: (photo: ProgressPhoto) => void}> = ({ photo, onClose, onDelete }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-pop-in" onClick={onClose}>
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <img 
                    src={photo.photo_url} 
                    alt={`Progresso ${formatDate(photo.date)}`} 
                    className="w-full h-auto object-contain rounded-2xl max-h-[75vh]" 
                />
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 bg-black/40 dark:bg-white/20 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/60 dark:hover:bg-white/30 transition-all"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                 <button 
                    onClick={() => onDelete(photo)} 
                    className="absolute top-3 left-3 bg-black/40 dark:bg-white/20 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500 transition-all"
                    aria-label="Excluir foto"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

const DeleteConfirmationModal: React.FC<{
    onConfirm: () => void;
    onClose: () => void;
}> = ({ onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm text-center animate-pop-in" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <TrashIcon className="w-8 h-8"/>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Excluir Foto?</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
                Esta ação é permanente e não pode ser desfeita.
            </p>
            <div className="flex flex-col gap-3 mt-6">
                <button onClick={onConfirm} className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold">Excluir</button>
                <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold">Cancelar</button>
            </div>
        </div>
    </div>
);


const ProgressView: React.FC = () => {
  const { userData, weightHistory, setWeightHistory, progressPhotos, setProgressPhotos, updateStreak, theme } = useAppContext();
  const { addToast } = useToast();
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<ProgressPhoto | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoToDelete, setPhotoToDelete] = useState<ProgressPhoto | null>(null);
  
  const sortedPhotos = useMemo(() => [...progressPhotos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [progressPhotos]);

  useEffect(() => {
     if (sortedPhotos.length > 0 && currentPhotoIndex >= sortedPhotos.length) {
        setCurrentPhotoIndex(sortedPhotos.length - 1);
    } else if (sortedPhotos.length === 0) {
        setCurrentPhotoIndex(0);
    }
  }, [sortedPhotos, currentPhotoIndex]);
  
  // Body scroll lock effect for modals
  useEffect(() => {
    const isModalOpen = !!viewingPhoto || isComparisonModalOpen || isWeightModalOpen || !!photoToDelete;
    if (isModalOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
    // Cleanup function
    return () => {
        document.body.style.overflow = 'auto';
    };
  }, [viewingPhoto, isComparisonModalOpen, isWeightModalOpen, photoToDelete]);

  const handleDeleteRequest = (photo: ProgressPhoto) => {
    setPhotoToDelete(photo);
  };
  
  const confirmDelete = async () => {
      if (photoToDelete) {
          if (viewingPhoto && viewingPhoto.id === photoToDelete.id) {
              setViewingPhoto(null);
          }
          if (!userData) return;
          try {
              const url = new URL(photoToDelete.photo_url);
              const path = url.pathname.split('/progress_photos/')[1];
              
              const { error: storageError } = await supabase.storage.from('progress_photos').remove([path]);
              if (storageError) {
                  console.error("Error deleting photo from storage:", storageError);
                  throw new Error("Não foi possível excluir o arquivo da foto.");
              }

              const { error: dbError } = await supabase.from('progress_photos').delete().eq('id', photoToDelete.id);
              if (dbError) {
                  console.error("Error deleting photo from database:", dbError);
                  throw new Error("Não foi possível excluir o registro da foto.");
              }

              setProgressPhotos(prev => prev.filter(p => p.id !== photoToDelete.id));
              addToast('Foto excluída com sucesso.', 'success');
          } catch (error: any) {
              console.error("Error processing photo deletion:", error);
              addToast(error.message || "Ocorreu um erro ao excluir a foto.", 'error');
          }
          setPhotoToDelete(null);
      }
  };


  const handleOlderPhoto = () => {
    setCurrentPhotoIndex(prev => Math.min(prev + 1, sortedPhotos.length - 1));
  };
  const handleNewerPhoto = () => {
    setCurrentPhotoIndex(prev => Math.max(0, prev - 1));
  };

  const currentPhoto = sortedPhotos[currentPhotoIndex];


  const latestWeightEntry = useMemo(() => [...weightHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || { weight: userData.weight }, [weightHistory, userData.weight]);
 
  const handleAddWeight = async (newWeight: number) => {
    if (newWeight > 30 && newWeight < 300) {
      const newEntry = {
        user_id: userData.id,
        date: new Date().toISOString(),
        weight: newWeight
      };
      
      const { data, error } = await supabase.from('weight_history').insert(newEntry).select();
      
      if (data) {
        setWeightHistory(prev => [data[0], ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setIsWeightModalOpen(false);
        updateStreak();
      }
      if (error) console.error("Error adding weight:", error);
    }
  };

  const handleAddPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const filePath = `${userData.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from('progress_photos').upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('progress_photos').getPublicUrl(filePath);

      const newPhotoData = {
          user_id: userData.id,
          date: new Date().toISOString(),
          photo_url: publicUrl,
      };

      const { data: dbData, error: dbError } = await supabase.from('progress_photos').insert(newPhotoData).select();

      if (dbData) {
          setProgressPhotos(prev => [dbData[0], ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          updateStreak();
      }
       if (dbError) console.error('Error saving photo record:', dbError);
    }
  };
  
  const sortedWeightHistory = useMemo(() => [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [weightHistory]);
  
  const calculateIMC = (weight: number, heightCm: number) => {
      if (heightCm === 0) return 0;
      const heightM = heightCm / 100;
      return parseFloat((weight / (heightM * heightM)).toFixed(1));
  }
  
  const imcHistory = useMemo(() => sortedWeightHistory.map(entry => ({
      date: entry.date,
      imc: calculateIMC(entry.weight, userData.height)
  })), [sortedWeightHistory, userData.height]);

  const startWeight = userData.weight;
  const currentWeight = latestWeightEntry.weight;
  const targetWeight = userData.targetWeight;
  const totalDistance = startWeight - targetWeight;
  const distanceCovered = startWeight - currentWeight;

  let progressPercentage = 0;
  if (totalDistance > 0) {
      progressPercentage = Math.max(0, Math.min(100, (distanceCovered / totalDistance) * 100));
  }

  const donutData = [
      { name: 'progress', value: progressPercentage },
      { name: 'remaining', value: 100 - progressPercentage },
  ];
  const DONUT_COLORS = theme === 'dark' ? ['#f9fafb', '#374151'] : ['#111827', '#e5e7eb'];
  
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(4px)',
    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
    borderRadius: '0.75rem',
    color: theme === 'dark' ? '#f3f4f6' : '#1f2937',
  };


  return (
    <>
      <section className="grid grid-cols-2 gap-4">
        <div className="flex flex-col space-y-3">
            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-sm rounded-3xl aspect-square flex items-center justify-center p-2 group">
              {sortedPhotos.length > 0 && currentPhoto ? (
                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                      <div onClick={() => setViewingPhoto(currentPhoto)} className="w-full h-full block cursor-pointer">
                          <img
                              key={currentPhoto.id}
                              src={currentPhoto.photo_url}
                              alt={`Progresso ${formatDate(currentPhoto.date)}`}
                              className="w-full h-full object-cover animate-fade-in"
                          />
                      </div>
                       <button
                          onClick={() => handleDeleteRequest(currentPhoto)}
                          className="absolute top-3 right-3 bg-black/40 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-500 transition-all z-10"
                          aria-label="Excluir foto"
                      >
                          <TrashIcon className="w-5 h-5" />
                      </button>
                      
                      {sortedPhotos.length > 1 && (
                          <>
                              <button
                                  onClick={handleNewerPhoto}
                                  disabled={currentPhotoIndex === 0}
                                  aria-label="Foto mais nova"
                                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 text-white backdrop-blur-sm w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/50 transition-all disabled:opacity-0 disabled:pointer-events-none"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                              </button>
                              <button
                                  onClick={handleOlderPhoto}
                                  disabled={currentPhotoIndex === sortedPhotos.length - 1}
                                  aria-label="Foto mais antiga"
                                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 text-white backdrop-blur-sm w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/50 transition-all disabled:opacity-0 disabled:pointer-events-none"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                              </button>
                          </>
                      )}
                  </div>
              ) : (
                  <div className="text-center text-gray-400 dark:text-gray-500">
                      <CameraIcon className="w-12 h-12 mx-auto" />
                      <p className="mt-2 font-medium">Sem fotos ainda</p>
                  </div>
              )}
          </div>
          
          <div className="flex justify-center items-center gap-2 py-1">
              {sortedPhotos.length > 1 && (
                  sortedPhotos.map((_, index) => (
                      <button 
                          key={index} 
                          onClick={() => setCurrentPhotoIndex(index)}
                          aria-label={`Ir para foto ${index + 1}`}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${currentPhotoIndex === index ? 'bg-black dark:bg-white scale-125' : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'}`}
                      />
                  ))
              )}
          </div>

          <div className="grid grid-cols-2 gap-3">
              <button
                  onClick={() => setIsComparisonModalOpen(true)}
                  disabled={progressPhotos.length < 2}
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-xl disabled:opacity-50 transition-transform active:scale-95"
              >
                  Comparar
              </button>
              <button
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full bg-black dark:bg-white text-white dark:text-black font-semibold py-3 rounded-xl transition-transform active:scale-95"
              >
                  Adicionar
              </button>
          </div>
          <input type="file" accept="image/*" ref={photoInputRef} onChange={handleAddPhoto} className="hidden" />
      </div>
        
        <div className="bg-gray-100/60 dark:bg-gray-800/50 rounded-3xl p-5 flex flex-col justify-between">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
                <ScaleIcon className="w-5 h-5" />
                <span className="ml-2 font-semibold">Peso</span>
            </div>
            <div className="relative flex-grow flex items-center justify-center my-4 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie 
                            data={donutData} 
                            cx="50%" 
                            cy="50%" 
                            dataKey="value" 
                            innerRadius="75%" 
                            outerRadius="100%" 
                            startAngle={90} 
                            endAngle={-270}
                            paddingAngle={progressPercentage > 0 && progressPercentage < 100 ? 4 : 0}
                            cornerRadius={progressPercentage > 0 ? 99 : 0}
                            stroke="none"
                        >
                            {donutData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold tracking-tighter leading-tight text-gray-900 dark:text-gray-100">{currentWeight.toFixed(1)}</span>
                    <span className="text-lg text-gray-500 dark:text-gray-400 font-medium -mt-1">kg</span>
                </div>
            </div>
            <div className="border-t border-gray-200/80 dark:border-gray-700 pt-4 flex justify-between items-center text-center">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Meta</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{userData.targetWeight} kg</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Faltam</p>
                    <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{(currentWeight - userData.targetWeight).toFixed(1)} kg</p>
                </div>
            </div>
        </div>
      </section>
      
       <section className="bg-gray-100/60 dark:bg-gray-800/50 rounded-3xl p-5">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Histórico de Peso</h2>
          <div className="space-y-3">
              {weightHistory.length > 0 ? (
                weightHistory.slice(0, 4).map(entry => (
                  <div key={entry.id} className="flex justify-between items-center text-gray-700 dark:text-gray-300 pb-3 border-b border-gray-200/80 dark:border-gray-700/80 last:border-b-0 last:pb-0">
                      <p className="font-medium">{new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{entry.weight.toFixed(1)} kg</p>
                  </div>
                ))
              ) : (
                 <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum registro de peso.</p>
              )}
          </div>
      </section>

      <section className="bg-gray-100/60 dark:bg-gray-800/50 rounded-3xl p-5">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Evolução do Peso</h2>
          <div className="h-60 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sortedWeightHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <defs>
                          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme === 'dark' ? '#f9fafb' : '#111827'} stopOpacity={0.1}/>
                              <stop offset="95%" stopColor={theme === 'dark' ? '#f9fafb' : '#111827'} stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} unit="kg" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Area type="monotone" dataKey="weight" stroke={theme === 'dark' ? '#f9fafb' : '#111827'} strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" activeDot={{ r: 6 }} />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </section>
      
       <section className="bg-gray-100/60 dark:bg-gray-800/50 rounded-3xl p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white dark:bg-gray-900/50 p-2 rounded-full shadow-sm"><ScaleIcon className="w-5 h-5 text-gray-600 dark:text-gray-300"/></div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Índice de Massa Corporal (IMC)</h2>
          </div>
          <div className="h-40 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={imcHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line type="monotone" dataKey="imc" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
              </ResponsiveContainer>
          </div>
      </section>
      
      <footer className="pt-4 pb-4">
         <button onClick={() => setIsWeightModalOpen(true)} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl text-lg font-semibold transform active:scale-95 transition-transform">
             Registrar Peso
         </button>
      </footer>

      {isWeightModalOpen && <RegisterWeightModal onSave={handleAddWeight} onClose={() => setIsWeightModalOpen(false)} />}
      {viewingPhoto && <SinglePhotoViewerModal photo={viewingPhoto} onClose={() => setViewingPhoto(null)} onDelete={handleDeleteRequest} />}
      {isComparisonModalOpen && (
        <PhotoComparisonModal
            photos={progressPhotos}
            onClose={() => setIsComparisonModalOpen(false)}
        />
       )}
       {photoToDelete && (
        <DeleteConfirmationModal 
            onConfirm={confirmDelete}
            onClose={() => setPhotoToDelete(null)}
        />
       )}
    </>
  )
}

export const ProgressTab: React.FC = () => {
  const [view, setView] = useState<'progress' | 'calendar' | 'reports'>('progress');
  
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white dark:bg-black min-h-screen animate-fade-in">
      <header>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Progresso</h1>
        <p className="text-gray-500 dark:text-gray-400">Sua jornada visual e diária</p>
      </header>

      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <TabButton label="Progresso" isActive={view === 'progress'} onClick={() => setView('progress')} />
        <TabButton label="Calendário" isActive={view === 'calendar'} onClick={() => setView('calendar')} />
        <TabButton label="Relatórios" isActive={view === 'reports'} onClick={() => setView('reports')} />
      </div>

      {view === 'progress' && <ProgressView />}
      {view === 'calendar' && <CalendarView />}
      {view === 'reports' && <ReportsView />}
    </div>
  );
};


const RegisterWeightModal: React.FC<{onClose: () => void, onSave: (weight: number) => void}> = ({ onClose, onSave }) => {
    const [weight, setWeight] = useState('');
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">Novo Peso</h2>
                <div className="relative my-6">
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full h-20 px-4 text-center text-4xl font-bold bg-gray-100/80 dark:bg-gray-800/80 rounded-2xl shadow-inner transition-shadow focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-900 dark:text-white"
                        placeholder="70.5"
                        autoFocus
                    />
                    <span className="absolute bottom-3 right-5 text-lg text-gray-400 dark:text-gray-500 pointer-events-none">kg</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold">Cancelar</button>
                    <button onClick={() => onSave(parseFloat(weight))} disabled={!weight} className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-semibold disabled:bg-gray-300 dark:disabled:bg-gray-600">Salvar</button>
                </div>
            </div>
        </div>
    );
};

function calculateDateDifference(dateStr1: string, dateStr2: string): string {
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return "Diferença de 1 dia";
    
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;

    let parts = [];
    if (weeks > 0) {
        parts.push(`${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`);
    }
    if (remainingDays > 0) {
        parts.push(`${remainingDays} ${remainingDays === 1 ? 'dia' : 'dias'}`);
    }

    return `Diferença de ${parts.join(' e ')}`;
}

const PhotoComparisonModal: React.FC<{
    photos: ProgressPhoto[];
    onClose: () => void;
}> = ({ photos, onClose }) => {
    const [selectedPhotos, setSelectedPhotos] = useState<ProgressPhoto[]>([]);
    const [view, setView] = useState<'select' | 'compare'>('select');

    const handleSelectPhoto = (photo: ProgressPhoto) => {
        if (selectedPhotos.some(p => p.id === photo.id)) {
            setSelectedPhotos(prev => prev.filter(p => p.id !== photo.id));
            return;
        }
        if (selectedPhotos.length < 2) {
            setSelectedPhotos(prev => [...prev, photo].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
        }
    };

    const handleCompareClick = () => {
        if (selectedPhotos.length === 2) {
            setView('compare');
        }
    };
    
    const handleBackClick = () => {
        setView('select');
    };
    
    const sortedPhotos = useMemo(() => [...photos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [photos]);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md max-h-[90vh] flex flex-col animate-pop-in" onClick={e => e.stopPropagation()}>
                {view === 'select' ? (
                    <>
                        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                            <div className="w-8"></div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Selecione 2 Fotos</h2>
                            <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </header>
                        <main className="flex-grow overflow-y-auto p-4 grid grid-cols-3 gap-3">
                            {sortedPhotos.map(photo => {
                                const isSelected = selectedPhotos.some(p => p.id === photo.id);
                                return (
                                    <button key={photo.id} onClick={() => handleSelectPhoto(photo)} className="relative aspect-square rounded-xl overflow-hidden group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                                        <img src={photo.photo_url} alt={`Progresso ${formatDate(photo.date)}`} className={`w-full h-full object-cover transition-transform duration-200 ${isSelected ? 'scale-90' : 'group-hover:scale-95'}`} />
                                        <div className={`absolute inset-0 transition-all duration-200 ${isSelected ? 'bg-black/40' : 'bg-transparent'}`}></div>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 bg-white text-blue-500 w-6 h-6 rounded-full flex items-center justify-center transform scale-100 transition-transform">
                                                <CheckCircleIcon className="w-6 h-6" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </main>
                        <footer className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-800">
                            <button onClick={handleCompareClick} disabled={selectedPhotos.length !== 2} className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-semibold disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                                Comparar ({selectedPhotos.length}/2)
                            </button>
                        </footer>
                    </>
                ) : (
                    <>
                        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                            <button onClick={handleBackClick} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold text-base px-2 py-1">Voltar</button>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Comparação</h2>
                            <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-1 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </header>
                        <main className="flex-grow overflow-y-auto p-4">
                             <div className="w-full text-center mb-4">
                                <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                    {calculateDateDifference(selectedPhotos[0].date, selectedPhotos[1].date)}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">de progresso</p>
                            </div>
                            <div className="flex gap-4 w-full">
                                {selectedPhotos.map(photo => (
                                    <div key={photo.id} className="w-1/2">
                                        <img src={photo.photo_url} alt={`Progresso ${formatDate(photo.date)}`} className="w-full object-cover rounded-xl aspect-[3/4]" />
                                        <p className="text-center text-gray-700 dark:text-gray-300 font-semibold mt-2">{formatDate(photo.date)}</p>
                                    </div>
                                ))}
                            </div>
                        </main>
                    </>
                )}
            </div>
        </div>
    );
};