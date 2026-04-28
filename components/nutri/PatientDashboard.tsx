import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft, LayoutDashboard, Calendar, Activity, CheckCircle2,
  MessageSquare, FileText, Stethoscope, PenTool, Settings,
  Bell, Check, ActivitySquare, AlertTriangle, TrendingDown, TrendingUp,
  XIcon, Droplet, Flame, Beef, Zap, RefreshCw, Plus, Sparkles,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '../../supabaseClient';
import { DietPlanEditor } from './DietPlanEditor';
import { CreateFullPlanModal } from './CreateFullPlanModal';
import { CheckinsView } from './CheckinsView';
import { EvolutionView } from './EvolutionView';
import { MaterialsView } from './MaterialsView';
import { ExamsView } from './ExamsView';
import { PatientSettingsView } from './PatientSettingsView';
import { alertsService, PatientAlert } from '../../services/alertsService';

/* =========================
   UTILS
========================= */

const todayISO = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().split('T')[0];
};

const calcBMI = (weightKg?: number | null, heightCm?: number | null) => {
  if (!weightKg || !heightCm) return null;
  const hM = heightCm / 100;
  return weightKg / (hM * hM);
};

const sumMealField = (meals: any[] | null | undefined, field: string) => {
  if (!Array.isArray(meals)) return 0;
  return meals.reduce((t, m) => t + (Number(m?.[field]) || 0), 0);
};

/* =========================
   MODAL — Composição corporal (detalhes)
========================= */

const BodyCompositionModal: React.FC<{
  userId: string;
  existing: any | null;
  onClose: () => void;
  onSaved: () => void;
}> = ({ userId, existing, onClose, onSaved }) => {
  const [leanMass, setLeanMass] = useState(existing?.lean_mass ?? '');
  const [fatMass, setFatMass] = useState(existing?.fat_mass ?? '');
  const [bodyFatPct, setBodyFatPct] = useState(existing?.body_fat_pct ?? '');
  const [waist, setWaist] = useState(existing?.waist ?? '');
  const [hip, setHip] = useState(existing?.hip ?? '');
  const [chest, setChest] = useState(existing?.chest ?? '');
  const [arm, setArm] = useState(existing?.arm ?? '');
  const [thigh, setThigh] = useState(existing?.thigh ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);

  const toNum = (v: any) => (v === '' || v === null || v === undefined ? null : Number(v));

  const handleSave = async () => {
    setSaving(true);
    try {
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
        measured_at: todayISO(),
        updated_at: new Date().toISOString(),
      };

      if (existing?.id) {
        await supabase.from('body_composition').update(payload).eq('id', existing.id);
      } else {
        await supabase.from('body_composition').insert(payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('[BodyComposition] save error:', err);
      alert('Erro ao salvar composição corporal.');
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
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#007AFF] pr-10"
          placeholder="—"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[220] bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-[24px] w-full max-w-[560px] shadow-2xl my-auto max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">Composição corporal</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-50 transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Massa magra" value={leanMass} onChange={setLeanMass} unit="kg" />
            <Field label="Massa gorda" value={fatMass} onChange={setFatMass} unit="kg" />
            <Field label="% Gordura" value={bodyFatPct} onChange={setBodyFatPct} unit="%" />
            <Field label="Cintura" value={waist} onChange={setWaist} unit="cm" />
            <Field label="Quadril" value={hip} onChange={setHip} unit="cm" />
            <Field label="Peito" value={chest} onChange={setChest} unit="cm" />
            <Field label="Braço" value={arm} onChange={setArm} unit="cm" />
            <Field label="Coxa" value={thigh} onChange={setThigh} unit="cm" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#007AFF]"
              placeholder="Observações do nutri..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-[#007AFF] text-white text-sm font-bold rounded-xl hover:bg-[#0056b3] transition-colors disabled:opacity-60">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================
   MAIN DASHBOARD
========================= */

export const PatientDashboard: React.FC<{ patient: any; onBack: () => void; chartData?: any[] }> = ({ patient, onBack }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [showAnamnesisModal, setShowAnamnesisModal] = useState(false);
  const [activeView, setActiveView] = useState<null | 'diet' | 'checkins' | 'evolution' | 'materials' | 'exams' | 'settings'>(null);
  const [nutritionistId, setNutritionistId] = useState<string | null>(null);

  // Busca id do nutri logado (uma vez)
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('nutritionists')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data?.id) setNutritionistId(data.id);
    })();
  }, []);

  // Dados extras do paciente
  const [profile, setProfile] = useState<any>(null);
  const [customGoals, setCustomGoals] = useState<any>(null);
  const [dailyRecords, setDailyRecords] = useState<any[]>([]);
  const [latestCheckin, setLatestCheckin] = useState<any>(null);
  const [bodyComposition, setBodyComposition] = useState<any>(null);
  const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
  const [workoutHistory, setWorkoutHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [showBodyCompModal, setShowBodyCompModal] = useState(false);
  const [showFullPlanModal, setShowFullPlanModal] = useState(false);
  const [latestPlan, setLatestPlan] = useState<any>(null);

  const userId = patient.user_id;

  /* ----- Carrega todos os dados ----- */
  const loadAll = async () => {
    try {
      const [
        profRes,
        weightRes,
        goalsRes,
        dailyRes,
        checkinRes,
        bodyRes,
        workoutRes,
        planRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('weight_history').select('*').eq('user_id', userId).order('date', { ascending: true }),
        supabase.from('custom_goals').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('daily_records').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(14),
        supabase.from('consultation_checkins').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('body_composition').select('*').eq('user_id', userId).order('measured_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('workout_history').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(14),
        supabase.from('patient_plans').select('*').eq('user_id', userId).eq('status', 'sent').order('created_at', { ascending: false }).limit(1).maybeSingle(),
      ]);

      // Materiais recentes (últimos 3)
      const { data: matsData } = await supabase
        .from('patient_materials')
        .select('id, title, type, created_at, read_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);
      if (matsData) setRecentMaterials(matsData);

      if (profRes.data) setProfile(profRes.data);
      if (goalsRes.data) setCustomGoals(goalsRes.data);
      if (dailyRes.data) setDailyRecords(dailyRes.data);
      if (checkinRes.data) setLatestCheckin(checkinRes.data);
      if (bodyRes.data) setBodyComposition(bodyRes.data);
      if (workoutRes.data) setWorkoutHistory(workoutRes.data);
      if (planRes.data) setLatestPlan(planRes.data);

      if (weightRes.data && weightRes.data.length > 0) {
        setChartData(
          weightRes.data.map((w: any) => ({
            date: new Date(w.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            weight: w.weight,
          }))
        );
      }

      // Alertas IA (cache 20h)
      if (profRes.data) {
        setAlertsLoading(true);
        alertsService
          .getOrGenerate(userId, {
            name: profRes.data.name,
            age: profRes.data.age,
            gender: profRes.data.gender,
            weight: profRes.data.weight,
            targetWeight: profRes.data.target_weight,
            startWeight: profRes.data.start_weight,
            height: profRes.data.height,
            goals: profRes.data.goals,
          })
          .then((a) => setAlerts(a))
          .finally(() => setAlertsLoading(false));
      }
    } catch (err) {
      console.error('[PatientDashboard] loadAll error:', err);
    }
  };

  useEffect(() => {
    loadAll();
  }, [userId]);

  /* ----- Realtime: check-ins, alerts, daily_records ----- */
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`patient-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'consultation_checkins', filter: `user_id=eq.${userId}` },
        (payload) => setLatestCheckin(payload.new))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_records', filter: `user_id=eq.${userId}` },
        () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_alerts', filter: `user_id=eq.${userId}` },
        (payload: any) => setAlerts((payload.new?.alerts as PatientAlert[]) || []))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patient_plans', filter: `user_id=eq.${userId}` },
        () => loadAll())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  /* ----- MEMOS: Macros, Checklist, Resumo, Composição ----- */

  // Macros - média dos últimos 7 dias baseados em daily_records.meals
  const macrosData = useMemo(() => {
    const last7 = dailyRecords.slice(0, 7);
    if (!last7.length) {
      return { items: [], totalCalories: 0, goalCalories: customGoals?.calories || profile?.goals?.calories || 0 };
    }

    const totals = last7.reduce(
      (acc, d) => {
        acc.protein += sumMealField(d.meals, 'protein') + (Number(d.quick_add_protein_grams) || 0);
        acc.carbs += sumMealField(d.meals, 'carbs');
        acc.fats += sumMealField(d.meals, 'fats');
        acc.calories += sumMealField(d.meals, 'calories');
        return acc;
      },
      { protein: 0, carbs: 0, fats: 0, calories: 0 }
    );

    const avg = {
      protein: totals.protein / last7.length,
      carbs: totals.carbs / last7.length,
      fats: totals.fats / last7.length,
      calories: totals.calories / last7.length,
    };

    // Calorias por macro (P=4, C=4, F=9)
    const pCal = avg.protein * 4;
    const cCal = avg.carbs * 4;
    const fCal = avg.fats * 9;
    const totalMacroCal = pCal + cCal + fCal;

    const items = totalMacroCal > 0 ? [
      { name: 'Proteínas', value: Math.round((pCal / totalMacroCal) * 100), color: '#007AFF', amount: `${Math.round(avg.protein)}g` },
      { name: 'Carboidratos', value: Math.round((cCal / totalMacroCal) * 100), color: '#05CD99', amount: `${Math.round(avg.carbs)}g` },
      { name: 'Gorduras', value: Math.round((fCal / totalMacroCal) * 100), color: '#FFCE20', amount: `${Math.round(avg.fats)}g` },
    ] : [
      { name: 'Proteínas', value: 0, color: '#007AFF', amount: `${Math.round(avg.protein)}g` },
      { name: 'Carboidratos', value: 0, color: '#05CD99', amount: `${Math.round(avg.carbs)}g` },
      { name: 'Gorduras', value: 0, color: '#FFCE20', amount: `${Math.round(avg.fats)}g` },
    ];

    return {
      items,
      totalCalories: Math.round(avg.calories),
      goalCalories: customGoals?.calories || profile?.goals?.calories || 0,
    };
  }, [dailyRecords, customGoals, profile]);

  // Checklist do dia
  const checklist = useMemo(() => {
    const today = todayISO();
    const todayRecord = dailyRecords.find((d) => d.date === today);
    const meals = Array.isArray(todayRecord?.meals) ? todayRecord!.meals : [];
    const water = Number(todayRecord?.water_liters) || 0;
    const quickProtein = Number(todayRecord?.quick_add_protein_grams) || 0;
    const proteinFromMeals = sumMealField(meals, 'protein');
    const totalProtein = proteinFromMeals + quickProtein;

    const proteinGoal = customGoals?.protein_g || profile?.goals?.protein || 0;
    const waterGoal = (customGoals?.water_ml ? customGoals.water_ml / 1000 : profile?.goals?.water) || 2.5;

    const todayWorkout = workoutHistory.find((w) => w.date === today);

    const items = [
      { label: `${meals.length} refeições registradas`, done: meals.length >= 3 },
      { label: 'Treino registrado', done: !!todayWorkout },
      { label: `${water.toFixed(1)}L de ${waterGoal.toFixed(1)}L de água`, done: water >= waterGoal * 0.95 },
      { label: 'Meta de proteína atingida', done: proteinGoal > 0 && totalProtein >= proteinGoal * 0.95 },
    ];

    const doneCount = items.filter((i) => i.done).length;
    const pct = Math.round((doneCount / items.length) * 100);

    return { items, pct, doneCount };
  }, [dailyRecords, workoutHistory, customGoals, profile]);

  // Resumo (peso)
  const resumo = useMemo(() => {
    const atual = profile?.weight ?? null;
    const inicial = profile?.start_weight ?? null;
    const meta = profile?.target_weight ?? null;

    let delta = 0;
    if (atual != null && inicial != null) delta = atual - inicial;

    let pctObj = 0;
    if (atual != null && inicial != null && meta != null && inicial !== meta) {
      pctObj = Math.max(0, Math.min(100, Math.round(((inicial - atual) / (inicial - meta)) * 100)));
    }

    return { atual, inicial, meta, delta, pctObj };
  }, [profile]);

  // Composição corporal: peso + IMC sempre; extras só quando body_composition existir
  const bodyComp = useMemo(() => {
    const peso = profile?.weight ?? null;
    const altura = profile?.height ?? null;
    const imc = calcBMI(peso, altura);

    return {
      peso,
      altura,
      imc,
      hasDetails: !!bodyComposition,
      leanMass: bodyComposition?.lean_mass,
      fatMass: bodyComposition?.fat_mass,
      bodyFatPct: bodyComposition?.body_fat_pct,
    };
  }, [profile, bodyComposition]);

  /* ----- REGERAR ALERTAS ----- */
  const regenerateAlerts = async () => {
    if (!profile) return;
    setAlertsLoading(true);
    try {
      const newAlerts = await alertsService.generateAndSave(userId, {
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        targetWeight: profile.target_weight,
        startWeight: profile.start_weight,
        height: profile.height,
        goals: profile.goals,
      });
      setAlerts(newAlerts);
    } finally {
      setAlertsLoading(false);
    }
  };

  const alertSeverityColors = (sev: string) => {
    if (sev === 'high') return { bg: 'bg-red-50', text: 'text-red-500' };
    if (sev === 'medium') return { bg: 'bg-orange-50', text: 'text-orange-500' };
    return { bg: 'bg-yellow-50', text: 'text-yellow-600' };
  };

  const alertIcon = (icon: string) => {
    switch (icon) {
      case 'weight': return <TrendingDown className="w-4 h-4" />;
      case 'protein': return <Beef className="w-4 h-4" />;
      case 'water': return <Droplet className="w-4 h-4" />;
      case 'energy': return <Zap className="w-4 h-4" />;
      case 'hunger': return <Flame className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const patientName = patient.profiles?.name || profile?.name || 'Paciente';
  const patientInitials = patientName.substring(0, 2).toUpperCase();

  return (
    <div className="fixed inset-0 bg-[#F9FAFC] dark:bg-[#0B0C10] z-[110] flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-[260px] bg-gradient-to-b from-white via-white/98 to-gray-50/30 dark:from-[#1C1C21] dark:to-[#111116] border-r border-[#E2E8F0] dark:border-[#2C2C35] flex-col z-[102] shadow-sm">
        <div className="p-6 pb-2 flex justify-start items-center">
          <img src="https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Icon%20Fitmind/fitmind_horizontal_o.png" alt="Fitmind Logo" className="h-8 object-contain ml-1" />
          <span className="ml-2 text-[10px] font-bold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-full">PRO</span>
        </div>

        <nav className="flex-1 px-4 mt-8 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#007AFF]/5 text-[#007AFF] font-bold text-[14px]">
            <LayoutDashboard className="w-5 h-5" /> Visão Geral
          </button>
          <button
            onClick={() => setShowFullPlanModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 font-semibold text-[14px] transition-all"
          >
            <Sparkles className="w-5 h-5" /> Plano Completo
          </button>
          <button
            onClick={() => setActiveView('diet')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[14px] transition-all ${activeView === 'diet' ? 'bg-[#007AFF]/5 text-[#007AFF]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Calendar className="w-5 h-5" /> Plano Alimentar
          </button>
          <button
            onClick={() => setActiveView('evolution')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[14px] transition-all ${activeView === 'evolution' ? 'bg-[#007AFF]/5 text-[#007AFF]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Activity className="w-5 h-5" /> Evolução
          </button>
          <button
            onClick={() => setActiveView('checkins')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[14px] transition-all ${activeView === 'checkins' ? 'bg-[#007AFF]/5 text-[#007AFF]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <CheckCircle2 className="w-5 h-5" /> Check-ins
          </button>
          <button
            onClick={() => setActiveView('materials')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[14px] transition-all ${activeView === 'materials' ? 'bg-[#007AFF]/5 text-[#007AFF]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FileText className="w-5 h-5" /> Materiais
          </button>
          <button
            onClick={() => setActiveView('exams')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[14px] transition-all ${activeView === 'exams' ? 'bg-[#007AFF]/5 text-[#007AFF]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Stethoscope className="w-5 h-5" /> Exames
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[14px] transition-all ${activeView === 'settings' ? 'bg-[#007AFF]/5 text-[#007AFF]' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Settings className="w-5 h-5" /> Configurações
          </button>
        </nav>

        <div className="p-5 border-t border-gray-100 mt-auto bg-gradient-to-b from-transparent via-white/80 to-white">
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-50 dark:bg-gray-900 shrink-0">
              <img src="https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Allan/a363b4bf95e991cec48ec623905cfc44.png" alt="Dr. Allan" className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal scale-[1.2] translate-y-1.5 translate-x-1" />
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

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-4 lg:px-10 py-8 relative -translate-x-[4px]">
        <div className="max-w-[1240px] mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar para pacientes
            </button>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600">
                <Bell className="w-5 h-5" />
                {alerts.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
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
                {patientInitials}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#141824] tracking-tight">{patientName}</h1>
                <p className="text-gray-500 text-[13px] font-medium mt-1">
                  {profile?.age ? `${profile.age} anos` : ''} {profile?.gender ? `• ${profile.gender}` : ''}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className="px-3 bg-green-50 text-green-600 text-[11px] font-bold rounded-lg h-7 flex items-center">Ativo</span>
                  <span className="px-3 bg-gray-50 text-gray-600 border border-gray-100 text-[11px] font-bold rounded-lg h-7 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Plano Semestral
                  </span>
                  {patient.created_at && (
                    <span className="px-3 bg-gray-50 text-gray-600 border border-gray-100 text-[11px] font-bold rounded-lg h-7 flex items-center">
                      Desde {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (profile?.whatsapp) {
                    const num = profile.whatsapp.replace(/\D/g, '');
                    window.open(`https://wa.me/${num}`, '_blank');
                  } else {
                    alert('Paciente não possui WhatsApp cadastrado.');
                  }
                }}
                className="px-5 py-2.5 bg-white border border-gray-200 text-green-600 font-bold text-sm rounded-xl flex items-center gap-2 hover:bg-gray-50 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 2.013c-5.512 0-9.998 4.486-9.998 9.998 0 1.954.55 3.842 1.597 5.467L2.014 22l4.632-1.587c1.57.94 3.393 1.436 5.362 1.436 5.513 0 9.998-4.487 9.998-9.998s-4.485-9.998-9.998-9.998z" /></svg>
                WhatsApp
              </button>
              <button 
                onClick={() => {
                  if (profile?.whatsapp) {
                    const num = profile.whatsapp.replace(/\D/g, '');
                    window.open(`https://wa.me/${num}`, '_blank');
                  } else {
                    alert('Paciente não possui WhatsApp cadastrado.');
                  }
                }}
                className="px-5 py-2.5 bg-[#007AFF] text-white font-bold text-sm rounded-xl flex items-center gap-2 hover:bg-[#0056b3] transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4" /> Enviar mensagem
              </button>
            </div>
          </div>

          {/* CTA removido em favor do Floating Action Button */}

          {/* Top Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Resumo do paciente */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-[14px] font-bold text-gray-900 mb-4">Resumo do paciente</h3>
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div>
                  <p className="text-[11px] text-gray-500 font-medium mb-1 truncate">Peso atual</p>
                  <div className="flex items-end gap-1">
                    <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                      {resumo.atual != null ? resumo.atual.toFixed(1).replace('.', ',') : '—'}
                      <span className="text-sm font-bold text-gray-600">kg</span>
                    </span>
                    {resumo.delta < 0 && <TrendingDown className="w-3.5 h-3.5 text-green-500 mb-1" strokeWidth={3} />}
                    {resumo.delta > 0 && <TrendingUp className="w-3.5 h-3.5 text-red-500 mb-1" strokeWidth={3} />}
                  </div>
                  {resumo.delta !== 0 && (
                    <p className={`text-[10px] font-bold mt-0.5 truncate ${resumo.delta < 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {resumo.delta < 0 ? '↓' : '↑'} {Math.abs(resumo.delta).toFixed(1).replace('.', ',')} kg
                    </p>
                  )}
                </div>
                <div className="border-l border-gray-100 pl-3">
                  <p className="text-[11px] text-gray-500 font-medium mb-1 truncate">Peso inicial</p>
                  <span className="text-base font-bold text-gray-700">{resumo.inicial != null ? resumo.inicial.toFixed(1).replace('.', ',') : '—'}</span>
                  <span className="text-xs font-bold text-gray-500 ml-0.5">kg</span>
                </div>
                <div className="border-l border-gray-100 pl-3">
                  <p className="text-[11px] text-gray-500 font-medium mb-1 truncate">Objetivo</p>
                  <span className="text-base font-bold text-gray-700">{resumo.meta != null ? resumo.meta.toFixed(1).replace('.', ',') : '—'}</span>
                  <span className="text-xs font-bold text-gray-500 ml-0.5">kg</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-2">
                  <span className="text-gray-700">% do objetivo</span>
                  <span className="text-[#007AFF]">{resumo.pctObj}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-[#007AFF] h-full rounded-full" style={{ width: `${resumo.pctObj}%` }}></div>
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

            {/* Alertas IA */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-gray-900">Alertas</h3>
                  {alerts.length > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{alerts.length}</span>}
                </div>
                <button onClick={regenerateAlerts} disabled={alertsLoading} className="p-1 text-gray-400 hover:text-[#007AFF] transition-colors disabled:opacity-50" title="Regerar alertas">
                  <RefreshCw className={`w-3.5 h-3.5 ${alertsLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {alertsLoading && alerts.length === 0 ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-start animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-gray-100" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 bg-gray-100 rounded w-3/4" />
                        <div className="h-2 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-[12px] text-gray-500 font-medium">Nenhum alerta no momento</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((a, i) => {
                    const c = alertSeverityColors(a.severity);
                    return (
                      <div key={i} className="flex gap-3 items-start">
                        <div className={`w-8 h-8 rounded-lg ${c.bg} flex flex-shrink-0 items-center justify-center ${c.text}`}>
                          {alertIcon(a.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 line-clamp-1 leading-snug mb-0.5">{a.title}</p>
                          <p className="text-[10px] text-gray-500 font-medium line-clamp-1">{a.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Último check-in */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[14px] font-bold text-gray-900">Último check-in</h3>
              </div>
              {latestCheckin ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-bold text-gray-900">
                      {(() => {
                        const d = new Date(latestCheckin.created_at);
                        const isToday = d.toDateString() === new Date().toDateString();
                        const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                        if (isToday) return `Hoje às ${time}`;
                        const y = new Date(); y.setDate(y.getDate() - 1);
                        if (d.toDateString() === y.toDateString()) return `Ontem às ${time}`;
                        return `${d.toLocaleDateString('pt-BR')} ${time}`;
                      })()}
                    </span>
                    <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest">Enviado</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { k: 'Fome', v: latestCheckin.hunger },
                      { k: 'Energia', v: latestCheckin.energy },
                      { k: 'Disposição', v: latestCheckin.mood },
                      { k: 'Humor', v: latestCheckin.humor },
                    ].map(({ k, v }) => (
                      <div key={k} className="flex items-center gap-2">
                        <span className="w-[62px] text-[11px] text-gray-600 font-medium">{k}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1">
                          <div className="bg-[#007AFF] h-1 rounded-full" style={{ width: `${v * 10}%` }}></div>
                        </div>
                        <span className="w-7 text-right text-[10px] font-bold text-gray-500">{v}/10</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveView('checkins')} className="text-[12px] font-bold text-[#007AFF] mt-5 text-left hover:text-[#0056b3] transition-colors">
                    Ver check-in completo
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 py-4 text-center">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Activity className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-[12px] text-gray-500 font-medium">Nenhum check-in ainda</p>
                </div>
              )}
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
                          <stop offset="5%" stopColor="#007AFF" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
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
            </div>

            {/* Composição Corporal */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-[14px] font-bold text-gray-900 mb-6">Composição corporal</h3>
              <div className="flex-1 space-y-4">
                {/* Sempre peso + IMC */}
                <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                  <span className="text-[13px] font-medium text-gray-600">Peso atual</span>
                  <span className="text-[14px] font-bold text-gray-900">{bodyComp.peso != null ? `${bodyComp.peso.toFixed(1).replace('.', ',')} kg` : '—'}</span>
                </div>
                <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                  <span className="text-[13px] font-medium text-gray-600">IMC</span>
                  <span className="text-[14px] font-bold text-gray-900">{bodyComp.imc != null ? bodyComp.imc.toFixed(1).replace('.', ',') : '—'}</span>
                </div>

                {/* Extras quando preenchidos */}
                {bodyComp.hasDetails && (
                  <>
                    {bodyComp.leanMass != null && (
                      <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                        <span className="text-[13px] font-medium text-gray-600">Massa magra</span>
                        <span className="text-[14px] font-bold text-gray-900">{Number(bodyComp.leanMass).toFixed(1).replace('.', ',')} kg</span>
                      </div>
                    )}
                    {bodyComp.fatMass != null && (
                      <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                        <span className="text-[13px] font-medium text-gray-600">Massa gorda</span>
                        <span className="text-[14px] font-bold text-gray-900">{Number(bodyComp.fatMass).toFixed(1).replace('.', ',')} kg</span>
                      </div>
                    )}
                    {bodyComp.bodyFatPct != null && (
                      <div className="flex justify-between items-end border-b border-gray-50 pb-3">
                        <span className="text-[13px] font-medium text-gray-600">% Gordura corporal</span>
                        <span className="text-[14px] font-bold text-gray-900">{Number(bodyComp.bodyFatPct).toFixed(1).replace('.', ',')}%</span>
                      </div>
                    )}
                  </>
                )}

                {!bodyComp.hasDetails && (
                  <p className="text-[11px] text-gray-400 font-medium italic pt-2">
                    Clique em "Ver detalhes" para adicionar massa magra, % gordura e medidas.
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowBodyCompModal(true)}
                className="text-[12px] font-bold text-[#007AFF] mt-5 text-left hover:underline flex items-center gap-1"
              >
                {bodyComp.hasDetails ? 'Ver detalhes' : 'Adicionar detalhes'} <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Macros */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-[14px] font-bold text-gray-900 mb-1">
                Macros <span className="font-medium text-gray-400 font-normal ml-0.5 text-[11px]">(média 7d)</span>
              </h3>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-4 flex-1 justify-center">
                <div className="w-[110px] h-[110px] sm:w-[100px] sm:h-[100px] relative shrink-0">
                  {macrosData.items.some((m) => m.value > 0) ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={macrosData.items}
                            innerRadius="65%"
                            outerRadius="95%"
                            dataKey="value"
                            stroke="none"
                            startAngle={90}
                            endAngle={-270}
                            isAnimationActive={true}
                          >
                            {macrosData.items.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Centro do donut */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[14px] font-extrabold text-gray-900 leading-none">{macrosData.totalCalories}</span>
                        <span className="text-[9px] font-bold text-gray-400 mt-0.5">kcal</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full rounded-full border-[10px] border-gray-100 flex items-center justify-center">
                      <span className="text-[9px] text-gray-400 font-bold text-center px-2">Sem dados</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full space-y-2.5 sm:space-y-3.5">
                  {macrosData.items.map((m) => (
                    <div key={m.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                        <span className="text-[11px] font-medium text-gray-600 truncate">{m.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-extrabold text-gray-900">{m.amount}</span>
                        <span className="text-[10px] text-gray-400 ml-0.5">({m.value}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-1.5">
                <p className="text-xs text-gray-900 font-bold">
                  Meta diária: <span className="font-medium text-gray-500">{macrosData.goalCalories || '—'} kcal</span>
                </p>
              </div>
            </div>

            {/* Checklist */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <h3 className="text-[14px] font-bold text-gray-900 mb-5">Checklist do dia</h3>
              <div className="bg-gray-50 rounded-lg h-2 mb-5 overflow-hidden">
                <div
                  className="bg-[#05CD99] h-full rounded-full transition-all duration-500"
                  style={{ width: `${checklist.pct}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 font-bold mb-3 -mt-2">
                {checklist.doneCount} de {checklist.items.length} concluídos
              </p>
              <div className="space-y-4">
                {checklist.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${item.done ? 'bg-[#05CD99] border-[#05CD99] text-white' : 'border-gray-300'}`}>
                      {item.done && <Check className="w-3 h-3" strokeWidth={4} />}
                    </div>
                    <span className={`text-sm font-medium ${item.done ? 'text-gray-600' : 'text-gray-500'}`}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ações rápidas */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
              <h3 className="text-[14px] font-bold text-gray-900 mb-5">Ações rápidas</h3>
              <div className="space-y-3">
                <button onClick={() => setActiveView('diet')} className="w-full flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-[#007AFF] hover:shadow-sm hover:bg-gray-50/50 transition-all group text-left">
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
                <div className="flex items-center justify-center flex-1 text-center py-4">
                  <p className="text-[11px] text-gray-400 italic">Nenhum material enviado ainda</p>
                </div>
              </div>
              <button onClick={() => setActiveView('materials')} className="text-[12px] font-bold text-[#007AFF] mt-2 text-left hover:underline">
                Ver todos os materiais
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Body Composition Modal */}
      {showBodyCompModal && (
        <BodyCompositionModal
          userId={userId}
          existing={bodyComposition}
          onClose={() => setShowBodyCompModal(false)}
          onSaved={loadAll}
        />
      )}

      {/* Create Full Plan Modal */}
      {showFullPlanModal && (
        <CreateFullPlanModal
          patient={{ ...patient, profiles: profile || patient.profiles }}
          onClose={() => setShowFullPlanModal(false)}
          onSent={() => {
            loadAll();
          }}
        />
      )}

      {/* Diet Plan Editor Overlay */}
      {activeView === 'diet' && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0B0C10]">
          <DietPlanEditor patient={patient} onBack={() => setActiveView(null)} />
        </div>
      )}

      {/* Checkins View Overlay */}
      {activeView === 'checkins' && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0B0C10]">
          <CheckinsView patient={patient} onBack={() => setActiveView(null)} />
        </div>
      )}

      {/* Evolution View Overlay */}
      {activeView === 'evolution' && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0B0C10]">
          <EvolutionView patient={patient} onBack={() => setActiveView(null)} />
        </div>
      )}

      {/* Materials View Overlay */}
      {activeView === 'materials' && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0B0C10]">
          <MaterialsView
            patient={patient}
            nutritionistId={nutritionistId}
            onBack={() => setActiveView(null)}
          />
        </div>
      )}

      {/* Exams View Overlay */}
      {activeView === 'exams' && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0B0C10]">
          <ExamsView
            patient={patient}
            nutritionistId={nutritionistId}
            onBack={() => setActiveView(null)}
          />
        </div>
      )}

      {/* Settings View Overlay */}
      {activeView === 'settings' && (
        <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0B0C10]">
          <PatientSettingsView
            patient={patient}
            onBack={() => { setActiveView(null); loadAll(); }}
          />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowFullPlanModal(true)}
        className="fixed bottom-8 right-8 lg:bottom-10 lg:right-10 z-[105] bg-[#007AFF] text-white px-5 py-3.5 rounded-full shadow-[0_8px_24px_rgba(0,122,255,0.35)] hover:shadow-[0_12px_28px_rgba(0,122,255,0.45)] hover:-translate-y-0.5 transition-all flex items-center gap-2.5 font-bold text-[14px]"
      >
        <Sparkles className="w-4 h-4 text-white" />
        {latestPlan ? 'Editar plano' : 'Criar plano personalizado'}
      </button>

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
                          return <p className="text-sm">Erro ao processar as informações adicionais.</p>;
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
