import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight, CheckCircle2, Activity, Scale, Heart, Target, Flame, Beef, Apple, Moon, BrainCircuit } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { supabase } from '../../supabaseClient';

export const AnamnesisForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const { userData, session, setConsultationStatus } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
     // Step 1
     gender: userData?.gender?.toLowerCase() || '',
     age: userData?.age?.toString() || '',
     weight: userData?.weight?.toString() || '',
     height: userData?.height?.toString() || '',
     // Step 2
     objective: '',
     // Step 3
     activityLevel: '',
     trainingFrequency: '',
     // Step 4
     dietaryPreferences: '',
     dislikes: '',
     allergies: '',
     // Step 5
     medicalHistory: '',
     medications: '',
     // Step 6
     sleep: '',
     stress: '',
     waterIntake: ''
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const rootElement = document.getElementById('root');
    if (rootElement) {
        rootElement.scrollTop = 0;
    }
  }, []);

  const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
     if (currentStep < totalSteps) {
         setCurrentStep(prev => prev + 1);
     } else {
         // Finalizar
         if (session?.user?.id) {
             const { data: consultation } = await supabase.from('consultations').select('id').eq('user_id', session.user.id).single();
             if (consultation) {
                 await supabase.from('anamneses').upsert([{
                     user_id: session.user.id,
                     consultation_id: consultation.id,
                     goal: formData.objective,
                     current_weight: formData.weight,
                     target_weight: null, // Pode ser preenchido se tiver
                     height: formData.height,
                     activity_level: formData.activityLevel,
                     wake_up_time: formData.sleep, // using mapped
                     sleep_time: formData.sleep, // using mapped
                     main_difficulties: formData.stress, // mapped
                     previous_diets: '',
                     food_restrictions: formData.allergies ? [formData.allergies] : [],
                     additional_info: JSON.stringify(formData)
                 }]);
                 await supabase.from('consultations').update({ status: 'anamnese_done' }).eq('id', consultation.id);
                 setConsultationStatus('anamnese_done');
                 if (onSuccess) onSuccess();
             }
         }
         localStorage.setItem('fitmind_anamnese', JSON.stringify(formData));
         setShowSuccessModal(true);
     }
  };

  const OptionCard = ({ icon: Icon, title, description, selected, onClick }: any) => (
      <div 
        onClick={onClick}
        className={`w-full p-4 rounded-[20px] border-2 transition-all cursor-pointer flex items-center gap-4 ${
          selected 
            ? 'border-[#007AFF] bg-[#007AFF]/5 dark:bg-[#0A84FF]/10' 
            : 'border-gray-200 dark:border-[#2C2C2E] bg-white dark:bg-[#1C1C1E] opacity-70 hover:opacity-100'
        }`}
      >
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

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
             <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Scale className="w-8 h-8 text-[#007AFF]" />
                </div>
                <h2 className="text-[26px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">Métricas Básicas</h2>
                <p className="text-gray-500 text-[15px] font-medium mt-2">Para criar uma estratégia milimetricamente exata</p>
             </div>
             <div>
                <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Sexo Biológico</label>
                <div className="grid grid-cols-2 gap-3">
                   <button onClick={() => handleChange('gender', 'masculino')} className={`py-3.5 rounded-[16px] font-bold border-2 transition-all ${formData.gender === 'masculino' ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]' : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-white bg-white dark:bg-[#1C1C1E]'}`}>Masculino</button>
                   <button onClick={() => handleChange('gender', 'feminino')} className={`py-3.5 rounded-[16px] font-bold border-2 transition-all ${formData.gender === 'feminino' ? 'border-[#007AFF] bg-[#007AFF]/10 text-[#007AFF]' : 'border-gray-200 dark:border-gray-800 text-gray-500 dark:text-white bg-white dark:bg-[#1C1C1E]'}`}>Feminino</button>
                </div>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Idade</label>
                    <input type="number" placeholder="Anos" value={formData.age} onChange={(e) => handleChange('age', e.target.value)} className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[16px] px-4 py-3.5 text-[16px] font-medium text-gray-900 dark:text-white outline-none focus:border-[#007AFF] transition-colors" />
                 </div>
                 <div>
                    <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Altura (cm)</label>
                    <input type="number" placeholder="Ex: 175" value={formData.height} onChange={(e) => handleChange('height', e.target.value)} className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[16px] px-4 py-3.5 text-[16px] font-medium text-gray-900 dark:text-white outline-none focus:border-[#007AFF] transition-colors" />
                 </div>
             </div>

             <div>
                <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Peso Atual (kg)</label>
                <input type="number" placeholder="Ex: 78.5" value={formData.weight} onChange={(e) => handleChange('weight', e.target.value)} className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[16px] px-4 py-3.5 text-[16px] font-medium text-gray-900 dark:text-white outline-none focus:border-[#007AFF] transition-colors" />
             </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
             <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Target className="w-8 h-8 text-[#007AFF]" />
                </div>
                <h2 className="text-[26px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">Qual seu grande alvo?</h2>
                <p className="text-gray-500 text-[15px] font-medium mt-2">Escolha seu objetivo principal</p>
             </div>
             
             <div className="space-y-3">
                <OptionCard 
                   icon={Flame} 
                   title="Emagrecimento Acelerado" 
                   description="Perder gordura de forma definitiva secando com saúde."
                   selected={formData.objective === 'emagrecimento'} 
                   onClick={() => handleChange('objective', 'emagrecimento')} 
                />
                <OptionCard 
                   icon={Beef} 
                   title="Hipertrofia Muscular" 
                   description="Ganhos secos focados em aumento de massa magra."
                   selected={formData.objective === 'hipertrofia'} 
                   onClick={() => handleChange('objective', 'hipertrofia')} 
                />
                <OptionCard 
                   icon={Activity} 
                   title="Recomposição Corporal" 
                   description="Perder gordura e ganhar massa simultaneamente."
                   selected={formData.objective === 'recomposicao'} 
                   onClick={() => handleChange('objective', 'recomposicao')} 
                />
             </div>
          </div>
        );
      case 3:
         return (
            <div className="space-y-6">
               <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Activity className="w-8 h-8 text-[#007AFF]" />
                  </div>
                  <h2 className="text-[26px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">Sua Rotina Física</h2>
               </div>
               
               <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">No seu dia a dia de trabalho, você é:</label>
                  <div className="space-y-3">
                     {['Sedentário (Trabalho sentado, escritório)', 'Levemente Ativo (Move-se um pouco)', 'Muito Ativo (Trabalho braçal ou em pé o dia todo)'].map(lvl => (
                        <div key={lvl} onClick={() => handleChange('activityLevel', lvl)} className={`p-4 rounded-[16px] border-2 cursor-pointer font-semibold transition-all ${formData.activityLevel === lvl ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]' : 'border-gray-200 dark:border-gray-800 text-gray-700 bg-white dark:bg-[#1C1C1E]'}`}>
                           {lvl}
                        </div>
                     ))}
                  </div>
               </div>
  
               <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2 mt-4">Qual sua frequência de treino real atual?</label>
                  <div className="space-y-3">
                     {['Não treino ainda', '1 a 2 vezes por semana', '3 a 4 vezes por semana', '5 a 6 vezes por semana'].map(freq => (
                        <div key={freq} onClick={() => handleChange('trainingFrequency', freq)} className={`p-4 rounded-[16px] border-2 cursor-pointer font-semibold transition-all ${formData.trainingFrequency === freq ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]' : 'border-gray-200 dark:border-gray-800 text-gray-700 bg-white dark:bg-[#1C1C1E]'}`}>
                           {freq}
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          );
      case 4:
         return (
            <div className="space-y-6">
               <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Apple className="w-8 h-8 text-[#007AFF]" />
                  </div>
                  <h2 className="text-[26px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">Seu Paladar</h2>
               </div>
               
               <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Restrições ou Alergias (Ex: Glúten, Lactose, Frutos do mar)</label>
                  <textarea rows={3} placeholder="Mencione qualquer alergia que pode te causar mal..." value={formData.allergies} onChange={(e) => handleChange('allergies', e.target.value)} className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-gray-900 dark:text-white outline-none focus:border-[#007AFF] transition-colors resize-none" />
               </div>

               <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">O que você odeia comer e não quer na sua dieta?</label>
                  <textarea rows={3} placeholder="Ex: Odeio batata doce, não consigo comer ovo..." value={formData.dislikes} onChange={(e) => handleChange('dislikes', e.target.value)} className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-gray-900 dark:text-white outline-none focus:border-[#007AFF] transition-colors resize-none" />
               </div>

               <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Prefrências (Ex: Vegano, Vegetariano, Cetogênico)</label>
                  <input type="text" placeholder="Caso tenha alguma restrição de estilo..." value={formData.dietaryPreferences} onChange={(e) => handleChange('dietaryPreferences', e.target.value)} className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-gray-900 dark:text-white outline-none focus:border-[#007AFF]" />
               </div>
            </div>
         );
      case 5:
         return (
            <div className="space-y-6">
               <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Heart className="w-8 h-8 text-[#007AFF]" />
                  </div>
                  <h2 className="text-[26px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">Condições Médicas</h2>
               </div>
               
               <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Tem alguma doença ou patologia? (Ex: Diabetes, Hipertensão, Hipotiroidismo)</label>
                  <textarea rows={4} placeholder="Conte para o Dr. Allan detalhes de qualquer patologia..." value={formData.medicalHistory} onChange={(e) => handleChange('medicalHistory', e.target.value)} className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-gray-900 dark:text-white outline-none focus:border-[#007AFF] transition-colors resize-none" />
               </div>

               <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Uso contínuo de Medicamentos?</label>
                  <textarea rows={3} placeholder="Liste os nomes caso faça uso." value={formData.medications} onChange={(e) => handleChange('medications', e.target.value)} className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-gray-900 dark:text-white outline-none focus:border-[#007AFF] transition-colors resize-none" />
               </div>
            </div>
         );
      case 6:
         return (
            <div className="space-y-6">
               <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-[#007AFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                     <BrainCircuit className="w-8 h-8 text-[#007AFF]" />
                  </div>
                  <h2 className="text-[26px] font-bold text-gray-900 dark:text-white tracking-tight leading-tight">Hábitos e Recuperação</h2>
               </div>
               
               <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">Como é a qualidade do seu sono?</label>
                  <div className="grid grid-cols-1 gap-2">
                     {['Péssimo (Acordo cansado)', 'Regular 5 a 6h', 'Bom (Durmo 7 a 8h)'].map((l) => (
                        <div key={l} onClick={() => handleChange('sleep', l)} className={`p-4 rounded-[16px] border-2 cursor-pointer font-semibold transition-all ${formData.sleep === l ? 'border-[#007AFF] bg-[#007AFF]/5 text-[#007AFF]' : 'border-gray-200 dark:border-gray-800 text-gray-700 bg-white dark:bg-[#1C1C1E]'}`}>
                           {l}
                        </div>
                     ))}
                  </div>
               </div>
               
               <div>
                  <label className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2 mt-2">Dificuldades com estresse ou ansiedade que afetam a comida?</label>
                  <textarea rows={3} placeholder="Ex: Desconto muito em doces a noite..." value={formData.stress} onChange={(e) => handleChange('stress', e.target.value)} className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[16px] px-4 py-3.5 text-[15px] font-medium text-gray-900 dark:text-white outline-none focus:border-[#007AFF] transition-colors resize-none" />
               </div>
            </div>
         );
      default:
        return null;
    }
  };

  const isStepValid = () => {
      // Regras de validação simples por step
      switch(currentStep) {
          case 1: return formData.gender && formData.age && formData.weight && formData.height;
          case 2: return formData.objective;
          case 3: return formData.activityLevel && formData.trainingFrequency;
          default: return true; 
      }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full min-h-[100dvh] bg-[#F2F2F7] dark:bg-black font-sans flex justify-center pb-32">
      <div className="w-full max-w-[480px] bg-[#F2F2F7] dark:bg-black relative flex flex-col sm:border-x sm:border-gray-200 dark:sm:border-gray-900 pb-20">
        
        {/* Transparent Nav Header */}
        <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-xl z-50">
          <button 
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/consultoria-premium')}
            className="w-10 h-10 flex flex-col items-center justify-center -ml-2 rounded-full active:opacity-60 transition-opacity"
          >
            <ChevronLeft className="w-7 h-7 text-[#007AFF]" strokeWidth={2.5} />
          </button>
          
          <div className="flex-1 px-8">
              {/* Progress Bar */}
             <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                 <motion.div 
                     className="h-full bg-[#007AFF]"
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     transition={{ duration: 0.3 }}
                 />
             </div>
             <p className="text-center text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                Passo {currentStep} de {totalSteps}
             </p>
          </div>
          
          <div className="w-10" />
        </div>

        <div className="px-5 pt-6 flex-1 flex flex-col">
          <AnimatePresence mode="wait">
              <motion.div
                 key={currentStep}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.25, ease: "easeOut" }}
                 className="flex-1"
              >
                  {getStepContent()}
              </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Fixed Action Button */}
        <div className="fixed sm:absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7] dark:from-black dark:via-black to-transparent pt-12 pb-8 px-5 z-40">
           <button 
              onClick={handleNext}
              disabled={!isStepValid()}
              className="w-full bg-[#007AFF] disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed hover:bg-[#0066D6] text-white font-bold text-[17px] py-[18px] rounded-[18px] shadow-[0_8px_24px_rgba(0,122,255,0.3)] disabled:shadow-none flex items-center justify-center gap-2 transition-all active:scale-95"
           >
              {currentStep === totalSteps ? 'Enviar e Concluir' : 'Continuar'}
              {currentStep !== totalSteps && <ArrowRight className="w-5 h-5 text-white/70" strokeWidth={2.5} />}
           </button>
        </div>

      </div>

      {showSuccessModal && createPortal(
         <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-0">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
               className="absolute inset-0 bg-black/50 backdrop-blur-md" 
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               className="relative w-full max-w-[340px] bg-white dark:bg-[#1C1C1E] rounded-[36px] p-6 shadow-2xl text-center flex flex-col items-center mx-4"
             >
                <div className="w-[64px] h-[64px] bg-[#34C759]/10 rounded-full flex items-center justify-center mb-5">
                   <div className="w-[48px] h-[48px] bg-[#34C759] rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(52,199,89,0.4)]">
                      <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={3} />
                   </div>
                </div>

                <h2 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight mb-2">Dados Enviados!</h2>
                <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                   Sua anamnese já está com o Dr. Allan. Envie uma mensagem no WhatsApp para agendar sua consulta.
                </p>

                <div className="w-full space-y-2.5">
                   <button 
                      onClick={() => {
                        localStorage.setItem('fitmind_consultation_waiting', 'true');
                        window.open('https://wa.me/5543999142672?text=Ol%C3%A1%2C%20conclu%C3%AD%20minha%20anamnese%20no%20FitMind%20e%20gostaria%20de%20marcar%20minha%20consulta%20premium.', '_blank');
                        setShowSuccessModal(false);
                        navigate('/consultation', { replace: true });
                      }}
                      className="w-full bg-gradient-to-r from-[#25D366] to-[#1DA851] text-white font-bold border-none py-[16px] rounded-[20px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_4px_16px_rgba(37,211,102,0.3)] text-[15px]"
                   >
                      Chamar no WhatsApp
                   </button>
                   <button 
                      onClick={() => {
                        localStorage.setItem('fitmind_consultation_waiting', 'true');
                        setShowSuccessModal(false);
                        navigate('/consultation', { replace: true });
                      }}
                      className="w-full bg-gray-100 dark:bg-[#2C2C2E] text-gray-900 dark:text-white font-bold py-[16px] rounded-[20px] flex items-center justify-center active:scale-95 transition-transform text-[15px]"
                   >
                      Voltar ao Painel
                   </button>
                </div>
             </motion.div>
         </div>,
         document.body
      )}
    </div>
  );
};
