import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, TrendingDown, TrendingUp, Activity, Camera, Ruler,
  Target, Calendar as CalendarIcon, Trophy, Image as ImageIcon,
  X as XIcon, ChevronLeft, ChevronRight, ArrowRight, BarChart3,
  Dumbbell, Utensils,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

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

// Heatmap: array de 84 dias (12 semanas × 7 dias)
const generateHeatmap = () => {
  const days: { date: string; level: 0 | 1 | 2 | 3 }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    // Distribuição realista: 60% nível 3, 20% nível 2, 10% nível 1, 10% nível 0
    const r = Math.random();
    let level: 0 | 1 | 2 | 3 = 3;
    if (r < 0.1) level = 0;
    else if (r < 0.2) level = 1;
    else if (r < 0.4) level = 2;
    days.push({ date: d.toISOString().split('T')[0], level });
  }
  return days;
};
const MOCK_HEATMAP = generateHeatmap();

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
  const initialWeight = MOCK_WEIGHT[0].weight;
  const currentWeight = MOCK_WEIGHT[MOCK_WEIGHT.length - 1].weight;
  const targetWeight = 78;
  const totalLost = +(initialWeight - currentWeight).toFixed(1);
  const pctOfGoal = Math.round((totalLost / (initialWeight - targetWeight)) * 100);
  const startDate = new Date(MOCK_WEIGHT[0].date);
  const weeksFollowing = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const avgPerWeek = +(totalLost / Math.max(weeksFollowing, 1)).toFixed(2);

  const [period, setPeriod] = useState<Period>('30D');
  const [photoFilter, setPhotoFilter] = useState<'Todos' | 'Frente' | 'Lado'>('Todos');
  const [selectedToCompare, setSelectedToCompare] = useState<string[]>([]);
  const [comparing, setComparing] = useState<{ a: any; b: any } | null>(null);
  const [openPhoto, setOpenPhoto] = useState<any | null>(null);

  const chartData = useMemo(() =>
    MOCK_WEIGHT.map((w) => ({
      date: formatBR(w.date),
      peso: w.weight,
    })), []);

  const filteredPhotos = useMemo(() =>
    photoFilter === 'Todos' ? MOCK_PHOTOS : MOCK_PHOTOS.filter((p) => p.angle === photoFilter),
  [photoFilter]);

  const togglePhotoSelect = (id: string) => {
    if (selectedToCompare.includes(id)) {
      setSelectedToCompare(selectedToCompare.filter((x) => x !== id));
    } else if (selectedToCompare.length < 2) {
      setSelectedToCompare([...selectedToCompare, id]);
    }
  };

  const compareNow = () => {
    if (selectedToCompare.length !== 2) return;
    const a = MOCK_PHOTOS.find((p) => p.id === selectedToCompare[0])!;
    const b = MOCK_PHOTOS.find((p) => p.id === selectedToCompare[1])!;
    // Garante ordem: mais antiga primeiro
    const [older, newer] = new Date(a.date) < new Date(b.date) ? [a, b] : [b, a];
    setComparing({ a: older, b: newer });
    setSelectedToCompare([]);
  };

  // Heatmap colors
  const heatColor = (level: number) => {
    if (level === 0) return 'bg-gray-100';
    if (level === 1) return 'bg-emerald-200';
    if (level === 2) return 'bg-emerald-400';
    return 'bg-emerald-600';
  };

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
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="text-[16px] font-bold text-gray-900 mb-1">Composição corporal</h3>
              <p className="text-[12px] text-gray-500 font-medium mb-5">Última medição: {formatBRFull(MOCK_BODY_COMP[MOCK_BODY_COMP.length - 1].date)}</p>

              <div className="space-y-4">
                {[
                  { label: 'Massa magra', curr: MOCK_BODY_COMP[MOCK_BODY_COMP.length - 1].lean, prev: MOCK_BODY_COMP[0].lean, unit: 'kg', color: '#3b82f6', positive: 'up' as const },
                  { label: 'Massa gorda', curr: MOCK_BODY_COMP[MOCK_BODY_COMP.length - 1].fat, prev: MOCK_BODY_COMP[0].fat, unit: 'kg', color: '#f59e0b', positive: 'down' as const },
                  { label: '% Gordura', curr: MOCK_BODY_COMP[MOCK_BODY_COMP.length - 1].fatPct, prev: MOCK_BODY_COMP[0].fatPct, unit: '%', color: '#ef4444', positive: 'down' as const },
                ].map((m) => {
                  const delta = +(m.curr - m.prev).toFixed(1);
                  const isGood = (m.positive === 'down' && delta < 0) || (m.positive === 'up' && delta > 0);
                  return (
                    <div key={m.label} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[12px] font-semibold text-gray-600">{m.label}</span>
                        <div className={`flex items-center gap-0.5 text-[11px] font-bold ${isGood ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {delta > 0 ? '+' : ''}{delta}{m.unit}
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-[20px] font-extrabold text-gray-900 tabular-nums">
                          {m.curr}<span className="text-[12px] font-bold text-gray-400 ml-0.5">{m.unit}</span>
                        </span>
                        <span className="text-[11px] text-gray-400">eram {m.prev}{m.unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
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

          {/* Medidas + Heatmap adesão */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {/* Medidas corporais */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2 mb-1">
                <Ruler className="w-4 h-4 text-gray-500" /> Medidas corporais
              </h3>
              <p className="text-[12px] text-gray-500 font-medium mb-5">Comparativo desde o início</p>

              <div className="space-y-3">
                {MOCK_MEASUREMENTS.map((m) => {
                  const delta = +(m.latest - m.previous).toFixed(1);
                  const positive = m.positive || 'down';
                  const isGood = delta === 0 ? null : (positive === 'down' && delta < 0) || (positive === 'up' && delta > 0);
                  return (
                    <div key={m.name} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-[13px] font-semibold text-gray-700">{m.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-400 tabular-nums">{m.previous} {m.unit}</span>
                        <ArrowRight className="w-3 h-3 text-gray-300" />
                        <span className="text-[14px] font-extrabold text-gray-900 tabular-nums">{m.latest} {m.unit}</span>
                        <div className={`min-w-[48px] flex items-center justify-end gap-0.5 text-[11px] font-bold ${
                          isGood === null ? 'text-gray-400' : isGood ? 'text-emerald-600' : 'text-rose-500'
                        }`}>
                          {delta !== 0 && (delta > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
                          {delta > 0 ? '+' : ''}{delta}{m.unit}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Adesão à dieta (heatmap) */}
            <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-gray-500" /> Adesão à dieta
                  </h3>
                  <p className="text-[12px] text-gray-500 font-medium mt-0.5">Últimas 12 semanas</p>
                </div>
                <div className="text-right">
                  <p className="text-[20px] font-extrabold text-gray-900 leading-none">
                    {Math.round((MOCK_HEATMAP.filter((d) => d.level === 3).length / MOCK_HEATMAP.length) * 100)}%
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1">Adesão</p>
                </div>
              </div>

              {/* Heatmap em grid de 7 colunas (linha = dia da semana) */}
              <div className="overflow-x-auto -mx-2 px-2">
                <div className="flex gap-1 min-w-fit">
                  {Array.from({ length: 12 }).map((_, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1">
                      {Array.from({ length: 7 }).map((_, dayIdx) => {
                        const dayData = MOCK_HEATMAP[weekIdx * 7 + dayIdx];
                        if (!dayData) return null;
                        return (
                          <div
                            key={dayIdx}
                            className={`w-3.5 h-3.5 rounded-[3px] ${heatColor(dayData.level)}`}
                            title={`${dayData.date}: nível ${dayData.level}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legenda */}
              <div className="flex items-center justify-end gap-2 mt-4 text-[10px] font-bold text-gray-400">
                Menos
                <div className="w-3 h-3 rounded-[3px] bg-gray-100" />
                <div className="w-3 h-3 rounded-[3px] bg-emerald-200" />
                <div className="w-3 h-3 rounded-[3px] bg-emerald-400" />
                <div className="w-3 h-3 rounded-[3px] bg-emerald-600" />
                Mais
              </div>
            </div>
          </div>

          {/* Treinos */}
          <div className="hidden bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-6">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-gray-500" /> Treinos por semana
                </h3>
                <p className="text-[12px] text-gray-500 font-medium mt-0.5">Frequência das últimas 6 semanas</p>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Total</p>
                  <p className="text-[20px] font-extrabold text-gray-900 leading-none">
                    {MOCK_WORKOUTS_WEEKLY.reduce((s, w) => s + w.count, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Média</p>
                  <p className="text-[20px] font-extrabold text-gray-900 leading-none">
                    {(MOCK_WORKOUTS_WEEKLY.reduce((s, w) => s + w.count, 0) / MOCK_WORKOUTS_WEEKLY.length).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-end gap-3 h-[140px]">
              {MOCK_WORKOUTS_WEEKLY.map((w) => {
                const maxCount = Math.max(...MOCK_WORKOUTS_WEEKLY.map((x) => x.count));
                const heightPct = (w.count / maxCount) * 100;
                return (
                  <div key={w.week} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-gradient-to-t from-[#007AFF] to-[#3b9eff] rounded-lg transition-all group-hover:opacity-90 relative" style={{ height: `${heightPct}%` }}>
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-bold text-gray-900">{w.count}</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{w.week}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Linha do tempo de eventos */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-8">
            <h3 className="text-[16px] font-bold text-gray-900 mb-5">Linha do tempo</h3>
            <div className="space-y-4">
              {[
                { date: '26/04', icon: Activity, color: 'bg-blue-50 text-blue-500', title: 'Plano alimentar atualizado', sub: 'Plano "Janeiro Cutting v2" lançado' },
                { date: '20/04', icon: Camera, color: 'bg-purple-50 text-purple-500', title: 'Nova foto de progresso', sub: '2 fotos adicionadas (frente e lado)' },
                { date: '15/04', icon: Ruler, color: 'bg-emerald-50 text-emerald-500', title: 'Nova medição corporal', sub: 'Cintura -1cm, % gordura -0.8%' },
                { date: '10/04', icon: CalendarIcon, color: 'bg-amber-50 text-amber-500', title: 'Consulta de retorno', sub: 'Avaliação mensal realizada' },
                { date: '01/04', icon: Trophy, color: 'bg-rose-50 text-rose-500', title: 'Marco atingido', sub: 'Primeiros 3 kg perdidos' },
              ].map((evt, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${evt.color} shrink-0`}>
                      <evt.icon className="w-4 h-4" strokeWidth={2.5} />
                    </div>
                    {i < 4 && <div className="flex-1 w-px bg-gray-200 mt-2" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-[13px] font-bold text-gray-900">{evt.title}</p>
                      <span className="text-[11px] text-gray-400 font-semibold tabular-nums shrink-0">{evt.date}</span>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-0.5">{evt.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {comparing && (
        <PhotoCompareModal photoA={comparing.a} photoB={comparing.b} onClose={() => setComparing(null)} />
      )}
    </div>
  );
};
