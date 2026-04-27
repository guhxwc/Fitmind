import React, { useState, useMemo } from 'react';
import {
  ArrowLeft, Activity, Battery, Smile, UserCircle2,
  TrendingUp, TrendingDown, Calendar as CalendarIcon, Filter, ChevronDown,
  Flame,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

/* =========================================================
   TYPES
========================================================= */
interface Checkin {
  id: string;
  date: string;       // ISO
  hunger: number;     // 0-10
  energy: number;     // 0-10
  mood: number;       // 0-10
  humor: number;      // 0-10
  notes?: string;
}

type Period = '7d' | '30d' | 'all';

/* =========================================================
   MOCK DATA
========================================================= */
const MOCK_CHECKINS: Checkin[] = [
  { id: '1', date: '2026-04-26T08:30:00', hunger: 6, energy: 7, mood: 8, humor: 8, notes: 'Acordei bem disposto hoje, dormi 8 horas.' },
  { id: '2', date: '2026-04-25T09:00:00', hunger: 7, energy: 6, mood: 7, humor: 7 },
  { id: '3', date: '2026-04-24T08:45:00', hunger: 5, energy: 8, mood: 9, humor: 9, notes: 'Treino pesado ontem, mas me sinto ótimo.' },
  { id: '4', date: '2026-04-23T07:50:00', hunger: 8, energy: 5, mood: 6, humor: 6, notes: 'Ansiedade alta hoje pelo trabalho.' },
  { id: '5', date: '2026-04-22T08:20:00', hunger: 6, energy: 7, mood: 7, humor: 8 },
  { id: '6', date: '2026-04-21T09:10:00', hunger: 7, energy: 6, mood: 7, humor: 7 },
  { id: '7', date: '2026-04-20T08:00:00', hunger: 5, energy: 8, mood: 8, humor: 8, notes: 'Domingo tranquilo.' },
  { id: '8', date: '2026-04-19T08:30:00', hunger: 4, energy: 9, mood: 9, humor: 9 },
  { id: '9', date: '2026-04-18T09:00:00', hunger: 6, energy: 7, mood: 8, humor: 8 },
  { id: '10', date: '2026-04-17T08:15:00', hunger: 7, energy: 6, mood: 6, humor: 7 },
];

/* =========================================================
   HELPERS
========================================================= */
const formatDate = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const formatFullDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

/* =========================================================
   COMPONENTS
========================================================= */
const METRICS = [
  { key: 'hunger', label: 'Fome', icon: Flame, color: '#f59e0b', bgSoft: 'bg-amber-50', textColor: 'text-amber-600' },
  { key: 'energy', label: 'Energia', icon: Battery, color: '#10b981', bgSoft: 'bg-emerald-50', textColor: 'text-emerald-600' },
  { key: 'mood', label: 'Disposição', icon: UserCircle2, color: '#3b82f6', bgSoft: 'bg-blue-50', textColor: 'text-blue-600' },
  { key: 'humor', label: 'Humor', icon: Smile, color: '#8b5cf6', bgSoft: 'bg-purple-50', textColor: 'text-purple-600' },
] as const;

const SummaryCard: React.FC<{
  metric: typeof METRICS[number];
  value: number;
  delta: number;
}> = ({ metric, value, delta }) => {
  const Icon = metric.icon;
  return (
    <div className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${metric.bgSoft}`}>
          <Icon className="w-5 h-5" style={{ color: metric.color }} strokeWidth={2.5} />
        </div>
        {delta !== 0 && (
          <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md ${
            delta > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {delta > 0 ? <TrendingUp className="w-3 h-3" strokeWidth={3} /> : <TrendingDown className="w-3 h-3" strokeWidth={3} />}
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}
          </div>
        )}
      </div>
      <div>
        <p className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">{metric.label}</p>
        <div className="flex items-baseline gap-1 mt-1">
          <span className="text-[28px] font-extrabold text-gray-900 leading-none tracking-tight">{value.toFixed(1)}</span>
          <span className="text-[12px] font-bold text-gray-400">/10</span>
        </div>
        <p className="text-[11px] text-gray-400 font-medium mt-1.5">Média no período</p>
      </div>
    </div>
  );
};

const MetricBar: React.FC<{ value: number; color: string }> = ({ value, color }) => (
  <div className="flex items-center gap-2 flex-1">
    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${value * 10}%`, backgroundColor: color }} />
    </div>
    <span className="text-[11px] font-bold text-gray-600 tabular-nums w-8 text-right">{value}</span>
  </div>
);

const CheckinCard: React.FC<{ checkin: Checkin }> = ({ checkin }) => (
  <div className="bg-white rounded-[18px] p-5 border border-gray-100 hover:border-gray-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all">
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-[13px] font-bold text-gray-900">{formatDate(checkin.date)}</p>
        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
          {formatFullDate(checkin.date)} • {formatTime(checkin.date)}
        </p>
      </div>
      {checkin.notes && (
        <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md">com nota</span>
      )}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
      {METRICS.map((m) => (
        <div key={m.key} className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${m.bgSoft} shrink-0`}>
            <m.icon className="w-3.5 h-3.5" style={{ color: m.color }} strokeWidth={2.5} />
          </div>
          <span className="text-[12px] font-semibold text-gray-600 w-[72px]">{m.label}</span>
          <MetricBar value={(checkin as any)[m.key]} color={m.color} />
        </div>
      ))}
    </div>

    {checkin.notes && (
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-[12px] text-gray-700 leading-relaxed italic">"{checkin.notes}"</p>
      </div>
    )}
  </div>
);

/* =========================================================
   MAIN
========================================================= */
export const CheckinsView: React.FC<{ patient: any; onBack: () => void }> = ({ patient, onBack }) => {
  const [period, setPeriod] = useState<Period>('30d');
  const patientName = patient?.profiles?.name || 'Paciente';

  const filteredCheckins = useMemo(() => {
    const now = Date.now();
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 365;
    const cutoff = now - days * 24 * 60 * 60 * 1000;
    return MOCK_CHECKINS.filter((c) => new Date(c.date).getTime() >= cutoff);
  }, [period]);

  // Médias da semana atual e da anterior pra calcular delta
  const stats = useMemo(() => {
    const half = Math.ceil(filteredCheckins.length / 2);
    const recent = filteredCheckins.slice(0, half);
    const older = filteredCheckins.slice(half);

    const avg = (arr: Checkin[], k: keyof Checkin) =>
      arr.length ? arr.reduce((s, c) => s + (Number(c[k]) || 0), 0) / arr.length : 0;

    return METRICS.map((m) => {
      const r = avg(recent, m.key);
      const o = avg(older, m.key);
      return { metric: m, value: r, delta: r - o };
    });
  }, [filteredCheckins]);

  // Dados pro gráfico (ordem cronológica)
  const chartData = useMemo(() => {
    return [...filteredCheckins].reverse().map((c) => ({
      date: new Date(c.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      Fome: c.hunger,
      Energia: c.energy,
      Disposição: c.mood,
      Humor: c.humor,
    }));
  }, [filteredCheckins]);

  return (
    <div className="fixed inset-0 bg-[#F9FAFC] z-[110] flex overflow-hidden font-sans">
      {/* Sidebar lateral simples (sem reaproveitar — deixa a do PatientDashboard) */}
      <main className="flex-1 overflow-y-auto px-4 lg:px-10 py-8">
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
                <h1 className="text-[24px] font-extrabold text-gray-900 tracking-tight">Check-ins</h1>
              </div>
            </div>

            {/* Filtro de período */}
            <div className="flex bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
              {([
                { v: '7d' as const, l: '7 dias' },
                { v: '30d' as const, l: '30 dias' },
                { v: 'all' as const, l: 'Tudo' },
              ]).map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setPeriod(v)}
                  className={`px-4 py-2 text-[12px] font-bold rounded-lg transition-all ${
                    period === v ? 'bg-[#007AFF] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Resumo do período */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <SummaryCard key={s.metric.key} metric={s.metric} value={s.value} delta={s.delta} />
            ))}
          </div>

          {/* Gráfico de tendências */}
          <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)] mb-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Tendências</h3>
                <p className="text-[12px] text-gray-500 mt-0.5 font-medium">Evolução das 4 métricas no período selecionado</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {METRICS.map((m) => (
                  <div key={m.key} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[260px] w-full -ml-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 12, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                      labelStyle={{ color: '#0f172a', fontWeight: 800, marginBottom: 4 }}
                    />
                    {METRICS.map((m) => (
                      <Line
                        key={m.key}
                        type="monotone"
                        dataKey={m.label}
                        stroke={m.color}
                        strokeWidth={2.5}
                        dot={{ r: 3, strokeWidth: 0, fill: m.color }}
                        activeDot={{ r: 5, strokeWidth: 2, stroke: 'white', fill: m.color }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-medium">
                  Sem dados no período
                </div>
              )}
            </div>
          </div>

          {/* Histórico de check-ins */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-bold text-gray-900">Histórico</h3>
              <span className="text-[12px] text-gray-500 font-semibold">{filteredCheckins.length} check-in{filteredCheckins.length !== 1 ? 's' : ''}</span>
            </div>
            {filteredCheckins.length === 0 ? (
              <div className="bg-white rounded-[20px] border-2 border-dashed border-gray-200 py-16 text-center">
                <Activity className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-[14px] font-bold text-gray-700">Nenhum check-in no período</p>
                <p className="text-[12px] text-gray-500 mt-1">Tente alterar o filtro de período acima.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCheckins.map((c) => (
                  <CheckinCard key={c.id} checkin={c} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
