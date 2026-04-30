import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, TrendingDown, TrendingUp, Activity, Camera, Ruler,
  Target, Calendar as CalendarIcon, Trophy, Image as ImageIcon,
  X as XIcon, ChevronLeft, ChevronRight, ArrowRight, BarChart3,
  Dumbbell, Utensils, Edit2
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { supabase } from '../../supabaseClient';

/* =========================================================
   MOCK DATA
========================================================= */
const MOCK_WEIGHT = [
  { date: '2026-02-01', weight: 86.0 }, { date: '2026-02-08', weight: 85.4 },
  { date: '2026-02-15', weight: 85.1 }, { date: '2026-02-22', weight: 84.6 },
  { date: '2026-03-01', weight: 84.2 }, { date: '2026-03-08', weight: 83.9 },
  { date: '2026-03-15', weight: 83.5 }, { date: '2026-03-22', weight: 83.1 },
  { date: '2026-03-29', weight: 82.8 }, { date: '2026-04-05', weight: 82.6 },
  { date: '2026-04-12', weight: 82.5 }, { date: '2026-04-19', weight: 82.2 },
  { date: '2026-04-26', weight: 81.9 },
];

const MOCK_PHOTOS = [
  { id: '1', url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', date: '2026-02-01', angle: 'Frente' },
  { id: '2', url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400', date: '2026-02-01', angle: 'Lado' },
  { id: '3', url: 'https://images.unsplash.com/photo-1583500178690-f7ed30dba3a4?w=400', date: '2026-03-01', angle: 'Frente' },
  { id: '4', url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400', date: '2026-03-01', angle: 'Lado' },
  { id: '5', url: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400', date: '2026-04-01', angle: 'Frente' },
  { id: '6', url: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?w=400', date: '2026-04-01', angle: 'Lado' },
];

const MOCK_MEASUREMENTS = [
  { name: 'Cintura', latest: 84, previous: 89, unit: 'cm' },
  { name: 'Quadril', latest: 100, previous: 102, unit: 'cm' },
  { name: 'Peito', latest: 102, previous: 104, unit: 'cm' },
  { name: 'Braço', latest: 34, previous: 33, unit: 'cm', positive: 'up' as const },
  { name: 'Coxa', latest: 56, previous: 57, unit: 'cm' },
  { name: 'Panturrilha', latest: 36, previous: 36, unit: 'cm' },
];

const MOCK_BODY_COMP = [
  { date: '2026-02-01', lean: 62.5, fat: 23.5, fatPct: 27.3 },
  { date: '2026-03-01', lean: 63.1, fat: 21.1, fatPct: 25.0 },
  { date: '2026-04-01', lean: 63.4, fat: 19.2, fatPct: 23.2 },
  { date: '2026-04-26', lean: 63.7, fat: 18.2, fatPct: 22.2 },
];

const MOCK_WORKOUTS_WEEKLY = [
  { week: 'Sem 1', count: 4 }, { week: 'Sem 2', count: 5 },
  { week: 'Sem 3', count: 3 }, { week: 'Sem 4', count: 5 },
  { week: 'Sem 5', count: 4 }, { week: 'Sem 6', count: 5 },
];

/* =========================================================
   HELPERS
========================================================= */
const formatBR = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

const formatBRFull = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

/* =========================================================
   COMPONENTS
========================================================= */

const AddEvolutionRecordModal: React.FC<{
  userId: string;
  mode: 'composition' | 'measurements';
  latestRecord: any | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ userId, mode, latestRecord, onClose, onSaved }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [leanMass, setLeanMass] = useState(latestRecord?.lean_mass ?? '');
  const [fatMass, setFatMass] = useState(latestRecord?.fat_mass ?? '');
  const [bodyFatPct, setBodyFatPct] = useState(latestRecord?.body_fat_pct ?? '');
  
  const [waist, setWaist] = useState(latestRecord?.waist ?? '');
  const [hip, setHip] = useState(latestRecord?.hip ?? '');
  const [chest, setChest] = useState(latestRecord?.chest ?? '');
  const [arm, setArm] = useState(latestRecord?.arm ?? '');
  const [thigh, setThigh] = useState(latestRecord?.thigh ?? '');
  
  const [notes, setNotes] = useState(latestRecord?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const toNum = (v: any) => (v === '' || v === null || v === undefined ? null : Number(v));

  const handleSave = async () => {
    setSaving(true);
    try {
      const dbDate = new Date(date + 'T12:00:00Z').toISOString();
      
      const payload = {
        user_id: userId,
        lean_mass: toNum(leanMass),
        fat_mass: toNum(fatMass),
        body_fat_pct: toNum(bodyFatPct),
        waist: toNum(waist),
        hip: toNum(hip),
        chest: toNum(chest),
        arm: toNum(arm),
        thigh: toNum(thigh),
        notes: notes || null,
        measured_at: dbDate,
        updated_at: new Date().toISOString(),
      };

      await supabase.from('body_composition').insert(payload);
      onSaved();
      onClose();
    } catch (err) {
      console.error('Record save error:', err);
      alert('Erro ao salvar registro.');
    } finally {
      setSaving(false);
    }
  };

  const Field: React.FC<{ label: string; value: any; onChange: (v: string) => void; unit?: string }> = ({ label, value, onChange, unit = 'kg' }) => (
    <div>
      <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">{label}</label>
      <div className="relative">
        <input
          type="number"
          step="0.1"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 transition-all pr-10"
          placeholder="—"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[220] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[24px] w-full max-w-[480px] shadow-2xl my-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'composition' ? 'Nova evolução corporal' : 'Novas medidas corporais'}
          </h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-50 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Data da medição</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
            />
          </div>

          <div className="w-full h-px bg-gray-100" />

          {mode === 'composition' ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Massa magra" value={leanMass} onChange={setLeanMass} unit="kg" />
              <Field label="Massa gorda" value={fatMass} onChange={setFatMass} unit="kg" />
              <Field label="% Gordura" value={bodyFatPct} onChange={setBodyFatPct} unit="%" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Cintura" value={waist} onChange={setWaist} unit="cm" />
              <Field label="Quadril" value={hip} onChange={setHip} unit="cm" />
              <Field label="Peito" value={chest} onChange={setChest} unit="cm" />
              <Field label="Braço" value={arm} onChange={setArm} unit="cm" />
              <Field label="Coxa" value={thigh} onChange={setThigh} unit="cm" />
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Observações (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
              placeholder="Anotações sobre a medição..."
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-[24px]">
          <button onClick={onClose} className="px-5 py-2.5 text-[13px] font-bold text-gray-600 hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-[#007AFF] text-white text-[13px] font-bold rounded-xl hover:bg-[#0056b3] transition-colors disabled:opacity-60 shadow-sm">
            {saving ? 'Registrando...' : 'Registrar Evolução'}
          </button>
        </div>
      </div>
    </div>
  );
};

type Period = '7D' | '30D' | '90D' | '6M' | 'Tudo';

const KpiCard: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  hint?: string;
  trend?: { value: string; positive: boolean };
}> = ({ icon, iconBg, iconColor, label, value, hint, trend }) => (
  <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg} ${iconColor}`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${
          trend.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trend.positive ? <TrendingUp className="w-3 h-3" strokeWidth={3} /> : <TrendingDown className="w-3 h-3" strokeWidth={3} />}
          {trend.value}
        </div>
      )}
    </div>
    <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">{label}</p>
    <p className="text-[24px] font-extrabold text-gray-900 leading-none mt-1.5 tracking-tight">{value}</p>
    {hint && <p className="text-[11px] text-gray-400 font-medium mt-1.5">{hint}</p>}
  </div>
);

const PhotoCompareModal: React.FC<{ photoA: any; photoB: any; onClose: () => void }> = ({ photoA, photoB, onClose }) => (
  <div className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
    <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-[16px] font-bold text-gray-900">Comparar fotos</h3>
          <p className="text-[12px] text-gray-500">{formatBRFull(photoA.date)} vs {formatBRFull(photoB.date)}</p>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500">
          <XIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-1 bg-gray-100">
        {[photoA, photoB].map((p, i) => (
          <div key={p.id} className="relative aspect-[3/4] bg-gray-200">
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg">
              <p className="text-[11px] font-bold">{i === 0 ? 'Antes' : 'Depois'}</p>
              <p className="text-[10px] opacity-90">{formatBRFull(p.date)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* =========================================================
   MAIN
========================================================= */
export const EvolutionView: React.FC<{ patient: any; onBack: () => void }> = ({ patient, onBack }) => {
  const patientName = patient?.profiles?.name || 'Paciente';
  
  const [loading, setLoading] = useState(true);
  const [weightHistory, setWeightHistory] = useState<any[]>([]);
  const [bodyCompHistory, setBodyCompHistory] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [checkins, setCheckins] = useState<any[]>([]);
  
  const [period, setPeriod] = useState<Period>('30D');
  const [photoFilter, setPhotoFilter] = useState<'Todos' | 'Frente' | 'Lado'>('Todos');
  const [selectedToCompare, setSelectedToCompare] = useState<string[]>([]);
  const [comparing, setComparing] = useState<{ a: any; b: any } | null>(null);
  
  const [modalMode, setModalMode] = useState<'composition' | 'measurements' | null>(null);
  
  const loadData = async () => {
    try {
      setLoading(true);
      const [weightRes, compRes, photoRes, plansRes, checkinsRes] = await Promise.all([
        supabase.from('weight_history').select('*').eq('user_id', patient.user_id).order('date', { ascending: true }),
        supabase.from('body_composition').select('*').eq('user_id', patient.user_id).order('measured_at', { ascending: true }),
        supabase.from('progress_photos').select('*').eq('user_id', patient.user_id).order('date', { ascending: false }),
        supabase.from('patient_plans').select('id, title, created_at').eq('user_id', patient.user_id).eq('status', 'sent').order('created_at', { ascending: false }),
        supabase.from('consultation_checkins').select('id, created_at').eq('user_id', patient.user_id).order('created_at', { ascending: false })
      ]);
      setWeightHistory(weightRes.data || []);
      setBodyCompHistory(compRes.data || []);
      setPhotos(photoRes.data || []);
      setPlans(plansRes.data || []);
      setCheckins(checkinsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patient?.user_id) loadData();
  }, [patient?.user_id]);

  const profile = patient?.profiles;
  const initialWeight = profile?.start_weight || weightHistory[0]?.weight || 0;
  const currentWeight = weightHistory[weightHistory.length - 1]?.weight || profile?.weight || 0;
  const targetWeight = profile?.target_weight || 0;
  const totalLost = +(initialWeight - currentWeight).toFixed(1);
  const pctOfGoal = Math.abs(initialWeight - targetWeight) > 0 ? Math.round((totalLost / (initialWeight - targetWeight)) * 100) : 0;
  const startDate = profile?.created_at ? new Date(profile.created_at) : (weightHistory[0]?.date ? new Date(weightHistory[0].date) : new Date());
  const weeksFollowing = Math.max(1, Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
  const avgPerWeek = +(totalLost / weeksFollowing).toFixed(2);

  const chartData = useMemo(() => {
    let data = weightHistory;
    if (period !== 'Tudo') {
      const days = period === '7D' ? 7 : period === '30D' ? 30 : period === '90D' ? 90 : 180;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      data = weightHistory.filter((w) => new Date(w.date) >= cutoff);
    }
    return data.map((w) => ({
      date: formatBR(w.date),
      peso: w.weight,
    }));
  }, [weightHistory, period]);

  const filteredPhotos = useMemo(() =>
    photoFilter === 'Todos' ? photos : photos.filter((p) => p.angle === photoFilter),
  [photos, photoFilter]);

  const togglePhotoSelect = (id: string) => {
    if (selectedToCompare.includes(id)) {
      setSelectedToCompare(selectedToCompare.filter((x) => x !== id));
    } else if (selectedToCompare.length < 2) {
      setSelectedToCompare([...selectedToCompare, id]);
    }
  };

  const compareNow = () => {
    if (selectedToCompare.length !== 2) return;
    const a = photos.find((p) => p.id === selectedToCompare[0])!;
    const b = photos.find((p) => p.id === selectedToCompare[1])!;
    const [older, newer] = new Date(a.date) < new Date(b.date) ? [a, b] : [b, a];
    setComparing({ a: older, b: newer });
    setSelectedToCompare([]);
  };

  const timelineEvents = useMemo(() => {
    const rawEvents: any[] = [];
    
    plans.forEach(plan => {
      rawEvents.push({
        date: new Date(plan.created_at),
        icon: Utensils, color: 'bg-blue-50 text-blue-500', 
        title: 'Plano alimentar atualizado', sub: `Plano "${plan.title}" lançado`
      });
    });

    bodyCompHistory.forEach(comp => {
      rawEvents.push({
        date: new Date(comp.measured_at || comp.updated_at),
        icon: Ruler, color: 'bg-emerald-50 text-emerald-500', 
        title: 'Nova edição de medidas', sub: `Atualização de composição corporal`
      });
    });

    checkins.forEach(chk => {
      rawEvents.push({
        date: new Date(chk.created_at),
        icon: CalendarIcon, color: 'bg-amber-50 text-amber-500', 
        title: 'Check-in realizado', sub: 'Paciente preencheu as avaliações'
      });
    });

    // Photos grouped by day
    const photoDays: Record<string, number> = {};
    photos.forEach(p => {
      const d = new Date(p.date || p.created_at).toISOString().split('T')[0];
      photoDays[d] = (photoDays[d] || 0) + 1;
    });
    Object.keys(photoDays).forEach(d => {
      rawEvents.push({
        date: new Date(d),
        icon: Camera, color: 'bg-purple-50 text-purple-500',
        title: 'Novas fotos de progresso', sub: `${photoDays[d]} foto(s) adicionada(s)`
      });
    });

    return rawEvents.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
  }, [plans, bodyCompHistory, checkins, photos]);

  const latestComp = bodyCompHistory[bodyCompHistory.length - 1];
  const firstComp = bodyCompHistory[0];

  return (
    <div className="fixed inset-0 bg-[#F9FAFC] z-[110] overflow-y-auto font-sans">
      <main className="px-4 lg:px-10 py-8">
        <div className="max-w-[1240px] mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <p className="text-[12px] font-semibold text-gray-500">{patientName}</p>
                <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">Evolução</h1>
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[12px] font-bold text-gray-700 hover:bg-gray-50 shadow-sm">
              <BarChart3 className="w-3.5 h-3.5" /> Exportar relatório
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard
              icon={<TrendingDown className="w-5 h-5" strokeWidth={2.5} />}
              iconBg="bg-emerald-50" iconColor="text-emerald-500"
              label="Perda total"
              value={`${totalLost} kg`}
              hint={`De ${initialWeight} kg para ${currentWeight} kg`}
              trend={{ value: `-${((totalLost / initialWeight) * 100).toFixed(1)}%`, positive: true }}
            />
            <KpiCard
              icon={<Target className="w-5 h-5" strokeWidth={2.5} />}
              iconBg="bg-blue-50" iconColor="text-blue-500"
              label="% do objetivo"
              value={`${pctOfGoal}%`}
              hint={`Meta: ${targetWeight} kg`}
            />
            <KpiCard
              icon={<CalendarIcon className="w-5 h-5" strokeWidth={2.5} />}
              iconBg="bg-purple-50" iconColor="text-purple-500"
              label="Acompanhamento"
              value={`${weeksFollowing} semanas`}
              hint={`Desde ${startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
            />
            <KpiCard
              icon={<Activity className="w-5 h-5" strokeWidth={2.5} />}
              iconBg="bg-amber-50" iconColor="text-amber-500"
              label="Velocidade média"
              value={`${avgPerWeek} kg/sem`}
              hint={avgPerWeek <= 0.7 ? 'Faixa saudável' : 'Acelerada'}
              trend={{ value: avgPerWeek <= 0.7 ? 'OK' : 'Alta', positive: avgPerWeek <= 0.7 }}
            />
          </div>

          {/* Gráfico de peso + Composição */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Gráfico */}
            <div className="lg:col-span-2 bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900">Evolução de peso</h3>
                  <p className="text-[12px] text-gray-500 font-medium mt-0.5">Histórico completo com a meta marcada</p>
                </div>
                <div className="flex bg-gray-50 p-1 rounded-xl">
                  {(['7D', '30D', '90D', '6M', 'Tudo'] as Period[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                        period === p ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[260px] -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="evoPeso" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#007AFF" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#007AFF" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12, fontWeight: 600 }}
                      labelStyle={{ color: '#0f172a', fontWeight: 800 }}
                    />
                    <ReferenceLine y={targetWeight} stroke="#10b981" strokeDasharray="4 4" strokeWidth={2}
                      label={{ value: `Meta ${targetWeight}kg`, fill: '#10b981', fontSize: 10, fontWeight: 700, position: 'right' }} />
                    <Area type="monotone" dataKey="peso" stroke="#007AFF" strokeWidth={2.5} fill="url(#evoPeso)"
                      dot={{ r: 3, fill: '#007AFF', strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#007AFF', stroke: 'white', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Composição corporal */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[16px] font-bold text-gray-900">Composição corporal</h3>
                {latestComp && (
                  <button onClick={() => setModalMode('composition')} className="p-1.5 text-gray-400 hover:text-[#007AFF] transition-colors rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {!latestComp ? (
                <div className="flex flex-col items-center justify-center py-10 h-full">
                  <Activity className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500 mb-4 text-center">Nenhum dado registrado para este paciente.</p>
                  <button onClick={() => setModalMode('composition')} className="px-4 py-2 bg-[#007AFF] text-white text-[12px] font-bold rounded-xl hover:bg-[#0056b3] transition-colors">
                    Registrar Composição
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[12px] text-gray-500 font-medium mb-5">Última medição: {formatBRFull(latestComp.measured_at)}</p>

                  <div className="space-y-4">
                    {[
                      { label: 'Massa magra', curr: latestComp.lean_mass, prev: firstComp?.lean_mass, unit: 'kg', color: '#3b82f6', positive: 'up' as const },
                      { label: 'Massa gorda', curr: latestComp.fat_mass, prev: firstComp?.fat_mass, unit: 'kg', color: '#f59e0b', positive: 'down' as const },
                      { label: '% Gordura', curr: latestComp.body_fat_pct, prev: firstComp?.body_fat_pct, unit: '%', color: '#ef4444', positive: 'down' as const },
                    ].map((m) => {
                      if (m.curr == null) return null;
                      const delta = m.prev != null ? +(m.curr - m.prev).toFixed(1) : 0;
                      const isGood = m.prev == null ? null : ((m.positive === 'down' && delta < 0) || (m.positive === 'up' && delta > 0));
                      return (
                        <div key={m.label} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[12px] font-semibold text-gray-600">{m.label}</span>
                            {m.prev != null && delta !== 0 && (
                              <div className={`flex items-center gap-0.5 text-[11px] font-bold ${isGood ? 'text-emerald-600' : 'text-rose-500'}`}>
                                {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {delta > 0 ? '+' : ''}{delta}{m.unit}
                              </div>
                            )}
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-[20px] font-extrabold text-gray-900 tabular-nums">
                              {m.curr}<span className="text-[12px] font-bold text-gray-400 ml-0.5">{m.unit}</span>
                            </span>
                            {m.prev != null && (
                              <span className="text-[11px] text-gray-400">eram {m.prev}{m.unit}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Galeria de fotos */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-gray-500" /> Fotos de progresso
                </h3>
                <p className="text-[12px] text-gray-500 font-medium mt-0.5">
                  {selectedToCompare.length > 0
                    ? `Selecione ${2 - selectedToCompare.length} foto${selectedToCompare.length === 1 ? '' : 's'} para comparar`
                    : 'Clique em duas fotos para comparar antes/depois'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedToCompare.length === 2 && (
                  <button onClick={compareNow} className="flex items-center gap-1.5 px-3 py-2 bg-[#007AFF] text-white text-[12px] font-bold rounded-xl hover:bg-[#0056b3]">
                    Comparar <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="flex bg-gray-50 p-1 rounded-xl">
                  {(['Todos', 'Frente', 'Lado'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setPhotoFilter(f)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                        photoFilter === f ? 'bg-white text-[#007AFF] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {filteredPhotos.map((p) => {
                const isSelected = selectedToCompare.includes(p.id);
                const idx = selectedToCompare.indexOf(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePhotoSelect(p.id)}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                      isSelected ? 'border-[#007AFF] shadow-[0_4px_14px_rgba(0,122,255,0.30)]' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <img src={p.url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-[10px] font-bold text-white">{formatBR(p.date)}</p>
                      <p className="text-[9px] font-medium text-white/80">{p.angle}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#007AFF] text-white flex items-center justify-center text-[11px] font-extrabold shadow-md">
                        {idx + 1}
                      </div>
                    )}
                  </button>
                );
              })}
              <button className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 hover:border-[#007AFF] hover:bg-blue-50/30 transition-all text-gray-400 hover:text-[#007AFF]">
                <ImageIcon className="w-6 h-6" />
                <span className="text-[10px] font-bold">Adicionar</span>
              </button>
            </div>
          </div>

          {/* Medidas + Linha do tempo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Medidas corporais */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] relative">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-gray-500" /> Medidas corporais
                </h3>
                {latestComp && (
                  <button onClick={() => setModalMode('measurements')} className="p-1.5 text-gray-400 hover:text-[#007AFF] transition-colors rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {!latestComp ? (
                <div className="flex flex-col items-center justify-center py-10 h-full">
                  <Ruler className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-500 mb-4 text-center">Nenhum dado registrado para este paciente.</p>
                  <button onClick={() => setModalMode('measurements')} className="px-4 py-2 bg-[#007AFF] text-white text-[12px] font-bold rounded-xl hover:bg-[#0056b3] transition-colors">
                    Iniciar Registro
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-[12px] text-gray-500 font-medium mb-5">Comparativo desde o início</p>

                  <div className="space-y-3">
                    {[
                      { name: 'Cintura', latest: latestComp.waist, previous: firstComp?.waist, unit: 'cm' },
                      { name: 'Quadril', latest: latestComp.hip, previous: firstComp?.hip, unit: 'cm' },
                      { name: 'Peito', latest: latestComp.chest, previous: firstComp?.chest, unit: 'cm' },
                      { name: 'Braço', latest: latestComp.arm, previous: firstComp?.arm, unit: 'cm', positive: 'up' as const },
                      { name: 'Coxa', latest: latestComp.thigh, previous: firstComp?.thigh, unit: 'cm', positive: 'up' as const },
                    ].map((m) => {
                      if (m.latest == null) return null;
                      const delta = m.previous != null ? +(m.latest - m.previous).toFixed(1) : 0;
                      const positive = m.positive || 'down';
                      const isGood = m.previous == null || delta === 0 ? null : (positive === 'down' && delta < 0) || (positive === 'up' && delta > 0);
                      return (
                        <div key={m.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                          <span className="text-[13px] font-semibold text-gray-700">{m.name}</span>
                          <div className="flex items-center gap-3">
                            {m.previous != null && (
                              <>
                                <span className="text-[11px] text-gray-400 tabular-nums">{m.previous} {m.unit}</span>
                                <ArrowRight className="w-3 h-3 text-gray-300" />
                              </>
                            )}
                            <span className="text-[14px] font-extrabold text-gray-900 tabular-nums">{m.latest} {m.unit}</span>
                            {m.previous != null && (
                              <div className={`min-w-[48px] flex items-center justify-end gap-0.5 text-[11px] font-bold ${
                                isGood === null ? 'text-gray-400' : isGood ? 'text-emerald-600' : 'text-rose-500'
                              }`}>
                                {delta !== 0 && (delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
                                {delta > 0 ? '+' : ''}{delta}{m.unit}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Linha do tempo de eventos */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="text-[16px] font-bold text-gray-900 mb-5">Linha do tempo</h3>
              {timelineEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <Activity className="w-8 h-8 text-gray-200 mb-3" />
                  <p className="text-[13px] font-medium text-gray-500">Nenhum evento registrado ainda.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {timelineEvents.map((evt, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${evt.color} shrink-0`}>
                          <evt.icon className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                        {i < timelineEvents.length - 1 && <div className="flex-1 w-px bg-gray-200 mt-2" />}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-[13px] font-bold text-gray-900">{evt.title}</p>
                          <span className="text-[11px] text-gray-400 font-semibold tabular-nums shrink-0">{formatBR(evt.date.toISOString())}</span>
                        </div>
                        <p className="text-[12px] text-gray-500 mt-0.5">{evt.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Treinos */}
        </div>
      </main>

      {modalMode && (
        <AddEvolutionRecordModal
          userId={patient.user_id}
          mode={modalMode}
          latestRecord={latestComp}
          onClose={() => setModalMode(null)}
          onSaved={() => loadData()}
        />
      )}

      {comparing && (
        <PhotoCompareModal photoA={comparing.a} photoB={comparing.b} onClose={() => setComparing(null)} />
      )}
    </div>
  );
};
