import React, { useState, useRef, useEffect } from 'react';
import { Activity, Battery, Smile, UserCircle2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAppContext } from '../AppContext';

interface SliderProps {
  label: string;
  value: number;
  max?: number;
  metric: 'hunger' | 'energy' | 'mood' | 'humor';
  onChange: (val: number) => void;
  icon: React.ReactNode;
}

const SliderRow: React.FC<SliderProps> = ({ label, value, max = 10, metric, onChange, icon }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const colors = {
    hunger: 'text-amber-500 bg-amber-50',
    energy: 'text-emerald-500 bg-emerald-50',
    mood: 'text-blue-500 bg-blue-50',
    humor: 'text-purple-500 bg-purple-50',
  };

  const darkColors = {
    hunger: 'dark:bg-amber-500/10',
    energy: 'dark:bg-emerald-500/10',
    mood: 'dark:bg-blue-500/10',
    humor: 'dark:bg-purple-500/10',
  };

  const fillColors = {
    hunger: 'bg-amber-500',
    energy: 'bg-emerald-500',
    mood: 'bg-blue-500',
    humor: 'bg-purple-500',
  };

  const textColors = {
    hunger: 'text-amber-500',
    energy: 'text-emerald-500',
    mood: 'text-blue-500',
    humor: 'text-purple-500',
  };

  const updateFromClientX = (clientX: number) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.max(0, Math.min(1, pct));
    const newVal = Math.round(pct * max);
    onChange(newVal);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      updateFromClientX(e.clientX);
    };
    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    updateFromClientX(e.touches[0].clientX);
  };

  const percent = (value / max) * 100;

  return (
    <div className="grid grid-cols-[auto_80px_1fr_auto] items-center gap-3">
      <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center shrink-0 ${colors[metric]} ${darkColors[metric]}`}>
        {icon}
      </div>
      <div className="text-[14px] font-semibold text-gray-900 dark:text-white">{label}</div>
      
      <div 
        ref={wrapRef}
        className="relative h-[32px] flex items-center touch-none cursor-pointer group"
        onMouseDown={(e) => {
          setIsDragging(true);
          updateFromClientX(e.clientX);
        }}
        onTouchStart={(e) => {
          setIsDragging(true);
          updateFromClientX(e.touches[0].clientX);
        }}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsDragging(false)}
        onTouchCancel={() => setIsDragging(false)}
      >
        <div className="absolute left-0 right-0 h-[6px] bg-[#eef0f6] dark:bg-gray-800 rounded-full overflow-hidden">
          <div className={`absolute left-0 top-0 bottom-0 rounded-full transition-[width] duration-100 ease-out ${fillColors[metric]}`} style={{ width: `${percent}%` }}></div>
        </div>
        <div 
          className={`absolute w-[18px] h-[18px] bg-white rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.18)] border-2 border-transparent top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-100 pointer-events-none ${isDragging ? 'scale-[1.15] shadow-[0_3px_10px_rgba(0,0,0,0.3)]' : ''} group-hover:shadow-[0_2px_8px_rgba(0,0,0,0.25)]`} 
          style={{ 
            left: `${percent}%`,
            borderColor: metric === 'hunger' ? '#f59e0b' : metric === 'energy' ? '#10b981' : metric === 'mood' ? '#3b6ef5' : '#6c5ce7'
          }}
        ></div>
      </div>

      <div className={`text-[13px] font-bold min-w-[40px] text-right font-mono ${textColors[metric]}`}>
        <span>{value}</span><span className="text-gray-400 dark:text-gray-600">/10</span>
      </div>
    </div>
  );
};

export const QuickCheckInCard: React.FC = () => {
  const { session } = useAppContext();
  const [hunger, setHunger] = useState(6);
  const [energy, setEnergy] = useState(7);
  const [mood, setMood] = useState(7);
  const [humor, setHumor] = useState(8);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;
    const load = async () => {
      const { data } = await supabase
        .from('consultation_checkins')
        .select('hunger, energy, mood, humor, notes, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setLastSentAt(new Date(data.created_at));
        const today = new Date().toDateString();
        if (new Date(data.created_at).toDateString() === today) {
          setHunger(data.hunger);
          setEnergy(data.energy);
          setMood(data.mood);
          setHumor(data.humor);
          if (data.notes) setNotes(data.notes);
          setSubmitted(true);
        }
      }
    };
    load();
  }, [session?.user?.id]);

  const handleSubmit = async () => {
    if (!session?.user?.id || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: insertErr } = await supabase
        .from('consultation_checkins')
        .insert({
          user_id: session.user.id,
          hunger,
          energy,
          mood,
          humor,
          notes: notes.trim() || null,
        });

      if (insertErr) throw insertErr;

      setSubmitted(true);
      setLastSentAt(new Date());
      setTimeout(() => setSubmitted(false), 2500);
    } catch (err: any) {
      console.error('[QuickCheckIn] erro ao salvar:', err);
      setError('Não foi possível enviar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatLastSent = () => {
    if (!lastSentAt) return 'Hoje';
    const today = new Date();
    const isToday = lastSentAt.toDateString() === today.toDateString();
    const time = lastSentAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return isToday ? `Hoje, ${time}` : `${lastSentAt.toLocaleDateString('pt-BR')}, ${time}`;
  };

  return (
    <div className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-white/5">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" strokeWidth={2.5} />
          </div>
          <h3 className="text-[16px] font-bold text-gray-900 dark:text-white tracking-tight">Check-in rápido</h3>
        </div>
        <div className="text-[13px] font-medium text-gray-500 mt-1">{formatLastSent()}</div>
      </div>

      <div className="text-[15px] font-bold text-gray-900 dark:text-white mb-4">Como você está hoje?</div>

      <div className="flex flex-col gap-3 mb-6">
        <SliderRow 
          label="Fome" 
          value={hunger} 
          onChange={setHunger} 
          metric="hunger" 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
        />
        <SliderRow 
          label="Energia" 
          value={energy} 
          onChange={setEnergy} 
          metric="energy" 
          icon={<Battery className="w-[18px] h-[18px]" strokeWidth={2.5} />}
        />
        <SliderRow 
          label="Disposição" 
          value={mood} 
          onChange={setMood} 
          metric="mood" 
          icon={<UserCircle2 className="w-[18px] h-[18px]" strokeWidth={2.5} />}
        />
        <SliderRow 
          label="Humor" 
          value={humor} 
          onChange={setHumor} 
          metric="humor" 
          icon={<Smile className="w-[18px] h-[18px]" strokeWidth={2.5} />}
        />
      </div>

      <div className="mb-6">
        <label className="block text-[13px] font-bold text-gray-900 dark:text-white mb-2">
          Observações (Opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Como foi o seu dia? Sentiu algo diferente?"
          className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none h-[80px]"
        />
      </div>

      {error && (
        <div className="mb-3 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </div>
      )}

      <button 
        onClick={handleSubmit}
        disabled={submitting}
        className={`w-full py-3.5 rounded-2xl font-bold text-[15px] transition-all duration-200 active:scale-[0.98] disabled:opacity-60 ${
          submitted 
            ? 'bg-emerald-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.28)]'
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-[0_4px_14px_rgba(59,130,246,0.28)]'
        }`}
      >
        {submitting ? 'Enviando...' : submitted ? '✓ Check-in enviado!' : 'Enviar check-in'}
      </button>
    </div>
  );
};
