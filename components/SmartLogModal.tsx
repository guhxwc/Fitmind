
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from './AppContext';
import Portal from './core/Portal';
import { SparklesIcon, CheckCircleIcon, MicrophoneIcon, KeyboardIcon, CameraIcon, XMarkIcon, ArrowPathIcon, ChevronLeftIcon, LockIcon } from './core/Icons';
import { supabase } from '../supabaseClient';
import { useToast } from './ToastProvider';
import { CalorieCamModal } from './tabs/CalorieCamModal';
import { ManualMealModal } from './tabs/ManualMealModal';

interface SmartLogModalProps {
  onClose: () => void;
  initialMealType?: string;
}

type LogMode = 'menu' | 'type' | 'voice' | 'camera' | 'manual';

export const SmartLogModal: React.FC<SmartLogModalProps> = ({ onClose, initialMealType }) => {
  const { userData, setMeals, updateStreak, setCurrentWater, setWeightHistory, setUserData } = useAppContext();
  const { addToast } = useToast();
  const [mode, setMode] = useState<LogMode>('menu');
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      addToast("Erro ao acessar microfone", "error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split(',')[1]);
        } else {
          reject(new Error("Failed to convert blob to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleProcess = async (source: 'text' | 'audio') => {
    if (source === 'text' && !input.trim()) return;
    if (source === 'audio' && !audioBlob) return;
    if (!userData) return;
    
    setIsProcessing(true);

    try {
      const now = new Date();
      const currentTimeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      let payload: any;
      if (source === 'text') {
        payload = {
          type: 'text',
          input: input,
          currentTime: currentTimeStr
        };
      } else {
        const base64Audio = await blobToBase64(audioBlob!);
        payload = {
          type: 'audio',
          audio: base64Audio,
          mimeType: audioBlob!.type,
          currentTime: currentTimeStr
        };
      }

      const { data: result, error } = await supabase.functions.invoke('gemini-nutrition', {
        body: payload
      });

      if (error) throw error;
      
      if (result.meals && result.meals.length > 0) {
          const newMeals = result.meals.map((m: any) => ({
              name: m.name,
              calories: m.calories,
              protein: m.protein,
              type: m.meal_type,
              id: new Date().toISOString() + Math.random(),
              time: m.time || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          }));
          setMeals(prev => [...prev, ...newMeals]);
      }

      if (result.water_liters && result.water_liters > 0) {
          setCurrentWater(prev => parseFloat((prev + result.water_liters).toFixed(1)));
      }

      if (result.weight_kg && result.weight_kg > 0) {
          setUserData(prev => prev ? ({ ...prev, weight: result.weight_kg }) : null);
          
          const { data: weightData } = await supabase.from('weight_history').insert({ 
              user_id: userData.id, 
              date: new Date().toISOString(), 
              weight: result.weight_kg 
          }).select();
          
          if (weightData) {
             setWeightHistory(prev => [...prev, weightData[0]].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          }
          
          await supabase.from('profiles').update({ weight: result.weight_kg }).eq('id', userData.id);
      }

      updateStreak();
      addToast('Registrado com sucesso!', 'success');
      onClose();

    } catch (error) {
      console.error(error);
      addToast('Não entendi. Tente detalhar melhor.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (mode === 'camera') {
    return (
      <CalorieCamModal 
        onClose={onClose} 
        initialMealType={initialMealType}
        onAddMeal={(meal) => {
          setMeals(prev => [...prev, { ...meal, id: Date.now().toString(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
          updateStreak();
          addToast('Refeição adicionada!', 'success');
          onClose();
        }} 
      />
    );
  }

  if (mode === 'manual') {
    return (
      <ManualMealModal 
        onClose={onClose} 
        initialMealType={initialMealType}
        onAddMeal={(meal) => {
          setMeals(prev => [...prev, { ...meal, id: Date.now().toString(), time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }]);
          updateStreak();
          addToast('Refeição adicionada!', 'success');
          onClose();
        }} 
      />
    );
  }

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={onClose}>
        <div className="bg-white dark:bg-black w-full max-w-md rounded-t-[32px] p-6 animate-slide-up shadow-2xl relative" onClick={e => e.stopPropagation()}>
            
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6 opacity-50"></div>

            {mode === 'menu' && (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                      <SparklesIcon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registro Inteligente</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Escolha como deseja registrar hoje</p>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-4">
                  <button 
                    onClick={() => setMode('manual')}
                    className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all"
                  >
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <KeyboardIcon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">Manual</p>
                      <p className="text-xs text-gray-500">Preencha os dados da refeição</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      if (userData?.isPro) {
                        setMode('type');
                      } else {
                        addToast("Recurso exclusivo para assinantes PRO", "info");
                      }
                    }}
                    className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all relative overflow-hidden"
                  >
                    {!userData?.isPro && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1">
                        <LockIcon className="w-2.5 h-2.5" /> PRO
                      </div>
                    )}
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <SparklesIcon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">Digitar (IA)</p>
                      <p className="text-xs text-gray-500">Escreva naturalmente o que comeu</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      if (userData?.isPro) {
                        setMode('voice');
                      } else {
                        addToast("Recurso exclusivo para assinantes PRO", "info");
                      }
                    }}
                    className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all relative overflow-hidden"
                  >
                    {!userData?.isPro && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1">
                        <LockIcon className="w-2.5 h-2.5" /> PRO
                      </div>
                    )}
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400">
                      <MicrophoneIcon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">Falar</p>
                      <p className="text-xs text-gray-500">Grave um áudio descrevendo tudo</p>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      if (userData?.isPro) {
                        setMode('camera');
                      } else {
                        addToast("Recurso exclusivo para assinantes PRO", "info");
                      }
                    }}
                    className="flex items-center gap-4 p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all relative overflow-hidden"
                  >
                    {!userData?.isPro && (
                      <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1">
                        <LockIcon className="w-2.5 h-2.5" /> PRO
                      </div>
                    )}
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400">
                      <CameraIcon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 dark:text-white">CalorieCam</p>
                      <p className="text-xs text-gray-500">Tire uma foto do seu prato</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {mode === 'type' && (
              <div className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => setMode('menu')} className="text-gray-500"><ChevronLeftIcon className="w-6 h-6" /></button>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Digitar Registro</h2>
                  <div className="w-6"></div>
                </div>

                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ex: Almocei frango com salada agora ao meio-dia..."
                    className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 text-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600 mb-6"
                    autoFocus
                />

                <button
                    onClick={() => handleProcess('text')}
                    disabled={isProcessing || !input.trim()}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                    {isProcessing ? <><svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Processando...</> : "Processar com IA"}
                </button>
              </div>
            )}

            {mode === 'voice' && (
              <div className="animate-fade-in text-center">
                <div className="flex items-center justify-between mb-6">
                  <button onClick={() => { stopRecording(); setMode('menu'); }} className="text-gray-500"><ChevronLeftIcon className="w-6 h-6" /></button>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Falar Registro</h2>
                  <div className="w-6"></div>
                </div>

                <div className="py-10">
                  <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all duration-500 ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-purple-500'}`}>
                    <MicrophoneIcon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-2xl font-mono font-bold mt-6 text-gray-900 dark:text-white">{formatTime(recordingTime)}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {isRecording ? "Gravando... Fale naturalmente." : audioBlob ? "Gravação concluída!" : "Toque em Iniciar para falar"}
                  </p>
                </div>

                <div className="flex gap-4 mt-6">
                  {!isRecording && !audioBlob && (
                    <button onClick={startRecording} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold">Iniciar Gravação</button>
                  )}
                  {isRecording && (
                    <button onClick={stopRecording} className="flex-1 bg-red-500 text-white py-4 rounded-xl font-bold">Parar</button>
                  )}
                  {audioBlob && !isRecording && (
                    <>
                      <button onClick={() => { setAudioBlob(null); setRecordingTime(0); }} className="w-1/3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"><ArrowPathIcon className="w-5 h-5" /> Refazer</button>
                      <button onClick={() => handleProcess('audio')} disabled={isProcessing} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                        {isProcessing ? "Analisando..." : "Analisar Áudio"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
    </Portal>
  );
};
