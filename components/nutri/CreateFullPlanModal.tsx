import React, { useState, useEffect, useMemo } from 'react';
import {
  X, ChevronDown, ChevronUp, Check, Plus, Clock, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Sparkles, ArrowRight, ArrowLeft,
  Sun, Moon, Apple, Coffee, Utensils, Flame, Beef, Wheat, Droplet,
  CalendarCheck, Trash2, Search, Loader2,
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { calculateAutoGoals } from '../../lib/nutritionGoals';

/* ============================================================
   TIPOS
============================================================ */

type Step = 1 | 2 | 3;

interface BasicData {
  planTitle: string;
  name: string;
  birthDate: string;
  age: string;
  gender: string;
  weightKg: string;
  heightM: string;
  bmi: string;
  tmb: string;
  measurementUnit: 'cm' | 'pol';
  waist: string;
  abdomen: string;
  hip: string;
  chest: string;
  arm: string;
  thigh: string;
  calf: string;
  neck: string;
  notes: string;
}

interface MealFood {
  id: string;        // id local
  food_id: number;   // id da TACO
  food_name: string;
  amount_g: number;  // quantidade prescrita em gramas
  // macros já calculados pra amount_g (snapshot)
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  // valores por 100g (pra recalcular se mudar amount)
  cal_per_100: number;
  protein_per_100: number;
  carbs_per_100: number;
  fats_per_100: number;
}

interface DietMeal {
  id: string;
  type: 'breakfast' | 'snack' | 'lunch' | 'afternoon_snack' | 'dinner' | 'supper';
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  foods?: MealFood[];
  expanded?: boolean; // controla expansão inline
}

interface DietVariant {
  id: string;
  name: string;
  days: number[]; // 0=Dom, 1=Seg...
  meals: DietMeal[];
}

interface DietData {
  goalCalories: string;
  protein: string;
  carbs: string;
  fats: string;
  water: string;
  variants: DietVariant[];
  activeVariantId: string;
  restrictions: string[];
  preferences: string[];
  planNotes: string;
}

interface AppointmentData {
  appointmentType: 'retorno' | 'consultoria' | 'avaliacao';
  duration: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notes: string;
}

/* ============================================================
   UTILS
============================================================ */

const calcBMI = (weightKg?: number, heightM?: number) =>
  weightKg && heightM ? weightKg / (heightM * heightM) : 0;

const bmiClassification = (bmi: number) => {
  if (!bmi) return { label: '', color: '' };
  if (bmi < 18.5) return { label: 'Abaixo', color: 'text-blue-600 bg-blue-50' };
  if (bmi < 25) return { label: 'Normal', color: 'text-green-600 bg-green-50' };
  if (bmi < 30) return { label: 'Sobrepeso', color: 'text-amber-600 bg-amber-50' };
  return { label: 'Obesidade', color: 'text-red-600 bg-red-50' };
};

// TMB (Mifflin-St Jeor)
const calcTMB = (weightKg: number, heightCm: number, age: number, gender: string) => {
  if (!weightKg || !heightCm || !age) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(gender === 'Feminino' ? base - 161 : base + 5);
};

// Macros derivados (P=4, C=4, F=9)
const calcMacrosPct = (cal: number, p: number, c: number, f: number) => {
  if (!cal) return { p: 0, c: 0, f: 0 };
  return {
    p: Math.round(((p * 4) / cal) * 100),
    c: Math.round(((c * 4) / cal) * 100),
    f: Math.round(((f * 9) / cal) * 100),
  };
};

const newMealId = () => `m_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const MEAL_TYPE_META: Record<DietMeal['type'], { label: string; icon: any; color: string }> = {
  breakfast: { label: 'Café da manhã', icon: Sun, color: 'text-amber-500 bg-amber-50' },
  snack: { label: 'Lanche da manhã', icon: Apple, color: 'text-emerald-500 bg-emerald-50' },
  lunch: { label: 'Almoço', icon: Utensils, color: 'text-orange-500 bg-orange-50' },
  afternoon_snack: { label: 'Lanche da tarde', icon: Coffee, color: 'text-sky-500 bg-sky-50' },
  dinner: { label: 'Jantar', icon: Utensils, color: 'text-rose-500 bg-rose-50' },
  supper: { label: 'Ceia', icon: Moon, color: 'text-indigo-500 bg-indigo-50' },
};

/* ============================================================
   STEPPER
============================================================ */

const Stepper: React.FC<{ step: Step }> = ({ step }) => {
  const items = [
    { n: 1, label: 'Dados' },
    { n: 2, label: 'Dieta' },
    { n: 3, label: 'Agendar retorno' },
  ];

  return (
    <div className="flex items-center justify-center mb-8 mt-2">
      {items.map((it, i) => {
        const done = step > it.n;
        const active = step === it.n;
        return (
          <React.Fragment key={it.n}>
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all ${
                  done
                    ? 'bg-[#007AFF] text-white'
                    : active
                    ? 'bg-[#007AFF] text-white ring-4 ring-[#007AFF]/15'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? <Check className="w-4 h-4" strokeWidth={3} /> : it.n}
              </div>
              <span
                className={`text-[14px] font-semibold ${
                  active || done ? 'text-[#007AFF]' : 'text-gray-400'
                }`}
              >
                {it.label}
              </span>
            </div>
            {i < items.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-3 max-w-[110px] transition-colors ${
                  done ? 'bg-[#007AFF]' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* ============================================================
   STEP 1 — DADOS
============================================================ */

const Step1Data: React.FC<{ data: BasicData; setData: React.Dispatch<React.SetStateAction<BasicData>> }> = ({
  data,
  setData,
}) => {
  const set = (k: keyof BasicData, v: string) => setData((d) => ({ ...d, [k]: v }));

  // BMI/TMB calculados ao vivo
  useEffect(() => {
    const w = parseFloat(data.weightKg.replace(',', '.'));
    const h = parseFloat(data.heightM.replace(',', '.'));
    const age = parseInt(data.age);
    const bmi = calcBMI(w, h);
    const heightCm = h * 100;
    const tmb = calcTMB(w, heightCm, age, data.gender);
    setData((d) => ({
      ...d,
      bmi: bmi ? bmi.toFixed(1).replace('.', ',') : '',
      tmb: tmb ? tmb.toString() : '',
    }));
  }, [data.weightKg, data.heightM, data.age, data.gender]);

  const bmiInfo = bmiClassification(parseFloat(data.bmi.replace(',', '.')) || 0);

  const Field: React.FC<{
    label: string;
    value: string;
    onChange?: (v: string) => void;
    suffix?: string;
    placeholder?: string;
    disabled?: boolean;
    extra?: React.ReactNode;
    type?: string;
  }> = ({ label, value, onChange, suffix, placeholder, disabled, extra, type = 'text' }) => (
    <div className="flex-1 min-w-0">
      <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">{label}</label>
      <div
        className={`relative flex items-center bg-white border rounded-xl h-[44px] transition-all ${
          disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-200 focus-within:border-[#007AFF] focus-within:ring-2 focus-within:ring-[#007AFF]/10'
        }`}
      >
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent px-3.5 text-[14px] font-medium text-gray-900 placeholder-gray-400 outline-none disabled:text-gray-700"
        />
        {extra && <div className="px-2">{extra}</div>}
        {suffix && <span className="text-[12px] font-medium text-gray-400 pr-3.5">{suffix}</span>}
      </div>
    </div>
  );

  const SelectField: React.FC<{
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: string[];
  }> = ({ label, value, onChange, options }) => (
    <div className="flex-1 min-w-0">
      <label className="text-[12px] font-semibold text-gray-700 mb-1.5 block">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-white border border-gray-200 rounded-xl h-[44px] px-3.5 pr-10 text-[14px] font-medium text-gray-900 outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10"
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Fase do Plano */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="text-[15px] font-bold text-gray-900 mb-1">Identificação do Plano</h3>
        <p className="text-[12px] text-gray-500 mb-4">Dê um nome para identificar a fase atual da dieta para o paciente.</p>
        <div className="md:w-1/2">
            <Field label="Nome do Plano / Fase" value={data.planTitle} onChange={(v) => set('planTitle', v)} placeholder="Ex: Fase 1 - Adaptação, Dieta Bulking..." />
        </div>
      </div>

      {/* Dados básicos */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h3 className="text-[15px] font-bold text-gray-900 mb-4">Dados básicos</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Field label="Nome" value={data.name} onChange={(v) => set('name', v)} placeholder="Nome do paciente" />
          <Field
            label="Data de nascimento"
            value={data.birthDate}
            onChange={(v) => {
              set('birthDate', v);
              if (v) {
                const d = new Date(v);
                if (!isNaN(d.getTime())) {
                  const age = new Date().getFullYear() - d.getFullYear();
                  set('age', `${age} anos`);
                }
              }
            }}
            type="date"
          />
          <Field label="Idade" value={data.age} disabled />
          <SelectField
            label="Sexo"
            value={data.gender}
            onChange={(v) => set('gender', v)}
            options={['Masculino', 'Feminino', 'Outro']}
          />
          <Field
            label="Peso atual"
            value={data.weightKg}
            onChange={(v) => set('weightKg', v)}
            suffix="kg"
            placeholder="0,0"
          />
          <Field
            label="Altura"
            value={data.heightM}
            onChange={(v) => set('heightM', v)}
            suffix="m"
            placeholder="0,00"
          />
          <Field
            label="IMC (calculado)"
            value={data.bmi}
            disabled
            extra={
              data.bmi ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${bmiInfo.color}`}>
                  {bmiInfo.label}
                </span>
              ) : null
            }
          />
          <Field label="TMB (calculado)" value={data.tmb} disabled suffix="kcal/dia" />
        </div>
      </div>

      {/* Medidas corporais */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-bold text-gray-900">Medidas corporais</h3>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['cm', 'pol'] as const).map((u) => (
              <button
                key={u}
                onClick={() => set('measurementUnit', u as any)}
                className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                  data.measurementUnit === u ? 'bg-[#007AFF] text-white shadow-sm' : 'text-gray-500'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            ['Cintura', 'waist'],
            ['Abdômen', 'abdomen'],
            ['Quadril', 'hip'],
            ['Peito', 'chest'],
            ['Braço', 'arm'],
            ['Coxa', 'thigh'],
            ['Panturrilha', 'calf'],
            ['Pescoço', 'neck'],
          ].map(([label, key]) => (
            <Field
              key={key}
              label={label}
              value={(data as any)[key]}
              onChange={(v) => set(key as any, v)}
              suffix={data.measurementUnit}
              placeholder="0"
            />
          ))}
        </div>
      </div>

      {/* Observações */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <label className="text-[15px] font-bold text-gray-900 mb-3 block">Observações</label>
        <div className="relative">
          <textarea
            value={data.notes}
            onChange={(e) => set('notes', e.target.value.slice(0, 500))}
            rows={3}
            placeholder="Ex.: informações relevantes sobre o paciente, histórico, preferências..."
            className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-[14px] text-gray-900 placeholder-gray-400 outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 resize-none"
          />
          <div className="absolute right-3 bottom-2 text-[10px] font-medium text-gray-400">
            {data.notes.length}/500
          </div>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   STEP 2 — DIETA
============================================================ */

const MealEditModal: React.FC<{
  meal: DietMeal | null;
  onSave: (m: DietMeal) => void;
  onClose: () => void;
}> = ({ meal, onSave, onClose }) => {
  const [form, setForm] = useState<DietMeal>(
    meal || {
      id: newMealId(),
      type: 'breakfast',
      name: 'Café da manhã',
      time: '07:00',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
    }
  );

  const setF = <K extends keyof DietMeal>(k: K, v: DietMeal[K]) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl w-full max-w-[440px] shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Nova refeição</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">Após salvar, adicione os alimentos.</p>
          </div>
          <button onClick={onClose} className="p-1.5 -mr-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => {
                const t = e.target.value as DietMeal['type'];
                setF('type', t);
                setF('name', MEAL_TYPE_META[t].label);
              }}
              className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl h-[44px] px-3.5 text-[14px] font-medium text-gray-900 outline-none focus:border-[#007AFF]"
            >
              {(Object.keys(MEAL_TYPE_META) as Array<DietMeal['type']>).map((t) => (
                <option key={t} value={t}>
                  {MEAL_TYPE_META[t].label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setF('name', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[44px] px-3.5 text-[14px] font-medium text-gray-900 outline-none focus:border-[#007AFF]"
              />
            </div>
            <div>
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">Horário</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setF('time', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[44px] px-3.5 text-[14px] font-medium text-gray-900 outline-none focus:border-[#007AFF]"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-50 rounded-xl">
            Cancelar
          </button>
          <button
            onClick={() => {
              onSave(form);
              onClose();
            }}
            className="px-5 py-2 bg-[#007AFF] text-white text-sm font-bold rounded-xl hover:bg-[#0056b3] transition-colors"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   FOOD SEARCH (busca alimento na tabela TACO)
============================================================ */

interface AppFood {
  id: string;
  name: string;
  category: string | null;
  portion_size: number;
  portion_unit: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const FoodSearch: React.FC<{ onPick: (food: MealFood) => void }> = ({ onPick }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AppFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [pickedFood, setPickedFood] = useState<AppFood | null>(null);
  const [amount, setAmount] = useState<string>('100');

  // debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('foods')
          .select('id, name, category, portion_size, portion_unit, kcal, protein, carbs, fat')
          .ilike('name', `%${query.trim()}%`)
          .limit(12);
        if (error) throw error;
        setResults((data as AppFood[]) || []);
      } catch (err) {
        console.error('[FoodSearch] erro:', err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleConfirm = () => {
    if (!pickedFood) return;
    const amt = Number((amount || '0').replace(',', '.')) || 0;
    if (amt <= 0) return;
    const ratio = amt / pickedFood.portion_size;
    onPick({
      id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      food_id: pickedFood.id as any, // ID string vindo de foods
      food_name: pickedFood.name,
      amount_g: amt,
      calories: Math.round(Number(pickedFood.kcal) * ratio),
      protein: Math.round(Number(pickedFood.protein) * ratio * 10) / 10,
      carbs: Math.round(Number(pickedFood.carbs) * ratio * 10) / 10,
      fats: Math.round(Number(pickedFood.fat) * ratio * 10) / 10,
      cal_per_100: Number(pickedFood.kcal) / (pickedFood.portion_size / 100),
      protein_per_100: Number(pickedFood.protein) / (pickedFood.portion_size / 100),
      carbs_per_100: Number(pickedFood.carbs) / (pickedFood.portion_size / 100),
      fats_per_100: Number(pickedFood.fat) / (pickedFood.portion_size / 100),
    });
    // Reset
    setPickedFood(null);
    setQuery('');
    setAmount('100');
    setResults([]);
    setOpen(false);
  };

  // Preview macros pra quantidade atual
  const preview = useMemo(() => {
    if (!pickedFood) return null;
    const amt = Number((amount || '0').replace(',', '.')) || 0;
    const ratio = amt / pickedFood.portion_size;
    return {
      cal: Math.round(Number(pickedFood.kcal) * ratio),
      p: Math.round(Number(pickedFood.protein) * ratio * 10) / 10,
      c: Math.round(Number(pickedFood.carbs) * ratio * 10) / 10,
      f: Math.round(Number(pickedFood.fat) * ratio * 10) / 10,
    };
  }, [pickedFood, amount]);

  return (
    <div className="relative">
      <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Adicionar alimentos</p>

      {/* Estado: alimento escolhido — mostra preview e quantidade */}
      {pickedFood ? (
        <div className="bg-[#007AFF]/[0.04] border border-[#007AFF]/20 rounded-xl p-3 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-gray-900 truncate">{pickedFood.name}</p>
              <p className="text-[10px] text-gray-500 font-medium">
                Por {pickedFood.portion_size}{pickedFood.portion_unit}: {Number(pickedFood.kcal)} kcal • P {Number(pickedFood.protein)}g • C {Number(pickedFood.carbs)}g • G {Number(pickedFood.fat)}g
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPickedFood(null)}
              className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-white shrink-0"
              title="Trocar alimento"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-bold text-gray-600 shrink-0">Quantidade:</label>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#007AFF]">
              <input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-[80px] text-[13px] font-bold text-gray-900 text-right outline-none px-3 py-2 bg-transparent"
                autoFocus
              />
              <span className="text-[11px] font-bold text-gray-500 pr-3">{pickedFood.portion_unit}</span>
            </div>
            {preview && (
              <span className="text-[11px] text-gray-600 font-semibold">
                = {preview.cal} kcal • P {preview.p}g • C {preview.c}g • G {preview.f}g
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="w-full bg-[#007AFF] text-white text-[13px] font-bold py-2.5 rounded-xl hover:bg-[#0056b3] transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" strokeWidth={3} /> Adicionar à refeição
          </button>
        </div>
      ) : (
        // Estado: input de busca
        <div className="relative">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:border-[#007AFF] focus-within:ring-2 focus-within:ring-[#007AFF]/10 transition-all">
            <Search className="w-4 h-4 text-gray-400 ml-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Pesquise um alimento (ex: arroz, frango...)"
              className="flex-1 bg-transparent px-2.5 py-2.5 text-[13px] font-medium text-gray-900 outline-none placeholder:text-gray-400 placeholder:font-normal"
            />
            {loading && <Loader2 className="w-4 h-4 text-[#007AFF] mr-3 animate-spin shrink-0" />}
          </div>

          {open && query.trim() && (
            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.15)] max-h-[280px] overflow-y-auto">
              {!loading && results.length === 0 && (
                <p className="px-3 py-4 text-[12px] text-gray-400 text-center font-medium">Nenhum alimento encontrado.</p>
              )}
              {results.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setPickedFood(r);
                    setAmount(String(r.portion_size)); // Initialize amount to portion size
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-gray-50 text-left border-b border-gray-50 last:border-b-0 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-gray-900 truncate">{r.name}</p>
                    <p className="text-[10px] text-gray-500 font-medium truncate">
                      {r.category || '—'} • {Number(r.kcal)} kcal/{r.portion_size}{r.portion_unit}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-[#007AFF] shrink-0" strokeWidth={3} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Step2Diet: React.FC<{ data: DietData; setData: React.Dispatch<React.SetStateAction<DietData>> }> = ({
  data,
  setData,
}) => {
  const [showMealModal, setShowMealModal] = useState(false);

  const set = <K extends keyof DietData>(k: K, v: DietData[K]) => setData((d) => ({ ...d, [k]: v }));

  const activeVariant = data.variants.find(v => v.id === data.activeVariantId) || data.variants[0];

  const updateVariantMeals = (meals: DietMeal[]) => {
    setData((d) => ({
      ...d,
      variants: d.variants.map((v) => (v.id === d.activeVariantId ? { ...v, meals } : v)),
    }));
  };

  const updateVariant = (patch: Partial<DietVariant>) => {
    setData((d) => ({
      ...d,
      variants: d.variants.map((v) => (v.id === d.activeVariantId ? { ...v, ...patch } : v)),
    }));
  };

  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Somatório do que já foi adicionado nas refeições (para comparar com a meta)
  const totals = useMemo(
    () =>
      activeVariant.meals.reduce(
        (a, m) => ({
          cal: a.cal + m.calories,
          p: a.p + m.protein,
          c: a.c + m.carbs,
          f: a.f + m.fats,
        }),
        { cal: 0, p: 0, c: 0, f: 0 }
      ),
    [activeVariant.meals]
  );

  const macroPct = useMemo(
    () =>
      calcMacrosPct(
        Number(data.goalCalories) || 0,
        Number(data.protein) || 0,
        Number(data.carbs) || 0,
        Number(data.fats) || 0
      ),
    [data.goalCalories, data.protein, data.carbs, data.fats]
  );

  const editableMacros = [
    { key: 'goalCalories', label: 'Meta de calorias', value: data.goalCalories, suffix: 'kcal', sub: 'Por dia', currentValue: totals.cal, icon: Flame, color: 'bg-emerald-50 text-emerald-500' },
    { key: 'protein', label: 'Proteínas', value: data.protein, suffix: 'g', sub: `${macroPct.p}%`, currentValue: totals.p, icon: Beef, color: 'bg-purple-50 text-purple-500' },
    { key: 'carbs', label: 'Carboidratos', value: data.carbs, suffix: 'g', sub: `${macroPct.c}%`, currentValue: totals.c, icon: Wheat, color: 'bg-orange-50 text-orange-500' },
    { key: 'fats', label: 'Gorduras', value: data.fats, suffix: 'g', sub: `${macroPct.f}%`, currentValue: totals.f, icon: Droplet, color: 'bg-amber-50 text-amber-500' },
    { key: 'water', label: 'Água', value: data.water, suffix: 'L', sub: 'Por dia', currentValue: null, icon: Droplet, color: 'bg-sky-50 text-sky-500' },
  ] as const;

  return (
    <div className="space-y-5">
      {/* Cards de macros (metas editáveis) */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {editableMacros.map((c) => (
          <div key={c.key} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/60 transition-colors group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.color}`}>
              <c.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide truncate">{c.label}</p>
              <div className="flex items-baseline gap-1">
                <input
                  type="text"
                  inputMode="decimal"
                  value={c.value}
                  onChange={(e) => set(c.key as any, e.target.value.replace(/[^0-9.,]/g, ''))}
                  className="w-full max-w-[70px] text-[16px] font-extrabold text-gray-900 leading-tight bg-transparent border-0 outline-none p-0 group-hover:bg-white group-hover:border group-hover:border-gray-200 group-hover:rounded-md group-hover:px-1.5 focus:bg-white focus:border focus:border-[#007AFF] focus:rounded-md focus:px-1.5 transition-all"
                  placeholder="0"
                />
                <span className="text-[11px] font-bold text-gray-400 shrink-0">{c.suffix}</span>
              </div>
              <p className="text-[10px] font-medium text-gray-400 mt-0.5">
                {c.currentValue !== null ? `Atual: ${c.currentValue}${c.suffix === 'kcal' ? '' : c.suffix} • ${c.sub}` : c.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Distribuição refeições */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {/* Aba de Variantes de Dieta */}
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-gray-100 overflow-x-auto no-scrollbar">
            {data.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => set('activeVariantId', v.id)}
                className={`flex items-center justify-between min-w-[120px] px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all whitespace-nowrap ${
                  data.activeVariantId === v.id
                    ? 'bg-[#007AFF] text-white shadow-md'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                }`}
              >
                <span>{v.name}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const newId = `var_${Date.now()}`;
                setData((d) => ({
                  ...d,
                  variants: [
                    ...d.variants,
                    { id: newId, name: `Variante ${d.variants.length + 1}`, days: [], meals: [] },
                  ],
                  activeVariantId: newId,
                }));
              }}
              className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 transition-colors tooltip"
              title="Adicionar nova dieta"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-start justify-between mb-1 gap-3">
            <div>
              <h3 className="text-[15px] font-bold text-gray-900">Distribuição das refeições - {activeVariant.name}</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">Configure as refeições para esta variante.</p>
              
              <div className="mt-3 flex items-center gap-3">
                 <input 
                   type="text" 
                   value={activeVariant.name}
                   onChange={e => updateVariant({ name: e.target.value })}
                   className="text-[13px] font-bold text-gray-900 px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-[#007AFF]"
                   placeholder="Nome da dieta (Ex: Dia Off)"
                 />
                 <button
                    type="button"
                    onClick={() => setShowCalendarModal(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg text-[12px] font-bold transition-colors"
                 >
                    <CalendarIcon className="w-4 h-4" />
                    Configurar Dias
                 </button>
                 {data.variants.length > 1 && (
                     <button
                        type="button"
                        onClick={() => {
                          setData(d => {
                             const newVariants = d.variants.filter(v => v.id !== activeVariant.id);
                             return {
                               ...d,
                               variants: newVariants,
                               activeVariantId: newVariants.length > 0 ? newVariants[0].id : ''
                             };
                          });
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                        title="Remover variante"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                 )}
              </div>
            </div>
            <button
              onClick={() => setShowMealModal(true)}
              className="px-3 py-2 bg-[#007AFF]/10 text-[#007AFF] text-[12px] font-bold rounded-xl flex items-center gap-1.5 hover:bg-[#007AFF]/15 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar refeição
            </button>
          </div>

          <div className="mt-5 space-y-2.5">
            {activeVariant.meals.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm font-medium border-2 border-dashed border-gray-200 rounded-2xl">
                Nenhuma refeição na {activeVariant.name}. Clique em "Adicionar refeição".
              </div>
            )}
            {activeVariant.meals.map((m) => {
              const meta = MEAL_TYPE_META[m.type];
              const Icon = meta.icon;
              const isExpanded = !!m.expanded;

              const updateMeal = (patch: Partial<DietMeal>) => {
                updateVariantMeals(activeVariant.meals.map((x) => (x.id === m.id ? { ...x, ...patch } : x)));
              };

              const recalcFromFoods = (foods: MealFood[]) => {
                const t = foods.reduce(
                  (a, f) => ({
                    cal: a.cal + f.calories,
                    p: a.p + f.protein,
                    c: a.c + f.carbs,
                    f: a.f + f.fats,
                  }),
                  { cal: 0, p: 0, c: 0, f: 0 }
                );
                return {
                  foods,
                  calories: Math.round(t.cal),
                  protein: Math.round(t.p),
                  carbs: Math.round(t.c),
                  fats: Math.round(t.f),
                };
              };

              const addFood = (food: MealFood) => {
                const foods = [...(m.foods || []), food];
                updateMeal(recalcFromFoods(foods));
              };

              const removeFood = (foodId: string) => {
                const foods = (m.foods || []).filter((f) => f.id !== foodId);
                updateMeal(recalcFromFoods(foods));
              };

              const updateFoodAmount = (foodId: string, newAmount: number) => {
                const foods = (m.foods || []).map((f) => {
                  if (f.id !== foodId) return f;
                  const ratio = newAmount / 100;
                  return {
                    ...f,
                    amount_g: newAmount,
                    calories: Math.round(f.cal_per_100 * ratio),
                    protein: Math.round(f.protein_per_100 * ratio * 10) / 10,
                    carbs: Math.round(f.carbs_per_100 * ratio * 10) / 10,
                    fats: Math.round(f.fats_per_100 * ratio * 10) / 10,
                  };
                });
                updateMeal(recalcFromFoods(foods));
              };

              const removeMeal = () => {
                updateVariantMeals(activeVariant.meals.filter((x) => x.id !== m.id));
              };

              return (
                <div
                  key={m.id}
                  className={`rounded-2xl border transition-all relative ${
                    isExpanded ? 'border-[#007AFF]/40 bg-[#007AFF]/[0.015] shadow-[0_4px_20px_rgba(0,122,255,0.06)] z-[50]' : 'border-gray-100 hover:border-gray-200 overflow-hidden z-[1]'
                  }`}
                >
                  {/* HEADER (cabeçalho clicável que expande / colapsa) */}
                  <button
                    type="button"
                    onClick={() => updateMeal({ expanded: !isExpanded })}
                    className={`w-full grid grid-cols-[auto_1.4fr_1fr_auto_auto] gap-3 items-center p-3 text-left hover:bg-gray-50/40 transition-colors ${isExpanded ? 'rounded-t-2xl' : 'rounded-2xl'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${meta.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-bold text-gray-900 truncate">{m.name}</p>
                      <p className="text-[11px] text-gray-500 font-medium">{m.time}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500 font-medium">Calorias</p>
                      <p className="text-[13px] font-bold text-gray-900">{m.calories} kcal</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 text-[11px] font-bold">
                      <span className="flex items-center gap-1 text-purple-600"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" />{m.protein}g</span>
                      <span className="flex items-center gap-1 text-orange-600"><span className="w-1.5 h-1.5 rounded-full bg-orange-500" />{m.carbs}g</span>
                      <span className="flex items-center gap-1 text-amber-600"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" />{m.fats}g</span>
                    </div>
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* PAINEL EXPANDIDO */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-gray-100 bg-white">
                      {/* Edição rápida do header */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 pb-4">
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Tipo</label>
                          <select
                            value={m.type}
                            onChange={(e) => {
                              const t = e.target.value as DietMeal['type'];
                              updateMeal({ type: t, name: MEAL_TYPE_META[t].label });
                            }}
                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl h-[40px] px-3 text-[13px] font-semibold text-gray-900 outline-none focus:border-[#007AFF]"
                          >
                            {(Object.keys(MEAL_TYPE_META) as Array<DietMeal['type']>).map((t) => (
                              <option key={t} value={t}>
                                {MEAL_TYPE_META[t].label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Nome</label>
                          <input
                            type="text"
                            value={m.name}
                            onChange={(e) => updateMeal({ name: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[40px] px-3 text-[13px] font-semibold text-gray-900 outline-none focus:border-[#007AFF]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-1 block">Horário</label>
                          <input
                            type="time"
                            value={m.time}
                            onChange={(e) => updateMeal({ time: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl h-[40px] px-3 text-[13px] font-semibold text-gray-900 outline-none focus:border-[#007AFF]"
                          />
                        </div>
                      </div>

                      {/* Lista de alimentos adicionados */}
                      <div className="mb-3">
                        <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Alimentos</p>
                        {(m.foods || []).length === 0 ? (
                          <p className="text-[12px] text-gray-400 italic mb-3">Nenhum alimento. Pesquise abaixo para adicionar.</p>
                        ) : (
                          <div className="space-y-1.5 mb-3">
                            {(m.foods || []).map((f) => (
                              <div key={f.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center bg-gray-50/70 hover:bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                                <div className="min-w-0">
                                  <p className="text-[12px] font-bold text-gray-900 truncate">{f.food_name}</p>
                                  <p className="text-[10px] text-gray-500 font-medium">{f.calories} kcal • P {f.protein}g • C {f.carbs}g • G {f.fats}g</p>
                                </div>
                                <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                                  <input
                                    type="number"
                                    min={1}
                                    value={f.amount_g}
                                    onChange={(e) => updateFoodAmount(f.id, Number(e.target.value) || 0)}
                                    className="w-[60px] text-[12px] font-bold text-gray-900 text-right outline-none px-2 py-1.5 bg-transparent"
                                  />
                                  <span className="text-[10px] font-bold text-gray-500 pr-2">g</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFood(f.id)}
                                  className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remover alimento"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Busca de alimento na TACO */}
                      <FoodSearch onPick={addFood} />

                      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                        <button
                          type="button"
                          onClick={removeMeal}
                          className="px-3 py-1.5 text-[12px] font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remover refeição
                        </button>
                        <button
                          type="button"
                          onClick={() => updateMeal({ expanded: false })}
                          className="px-3 py-1.5 text-[12px] font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          Minimizar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex gap-2.5 items-start">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[12px] text-blue-900 font-medium leading-relaxed">
              As calorias e macros são ajustadas automaticamente conforme as refeições adicionadas.
            </p>
          </div>
        </div>

        {/* Preferências e observações */}
        <div className="space-y-5">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-bold text-gray-900">Preferências alimentares</h3>
            <p className="text-[12px] text-gray-500 mt-0.5 mb-4">Selecione as preferências e restrições do paciente.</p>

            <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2">Restrições alimentares</p>
            <TagsField
              tags={data.restrictions}
              onAdd={(t) => set('restrictions', [...data.restrictions, t])}
              onRemove={(i) => set('restrictions', data.restrictions.filter((_, idx) => idx !== i))}
              color="red"
            />

            <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-2 mt-4">Preferências</p>
            <TagsField
              tags={data.preferences}
              onAdd={(t) => set('preferences', [...data.preferences, t])}
              onRemove={(i) => set('preferences', data.preferences.filter((_, idx) => idx !== i))}
              color="green"
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <h3 className="text-[15px] font-bold text-gray-900">Observações do plano</h3>
            <p className="text-[12px] text-gray-500 mt-0.5 mb-3">Informações importantes sobre o plano alimentar.</p>
            <div className="relative">
              <textarea
                rows={4}
                value={data.planNotes}
                onChange={(e) => set('planNotes', e.target.value.slice(0, 500))}
                placeholder="Ex.: Orientações, estratégias, pontos de atenção..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 resize-none"
              />
              <div className="absolute right-3 bottom-2 text-[10px] font-medium text-gray-400">
                {data.planNotes.length}/500
              </div>
            </div>
          </div>
        </div>
      </div>

      {showMealModal && (
        <MealEditModal
          meal={null}
          onSave={(m) => {
            updateVariantMeals([...activeVariant.meals, { ...m, expanded: true, foods: [] }]);
          }}
          onClose={() => setShowMealModal(false)}
        />
      )}

      {/* Calendar Modal para Variante */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Dias da semana</h3>
            <p className="text-sm text-gray-500 mb-6">Em quais dias esta dieta ({activeVariant.name}) deve ser seguida?</p>
            
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {[
                { id: 0, label: 'Dom' },
                { id: 1, label: 'Seg' },
                { id: 2, label: 'Ter' },
                { id: 3, label: 'Qua' },
                { id: 4, label: 'Qui' },
                { id: 5, label: 'Sex' },
                { id: 6, label: 'Sáb' },
              ].map(d => {
                const isActive = activeVariant.days.includes(d.id);
                return (
                  <button
                    key={d.id}
                    onClick={() => {
                       const newDays = isActive 
                          ? activeVariant.days.filter(x => x !== d.id) 
                          : [...activeVariant.days, d.id].sort();
                       updateVariant({ days: newDays });
                    }}
                    className={`w-12 h-12 rounded-xl text-sm font-bold transition-all ${
                       isActive 
                          ? 'bg-[#007AFF] text-white shadow-md' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
               <button 
                  onClick={() => setShowCalendarModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
               >
                 Concluído
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TagsField: React.FC<{
  tags: string[];
  onAdd: (t: string) => void;
  onRemove: (i: number) => void;
  color: 'red' | 'green';
}> = ({ tags, onAdd, onRemove, color }) => {
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);

  const colorClass =
    color === 'red'
      ? 'bg-red-50 text-red-600 border border-red-100'
      : 'bg-green-50 text-green-600 border border-green-100';

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t, i) => (
        <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${colorClass}`}>
          <X className="w-3 h-3 cursor-pointer hover:opacity-70" onClick={() => onRemove(i)} />
          {color === 'green' && <Check className="w-3 h-3" strokeWidth={3} />}
          {t}
        </span>
      ))}
      {adding ? (
        <input
          autoFocus
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onBlur={() => {
            if (input.trim()) onAdd(input.trim());
            setInput('');
            setAdding(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && input.trim()) {
              onAdd(input.trim());
              setInput('');
              setAdding(false);
            }
          }}
          placeholder="Digite e Enter"
          className="px-2.5 py-1 text-[11px] font-medium bg-white border border-[#007AFF] rounded-lg outline-none w-32"
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border border-dashed border-gray-300 text-gray-500 hover:border-[#007AFF] hover:text-[#007AFF] transition-colors"
        >
          <Plus className="w-3 h-3" /> Adicionar
        </button>
      )}
    </div>
  );
};

/* ============================================================
   STEP 3 — AGENDAR
============================================================ */

const Step3Schedule: React.FC<{ data: AppointmentData; setData: React.Dispatch<React.SetStateAction<AppointmentData>> }> = ({
  data,
  setData,
}) => {
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const set = <K extends keyof AppointmentData>(k: K, v: AppointmentData[K]) => setData((d) => ({ ...d, [k]: v }));

  const monthYearLabel = calendarMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Construir calendário
  const days = useMemo(() => {
    const out: Array<{ date: Date; current: boolean }> = [];
    const startDay = calendarMonth.getDay();
    const startDate = new Date(calendarMonth);
    startDate.setDate(1 - startDay);
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      out.push({ date: d, current: d.getMonth() === calendarMonth.getMonth() });
    }
    return out;
  }, [calendarMonth]);

  const isSameDay = (a: Date, b: string) => {
    if (!b) return false;
    const [y, m, d] = b.split('-').map(Number);
    return a.getFullYear() === y && a.getMonth() === m - 1 && a.getDate() === d;
  };

  const slots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatBR = (iso: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Coluna esquerda */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-[#007AFF]/10 text-[#007AFF] flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900">Agendar próximo retorno</h3>
            <p className="text-[12px] text-gray-500 mt-0.5">Defina a data e o horário da próxima consulta.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Tipo de consulta</label>
            <div className="relative">
              <select
                value={data.appointmentType}
                onChange={(e) => set('appointmentType', e.target.value as any)}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl h-[44px] px-3.5 pr-10 text-[14px] font-medium text-gray-900 outline-none focus:border-[#007AFF]"
              >
                <option value="retorno">Retorno / Consultoria</option>
                <option value="consultoria">Consultoria nova</option>
                <option value="avaliacao">Avaliação</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1.5">Consulta de acompanhamento do plano alimentar.</p>
          </div>

          <div>
            <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Duração da consulta</label>
            <div className="relative">
              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={data.duration}
                onChange={(e) => set('duration', Number(e.target.value))}
                className="w-full appearance-none bg-white border border-gray-200 rounded-xl h-[44px] pl-10 pr-10 text-[14px] font-medium text-gray-900 outline-none focus:border-[#007AFF]"
              >
                {[15, 30, 45, 60, 90].map((n) => (
                  <option key={n} value={n}>
                    {n} minutos
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Profissional</label>
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 h-[52px]">
              <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-50 shrink-0">
                <img
                  src="https://jkjkbawikpqgxvmstzsb.supabase.co/storage/v1/object/public/Allan/a363b4bf95e991cec48ec623905cfc44.png"
                  alt="Dr. Allan"
                  className="w-full h-full object-cover scale-[1.2] translate-y-1"
                />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-gray-900">Dr. Allan</p>
                <p className="text-[11px] text-gray-500 font-medium">Nutricionista</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Observações (opcional)</label>
            <div className="relative">
              <textarea
                rows={3}
                value={data.notes}
                onChange={(e) => set('notes', e.target.value.slice(0, 300))}
                placeholder="Ex.: foco do retorno, avaliações, orientações específicas..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-3 text-[13px] text-gray-900 placeholder-gray-400 outline-none focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/10 resize-none"
              />
              <div className="absolute right-3 bottom-2 text-[10px] font-medium text-gray-400">
                {data.notes.length}/300
              </div>
            </div>
          </div>

          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex gap-2 items-center">
            <CalendarIcon className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="text-[12px] text-blue-900 font-medium">O paciente receberá um lembrete da consulta por e-mail e WhatsApp.</p>
          </div>
        </div>
      </div>

      {/* Coluna direita - calendário + horários */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col">
        <h3 className="text-[15px] font-bold text-gray-900 mb-4">Selecione a data</h3>

        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              const d = new Date(calendarMonth);
              d.setMonth(d.getMonth() - 1);
              setCalendarMonth(d);
            }}
            className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <p className="text-[14px] font-bold text-gray-900 capitalize">{monthYearLabel}</p>
          <button
            onClick={() => {
              const d = new Date(calendarMonth);
              d.setMonth(d.getMonth() + 1);
              setCalendarMonth(d);
            }}
            className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-lg"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div key={d} className="text-[10px] font-bold text-gray-400 uppercase py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            const past = d.date < today;
            const selected = isSameDay(d.date, data.date);
            return (
              <button
                key={i}
                disabled={!d.current || past}
                onClick={() => {
                  const yyyy = d.date.getFullYear();
                  const mm = String(d.date.getMonth() + 1).padStart(2, '0');
                  const dd = String(d.date.getDate()).padStart(2, '0');
                  set('date', `${yyyy}-${mm}-${dd}`);
                }}
                className={`aspect-square rounded-lg text-[12px] font-bold transition-all ${
                  selected
                    ? 'bg-[#007AFF] text-white shadow-md'
                    : !d.current || past
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {d.date.getDate()}
              </button>
            );
          })}
        </div>

        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[14px] font-bold text-gray-900">Horários disponíveis</h4>
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Horário local
            </span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((s) => (
              <button
                key={s}
                onClick={() => set('time', s)}
                className={`py-2.5 rounded-xl text-[12px] font-bold border transition-all ${
                  data.time === s
                    ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-md'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-[#007AFF]/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {data.date && data.time && (
          <div className="mt-5 bg-emerald-50/70 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600" strokeWidth={3} />
            <p className="text-[12px] text-emerald-800 font-bold">
              Retorno agendado para {formatBR(data.date)} às {data.time}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   ROOT MODAL
============================================================ */

interface Props {
  patient: any; // tem user_id, profiles, etc.
  planIdToEdit?: string | null;
  onClose: () => void;
  onSent: () => void; // callback após envio
}

export const CreateFullPlanModal: React.FC<Props> = ({ patient, planIdToEdit, onClose, onSent }) => {
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(!!planIdToEdit);
  const [error, setError] = useState<string | null>(null);

  const userId = patient.user_id;
  const profile = patient.profiles;

  const [basic, setBasic] = useState<BasicData>({
    planTitle: 'Plano Alimentar',
    name: profile?.name || '',
    birthDate: '',
    age: profile?.age ? `${profile.age} anos` : '',
    gender: profile?.gender || 'Masculino',
    weightKg: profile?.weight ? String(profile.weight).replace('.', ',') : '',
    heightM: profile?.height ? (Number(profile.height) / 100).toFixed(2).replace('.', ',') : '',
    bmi: '',
    tmb: '',
    measurementUnit: 'cm',
    waist: '',
    abdomen: '',
    hip: '',
    chest: '',
    arm: '',
    thigh: '',
    calf: '',
    neck: '',
    notes: '',
  });

  const [diet, setDiet] = useState<DietData>(() => {
    const auto = calculateAutoGoals({
      weight: profile?.weight,
      height: profile?.height,
      age: profile?.age,
      gender: profile?.gender,
      activityLevel: profile?.activity_level,
    });
    const defaultVariantId = 'var_1';
    return {
      goalCalories: auto?.calories ? String(auto.calories) : '',
      protein: auto?.protein ? String(auto.protein) : '',
      carbs: auto?.carbs ? String(auto.carbs) : '',
      fats: auto?.fats ? String(auto.fats) : '',
      water: auto?.water ? String(auto.water).replace('.', ',') : '',
      variants: [
        {
          id: defaultVariantId,
          name: 'Plano base',
          days: [0, 1, 2, 3, 4, 5, 6],
          meals: [],
        }
      ],
      activeVariantId: defaultVariantId,
      restrictions: [],
      preferences: ['Frango', 'Peixes', 'Ovos', 'Vegetais'],
      planNotes: '',
    };
  });

  const [appointment, setAppointment] = useState<AppointmentData>({
    appointmentType: 'retorno',
    duration: 30,
    date: '',
    time: '',
    notes: '',
  });

  useEffect(() => {
     if (!planIdToEdit) return;
     const loadPlan = async () => {
         try {
             // Fetch plan
             const { data: plan, error: planError } = await supabase
                 .from('patient_plans')
                 .select('*')
                 .eq('id', planIdToEdit)
                 .single();
                 
             if (planError) throw planError;
             
             // Setup basic
             setBasic(b => ({
                 ...b,
                 planTitle: plan.title || 'Plano Alimentar',
                 weightKg: plan.weight_kg ? String(plan.weight_kg).replace('.',',') : b.weightKg,
                 heightM: plan.height_m ? String(plan.height_m).replace('.',',') : b.heightM,
             }));
             
             // Setup diet basic
             setDiet(d => ({
                 ...d,
                 goalCalories: plan.goal_calories ? String(plan.goal_calories) : '',
                 protein: plan.protein_g ? String(plan.protein_g) : '',
                 carbs: plan.carbs_g ? String(plan.carbs_g) : '',
                 fats: plan.fats_g ? String(plan.fats_g) : '',
                 water: plan.water_l ? String(plan.water_l).replace('.',',') : '',
                 planNotes: plan.observations || '',
             }));
             
             // Try to fetch variants
             const { data: variants, error: varError } = await supabase
                 .from('plan_diet_variants')
                 .select('*')
                 .eq('plan_id', planIdToEdit);
                 
             if (varError) throw varError;
             
             if (variants && variants.length > 0) {
                 // Format variants with their meals
                 const { data: meals, error: mealError } = await supabase
                     .from('plan_meals')
                     .select(`*, plan_meal_foods(*)`)
                     .in('variant_id', variants.map(v => v.id))
                     .order('time_order', { ascending: true }); // Assume time order roughly
                     
                 const formattedVariants: DietVariant[] = variants.map(v => {
                     const varMeals = (meals || []).filter(m => m.variant_id === v.id).map(m => ({
                         id: m.id,
                         type: m.type as any,
                         name: m.name,
                         time: m.time,
                         calories: m.calories || 0,
                         protein: m.protein || 0,
                         carbs: m.carbs || 0,
                         fats: m.fats || 0,
                         expanded: false,
                         foods: (m.plan_meal_foods || []).map((f: any) => ({
                            id: f.id,
                            foodId: f.food_id,
                            name: f.food_name,
                            amount_g: f.amount_g,
                            calories: f.calories || 0,
                            protein: f.protein || 0,
                            carbs: f.carbs || 0,
                            fats: f.fats || 0,
                            cal_per_100: f.cal_per_100 || 0,
                            protein_per_100: f.protein_per_100 || 0,
                            carbs_per_100: f.carbs_per_100 || 0,
                            fats_per_100: f.fats_per_100 || 0,
                            measureUnit: f.measure_unit,
                         }))
                     }));
                     return {
                         id: v.id,
                         name: v.name,
                         days: v.days || [],
                         meals: varMeals
                     };
                 });
                 setDiet(d => ({ ...d, variants: formattedVariants, activeVariantId: formattedVariants[0]?.id }));
             }

             // Appointment
             if (plan.appointment_at) {
                 const d = new Date(plan.appointment_at);
                 const yyyy = d.getFullYear();
                 const mm = String(d.getMonth() + 1).padStart(2, '0');
                 const dd = String(d.getDate()).padStart(2, '0');
                 
                 setAppointment(a => ({
                    ...a,
                    date: `${yyyy}-${mm}-${dd}`,
                    time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
                 }));
             }
         } catch (e) {
             console.error('Error loading plan for edit:', e);
             setError('Erro ao carregar o plano para edição.');
         } finally {
             setLoadingInitial(false);
         }
     }
     loadPlan();
  }, [planIdToEdit]);

  const goNext = () => setStep((s) => (Math.min(3, s + 1) as Step));
  const goBack = () => setStep((s) => (Math.max(1, s - 1) as Step));

  const handleFinalize = async () => {
    setSaving(true);
    setError(null);
    try {
      // 1. Pega o nutritionist_id pelo user logado
      const { data: { user } } = await supabase.auth.getUser();
      const { data: nutri } = await supabase
        .from('nutritionists')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      const toNum = (v: string) => {
        const n = Number(v.replace(',', '.'));
        return isNaN(n) ? null : n;
      };

      let appointmentAt: string | null = null;
      if (appointment.date && appointment.time) {
        appointmentAt = new Date(`${appointment.date}T${appointment.time}:00`).toISOString();
      }

      const planRow = {
        user_id: userId,
        nutritionist_id: nutri?.id || null,
        status: 'sent',
        sent_at: new Date().toISOString(),

        title: basic.planTitle,
        name: basic.name,
        birth_date: basic.birthDate || null,
        age: basic.age ? parseInt(basic.age) : null,
        gender: basic.gender,
        weight_kg: toNum(basic.weightKg),
        height_m: toNum(basic.heightM),
        bmi: toNum(basic.bmi),
        tmb_kcal: basic.tmb ? Number(basic.tmb) : null,

        waist_cm: toNum(basic.waist),
        abdomen_cm: toNum(basic.abdomen),
        hip_cm: toNum(basic.hip),
        chest_cm: toNum(basic.chest),
        arm_cm: toNum(basic.arm),
        thigh_cm: toNum(basic.thigh),
        calf_cm: toNum(basic.calf),
        neck_cm: toNum(basic.neck),
        measurement_unit: basic.measurementUnit,

        data_notes: basic.notes || null,

        goal_calories: toNum(diet.goalCalories),
        protein_g: toNum(diet.protein),
        carbs_g: toNum(diet.carbs),
        fats_g: toNum(diet.fats),
        water_l: toNum(diet.water),

        food_restrictions: diet.restrictions,
        food_preferences: diet.preferences,
        diet_notes: diet.planNotes || null,

        appointment_type: appointment.appointmentType,
        appointment_duration_min: appointment.duration,
        appointment_at: appointmentAt,
        appointment_notes: appointment.notes || null,
      };

      // Insere ou atualiza o plano
      let planId = planIdToEdit || null;
      if (planId) {
         const { error: updateErr } = await supabase
           .from('patient_plans')
           .update(planRow)
           .eq('id', planId);
         if (updateErr) throw updateErr;

         // Deleta as variantes antigas (as refeicoes/alimentos devem estar com onDelete cascade ou ser explicitamente excluidos)
         // Para seguranca de fk, deletamos as refeicoes tbm:
         await supabase.from('plan_meals').delete().eq('plan_id', planId); 
         await supabase.from('plan_diet_variants').delete().eq('plan_id', planId);
      } else {
         const { data: newPlan, error: planErr } = await supabase
           .from('patient_plans')
           .insert(planRow)
           .select('id')
           .single();
         if (planErr) throw planErr;
         planId = newPlan.id;
      }

      // Insere as variantes e refeições
      if (diet.variants.length > 0 && planId) {
        for (const variant of diet.variants) {
          // Inserir variante
          const { data: dbVariant, error: varErr } = await supabase
            .from('plan_diet_variants')
            .insert({
              plan_id: planId,
              name: variant.name,
              days: variant.days,
            })
            .select('id')
            .single();

          if (varErr) throw varErr;

          // Inserir refeições da variante
          if (variant.meals.length > 0 && dbVariant?.id) {
            const mealRows = variant.meals.map((m, i) => ({
              plan_id: planId,
              variant_id: dbVariant.id,
              user_id: userId,
              meal_order: i,
              meal_type: m.type,
              name: m.name,
              time_of_day: m.time || null,
              calories: m.calories || 0,
              protein_g: m.protein || 0,
              carbs_g: m.carbs || 0,
              fats_g: m.fats || 0,
            }));

            const { data: insertedMeals, error: mealsErr } = await supabase
              .from('plan_meals')
              .insert(mealRows)
              .select('id, meal_order');

            if (mealsErr) throw mealsErr;

            // Insere alimentos
            if (insertedMeals && insertedMeals.length > 0) {
              const foodRows: any[] = [];
              variant.meals.forEach((m, i) => {
                if (!m.foods || m.foods.length === 0) return;
                const dbMeal = insertedMeals.find((x: any) => x.meal_order === i);
                if (!dbMeal) return;
                m.foods.forEach((f, fIdx) => {
                  foodRows.push({
                    meal_id: dbMeal.id,
                    user_id: userId,
                    food_id: f.food_id,
                    food_name: f.food_name,
                    amount_g: f.amount_g,
                    calories: f.calories,
                    protein_g: f.protein,
                    carbs_g: f.carbs,
                    fats_g: f.fats,
                    food_order: fIdx,
                  });
                });
              });

              if (foodRows.length > 0) {
                const { error: foodsErr } = await supabase.from('plan_meal_foods').insert(foodRows);
                if (foodsErr) throw foodsErr;
              }
            }
          }
        }
      }

      // Atualiza next_review_at na consulta ativa
      if (appointmentAt) {
        await supabase
          .from('consultations')
          .update({ next_review_at: appointmentAt, status: 'active' })
          .eq('user_id', userId);
      }

      // Sincroniza com diet_plans (formato lido pelo DietView do paciente
      // e pelo DietPlanEditor do nutri). Esse upsert faz tudo aparecer
      // sincronizadamente em /dieta (paciente), Plano Alimentar (nutri),
      // e Plano Personalizado (nutri).
      try {
        // Mapeia todas as variantes -> JSON plans
        const mappedPlans = diet.variants.map((variant) => {
          return {
            id: variant.id,
            name: variant.name,
            scope: 'custom',
            days: variant.days,
            meals: variant.meals.map((m) => ({
              id: m.id,
              name: m.name,
              time: m.time || '',
              obs: '',
              items: (m.foods || []).map((f) => ({
                id: f.id,
                food_id: String(f.food_id),
                name: f.food_name,
                qty: f.amount_g,
                unit: 'g',
                portion_size: 100,
                kcal: f.cal_per_100,
                protein: f.protein_per_100,
                carbs: f.carbs_per_100,
                fat: f.fats_per_100,
              })),
            }))
          };
        });

        const dietPlanData = {
          user_id: userId,
          consultation_id: patient?.id || null,
          nutritionist_id: nutri?.id || null,
          title: basic.planTitle || 'Plano Alimentar',
          status: 'active',
          plan_data: {
            plans: mappedPlans,
          },
          plan: {
            plans: mappedPlans,
            total_calories: Number(diet.goalCalories) || 0,
            total_protein_g: Number(diet.protein) || 0,
            total_carbs_g: Number(diet.carbs) || 0,
            total_fat_g: Number(diet.fats) || 0,
            status: 'active',
          },
          total_calories: Number(diet.goalCalories) || 0,
          total_protein_g: Number(diet.protein) || 0,
          total_carbs_g: Number(diet.carbs) || 0,
          total_fat_g: Number(diet.fats) || 0,
          observations: diet.planNotes || null,
          version: 1,
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Procura plano existente pra esse user
        const { data: existingDietPlan } = await supabase
          .from('diet_plans')
          .select('id, version')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingDietPlan?.id) {
          // Atualiza incrementando versão
          await supabase
            .from('diet_plans')
            .update({ ...dietPlanData, version: (existingDietPlan.version || 0) + 1 })
            .eq('id', existingDietPlan.id);
        } else {
          await supabase.from('diet_plans').insert(dietPlanData);
        }
      } catch (syncErr) {
        // Sync falhou, mas o patient_plans já foi gravado. Apenas loga.
        console.warn('[CreateFullPlanModal] sync com diet_plans falhou:', syncErr);
      }

      onSent();
      onClose();
    } catch (err: any) {
      console.error('[CreateFullPlanModal] erro:', err);
      setError(err?.message || 'Não foi possível enviar o plano.');
    } finally {
      setSaving(false);
    }
  };

  const canGoNext = step === 1
    ? !!basic.name && !!basic.weightKg && !!basic.heightM
    : step === 2
    ? diet.variants.some(v => v.meals.length > 0)
    : true;

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-2 sm:p-6 overflow-y-auto" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FAFBFC] rounded-3xl w-full max-w-[1240px] shadow-[0_24px_64px_rgba(0,0,0,0.18)] my-auto max-h-[96vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-white px-6 sm:px-8 py-5 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-[20px] sm:text-[22px] font-extrabold text-gray-900 tracking-tight">Iniciar plano personalizado</h2>
            <p className="text-[13px] text-gray-500 mt-1">
              {step === 1 && 'Configure as informações iniciais para criar o plano do paciente.'}
              {step === 2 && 'Configure o plano alimentar ideal para o paciente.'}
              {step === 3 && 'Finalize agendando o próximo retorno do paciente.'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper */}
        <div className="bg-white px-6 sm:px-8 pb-5 border-b border-gray-100">
          <Stepper step={step} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {step === 1 && <Step1Data data={basic} setData={setBasic} />}
          {step === 2 && <Step2Diet data={diet} setData={setDiet} />}
          {step === 3 && <Step3Schedule data={appointment} setData={setAppointment} />}
        </div>

        {/* Footer */}
        <div className="bg-white px-6 sm:px-8 py-4 border-t border-gray-100 flex items-center justify-between">
          {step > 1 ? (
            <button onClick={goBack} className="px-5 py-2.5 text-[14px] font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          ) : (
            <button onClick={onClose} className="px-5 py-2.5 text-[14px] font-bold text-gray-700 hover:bg-gray-50 rounded-xl">
              Cancelar
            </button>
          )}

          {error && <span className="text-[12px] text-red-500 font-bold mx-3 truncate">{error}</span>}

          {step < 3 ? (
            <button
              onClick={goNext}
              disabled={!canGoNext}
              className="px-5 py-2.5 text-[14px] font-bold text-white bg-[#007AFF] hover:bg-[#0056b3] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center gap-2 shadow-[0_4px_12px_rgba(0,122,255,0.25)] transition-colors"
            >
              {step === 1 ? 'Continuar para dieta' : 'Continuar para agendar'} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalize}
              disabled={saving}
              className="px-5 py-2.5 text-[14px] font-bold text-white bg-[#007AFF] hover:bg-[#0056b3] disabled:opacity-60 rounded-xl flex items-center gap-2 shadow-[0_4px_12px_rgba(0,122,255,0.25)] transition-colors"
            >
              {saving ? 'Enviando...' : 'Finalizar plano'} {!saving && <Check className="w-4 h-4" strokeWidth={3} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
