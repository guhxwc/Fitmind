import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ArrowRight, CheckCircle2, Activity, Scale, Heart, Target,
  Flame, Beef, Apple, Sparkles, FileText, MessageCircle, Smartphone,
  HeartHandshake, Pill, Clock, History, User, Briefcase, Ruler, Sun,
  Moon, Cookie, Wine, Stethoscope, Upload, X, AlertCircle, Info,
} from 'lucide-react';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';
import { openNutriWhatsApp } from '../../services/whatsappService';
import { examsService } from '../../services/materialsExamsService';

interface AnamnesisFormProps {
  onSuccess?: () => void;
  editMode?: boolean;
  skipIntro?: boolean;
}

const HEALTH_CONDITIONS_OPTIONS = [
  'Obesidade', 'Esteatose hepática', 'Diabetes', 'Hipertensão',
  'Hipercolesterolemia', 'Tireoide', 'SOP',
  'Refluxo', 'Colesterol alto', 'Nenhuma',
];

const PREVIOUS_DIETS_OPTIONS = [
  'Low carb', 'Cetogênica', 'Jejum intermitente', 'Mediterrânea',
  'Vegana', 'Vegetariana', 'Dukan', 'Paleo', 'Nunca fiz',
];

const ALCOHOL_TYPES_OPTIONS = [
  'Cerveja', 'Vinho', 'Destilados', 'Coquetéis', 'Outros',
];

const PHYSICAL_ACTIVITIES_OPTIONS = [
  'Musculação', 'Corrida', 'Caminhada', 'Crossfit', 'Pilates',
  'Yoga', 'Bike/ciclismo', 'Natação', 'Lutas', 'Esportes coletivos', 'Outros',
];

const GLP1_OPTIONS = [
  { value: 'ozempic', label: 'Ozempic (semaglutida)' },
  { value: 'mounjaro', label: 'Mounjaro (tirzepatida)' },
  { value: 'wegovy', label: 'Wegovy (semaglutida)' },
  { value: 'saxenda', label: 'Saxenda (liraglutida)' },
  { value: 'trulicity', label: 'Trulicity (dulaglutida)' },
  { value: 'outro', label: 'Outro' },
];

export const AnamnesisForm: React.FC<AnamnesisFormProps> = ({
  onSuccess, editMode = false, skipIntro = false,
}) => {
  const navigate = useNavigate();
  const { userData, session, setConsultationStatus } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 11;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showIntroModal, setShowIntroModal] = useState(
    () => !skipIntro && !editMode && !localStorage.getItem('fitmind_consultation_intro')
  );
  const [loading, setLoading] = useState(editMode);
  const [submitting, setSubmitting] = useState(false);
  const [showWaistInstructions, setShowWaistInstructions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Exames anexados (upload no step 5)
  const [examFiles, setExamFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    // Step 1 — Identificação
    fullName: '', occupation: '', gender: '', age: '',
    // Step 2 — Biometria
    weight: '',
    fastingWeight: '', fastingWeightUnknown: false,
    height: '',
    waistCircumference: '', waistUnknown: false,
    // Step 3 — Objetivo
    objective: '', targetWeight: '', deadline: '',
    // Step 4 — Patologias + medicamento
    healthConditions: [] as string[],
    controlledMedications: '',
    // Step 5 — Exames
    hasRecentExams: '', // 'yes' | 'no'
    // Step 6 — GLP-1
    glp1Status: '', glp1Medication: '', glp1Dose: '', glp1StartDate: '',
    // Step 7 — Atividade física
    practicesPhysicalActivity: '',
    physicalActivities: [] as string[],
    physicalActivityTimes: '',
    // Step 8 — Sono e sol
    wakeUpTime: '', sleepTime: '',
    sleepsWell: '',
    sunExposureHabit: '',
    // Step 9 — Alimentação
    foodRoutineDescription: '',
    typicalMeals: '',
    mealCountPerDay: '',
    sweetsHabit: '', sweetsTime: '',
    allergies: '',
    // Step 10 — Função intestinal
    bowelFunction: '', dailyBowelMovement: '',
    // Step 11 — Álcool + histórico
    alcoholConsumption: '',
    alcoholTypes: [] as string[],
    alcoholFrequencyDetail: '',
    previousDiets: [] as string[],
    mainDifficulties: '',
    waterIntake: '',
  });

  /* ============================================================
     PRÉ-POPULAÇÃO
  ============================================================ */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const loadInitial = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const userId = currentSession?.user?.id || session?.user?.id || userData?.id;
      if (!userId) {
        if (editMode) setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, gender, age, weight, height, target_weight, goal, glp_status')
        .eq('id', userId)
        .maybeSingle();

      let initial: any = {};
      if (profile) {
        initial = {
          fullName: profile.name || '',
          gender: profile.gender?.toLowerCase() || '',
          age: profile.age?.toString() || '',
          weight: profile.weight?.toString() || '',
          height: profile.height?.toString() || '',
          targetWeight: profile.target_weight?.toString() || '',
          glp1Status: profile.glp_status === 'using' ? 'using'
            : profile.glp_status === 'never' ? 'never' : '',
          objective: ['emagrecimento','hipertrofia','recomposicao','performance','saude'].includes(profile.goal)
            ? profile.goal : '',
        };
      }

      if (editMode) {
        const { data: anamnese } = await supabase
          .from('anamneses')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (anamnese) {
          initial = {
            ...initial,
            fullName: profile?.name || initial.fullName,
            occupation: anamnese.occupation || '',
            objective: anamnese.goal || initial.objective || '',
            weight: anamnese.current_weight?.toString() || initial.weight || '',
            fastingWeight: anamnese.fasting_weight?.toString() || '',
            fastingWeightUnknown: !!anamnese.fasting_weight_unknown,
            height: anamnese.height?.toString() || initial.height || '',
            waistCircumference: anamnese.waist_circumference?.toString() || '',
            waistUnknown: !!anamnese.waist_unknown,
            targetWeight: anamnese.target_weight?.toString() || initial.targetWeight || '',
            deadline: anamnese.goal_deadline || '',
            glp1Status: anamnese.glp1_status || initial.glp1Status || '',
            glp1Medication: anamnese.glp1_medication || '',
            glp1Dose: anamnese.glp1_dose || '',
            glp1StartDate: anamnese.glp1_start_date || '',
            healthConditions: Array.isArray(anamnese.health_conditions) ? anamnese.health_conditions : [],
            controlledMedications: anamnese.controlled_medications || '',
            hasRecentExams: anamnese.has_recent_exams === true ? 'yes'
              : anamnese.has_recent_exams === false ? 'no' : '',
            practicesPhysicalActivity: anamnese.practices_physical_activity === true ? 'yes'
              : anamnese.practices_physical_activity === false ? 'no' : '',
            physicalActivities: anamnese.physical_activities_list
              ? anamnese.physical_activities_list.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            physicalActivityTimes: anamnese.physical_activity_times || '',
            wakeUpTime: anamnese.wake_up_time || '',
            sleepTime: anamnese.sleep_time || '',
            sleepsWell: anamnese.sleeps_well || '',
            sunExposureHabit: anamnese.sun_exposure_habit || '',
            foodRoutineDescription: anamnese.food_routine_description || '',
            typicalMeals: anamnese.typical_meals || '',
            mealCountPerDay: anamnese.meal_count_per_day?.toString() || '',
            sweetsHabit: anamnese.sweets_habit === true ? 'yes'
              : anamnese.sweets_habit === false ? 'no' : '',
            sweetsTime: anamnese.sweets_time || '',
            allergies: Array.isArray(anamnese.allergies) ? anamnese.allergies.join(', ') : '',
            bowelFunction: anamnese.bowel_function || '',
            dailyBowelMovement: anamnese.daily_bowel_movement === true ? 'yes'
              : anamnese.daily_bowel_movement === false ? 'no' : '',
            alcoholConsumption: anamnese.alcohol_consumption || '',
            alcoholTypes: anamnese.alcohol_types
              ? anamnese.alcohol_types.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            alcoholFrequencyDetail: anamnese.alcohol_frequency_detail || '',
            previousDiets: Array.isArray(anamnese.food_restrictions) ? anamnese.food_restrictions : [],
            mainDifficulties: anamnese.main_difficulties || '',
            waterIntake: anamnese.water_intake || '',
          };
        }
        setLoading(false);
      }

      setFormData((p) => ({ ...p, ...initial }));
    };

    loadInitial();
    // eslint-disable-next-line
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInArray = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const arr = (prev as any)[field] as string[];
      const isExclusive = value === 'Nenhuma' || value === 'Nunca fiz';
      let newArr: string[];
      if (isExclusive) {
        newArr = arr.includes(value) ? [] : [value];
      } else {
        const filtered = arr.filter((x) => x !== 'Nenhuma' && x !== 'Nunca fiz');
        newArr = filtered.includes(value)
          ? filtered.filter((x) => x !== value)
          : [...filtered, value];
      }
      return { ...prev, [field]: newArr };
    });
  };

  /* ============================================================
     UPLOAD DE EXAMES (step 5)
  ============================================================ */
  const handleAddExamFiles = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    setExamFiles((p) => [...p, ...arr]);
  };

  const removeExamFile = (idx: number) => {
    setExamFiles((p) => p.filter((_, i) => i !== idx));
  };

  /* ============================================================
     SUBMIT
  ============================================================ */
  const submitAnamnesis = async () => {
    setSubmitting(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const userId = currentSession?.user?.id || session?.user?.id || userData?.id;
      if (!userId) {
        alert('Sessão não encontrada.');
        setSubmitting(false);
        return false;
      }

      const { data: consultation } = await supabase
        .from('consultations')
        .select('id, nutritionist_id')
        .eq('user_id', userId)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!consultation) {
        alert('Nenhuma consulta ativa encontrada.');
        setSubmitting(false);
        return false;
      }

      const payload: any = {
        user_id: userId,
        consultation_id: consultation.id,
        // Identificação
        occupation: formData.occupation || null,
        // Objetivo
        goal: formData.objective || null,
        target_weight: parseFloat(formData.targetWeight) || null,
        goal_deadline: formData.deadline || null,
        // Biometria
        current_weight: parseFloat(formData.weight) || null,
        fasting_weight: formData.fastingWeightUnknown ? null : (parseFloat(formData.fastingWeight) || null),
        fasting_weight_unknown: !!formData.fastingWeightUnknown,
        height: parseFloat(formData.height) || null,
        waist_circumference: formData.waistUnknown ? null : (parseFloat(formData.waistCircumference) || null),
        waist_unknown: !!formData.waistUnknown,
        // Saúde
        health_conditions: formData.healthConditions,
        controlled_medications: formData.controlledMedications || null,
        has_recent_exams: formData.hasRecentExams === 'yes' ? true
          : formData.hasRecentExams === 'no' ? false : null,
        // GLP-1
        glp1_status: formData.glp1Status || null,
        glp1_medication: formData.glp1Status === 'never' ? null : formData.glp1Medication || null,
        glp1_dose: formData.glp1Status === 'never' ? null : formData.glp1Dose || null,
        glp1_start_date: formData.glp1Status === 'never' ? null : formData.glp1StartDate || null,
        // Atividade
        practices_physical_activity: formData.practicesPhysicalActivity === 'yes' ? true
          : formData.practicesPhysicalActivity === 'no' ? false : null,
        physical_activities_list: formData.physicalActivities.join(', ') || null,
        physical_activity_times: formData.physicalActivityTimes || null,
        // Sono / sol
        wake_up_time: formData.wakeUpTime || null,
        sleep_time: formData.sleepTime || null,
        sleeps_well: formData.sleepsWell || null,
        sun_exposure_habit: formData.sunExposureHabit || null,
        // Alimentação
        food_routine_description: formData.foodRoutineDescription || null,
        typical_meals: formData.typicalMeals || null,
        meal_count_per_day: formData.mealCountPerDay ? parseInt(formData.mealCountPerDay) : null,
        sweets_habit: formData.sweetsHabit === 'yes' ? true
          : formData.sweetsHabit === 'no' ? false : null,
        sweets_time: formData.sweetsTime || null,
        allergies: formData.allergies
          ? formData.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        // Função intestinal
        bowel_function: formData.bowelFunction || null,
        daily_bowel_movement: formData.dailyBowelMovement === 'yes' ? true
          : formData.dailyBowelMovement === 'no' ? false : null,
        // Álcool
        alcohol_consumption: formData.alcoholConsumption || null,
        alcohol_types: formData.alcoholTypes.join(', ') || null,
        alcohol_frequency_detail: formData.alcoholFrequencyDetail || null,
        // Histórico
        food_restrictions: formData.previousDiets,
        main_difficulties: formData.mainDifficulties || null,
        water_intake: formData.waterIntake || null,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error: anamnesisError } = await supabase
        .from('anamneses')
        .upsert(payload, { onConflict: 'user_id' });

      if (anamnesisError) {
        console.error('Erro ao salvar anamnese:', anamnesisError);
        alert('Erro ao salvar: ' + anamnesisError.message);
        setSubmitting(false);
        return false;
      }

      // Upload dos exames anexados (se tiver) — vão direto pra aba de Exames do nutri
      if (examFiles.length > 0) {
        for (const file of examFiles) {
          try {
            await examsService.create({
              userId,
              nutritionistId: consultation.nutritionist_id || null,
              title: file.name.replace(/\.[^/.]+$/, ''),
              exam_type: 'other',
              exam_date: new Date().toISOString().split('T')[0],
              observations: 'Anexado durante a anamnese.',
              file,
            });
          } catch (uploadErr) {
            console.warn('[AnamnesisForm] erro upload exame:', uploadErr);
          }
        }
      }

      // Atualiza profile
      const profileUpdate: any = { updated_at: new Date().toISOString() };
      if (formData.fullName) profileUpdate.name = formData.fullName;
      if (formData.weight) profileUpdate.weight = parseFloat(formData.weight);
      if (formData.height) profileUpdate.height = parseFloat(formData.height);
      if (formData.age) profileUpdate.age = parseInt(formData.age);
      if (formData.gender) profileUpdate.gender = formData.gender;
      if (formData.targetWeight) profileUpdate.target_weight = parseFloat(formData.targetWeight);
      if (formData.glp1Status) profileUpdate.glp_status = formData.glp1Status;
      if (formData.objective) profileUpdate.goal = formData.objective;
      await supabase.from('profiles').update(profileUpdate).eq('id', userId);

      if (!editMode) {
        await supabase
          .from('consultations')
          .update({ status: 'anamnese_done' })
          .eq('id', consultation.id);
      }

      localStorage.setItem('fitmind_anamnese', JSON.stringify(formData));
      setSubmitting(false);
      return true;
    } catch (err: any) {
      console.error('[AnamnesisForm] submit:', err);
      alert('Erro: ' + (err?.message || 'tente novamente.'));
      setSubmitting(false);
      return false;
    }
  };

  const handleNext = async () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      const ok = await submitAnamnesis();
      if (!ok) return;
      if (editMode) {
        if (onSuccess) {
            onSuccess();
        } else {
            navigate('/consultation');
        }
      } else {
        setShowSuccessModal(true);
      }
    }
  };

  const finalizeAnamnesis = () => {
    localStorage.setItem('fitmind_consultation_waiting', 'true');
    setShowSuccessModal(false);
    setConsultationStatus('anamnese_done');
    if (onSuccess) {
        onSuccess();
    } else {
        navigate('/consultation');
    }
  };

  /* ============================================================
     UI ATOMS
  ============================================================ */
  const OptionCard = ({ icon: Icon, title, description, selected, onClick }: any) => (
    <div onClick={onClick} className={`w-full p-4 rounded-[20px] border-2 transition-all cursor-pointer flex items-center gap-4 ${
      selected ? 'border-[#007AFF] bg-[#007AFF]/5 dark:bg-[#0A84FF]/10'
      : 'border-gray-200 dark:border-[#2C2C2E] bg-white dark:bg-[#1C1C1E] opacity-70 hover:opacity-100'
    }`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${selected ? 'bg-[#007AFF]' : 'bg-gray-100 dark:bg-[#2C2C2E]'}`}>
        <Icon className={`w-6 h-6 ${selected ? 'text-white' : 'text-gray-400'}`} />
      </div>
      <div className="flex-1 text-left">
        <h4 className={`text-[16px] font-bold ${selected ? 'text-[#007AFF] dark:text-[#0A84FF]' : 'text-gray-900 dark:text-white'}`}>{title}</h4>
        {description && <p className="text-[13px] text-gray-500 font-medium leading-tight mt-0.5">{description}</p>}
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? 'border-[#007AFF] bg-[#007AFF]' : 'border-gray-300 dark:border-gray-600'}`}>
        {selected && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />}
      </div>
    </div>
  );

  const StepHeader = ({ icon: Icon, title, subtitle }: any) => (
    <div className="text-center mb-8">
      <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-[#007AFF]" />
      </div>
      <h2 className="text-[26px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">{title}</h2>
      {subtitle && <p className="text-gray-500 text-[15px] font-medium mt-2">{subtitle}</p>}
    </div>
  );

  const PillToggle = ({ value, options, onChange }: any) => (
    <div className="space-y-3">
      {options.map((o: any) => (
        <div key={o.value} onClick={() => onChange(o.value)}
          className={`p-4 rounded-[16px] border-2 cursor-pointer font-semibold transition-all ${
            value === o.value ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
            : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white bg-white dark:bg-[#1C1C1E]'
          }`}>{o.label}</div>
      ))}
    </div>
  );

  const inputCls = "w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-gray-900 dark:text-white outline-none focus:border-[#007AFF] transition-colors placeholder:text-gray-400 placeholder:font-normal";

  const checkboxRow = (label: string, checked: boolean, onChange: (b: boolean) => void) => (
    <button type="button" onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] border transition-all ${
        checked ? 'border-[#007AFF] bg-[#007AFF]/5' : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1C1C1E]'
      }`}>
      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
        checked ? 'border-[#007AFF] bg-[#007AFF]' : 'border-gray-300'
      }`}>
        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      <span className={`text-[13px] font-semibold ${checked ? 'text-[#007AFF]' : 'text-gray-600 dark:text-gray-300'}`}>
        {label}
      </span>
    </button>
  );

  /* ============================================================
     STEPS
  ============================================================ */
  const getStepContent = () => {
    switch (currentStep) {
      // ─── 1. IDENTIFICAÇÃO ───
      case 1:
        return (
          <div className="space-y-6">
            <StepHeader icon={User} title="Quem é você?" subtitle="Vamos começar pelos seus dados" />
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Nome completo</label>
              <input type="text" placeholder="Como aparece no documento" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Ocupação</label>
              <input type="text" placeholder="Ex: Engenheiro, Médica, Estudante..." value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Sexo biológico</label>
              <div className="grid grid-cols-2 gap-3">
                {[{v:'masculino',l:'Masculino'},{v:'feminino',l:'Feminino'}].map((g) => (
                  <button key={g.v} onClick={() => handleChange('gender', g.v)}
                    className={`py-3.5 rounded-[16px] font-bold border-2 transition-all ${
                      formData.gender === g.v ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]'
                      : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-white bg-white dark:bg-[#1C1C1E]'
                    }`}>{g.l}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Idade</label>
              <input type="number" placeholder="Anos" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} className={inputCls} />
            </div>
          </div>
        );

      // ─── 2. BIOMETRIA ───
      case 2:
        return (
          <div className="space-y-5">
            <StepHeader icon={Ruler} title="Suas medidas" subtitle="Pra calcular suas metas com precisão" />

            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Peso atual (kg)</label>
              <input type="number" step="0.1" placeholder="Ex: 78,5" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)} className={inputCls} />
            </div>

            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Peso em jejum (kg)</label>
              <p className="text-[12px] text-gray-500 -mt-1 mb-2">Quanto pesa de manhã, sem ter comido nada</p>
              <input type="number" step="0.1" placeholder="Ex: 77,8" value={formData.fastingWeight}
                disabled={formData.fastingWeightUnknown}
                onChange={(e) => handleChange('fastingWeight', e.target.value)}
                className={`${inputCls} ${formData.fastingWeightUnknown ? 'opacity-40 cursor-not-allowed' : ''}`} />
              <div className="mt-2">
                {checkboxRow('Não sei meu peso em jejum', formData.fastingWeightUnknown, (b) => handleChange('fastingWeightUnknown', b))}
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Altura (cm)</label>
              <input type="number" placeholder="Ex: 175" value={formData.height} onChange={(e) => handleChange('height', e.target.value)} className={inputCls} />
            </div>

            {/* CINTURA com instruções */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300">Circunferência da cintura (cm)</label>
                <button type="button" onClick={() => setShowWaistInstructions(true)} className="text-[12px] font-bold text-[#007AFF] flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Como medir?
                </button>
              </div>
              <p className="text-[12px] text-gray-500 -mt-1 mb-2">Linha da última costela</p>
              <input type="number" step="0.1" placeholder="Ex: 82" value={formData.waistCircumference}
                disabled={formData.waistUnknown}
                onChange={(e) => handleChange('waistCircumference', e.target.value)}
                className={`${inputCls} ${formData.waistUnknown ? 'opacity-40 cursor-not-allowed' : ''}`} />
              <div className="mt-2">
                {checkboxRow('Não sei / não consegui medir', formData.waistUnknown, (b) => handleChange('waistUnknown', b))}
              </div>
            </div>
          </div>
        );

      // ─── 3. OBJETIVO ───
      case 3:
        return (
          <div className="space-y-6">
            <StepHeader icon={Target} title="Qual seu grande alvo?" />
            <div className="space-y-3">
              <OptionCard icon={Flame} title="Emagrecimento" description="Perder gordura com saúde."
                selected={formData.objective === 'emagrecimento'} onClick={() => handleChange('objective', 'emagrecimento')} />
              <OptionCard icon={Beef} title="Hipertrofia" description="Ganho de massa muscular."
                selected={formData.objective === 'hipertrofia'} onClick={() => handleChange('objective', 'hipertrofia')} />
              <OptionCard icon={Activity} title="Performance" description="Melhorar rendimento esportivo."
                selected={formData.objective === 'performance'} onClick={() => handleChange('objective', 'performance')} />
              <OptionCard icon={Heart} title="Saúde" description="Equilíbrio e qualidade de vida."
                selected={formData.objective === 'saude'} onClick={() => handleChange('objective', 'saude')} />
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Peso meta (kg)</label>
                <input type="number" step="0.1" placeholder="Opcional" value={formData.targetWeight} onChange={(e) => handleChange('targetWeight', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Prazo</label>
                <select value={formData.deadline} onChange={(e) => handleChange('deadline', e.target.value)} className={inputCls + ' appearance-none cursor-pointer'}>
                  <option value="">Selecione</option>
                  <option value="3_months">3 meses</option>
                  <option value="6_months">6 meses</option>
                  <option value="1_year">1 ano</option>
                  <option value="no_deadline">Sem prazo</option>
                </select>
              </div>
            </div>
          </div>
        );

      // ─── 4. PATOLOGIAS ───
      case 4:
        return (
          <div className="space-y-6">
            <StepHeader icon={Heart} title="Patologias" subtitle="Tem alguma condição diagnosticada?" />
            <div className="grid grid-cols-2 gap-2">
              {HEALTH_CONDITIONS_OPTIONS.map((c) => {
                const sel = formData.healthConditions.includes(c);
                return (
                  <button key={c} onClick={() => toggleInArray('healthConditions', c)}
                    className={`py-3 px-3 rounded-[14px] border-2 text-[12.5px] font-bold transition-all text-left ${
                      sel ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
                      : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white bg-white dark:bg-[#1C1C1E]'
                    }`}>{c}</button>
                );
              })}
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Toma algum medicamento controlado? Qual?</label>
              <textarea rows={3} placeholder="Ex: Losartana 50mg pela manhã..." value={formData.controlledMedications} onChange={(e) => handleChange('controlledMedications', e.target.value)} className={inputCls + ' resize-none'} />
            </div>
          </div>
        );

      // ─── 5. EXAMES (com upload) ───
      case 5:
        return (
          <div className="space-y-6">
            <StepHeader icon={Stethoscope} title="Exames" subtitle="Fez algum exame recentemente?" />
            <PillToggle value={formData.hasRecentExams} onChange={(v: string) => handleChange('hasRecentExams', v)} options={[
              { value: 'yes', label: 'Sim, fiz exames recentes' },
              { value: 'no', label: 'Não fiz' },
            ]} />

            {formData.hasRecentExams === 'yes' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                <div className="bg-blue-50 dark:bg-[#0A84FF]/10 border border-blue-100 dark:border-[#0A84FF]/20 rounded-[16px] p-4 mb-4">
                  <p className="text-[12.5px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    Anexe os arquivos. Eles serão enviados direto pro Dr. Allan analisar.
                  </p>
                </div>

                <div className="space-y-2 mb-3">
                  {examFiles.map((f, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-[#2C2C2E] rounded-[14px] p-3 flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                      <span className="flex-1 text-[13px] font-semibold text-gray-700 dark:text-white truncate">{f.name}</span>
                      <button onClick={() => removeExamFile(i)} className="p-1.5 hover:bg-white dark:hover:bg-[#1C1C1E] rounded-lg text-gray-400 hover:text-rose-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#007AFF] hover:bg-blue-50/30 rounded-[16px] py-6 flex flex-col items-center gap-2 transition-all">
                  <Upload className="w-6 h-6 text-gray-400" />
                  <span className="text-[13px] font-bold text-gray-700 dark:text-white">Anexar exames</span>
                  <span className="text-[11px] text-gray-500">PDF ou imagem, até 50MB cada</span>
                </button>
                <input ref={fileInputRef} type="file" hidden multiple accept="application/pdf,image/*" onChange={(e) => handleAddExamFiles(e.target.files)} />
              </motion.div>
            )}
          </div>
        );

      // ─── 6. GLP-1 ───
      case 6:
        return (
          <div className="space-y-6">
            <StepHeader icon={Pill} title="Medicamento GLP-1" />
            <div className="bg-blue-50 dark:bg-[#0A84FF]/10 border border-blue-100 dark:border-[#0A84FF]/20 rounded-[16px] p-4">
              <p className="text-[12.5px] text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                <span className="font-bold">GLP-1</span> são medicamentos como <span className="font-bold">Ozempic, Mounjaro e Wegovy</span> que ajudam no emagrecimento controlando a fome.
              </p>
            </div>
            <PillToggle value={formData.glp1Status} onChange={(v: string) => handleChange('glp1Status', v)} options={[
              { value: 'using', label: 'Sim, uso atualmente' },
              { value: 'used_before', label: 'Já usei, parei' },
              { value: 'never', label: 'Nunca usei' },
            ]} />
            {(formData.glp1Status === 'using' || formData.glp1Status === 'used_before') && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Qual?</label>
                  <select value={formData.glp1Medication} onChange={(e) => handleChange('glp1Medication', e.target.value)} className={inputCls + ' appearance-none cursor-pointer'}>
                    <option value="">Selecione</option>
                    {GLP1_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Dose</label>
                    <input type="text" placeholder="Ex: 0.5mg/sem" value={formData.glp1Dose} onChange={(e) => handleChange('glp1Dose', e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Quando começou</label>
                    <input type="month" value={formData.glp1StartDate} onChange={(e) => handleChange('glp1StartDate', e.target.value)} className={inputCls} />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        );

      // ─── 7. ATIVIDADE FÍSICA ───
      case 7:
        return (
          <div className="space-y-6">
            <StepHeader icon={Activity} title="Atividade física" />
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Faz atividades físicas?</label>
              <PillToggle value={formData.practicesPhysicalActivity} onChange={(v: string) => handleChange('practicesPhysicalActivity', v)} options={[
                { value: 'yes', label: 'Sim, pratico' }, { value: 'no', label: 'Não, sou sedentário' },
              ]} />
            </div>
            {formData.practicesPhysicalActivity === 'yes' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 overflow-hidden">
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Quais? (pode marcar várias)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PHYSICAL_ACTIVITIES_OPTIONS.map((a) => {
                      const sel = formData.physicalActivities.includes(a);
                      return (
                        <button key={a} onClick={() => toggleInArray('physicalActivities', a)}
                          className={`py-2.5 px-3 rounded-[14px] border-2 text-[12.5px] font-bold text-left transition-all ${
                            sel ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
                            : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white bg-white dark:bg-[#1C1C1E]'
                          }`}>{a}</button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Que horários treina?</label>
                  <input type="text" placeholder="Ex: Segunda a sexta, 6h-7h da manhã" value={formData.physicalActivityTimes} onChange={(e) => handleChange('physicalActivityTimes', e.target.value)} className={inputCls} />
                </div>
              </motion.div>
            )}
          </div>
        );

      // ─── 8. SONO E SOL ───
      case 8:
        return (
          <div className="space-y-6">
            <StepHeader icon={Moon} title="Sono e exposição ao sol" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Acorda</label>
                <input type="time" value={formData.wakeUpTime} onChange={(e) => handleChange('wakeUpTime', e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Dorme</label>
                <input type="time" value={formData.sleepTime} onChange={(e) => handleChange('sleepTime', e.target.value)} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Dorme bem?</label>
              <PillToggle value={formData.sleepsWell} onChange={(v: string) => handleChange('sleepsWell', v)} options={[
                { value: 'well', label: 'Sim, durmo bem' },
                { value: 'sometimes_difficulty', label: 'Às vezes tenho dificuldade' },
                { value: 'difficulty', label: 'Tenho muita dificuldade' },
              ]} />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Tem hábito de se expor ao sol?</label>
              <PillToggle value={formData.sunExposureHabit} onChange={(v: string) => handleChange('sunExposureHabit', v)} options={[
                { value: 'daily', label: 'Sim, todos os dias' },
                { value: 'often', label: 'Várias vezes na semana' },
                { value: 'sometimes', label: 'Às vezes' },
                { value: 'rare', label: 'Raramente' },
                { value: 'never', label: 'Nunca' },
              ]} />
            </div>
          </div>
        );

      // ─── 9. ALIMENTAÇÃO ───
      case 9:
        return (
          <div className="space-y-6">
            <StepHeader icon={Apple} title="Sua alimentação" />
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Como é sua rotina alimentar?</label>
              <textarea rows={3} placeholder="Ex: Como em horários regulares, só não tomo café da manhã..." value={formData.foodRoutineDescription} onChange={(e) => handleChange('foodRoutineDescription', e.target.value)} className={inputCls + ' resize-none'} />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">O que come normalmente em cada refeição?</label>
              <textarea rows={4} placeholder="Café da manhã: pão e café. Almoço: arroz, feijão, frango..." value={formData.typicalMeals} onChange={(e) => handleChange('typicalMeals', e.target.value)} className={inputCls + ' resize-none'} />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Refeições por dia</label>
              <select value={formData.mealCountPerDay} onChange={(e) => handleChange('mealCountPerDay', e.target.value)} className={inputCls + ' appearance-none cursor-pointer'}>
                <option value="">Selecione</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6 ou mais</option>
              </select>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Tem hábito de comer doces?</label>
              <PillToggle value={formData.sweetsHabit} onChange={(v: string) => handleChange('sweetsHabit', v)} options={[
                { value: 'yes', label: 'Sim' }, { value: 'no', label: 'Não' },
              ]} />
              {formData.sweetsHabit === 'yes' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden mt-3">
                  <label className="block text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">Geralmente que horas?</label>
                  <input type="text" placeholder="Ex: depois do jantar, à tarde..." value={formData.sweetsTime} onChange={(e) => handleChange('sweetsTime', e.target.value)} className={inputCls} />
                </motion.div>
              )}
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Alergias e restrições</label>
              <textarea rows={2} placeholder="Ex: glúten, lactose, frutos do mar..." value={formData.allergies} onChange={(e) => handleChange('allergies', e.target.value)} className={inputCls + ' resize-none'} />
            </div>
          </div>
        );

      // ─── 10. INTESTINO ───
      case 10:
        return (
          <div className="space-y-6">
            <StepHeader icon={Activity} title="Função intestinal" />
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Como normalmente é sua função intestinal?</label>
              <PillToggle value={formData.bowelFunction} onChange={(v: string) => handleChange('bowelFunction', v)} options={[
                { value: 'normal', label: 'Normal, regular' },
                { value: 'constipated', label: 'Constipado (intestino preso)' },
                { value: 'diarrhea', label: 'Diarreico (solto)' },
                { value: 'irregular', label: 'Irregular (varia muito)' },
              ]} />
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Vai ao banheiro todos os dias?</label>
              <PillToggle value={formData.dailyBowelMovement} onChange={(v: string) => handleChange('dailyBowelMovement', v)} options={[
                { value: 'yes', label: 'Sim, todo dia' }, { value: 'no', label: 'Não' },
              ]} />
            </div>
          </div>
        );

      // ─── 11. ÁLCOOL + HISTÓRICO ───
      case 11:
        return (
          <div className="space-y-6">
            <StepHeader icon={Wine} title="Álcool e histórico" subtitle="Pra fechar com tudo" />
            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Ingere bebida alcoólica?</label>
              <PillToggle value={formData.alcoholConsumption} onChange={(v: string) => handleChange('alcoholConsumption', v)} options={[
                { value: 'none', label: 'Não bebo' },
                { value: 'social', label: 'Socialmente' },
                { value: 'weekly', label: 'Toda semana' },
                { value: 'daily', label: 'Diariamente' },
              ]} />
              {formData.alcoholConsumption && formData.alcoholConsumption !== 'none' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden mt-4 space-y-4">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-2">Quais? (pode marcar várias)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ALCOHOL_TYPES_OPTIONS.map((a) => {
                        const sel = formData.alcoholTypes.includes(a);
                        return (
                          <button key={a} onClick={() => toggleInArray('alcoholTypes', a)}
                            className={`py-2.5 px-3 rounded-[14px] border-2 text-[12.5px] font-bold transition-all ${
                              sel ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
                              : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white bg-white dark:bg-[#1C1C1E]'
                            }`}>{a}</button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 dark:text-gray-300 mb-1.5">Detalhe a frequência</label>
                    <input type="text" placeholder="Ex: 2 cervejas no fim de semana" value={formData.alcoholFrequencyDetail} onChange={(e) => handleChange('alcoholFrequencyDetail', e.target.value)} className={inputCls} />
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Quanta água bebe por dia?</label>
              <PillToggle value={formData.waterIntake} onChange={(v: string) => handleChange('waterIntake', v)} options={[
                { value: 'menos_1l', label: 'Menos de 1L' },
                { value: '1_2l', label: '1 a 2L' },
                { value: '2_3l', label: '2 a 3L' },
                { value: 'mais_3l', label: 'Mais de 3L' },
              ]} />
            </div>

            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Já fez essas dietas? (opcional)</label>
              <div className="grid grid-cols-2 gap-2">
                {PREVIOUS_DIETS_OPTIONS.map((d) => {
                  const sel = formData.previousDiets.includes(d);
                  return (
                    <button key={d} onClick={() => toggleInArray('previousDiets', d)}
                      className={`py-2.5 px-3 rounded-[14px] border-2 text-[12.5px] font-bold transition-all ${
                        sel ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]'
                        : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-white bg-white dark:bg-[#1C1C1E]'
                      }`}>{d}</button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Maior dificuldade pra emagrecer (opcional)</label>
              <textarea rows={2} placeholder="Ex: compulsão à noite, falta de tempo..." value={formData.mainDifficulties} onChange={(e) => handleChange('mainDifficulties', e.target.value)} className={inputCls + ' resize-none'} />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: return !!(formData.fullName && formData.gender && formData.age);
      case 2: return !!(formData.weight && formData.height &&
        (formData.fastingWeightUnknown || formData.fastingWeight) &&
        (formData.waistUnknown || formData.waistCircumference));
      case 3: return !!formData.objective;
      case 4: return formData.healthConditions.length > 0;
      case 5: return !!formData.hasRecentExams;
      case 6:
        if (formData.glp1Status === 'using' || formData.glp1Status === 'used_before') return !!formData.glp1Medication;
        return !!formData.glp1Status;
      case 7: return !!formData.practicesPhysicalActivity;
      case 9: return !!formData.mealCountPerDay;
      default: return true;
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  if (loading) {
    return (
      <div className="w-full min-h-[100dvh] bg-[#F2F2F7] dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#007AFF]/20 border-t-[#007AFF] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-[100dvh] bg-[#F2F2F7] dark:bg-black font-sans flex justify-center pb-32">
      <div className="w-full max-w-[480px] bg-[#F2F2F7] dark:bg-black relative flex flex-col sm:border-x sm:border-gray-200 dark:sm:border-gray-900 pb-20">

        <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-xl z-50">
          <button
            onClick={() => {
              if (currentStep > 1) {
                setCurrentStep(currentStep - 1);
              } else {
                if (onSuccess) {
                  onSuccess();
                } else {
                  navigate('/consultation');
                }
              }
            }}
            className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full active:opacity-60"
          >
            <ChevronLeft className="w-7 h-7 text-[#007AFF]" strokeWidth={2.5} />
          </button>
          <div className="flex-1 px-8">
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div className="h-full bg-[#007AFF]" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
            </div>
            <p className="text-center text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
              Passo {currentStep} de {totalSteps}
            </p>
          </div>
          <div className="w-10" />
        </div>

        <div className="px-5 pt-6 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="flex-1">
              {getStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="fixed sm:absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7] dark:from-black dark:via-black to-transparent pt-12 pb-8 px-5 z-40">
          <button onClick={handleNext} disabled={!isStepValid() || submitting}
            className="w-full bg-[#007AFF] disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed hover:bg-[#0066D6] text-white font-bold text-[17px] py-[18px] rounded-[18px] shadow-[0_8px_24px_rgba(0,122,255,0.3)] disabled:shadow-none flex items-center justify-center gap-2 transition-all active:scale-95">
            {submitting ? 'Salvando...' : currentStep === totalSteps ? (editMode ? 'Salvar' : 'Enviar e concluir') : 'Continuar'}
            {!submitting && currentStep !== totalSteps && <ArrowRight className="w-5 h-5 text-white/70" strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {/* Modal instruções da cintura */}
      {showWaistInstructions && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={() => setShowWaistInstructions(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[380px] bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#007AFF] flex items-center justify-center shrink-0">
                <Ruler className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-gray-900 dark:text-white">Como medir a cintura</h3>
                <p className="text-[12px] text-gray-500 mt-0.5">Linha da última costela</p>
              </div>
            </div>
            <ol className="space-y-3 text-[13.5px] font-medium text-gray-700 dark:text-gray-300 leading-relaxed">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#007AFF] font-bold text-[12px] flex items-center justify-center shrink-0">1</span>
                Fique em pé, relaxado, em frente ao espelho.
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#007AFF] font-bold text-[12px] flex items-center justify-center shrink-0">2</span>
                Localize sua última costela (a mais inferior) — passe a fita métrica nessa linha, paralela ao chão.
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#007AFF] font-bold text-[12px] flex items-center justify-center shrink-0">3</span>
                Solte o ar normalmente — sem segurar nem inflar a barriga.
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-[#007AFF] font-bold text-[12px] flex items-center justify-center shrink-0">4</span>
                A fita deve ficar firme mas sem apertar a pele.
              </li>
            </ol>
            <button onClick={() => setShowWaistInstructions(false)} className="w-full mt-5 bg-[#007AFF] text-white font-bold py-3 rounded-[14px] active:scale-95 transition-transform">
              Entendi
            </button>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Modal Intro (igual antes) */}
      {showIntroModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[380px] bg-white dark:bg-[#1C1C1E] rounded-[28px] p-5 shadow-2xl mx-4">
            <div className="bg-[#007AFF]/10 w-11 h-11 rounded-full flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-[#007AFF]" />
            </div>
            <h2 className="text-[20px] font-bold text-gray-900 dark:text-white mb-1.5">Jornada Premium</h2>
            <p className="text-[13px] text-gray-500 mb-5 font-medium">Anamnese clínica completa pra estratégia individual.</p>
            <div className="space-y-3 mb-5">
              {[
                { icon: FileText, title: 'Anamnese clínica', desc: 'Você responde 11 passos sobre saúde, rotina e alimentação.' },
                { icon: MessageCircle, title: 'Agendar consulta', desc: 'Após enviar, marque sua consulta no WhatsApp.' },
                { icon: Smartphone, title: 'Plano no app', desc: 'O Allan envia sua estratégia pelo FitMind.' },
                { icon: HeartHandshake, title: 'Acompanhamento', desc: 'Acompanhamento total via WhatsApp.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-2.5">
                  <item.icon className="w-4 h-4 text-[#007AFF] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-[13px] text-gray-900 dark:text-white">{item.title}</h3>
                    <p className="text-[12px] text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { localStorage.setItem('fitmind_consultation_intro', 'true'); setShowIntroModal(false); }}
              className="w-full bg-[#007AFF] text-white font-bold py-3 rounded-[16px] active:scale-95 transition-transform">
              Iniciar Anamnese
            </button>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Modal Sucesso */}
      {showSuccessModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-[340px] bg-white dark:bg-[#1C1C1E] rounded-[36px] p-6 shadow-2xl text-center mx-4">
            <div className="w-[64px] h-[64px] bg-[#34C759]/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <div className="w-[48px] h-[48px] bg-[#34C759] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={3} />
              </div>
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 dark:text-white mb-2">Anamnese enviada!</h2>
            <p className="text-[14px] font-medium text-gray-500 mb-6">Já está com o Dr. Allan. Mande mensagem pra agendar sua consulta.</p>
            <button
              onClick={() => {
                openNutriWhatsApp({ userId: session?.user?.id, message: 'Olá, concluí minha anamnese no FitMind e gostaria de marcar minha consulta premium.' });
                finalizeAnamnesis();
              }}
              className="w-full bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white font-bold py-[16px] rounded-[20px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_4px_16px_rgba(37,211,102,0.3)] mb-2.5">
              Chamar no WhatsApp
            </button>
            <button onClick={finalizeAnamnesis}
              className="w-full bg-gray-100 dark:bg-[#2C2C2E] text-gray-900 dark:text-white font-bold py-[16px] rounded-[20px] active:scale-95 transition-transform">
              Voltar ao Painel
            </button>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  );
};