import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, Plus, Trash2, Copy, GripVertical, Search,
  Clock, FileText, CheckCircle, Send, Loader2, X, Edit2,
  Utensils, Target, Calendar, Printer, Share2, Save,
  Database, Cloud, MoreHorizontal, Settings, RefreshCw
} from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { calculateAutoGoals } from '../../lib/nutritionGoals';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FoodItem {
  id: string;
  food_id?: string;
  name: string;
  qty: number;
  unit: string;
  portion_size: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  obs: string;
  items: FoodItem[];
}

interface DietPlan {
  id: string;
  name: string;
  scope: 'all' | 'days';
  days: number[];
  meals: Meal[];
}

interface Targets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DietPlanEditorProps {
  patient: any;
  onBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);
const r = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;

const scaleFactor = (it: FoodItem) => (it.qty || 0) / (it.portion_size || 1);
const itemTotals = (it: FoodItem) => {
  const f = scaleFactor(it);
  return {
    kcal: (it.kcal || 0) * f,
    p: (it.protein || 0) * f,
    c: (it.carbs || 0) * f,
    fat: (it.fat || 0) * f,
  };
};
const mealTotals = (m: Meal) => m.items.reduce((a, it) => {
  const t = itemTotals(it);
  return { kcal: a.kcal + t.kcal, p: a.p + t.p, c: a.c + t.c, fat: a.fat + t.fat };
}, { kcal: 0, p: 0, c: 0, fat: 0 });
const dayTotals = (meals: Meal[]) => meals.reduce((a, m) => {
  const t = mealTotals(m);
  return { kcal: a.kcal + t.kcal, p: a.p + t.p, c: a.c + t.c, fat: a.fat + t.fat };
}, { kcal: 0, p: 0, c: 0, fat: 0 });

const DOW_FULL = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const DOW_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function getScopeLabel(plan: DietPlan) {
  if (plan.scope === "all") return "Todos os dias";
  const d = plan.days || [];
  if (d.length === 0) return "Sem dias";
  if (d.length === 7) return "Todos os dias";
  const weekdays = [1, 2, 3, 4, 5];
  if (d.length === 5 && weekdays.every(x => d.includes(x))) return "Seg — Sex";
  if (d.length === 2 && d.includes(0) && d.includes(6)) return "Fim de semana";
  if (d.length === 1) return DOW_FULL[d[0]];
  return [...d].sort((a, b) => a - b).map(i => DOW_FULL[i].slice(0, 3)).join(" · ");
}

function getScopeShort(plan: DietPlan) {
  if (plan.scope === "all") return "Todos";
  const d = plan.days || [];
  if (d.length === 7) return "Todos";
  if (d.length === 5 && [1, 2, 3, 4, 5].every(x => d.includes(x))) return "Seg–Sex";
  if (d.length === 2 && d.includes(0) && d.includes(6)) return "Fim sem.";
  if (d.length === 1) return DOW_FULL[d[0]].slice(0, 3);
  if (d.length === 0) return "—";
  return `${d.length} dias`;
}

// ─── Inline Components ────────────────────────────────────────────────────────

const InlineInput: React.FC<{
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  onEnter?: () => void;
}> = ({ value, onChange, className = "", placeholder = "", onEnter }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => { setInternalValue(value); }, [value]);

  if (!isEditing) {
    return (
      <span
        onClick={() => setIsEditing(true)}
        className={`cursor-text hover:bg-gray-50 dark:hover:bg-gray-800/50 px-1 -mx-1 rounded transition-colors ${!value ? 'text-gray-400 italic' : ''} ${className}`}
      >
        {value || placeholder}
      </span>
    );
  }

  return (
    <input
      autoFocus
      value={internalValue}
      onChange={e => setInternalValue(e.target.value)}
      onBlur={() => { setIsEditing(false); onChange(internalValue); }}
      onKeyDown={e => {
        if (e.key === 'Enter') { setIsEditing(false); onChange(internalValue); onEnter?.(); }
        if (e.key === 'Escape') { setIsEditing(false); setInternalValue(value); }
      }}
      className={`bg-white dark:bg-gray-900 border border-blue-500 rounded px-1 -mx-1 outline-none ${className}`}
      placeholder={placeholder}
    />
  );
};

// ─── Food Database Logic ──────────────────────────────────────────────────────

const MOCK_FOODS: any[] = [
  { id: "m1",  name: "Arroz branco cozido",         category: "Cereais",     portion_size: 100, portion_unit: "g",     kcal: 128, protein: 2.5,  carbs: 28.1, fat: 0.2 },
  { id: "m5",  name: "Peito de frango grelhado",    category: "Carnes",      portion_size: 100, portion_unit: "g",     kcal: 159, protein: 32.0, carbs: 0,    fat: 3.2 },
  { id: "m9",  name: "Ovo inteiro cozido",          category: "Ovos",        portion_size: 50,  portion_unit: "g",     kcal: 78,  protein: 6.3,  carbs: 0.6,  fat: 5.3 },
  { id: "m22", name: "Banana prata",                category: "Frutas",      portion_size: 100, portion_unit: "g",     kcal: 98,  protein: 1.3,  carbs: 26.0, fat: 0.1 },
  { id: "m34", name: "Whey protein concentrado",    category: "Suplementos", portion_size: 30,  portion_unit: "g",     kcal: 120, protein: 24.0, carbs: 3.0,  fat: 1.5 },
];

const makeItemFromFood = (food: any, qty?: number): FoodItem => ({
  id: uid(),
  food_id: food.id,
  name: food.name,
  qty: qty ?? food.portion_size,
  unit: food.portion_unit,
  portion_size: food.portion_size,
  kcal: food.kcal,
  protein: food.protein,
  carbs: food.carbs,
  fat: food.fat,
});

// ─── Sub-Components ───────────────────────────────────────────────────────────

const FoodCreateForm: React.FC<{ initialName: string; onCreate: (f: any) => void; onCancel: () => void }> = ({ initialName, onCreate, onCancel }) => {
  const [form, setForm] = useState({
    name: initialName,
    portion_size: 100,
    portion_unit: 'g',
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  const isValid = form.name.trim().length > 0 && form.portion_size > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-gray-900 dark:text-white">Novo Alimento</h3>
        <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Nome do Alimento</label>
          <input
            autoFocus
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-50 dark:bg-[#2C2C2E] border border-transparent focus:border-blue-500 rounded-xl px-4 py-2.5 text-[14px] outline-none transition-all"
            placeholder="Ex: Granola Caseira"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Portação Base</label>
            <div className="flex bg-gray-50 dark:bg-[#2C2C2E] rounded-xl overflow-hidden px-3 border border-transparent focus-within:border-blue-500 transition-all">
              <input
                type="number"
                value={form.portion_size === 0 ? '' : form.portion_size}
                onChange={e => setForm({ ...form, portion_size: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                placeholder="0"
                className="w-full bg-transparent py-2.5 text-[14px] outline-none"
              />
              <select 
                value={form.portion_unit}
                onChange={e => setForm({ ...form, portion_unit: e.target.value })}
                className="bg-transparent text-[12px] font-bold text-blue-500 outline-none"
              >
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="un">un</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Calorias (kcal)</label>
            <input
              type="number"
              value={form.kcal === 0 ? '' : form.kcal}
              onChange={e => setForm({ ...form, kcal: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              placeholder="0"
              className="w-full bg-gray-50 dark:bg-[#2C2C2E] border border-transparent focus:border-blue-500 rounded-xl px-4 py-2.5 text-[14px] outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-blue-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Prot (g)
            </label>
            <input
              type="number"
              value={form.protein === 0 ? '' : form.protein}
              onChange={e => setForm({ ...form, protein: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              placeholder="0"
              className="w-full bg-blue-50/30 dark:bg-blue-500/5 border border-transparent focus:border-blue-500 rounded-xl px-3 py-2 text-[13px] outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-teal-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> Carb (g)
            </label>
            <input
              type="number"
              value={form.carbs === 0 ? '' : form.carbs}
              onChange={e => setForm({ ...form, carbs: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              placeholder="0"
              className="w-full bg-teal-50/30 dark:bg-teal-500/5 border border-transparent focus:border-teal-500 rounded-xl px-3 py-2 text-[13px] outline-none transition-all"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-amber-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Gord (g)
            </label>
            <input
              type="number"
              value={form.fat === 0 ? '' : form.fat}
              onChange={e => setForm({ ...form, fat: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
              placeholder="0"
              className="w-full bg-amber-50/30 dark:bg-amber-500/5 border border-transparent focus:border-amber-500 rounded-xl px-3 py-2 text-[13px] outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] transition-all"
        >
          Cancelar
        </button>
        <button
          disabled={!isValid}
          onClick={() => onCreate({ id: uid(), ...form })}
          className="flex-[2] py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-4 h-4" /> Adicionar ao Plano
        </button>
      </div>
    </motion.div>
  );
};

const FoodSearch: React.FC<{ onPick: (f: any) => void; onClose: () => void }> = ({ onPick, onClose }) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;
    const fetchFoods = async () => {
      if (isCreating) return;
      const cleanQ = q.trim();
      
      setLoading(true);
      try {
        let data: any[] | null = null;
        let error: any = null;

        if (cleanQ) {
          // Busca inteligente com ranking por relevância
          const res = await supabase.rpc('search_foods', { p_query: cleanQ, p_limit: 20 });
          data = res.data;
          error = res.error;
        } else {
          // Sem query: lista alfabética com is_common no topo
          const res = await supabase.from('foods').select('*')
            .order('is_common', { ascending: false })
            .order('name')
            .limit(20);
          data = res.data;
          error = res.error;
        }

        if (active) {
          if (!error && data && data.length > 0) {
            setResults(data);
          } else {
            // Se não houver resultados no banco ou der erro, filtra do mock apenas para não ficar vazio no demo
            const filteredMock = MOCK_FOODS.filter(f => 
              f.name.toLowerCase().includes(cleanQ.toLowerCase()) || 
              cleanQ === ""
            );
            setResults(filteredMock);
          }
        }
      } catch (err) {
        console.error("Search error:", err);
        if (active) setResults(MOCK_FOODS.filter(f => f.name.toLowerCase().includes(cleanQ.toLowerCase())));
      } finally {
        if (active) setLoading(false);
      }
    };

    const t = setTimeout(fetchFoods, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [q, isCreating]);

  if (isCreating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-full left-0 mt-2 w-full max-w-md bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] rounded-2xl shadow-2xl z-[150] overflow-hidden"
      >
        <FoodCreateForm initialName={q} onCreate={onPick} onCancel={() => setIsCreating(false)} />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-full left-0 mt-2 w-full max-w-md bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] rounded-2xl shadow-2xl z-[150] overflow-hidden"
    >
      <div className="p-3 border-b border-gray-100 dark:border-[#2C2C2E] flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          autoFocus
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar no banco de alimentos..."
          className="flex-1 bg-transparent outline-none text-[14px]"
        />
        <X onClick={onClose} className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
      <div className="max-h-60 overflow-y-auto overflow-x-hidden">
        {loading && (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
            <div className="text-[12px] text-gray-400">Buscando na base TACO...</div>
          </div>
        )}
        {!loading && results.length === 0 && q.trim().length > 0 && (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-[13px] mb-4">Nenhum alimento encontrado para "{q}"</div>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Criar "{q}" agora
            </button>
          </div>
        )}
        {!loading && (results.length > 0 || q.trim() === "") && (
          <>
            {results.map(f => (
              <button
                key={f.id}
                onClick={() => onPick(f)}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] flex items-center justify-between group transition-colors"
              >
                <div className="min-w-0 flex-1 pr-4">
                  <div className="text-[14px] font-medium truncate flex items-center gap-2">
                    {f.name}
                    {f.is_common && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[9px] font-black rounded uppercase tracking-tighter">
                        ★ Popular
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-400">{f.category}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[13px] font-semibold">{r(f.kcal)} kcal</div>
                  <div className="text-[11px] text-gray-400">/{f.portion_size}{f.portion_unit}</div>
                </div>
              </button>
            ))}
            {q.trim().length > 0 && (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full text-left px-4 py-3 border-t border-gray-100 dark:border-[#2C2C2E] hover:bg-blue-50 dark:hover:bg-blue-500/5 text-blue-500 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-[13px] font-bold">Não encontrou? Criar novo alimento</span>
              </button>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};


const MealCard: React.FC<{
  meal: Meal;
  onUpdate: (m: Meal) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}> = ({ meal, onUpdate, onRemove, onDuplicate }) => {
  const [showSearch, setShowSearch] = useState(false);
  const totals = mealTotals(meal);

  const addItem = (food: any) => {
    onUpdate({ ...meal, items: [...meal.items, makeItemFromFood(food)] });
    setShowSearch(false);
  };

  const updateItem = (id: string, next: FoodItem) => {
    onUpdate({ ...meal, items: meal.items.map(it => it.id === id ? next : it) });
  };

  const removeItem = (id: string) => {
    onUpdate({ ...meal, items: meal.items.filter(it => it.id !== id) });
  };

  return (
    <div id={`meal-${meal.id}`} className={`bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-[#2C2C2E] rounded-[24px] shadow-sm hover:shadow-md transition-all relative ${showSearch ? 'z-[160]' : 'z-auto'}`}>
      <div className="p-4 sm:p-5 border-b border-gray-50 dark:border-[#2C2C2E] flex flex-wrap items-center justify-between gap-4 rounded-t-[24px]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[16px] font-bold text-gray-900 dark:text-white">
              <InlineInput value={meal.name} onChange={v => onUpdate({ ...meal, name: v })} placeholder="Nome da refeição" />
            </div>
            <div className="flex items-center gap-1.5 text-[12px] text-gray-400 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <InlineInput value={meal.time} onChange={v => onUpdate({ ...meal, time: v })} placeholder="00:00" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-blue-50 dark:bg-blue-500/5 text-blue-600 dark:text-blue-400 rounded-lg font-bold text-[13px] tabular-nums">
            {r(totals.kcal)} kcal
          </div>
          <button onClick={onDuplicate} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all">
            <Copy className="w-4 h-4" />
          </button>
          <button onClick={onRemove} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-[#1C1C1E] text-[11px] uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3 font-semibold">Alimento</th>
              <th className="px-5 py-3 font-semibold text-right">Quantidade</th>
              <th className="px-5 py-3 font-semibold text-right">Kcal</th>
              <th className="px-5 py-3 font-semibold text-center hidden sm:table-cell">P · C · G</th>
              <th className="px-5 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-[#2C2C2E]">
            {meal.items.map(item => {
              const itTotal = itemTotals(item);
              return (
                <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-[#2C2C2E]/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="text-[14px] font-medium text-gray-900 dark:text-white">
                      <InlineInput 
                        value={item.name} 
                        onChange={v => updateItem(item.id, { ...item, name: v })} 
                        placeholder="Nome do alimento" 
                      />
                    </div>
                    <div className="text-[11px] text-gray-400 tabular-nums">base {item.portion_size}{item.unit}</div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
              <div className="inline-flex items-center bg-gray-50 dark:bg-[#2C2C2E] rounded-lg px-2 py-1">
                      <input
                        type="number"
                        value={item.qty === 0 ? '' : item.qty}
                        onChange={e => updateItem(item.id, { ...item, qty: e.target.value === '' ? 0 : parseFloat(e.target.value) })}
                        placeholder="0"
                        className="w-12 bg-transparent text-right text-[13px] font-bold outline-none tabular-nums"
                      />
                      <span className="text-[11px] text-gray-400 ml-1 uppercase">{item.unit}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium text-gray-700 dark:text-gray-300 tabular-nums text-[13.5px]">
                    {r(itTotal.kcal)}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <div className="flex justify-center items-center gap-3 text-[11.5px] tabular-nums">
                      <span className="text-blue-500 font-medium">P {r1(itTotal.p)}g</span>
                      <span className="text-teal-500 font-medium">C {r1(itTotal.c)}g</span>
                      <span className="text-amber-500 font-medium">G {r1(itTotal.fat)}g</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 sm:p-5 bg-gray-50/30 dark:bg-transparent border-t border-gray-50 dark:border-[#2C2C2E] relative rounded-b-[24px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 max-w-[300px]">
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-2 text-[13px] font-semibold text-blue-500 hover:text-blue-600 bg-white dark:bg-[#2C2C2E] dark:hover:bg-[#3C3C3E] px-4 py-2 rounded-xl border border-gray-100 dark:border-transparent transition-all"
            >
              <Plus className="w-4 h-4" /> Adicionar alimento
            </button>
            <AnimatePresence>
              {showSearch && <FoodSearch onPick={addItem} onClose={() => setShowSearch(false)} />}
            </AnimatePresence>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Macros da refeição</span>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[13px] font-bold tabular-nums">{r1(totals.p)}<span className="text-[10px] ml-0.5 font-normal text-gray-400">g</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span className="text-[13px] font-bold tabular-nums">{r1(totals.c)}<span className="text-[10px] ml-0.5 font-normal text-gray-400">g</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[13px] font-bold tabular-nums">{r1(totals.fat)}<span className="text-[10px] ml-0.5 font-normal text-gray-400">g</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-[#2C2C2E] flex items-start gap-2">
          <FileText className="w-4 h-4 text-gray-300 mt-1 shrink-0" />
          <div className="flex-1">
            <textarea
              className="w-full bg-transparent border-none outline-none text-[13px] text-gray-500 dark:text-gray-400 resize-none placeholder-gray-300 dark:placeholder-gray-600"
              placeholder="Observações do especialista para esta refeição..."
              value={meal.obs}
              onChange={e => onUpdate({ ...meal, obs: e.target.value })}
              rows={1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const DietPlanEditor: React.FC<DietPlanEditorProps> = ({ patient, onBack }) => {
  const profile = Array.isArray(patient.profiles) ? patient.profiles[0] : (patient.profiles || {});
  const anamnese = patient.anamneses?.[0] || {};

  // Metas calculadas automaticamente a partir do profile (mesma fórmula do FitMind)
  const autoGoals = useMemo(() => calculateAutoGoals({
    weight: profile?.weight,
    height: profile?.height,
    age: profile?.age,
    gender: profile?.gender,
    activityLevel: profile?.activity_level,
  }), [profile]);

  // Targets é STATE — começa com anamnese > auto > defaults; nutri pode editar.
  const [targets, setTargets] = useState<Targets>(() => ({
    kcal: anamnese.target_calories || autoGoals?.calories || 2200,
    protein: anamnese.target_protein || autoGoals?.protein || 165,
    carbs: anamnese.target_carbs || autoGoals?.carbs || 248,
    fat: anamnese.target_fat || autoGoals?.fats || 70,
  }));

  const [showEditTargets, setShowEditTargets] = useState(false);
  const [showConfigDays, setShowConfigDays] = useState(false);

  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [activePlanId, setActivePlanId] = useState<string>("");
  const [activeMealId, setActiveMealId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const activePlan = useMemo(() => plans.find(p => p.id === activePlanId) || plans[0], [plans, activePlanId]);
  const totals = useMemo(() => dayTotals(activePlan?.meals || []), [activePlan]);

  useEffect(() => {
    const userId = patient.user_id || profile?.id;
    if (!userId) return;

    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('user_id', userId)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data?.plan_data?.plans) {
        setPlans(data.plan_data.plans);
        setActivePlanId(data.plan_data.plans[0].id);
        setActiveMealId(data.plan_data.plans[0].meals[0]?.id || "");

        // Se o plano já tem metas salvas, usar elas
        if (data.total_calories || data.total_protein_g || data.total_carbs_g || data.total_fat_g) {
          setTargets((prev) => ({
            kcal: Number(data.total_calories) || prev.kcal,
            protein: Number(data.total_protein_g) || prev.protein,
            carbs: Number(data.total_carbs_g) || prev.carbs,
            fat: Number(data.total_fat_g) || prev.fat,
          }));
        }
      } else {
        const initialPlan: DietPlan = {
          id: uid(), name: "Plano base", scope: "all", days: [0, 1, 2, 3, 4, 5, 6],
          meals: [
            { id: uid(), name: "Café da manhã", time: "07:00", obs: "", items: [] },
            { id: uid(), name: "Almoço", time: "12:30", obs: "", items: [] },
            { id: uid(), name: "Jantar", time: "19:30", obs: "", items: [] },
          ]
        };
        setPlans([initialPlan]);
        setActivePlanId(initialPlan.id);
        setActiveMealId(initialPlan.meals[0].id);
      }
      setLoading(false);
    };
    load();

    // Realtime: se outra fonte (ex: CreateFullPlanModal em outra aba) atualizar
    // o diet_plans deste paciente, recarrega o editor automaticamente.
    const channel = supabase
      .channel(`diet_plans_editor_${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'diet_plans', filter: `user_id=eq.${userId}` },
        () => { load(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [patient, profile]);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    // userId is the ID of the specific target user (patient)
    const userId = patient.user_id || profile?.id || patient.id;
    
    if (!userId) {
      notify("Erro: ID do paciente não identificado");
      setSaving(false);
      return;
    }

    try {
      // 1. Check for existing plan for this user
      const { data: existingPlan, error: fetchError } = await supabase
        .from('diet_plans')
        .select('id')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const dietData = {
        user_id: userId,
        consultation_id: patient.id,
        nutritionist_id: patient.nutritionist_id || '6178130c-e47a-4534-a794-9b80b823766b',
        title: activePlan.name || 'Plano Alimentar',
        plan: {
          plans,
          // Metas configuradas pelo nutri (não os totais somados)
          total_calories: r(targets.kcal),
          total_protein_g: r1(targets.protein),
          total_carbs_g: r1(targets.carbs),
          total_fat_g: r1(targets.fat),
          status: 'active'
        },
        // Top-level: também são as METAS (paciente lê isso pra exibir meta diária)
        total_calories: r(targets.kcal),
        total_protein_g: r1(targets.protein),
        total_carbs_g: r1(targets.carbs),
        total_fat_g: r1(targets.fat),
        plan_data: { plans },
        version: 1,
        status: 'active',
        updated_at: new Date().toISOString(),
        sent_at: new Date().toISOString()
      };

      let saveError;
      if (existingPlan?.id) {
        const { error: updateError } = await supabase
          .from('diet_plans')
          .update(dietData)
          .eq('id', existingPlan.id);
        saveError = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('diet_plans')
          .insert(dietData);
        saveError = insertError;
      }

      if (saveError) throw saveError;
      notify("Dieta publicada com sucesso!");
    } catch (err: any) {
      console.error("Save error:", err);
      notify("Erro ao salvar: " + (err.message || "Erro desconhecido"));
    } finally {
      setSaving(false);
    }
  };

  const addPlan = () => {
    const newPlan: DietPlan = {
      id: uid(), name: `Plano ${plans.length + 1}`, scope: "all", days: [0, 1, 2, 3, 4, 5, 6],
      meals: JSON.parse(JSON.stringify(activePlan.meals)).map((m: any) => ({ ...m, id: uid(), items: [] }))
    };
    setPlans([...plans, newPlan]);
    setActivePlanId(newPlan.id);
    notify("Novo plano criado");
  };

  const duplicatePlan = (id: string) => {
    const src = plans.find(p => p.id === id);
    if (!src) return;
    const dup = JSON.parse(JSON.stringify(src));
    dup.id = uid();
    dup.name = `${src.name} (cópia)`;
    dup.meals.forEach((m: any) => { m.id = uid(); m.items.forEach((i: any) => i.id = uid()); });
    setPlans([...plans, dup]);
    setActivePlanId(dup.id);
    notify("Plano duplicado");
  };

  const updateMeal = (mId: string, next: Meal) => {
    setPlans(ps => ps.map(p => p.id === activePlan.id ? { ...p, meals: p.meals.map(m => m.id === mId ? next : m) } : p));
  };

  const updateActivePlan = (patch: Partial<DietPlan>) => {
    setPlans(ps => ps.map(p => p.id === activePlan.id ? { ...p, ...patch } : p));
  };

  const addMeal = () => {
    const nm = { id: uid(), name: "Nova refeição", time: "--:--", obs: "", items: [] };
    setPlans(ps => ps.map(p => p.id === activePlan.id ? { ...p, meals: [...p.meals, nm] } : p));
    setTimeout(() => scrollToMeal(nm.id), 100);
  };

  const scrollToMeal = (id: string) => {
    const el = document.getElementById(`meal-${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveMealId(id);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-[#0B0C10] flex items-center justify-center z-[250]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-[14px] text-gray-500 font-medium">Carregando plano alimentar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F9FAFC] dark:bg-[#0B0C10] font-sans selection:bg-blue-100 dark:selection:bg-blue-500/30 overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="flex-shrink-0 z-[120] bg-white/98 dark:bg-[#111116]/98 backdrop-blur-xl border-b border-gray-100 dark:border-[#2C2C2E] px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2.5 rounded-2xl bg-gray-50 dark:bg-[#1C1C21] text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-500/20">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Pacientes</span>
              <span className="opacity-30">/</span>
              <span className="text-blue-500">{profile.name}</span>
            </div>
            <h1 className="text-[18px] font-extrabold text-gray-900 dark:text-white leading-tight">Plano Alimentar Estratégico</h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#1C1C21] rounded-xl border border-gray-100 dark:border-transparent text-gray-400">
            <Cloud className="w-3.5 h-3.5" />
            <span className="text-[12px] font-medium">Auto-save ativo</span>
          </div>
          <button className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#1C1C21] text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
            <Printer className="w-5 h-5" />
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-[14px] shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar Plano
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 py-8 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          
          {/* ── Main content (Left) ── */}
          <div className="space-y-8">
            
            {/* Patient Identity Card */}
            <div className="bg-white dark:bg-[#1C1C21] rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-8 border border-gray-100 dark:border-[#2C2C2E] shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[32px] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-500/20">
                  {profile.name?.charAt(0) || 'P'}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white dark:bg-[#2C2C2E] border border-gray-100 dark:border-transparent flex items-center justify-center text-blue-500 shadow-lg">
                  <Database className="w-5 h-5" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 text-gray-400 text-[12px] font-bold uppercase tracking-wider mb-2">
                  <span>ID #{profile.id?.slice(0, 6) || '---'}</span>
                  <span>·</span>
                  <span>{profile.age || '--'} anos</span>
                  <span>·</span>
                  <span>{profile.gender || '---'}</span>
                </div>
                <h2 className="text-[28px] sm:text-[32px] font-black text-gray-900 dark:text-white leading-tight mb-4 tracking-tight">
                  {profile.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[13px] font-bold border border-blue-100 dark:border-blue-500/20 flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" />
                    {anamnese.goal || 'Meta não definida'}
                  </span>
                  <span className="px-4 py-1.5 bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full text-[13px] font-bold border border-teal-100 dark:border-teal-500/20">
                    {profile.weight || '--'} kg
                  </span>
                  <span className="px-4 py-1.5 bg-gray-50 dark:bg-[#2C2C2E] text-gray-500 dark:text-gray-400 rounded-full text-[13px] font-bold">
                    IMC {r1(parseFloat(profile.weight || '0') / Math.pow(parseFloat(profile.height || '1') / 100, 2)) || '--'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pl-0 md:pl-8 border-l-0 md:border-l border-gray-100 dark:border-[#2C2C2E]">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Meta Kcal</span>
                  <span className="text-[22px] font-black tabular-nums">{targets.kcal}<span className="text-[12px] ml-1 font-normal text-gray-400">kcal</span></span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Proteína</span>
                  <span className="text-[22px] font-black tabular-nums">{targets.protein}<span className="text-[12px] ml-1 font-normal text-gray-400">g</span></span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Carbo</span>
                  <span className="text-[22px] font-black tabular-nums">{targets.carbs}<span className="text-[12px] ml-1 font-normal text-gray-400">g</span></span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest leading-none">Gordura</span>
                  <span className="text-[22px] font-black tabular-nums">{targets.fat}<span className="text-[12px] ml-1 font-normal text-gray-400">g</span></span>
                </div>
              </div>
            </div>

            {/* Plan Tabs Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-100 dark:border-[#2C2C2E] gap-4">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mb-px">
                {plans.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlanId(p.id)}
                    className={`relative px-6 py-4 text-[14px] font-bold transition-all whitespace-nowrap flex items-center gap-3 ${
                      activePlanId === p.id 
                        ? 'text-blue-500' 
                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                    }`}
                  >
                    {p.name}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${
                      activePlanId === p.id ? 'bg-blue-500/10' : 'bg-gray-100 dark:bg-[#1C1C21]'
                    }`}>
                      {getScopeShort(p)}
                    </span>
                    {activePlanId === p.id && (
                      <motion.div layoutId="plan-indicator" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
                    )}
                  </button>
                ))}
                <button 
                  onClick={addPlan}
                  className="px-4 py-3 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              <div className="pb-3 flex items-center gap-3 flex-wrap">
                <button onClick={() => duplicatePlan(activePlan.id)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1C1C21] border border-gray-100 dark:border-transparent text-gray-500 hover:text-blue-500 transition-all text-[13px] font-bold rounded-xl shadow-sm">
                  <Copy className="w-4 h-4" /> Duplicar Plano
                </button>
                <button onClick={() => setShowConfigDays(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1C1C21] border border-gray-100 dark:border-transparent text-gray-500 hover:text-blue-500 transition-all text-[13px] font-bold rounded-xl shadow-sm">
                  <Calendar className="w-4 h-4" /> Configurar Dias
                </button>
                <button onClick={() => setShowEditTargets(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-500/15 transition-all text-[13px] font-bold rounded-xl shadow-sm">
                  <Target className="w-4 h-4" /> Editar metas
                </button>
              </div>
            </div>

            {/* Daily Consumption Overview */}
            <div className="bg-white dark:bg-[#1C1C21] rounded-[28px] p-6 border border-gray-100 dark:border-[#2C2C2E] grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1fr_1fr] gap-10 items-center">
              <div className="flex items-center gap-6">
                <div className="relative w-16 h-16 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#F1F5F9" strokeWidth="3" className="dark:stroke-[#2C2C2E]" />
                    <circle 
                      cx="18" cy="18" r="16" fill="none" stroke="#3B82F6" strokeWidth="3" 
                      strokeDasharray="100, 100" 
                      strokeDashoffset={100 - (Math.min(100, (totals.kcal / targets.kcal) * 100))} 
                      strokeLinecap="round" 
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[13px] font-black text-blue-500">
                    {r((totals.kcal / targets.kcal) * 100)}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Calorias do dia</div>
                  <div className="text-[20px] font-black text-gray-900 dark:text-white tabular-nums">
                    {r(totals.kcal)} <span className="text-[13px] font-normal text-gray-400">/ {targets.kcal} kcal</span>
                  </div>
                </div>
              </div>

              {/* Macro Bars */}
              {[
                { label: 'Prot', val: totals.p, target: targets.protein, color: 'bg-blue-500' },
                { label: 'Carbo', val: totals.c, target: targets.carbs, color: 'bg-teal-500' },
                { label: 'Gord', val: totals.fat, target: targets.fat, color: 'bg-amber-500' }
              ].map(m => (
                <div key={m.label} className="w-full">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest mb-2">
                    <span className="text-gray-400">{m.label}</span>
                    <span className="text-gray-900 dark:text-white tabular-nums">{r1(m.val)}g <span className="opacity-40">/ {m.target}g</span></span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 dark:bg-[#111116] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (m.val / m.target) * 100)}%` }}
                      className={`h-full ${m.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Meals Layout Wrapper */}
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start">
              {/* Sticky Meal Rail */}
              <aside className="sticky top-[100px] hidden lg:flex flex-col gap-1">
                <div className="px-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Refeições</div>
                {activePlan.meals.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => scrollToMeal(m.id)}
                    className={`group flex items-center justify-between px-4 py-3 rounded-[14px] text-[13.5px] font-bold transition-all text-left ${
                      activeMealId === m.id 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1C1C21]'
                    }`}
                  >
                    <span className="flex items-center gap-3 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${activeMealId === m.id ? 'bg-white' : 'bg-gray-300'}`} />
                      {m.name}
                    </span>
                    <span className={`text-[11px] tabular-nums font-medium ${activeMealId === m.id ? 'text-white/80' : 'text-gray-400'}`}>
                      {r(mealTotals(m).kcal)} kcal
                    </span>
                  </button>
                ))}
                <button 
                  onClick={addMeal}
                  className="mt-2 flex items-center gap-3 px-4 py-3 rounded-[14px] text-[13px] font-bold text-blue-500 border border-dashed border-blue-200 dark:border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all text-left"
                >
                  <Plus className="w-4 h-4" /> Nova refeição
                </button>
              </aside>

              {/* Meals List */}
              <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                  {activePlan.meals.map(m => (
                    <motion.div
                      key={m.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MealCard
                        meal={m}
                        onUpdate={next => updateMeal(m.id, next)}
                        onRemove={() => {
                          setPlans(ps => ps.map(p => p.id === activePlan.id ? { ...p, meals: p.meals.filter(x => x.id !== m.id) } : p));
                          notify("Refeição removida");
                        }}
                        onDuplicate={() => {
                          const idx = activePlan.meals.findIndex(x => x.id === m.id);
                          const dup = JSON.parse(JSON.stringify(m));
                          dup.id = uid();
                          dup.name = `${m.name} (cópia)`;
                          dup.items.forEach((i: any) => i.id = uid());
                          setPlans(ps => ps.map(p => p.id === activePlan.id ? {
                            ...p, meals: [...p.meals.slice(0, idx + 1), dup, ...p.meals.slice(idx + 1)]
                          } : p));
                          notify("Refeição duplicada");
                        }}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <button 
                  onClick={addMeal}
                  className="w-full py-6 rounded-[28px] border-2 border-dashed border-gray-100 dark:border-[#1C1C21] text-gray-400 hover:text-blue-500 hover:border-blue-200 dark:hover:border-blue-500/20 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-[#1C1C21] text-gray-300 group-hover:text-blue-500 flex items-center justify-center transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-[14px] font-bold">Adicionar nova refeição ao plano alimentar</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Sidebar Stats (Right) ── */}
          <aside className="hidden lg:flex flex-col gap-6">
            <div className="bg-white dark:bg-[#1C1C21] rounded-[28px] p-6 border border-gray-100 dark:border-[#2C2C2E] shadow-sm">
              <h3 className="text-[14px] font-bold mb-5 flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-500" /> Ações do Sistema
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-50 dark:border-[#2C2C2E] hover:border-blue-500 transition-all group text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-bold">Compartilhar</div>
                    <div className="text-[11px] text-gray-400">PDF pelo WhatsApp</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-50 dark:border-[#2C2C2E] hover:border-blue-500 transition-all group text-left">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[13.5px] font-bold">Histórico</div>
                    <div className="text-[11px] text-gray-400">Versões anteriores</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-blue-600 rounded-[28px] p-6 text-white shadow-xl shadow-blue-500/30 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-1/2 -translate-y-1/2" />
               <Utensils className="w-12 h-12 mb-4 opacity-50" />
               <h3 className="text-[18px] font-extrabold mb-1">Dica Pro</h3>
               <p className="text-[13px] text-blue-100 leading-relaxed font-medium">
                 Adicione variações de alimentos para manter a adesão do paciente ao plano no longo prazo.
               </p>
            </div>
          </aside>
        </div>
        </div>
      </div>

      {/* ── Modal: Editar metas ── */}
      <AnimatePresence>
        {showEditTargets && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowEditTargets(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1C1C21] rounded-3xl w-full max-w-[460px] shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-gray-100 dark:border-[#2C2C2E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">Editar metas</h3>
                    <p className="text-[12px] text-gray-500 mt-0.5">Metas diárias do paciente.</p>
                  </div>
                </div>
                <button onClick={() => setShowEditTargets(false)} className="p-1.5 -mr-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-50 dark:hover:bg-[#2C2C2E]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-3">
                {[
                  { key: 'kcal' as const, label: 'Calorias', suffix: 'kcal', color: 'bg-rose-50 text-rose-500 dark:bg-rose-500/10' },
                  { key: 'protein' as const, label: 'Proteínas', suffix: 'g', color: 'bg-blue-50 text-blue-500 dark:bg-blue-500/10' },
                  { key: 'carbs' as const, label: 'Carboidratos', suffix: 'g', color: 'bg-teal-50 text-teal-500 dark:bg-teal-500/10' },
                  { key: 'fat' as const, label: 'Gorduras', suffix: 'g', color: 'bg-amber-50 text-amber-500 dark:bg-amber-500/10' },
                ].map(({ key, label, suffix, color }) => (
                  <div key={key} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold ${color}`}>
                      {suffix}
                    </div>
                    <div className="flex-1">
                      <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wide block mb-1">{label}</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={targets[key] || ''}
                          onChange={(e) => setTargets((t) => ({ ...t, [key]: Number(e.target.value) || 0 }))}
                          className="w-full bg-gray-50 dark:bg-[#0F0F12] border border-gray-200 dark:border-[#2C2C2E] rounded-xl h-[42px] px-3.5 pr-12 text-[14px] font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500"
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">{suffix}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {autoGoals && (
                  <button
                    type="button"
                    onClick={() => setTargets({
                      kcal: autoGoals.calories,
                      protein: autoGoals.protein,
                      carbs: autoGoals.carbs,
                      fat: autoGoals.fats,
                    })}
                    className="w-full mt-2 px-4 py-2.5 bg-gray-50 dark:bg-[#0F0F12] hover:bg-gray-100 dark:hover:bg-[#2C2C2E] text-gray-600 dark:text-gray-300 text-[12px] font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restaurar metas calculadas pelo FitMind
                  </button>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 dark:border-[#2C2C2E] flex justify-end gap-3">
                <button onClick={() => setShowEditTargets(false)} className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2C2C2E] rounded-xl">
                  Cancelar
                </button>
                <button
                  onClick={() => { setShowEditTargets(false); notify('Metas atualizadas. Clique em Publicar para salvar.'); }}
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal: Configurar Dias ── */}
      <AnimatePresence>
        {showConfigDays && activePlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/50 flex items-center justify-center p-4"
            onClick={() => setShowConfigDays(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1C1C21] rounded-3xl w-full max-w-[480px] shadow-2xl"
            >
              <div className="px-6 py-5 border-b border-gray-100 dark:border-[#2C2C2E] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">Configurar dias</h3>
                    <p className="text-[12px] text-gray-500 mt-0.5">Em quais dias da semana este plano se aplica.</p>
                  </div>
                </div>
                <button onClick={() => setShowConfigDays(false)} className="p-1.5 -mr-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-50 dark:hover:bg-[#2C2C2E]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex gap-2">
                  {[
                    { lbl: 'Todos', days: [0,1,2,3,4,5,6], scope: 'all' as const },
                    { lbl: 'Seg–Sex', days: [1,2,3,4,5], scope: 'days' as const },
                    { lbl: 'Fim de semana', days: [0,6], scope: 'days' as const },
                  ].map((preset) => (
                    <button
                      key={preset.lbl}
                      onClick={() => updateActivePlan({ scope: preset.scope, days: preset.days })}
                      className="flex-1 px-3 py-2 text-[12px] font-bold bg-gray-50 dark:bg-[#0F0F12] border border-gray-200 dark:border-[#2C2C2E] hover:border-blue-500 hover:text-blue-500 rounded-xl transition-colors"
                    >
                      {preset.lbl}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wide block mb-2">Personalizado</label>
                  <div className="grid grid-cols-7 gap-2">
                    {DOW_SHORT.map((d, i) => {
                      const selected = activePlan.scope === 'all' || activePlan.days.includes(i);
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            const currentDays = activePlan.scope === 'all' ? [0,1,2,3,4,5,6] : activePlan.days;
                            const newDays = currentDays.includes(i)
                              ? currentDays.filter(x => x !== i)
                              : [...currentDays, i].sort((a,b) => a-b);
                            updateActivePlan({
                              scope: newDays.length === 7 ? 'all' : 'days',
                              days: newDays,
                            });
                          }}
                          className={`aspect-square rounded-xl text-[12px] font-bold transition-all ${
                            selected
                              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                              : 'bg-gray-50 dark:bg-[#0F0F12] text-gray-500 hover:bg-gray-100 dark:hover:bg-[#2C2C2E]'
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl px-4 py-3">
                  <p className="text-[12px] font-bold text-blue-700 dark:text-blue-300">
                    Plano ativo em: {getScopeLabel(activePlan)}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 dark:border-[#2C2C2E] flex justify-end">
                <button
                  onClick={() => { setShowConfigDays(false); notify('Dias atualizados. Clique em Publicar para salvar.'); }}
                  className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-xl transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-[14px] font-bold"
          >
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
