
import React, { useState, useMemo, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { UserData, WeightEntry, ProgressPhoto } from '../../types';
import { CameraIcon, PlusIcon, TrashIcon, ArrowPathIcon, ScaleIcon } from '../core/Icons';

interface ProgressTabProps {
  userData: UserData;
  weightHistory: WeightEntry[];
  setWeightHistory: React.Dispatch<React.SetStateAction<WeightEntry[]>>;
  progressPhotos: ProgressPhoto[];
  setProgressPhotos: React.Dispatch<React.SetStateAction<ProgressPhoto[]>>;
  onShowProModal: (type: 'feature' | 'engagement', title?: string) => void;
}

const fileToBlob = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        try {
            resolve(file as Blob);
        } catch(e) {
            reject(e);
        }
    });
};

const formatDate = (isoString: string) => new Date(isoString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

export const ProgressTab: React.FC<ProgressTabProps> = ({ userData, weightHistory, setWeightHistory, progressPhotos, setProgressPhotos, onShowProModal }) => {
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isPhotoViewerOpen, setIsPhotoViewerOpen] = useState<ProgressPhoto | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const photoReplaceInputRef = useRef<HTMLInputElement>(null);
  
  const latestWeightEntry = useMemo(() => [...weightHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || { weight: userData.weight }, [weightHistory, userData.weight]);
  const latestPhoto = useMemo(() => [...progressPhotos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0], [progressPhotos]);

  const handleAddWeight = async (newWeight: number) => {
    if (newWeight > 30 && newWeight < 300) {
      const newEntry: Omit<WeightEntry, 'id'> = {
        user_id: userData.id,
        date: new Date().toISOString(),
        weight: newWeight
      };
      
      const { data, error } = await supabase.from('weight_history').insert(newEntry).select();
      
      if (data) {
        setWeightHistory(prev => [data[0], ...prev]);
        setIsWeightModalOpen(false);
        if (weightHistory.length + 1 === 5) {
            onShowProModal('engagement');
        }
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
          setProgressPhotos(prev => [dbData[0], ...prev]);
      }
       if (dbError) console.error('Error saving photo record:', dbError);
    }
  };
  
  const handleReplacePhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isPhotoViewerOpen) {
        // First, remove the old photo from storage
        const oldPath = isPhotoViewerOpen.photo_url.split('/progress_photos/')[1];
        await supabase.storage.from('progress_photos').remove([oldPath]);

        // Then, upload the new one
        const newPath = `${userData.id}/${Date.now()}_${file.name}`;
        const { error: uploadError } = await supabase.storage.from('progress_photos').upload(newPath, file);
        if (uploadError) {
            console.error("Error uploading replacement:", uploadError);
            return;
        }

        const { data: { publicUrl } } = supabase.storage.from('progress_photos').getPublicUrl(newPath);

        // Finally, update the database record
        const { data: dbData, error: dbError } = await supabase.from('progress_photos').update({ photo_url: publicUrl }).eq('id', isPhotoViewerOpen.id).select();

        if (dbData) {
            setProgressPhotos(prev => prev.map(p => p.id === isPhotoViewerOpen.id ? dbData[0] : p));
            setIsPhotoViewerOpen(dbData[0]);
        }
        if (dbError) console.error("Error updating photo record:", dbError);
    }
  };

  const handleDeletePhoto = async () => {
    if (isPhotoViewerOpen) {
      const path = isPhotoViewerOpen.photo_url.split('/progress_photos/')[1];
      
      // Delete from storage and db
      await supabase.storage.from('progress_photos').remove([path]);
      const { error } = await supabase.from('progress_photos').delete().eq('id', isPhotoViewerOpen.id);
      
      if (!error) {
        setProgressPhotos(prev => prev.filter(p => p.id !== isPhotoViewerOpen.id));
        setIsPhotoViewerOpen(null);
      } else {
        console.error("Error deleting photo:", error);
      }
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

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      <header>
        <h1 className="text-4xl font-bold text-gray-900">Progresso</h1>
        <p className="text-gray-500">Sua jornada visual</p>
      </header>

      <section className="grid grid-cols-2 gap-4">
        {/* Photo Card */}
        <div className="flex flex-col">
          <div className="bg-white border border-gray-200/80 shadow-soft rounded-3xl aspect-[3/4] flex flex-col items-center justify-center p-3 relative overflow-hidden group">
            {latestPhoto ? (
              <img src={latestPhoto.photo_url} onClick={() => setIsPhotoViewerOpen(latestPhoto)} alt="Progresso mais recente" className="w-full h-full object-cover rounded-2xl cursor-pointer" />
            ) : (
              <div className="text-center text-gray-400">
                <CameraIcon className="w-12 h-12 mx-auto" />
                <p className="mt-2 font-medium">Sem fotos ainda</p>
              </div>
            )}
             <button onClick={() => photoInputRef.current?.click()} className="absolute bottom-4 right-4 bg-black/60 text-white backdrop-blur-sm p-2 rounded-full transform translate-y-14 group-hover:translate-y-0 transition-transform duration-300">
                <PlusIcon className="w-6 h-6" />
             </button>
             <input type="file" accept="image/*" ref={photoInputRef} onChange={handleAddPhoto} className="hidden" />
          </div>
          {/* Mini Timeline */}
          <div className="flex gap-2 mt-3 h-16">
            {[...progressPhotos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map(photo => (
                 <div key={photo.id} className="w-1/3 aspect-square relative group">
                    <img src={photo.photo_url} onClick={() => setIsPhotoViewerOpen(photo)} alt={`Progresso ${formatDate(photo.date)}`} className="w-full h-full object-cover rounded-xl cursor-pointer"/>
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-bold">{formatDate(photo.date)}</p>
                    </div>
                </div>
            ))}
          </div>
        </div>
        
        {/* Weight Card */}
        <div className="bg-white border border-gray-200/80 shadow-soft rounded-3xl p-5 flex flex-col justify-between">
            <div>
                <p className="text-gray-500 font-medium">Peso Atual</p>
                <p className="text-4xl font-bold text-gray-900 mt-1">{latestWeightEntry?.weight.toFixed(1)}<span className="text-2xl text-gray-400 font-medium">kg</span></p>
            </div>
            <div>
                 <div className="flex justify-between items-baseline mt-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Meta</p>
                        <p className="font-semibold text-gray-800">{userData.targetWeight} kg</p>
                    </div>
                     <div>
                        <p className="text-gray-500 text-sm font-medium">Faltam</p>
                        <p className="font-semibold text-gray-800">{(latestWeightEntry.weight - userData.targetWeight).toFixed(1)} kg</p>
                    </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-black h-2 rounded-full" style={{ width: `${Math.max(0, 100 - ((latestWeightEntry.weight - userData.targetWeight) / (userData.weight - userData.targetWeight) * 100))}%` }}></div>
                </div>
            </div>
        </div>
      </section>
      
      {/* History List */}
       <section>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Histórico de Peso</h2>
          <div className="bg-gray-100/60 rounded-2xl p-4 space-y-3">
              {[...weightHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4).map(entry => (
                  <div key={entry.date} className="flex justify-between items-center text-gray-700">
                      <p className="font-medium">{new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</p>
                      <p className="font-semibold text-gray-900">{entry.weight.toFixed(1)} kg</p>
                  </div>
              ))}
          </div>
      </section>

      {/* Weight Chart */}
      <section>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Evolução do Peso</h2>
          <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sortedWeightHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <defs>
                          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={['dataMin - 2', 'dataMax + 2']} unit="kg" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }} />
                      <Area type="monotone" dataKey="weight" stroke="#111827" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" activeDot={{ r: 6 }} />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </section>
      
       {/* IMC Chart */}
      <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gray-100 p-2 rounded-full"><ScaleIcon className="w-5 h-5 text-gray-600"/></div>
            <h2 className="text-xl font-bold text-gray-800">Índice de Massa Corporal (IMC)</h2>
          </div>
          <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={imcHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(4px)', border: '1px solid #e5e7eb', borderRadius: '0.75rem' }} />
                      <Line type="monotone" dataKey="imc" stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
              </ResponsiveContainer>
          </div>
      </section>
      
      {/* Register Weight Button */}
      <footer className="pt-4 pb-4">
         <button onClick={() => setIsWeightModalOpen(true)} className="w-full bg-black text-white py-4 rounded-2xl text-lg font-semibold transform active:scale-95 transition-transform">
             Registrar Peso
         </button>
      </footer>

      {/* Modals */}
      {isWeightModalOpen && <RegisterWeightModal onSave={handleAddWeight} onClose={() => setIsWeightModalOpen(false)} />}
      {isPhotoViewerOpen && (
        <PhotoViewerModal 
            photo={isPhotoViewerOpen} 
            onClose={() => setIsPhotoViewerOpen(null)}
            onDelete={handleDeletePhoto}
            onReplace={() => photoReplaceInputRef.current?.click()}
        />
      )}
      <input type="file" accept="image/*" ref={photoReplaceInputRef} onChange={handleReplacePhoto} className="hidden" />

    </div>
  );
};


const RegisterWeightModal: React.FC<{onClose: () => void, onSave: (weight: number) => void}> = ({ onClose, onSave }) => {
    const [weight, setWeight] = useState('');
    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onClick={onClose}>
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900 text-center">Novo Peso</h2>
                <div className="relative my-6">
                    <input
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="w-full h-20 px-4 text-center text-4xl font-bold bg-gray-100/80 rounded-2xl shadow-inner transition-shadow focus:outline-none focus:ring-2 focus:ring-black"
                        placeholder="70.5"
                        autoFocus
                    />
                    <span className="absolute bottom-3 right-5 text-lg text-gray-400 pointer-events-none">kg</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={onClose} className="w-full bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold">Cancelar</button>
                    <button onClick={() => onSave(parseFloat(weight))} disabled={!weight} className="w-full bg-black text-white py-3 rounded-xl font-semibold disabled:bg-gray-300">Salvar</button>
                </div>
            </div>
        </div>
    );
};

const PhotoViewerModal: React.FC<{photo: ProgressPhoto, onClose: () => void, onDelete: () => void, onReplace: () => void}> = ({ photo, onClose, onDelete, onReplace }) => {
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col p-4" onClick={onClose}>
            <div className="flex-grow flex items-center justify-center">
                 <img src={photo.photo_url} alt={`Progresso ${formatDate(photo.date)}`} className="max-w-full max-h-full rounded-2xl object-contain" />
            </div>
            <div className="flex-shrink-0 grid grid-cols-3 gap-3 pt-4">
                 <button onClick={onDelete} className="bg-white/10 text-white backdrop-blur-md py-3 rounded-xl font-semibold flex items-center justify-center gap-2"><TrashIcon className="w-5 h-5"/>Remover</button>
                 <button onClick={onReplace} className="bg-white/10 text-white backdrop-blur-md py-3 rounded-xl font-semibold flex items-center justify-center gap-2"><ArrowPathIcon className="w-5 h-5"/>Substituir</button>
                 <button onClick={onClose} className="bg-white text-black py-3 rounded-xl font-semibold">Fechar</button>
            </div>
        </div>
    );
}