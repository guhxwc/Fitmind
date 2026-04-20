import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Flame, Beef, Droplet, Clock, Ban, Wheat, CheckCircle2, ChevronRight, Apple, ShoppingCart, X, Sparkles
} from 'lucide-react';

export const DietPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState(1); // 1 = Monday, typical default
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const shoppingItems = [
    { category: 'Açougue e Ovos', items: ['Ovos', 'Peito de Frango', 'Patinho moído magro', 'Whey Protein Concentrado'] },
    { category: 'Hortifruti', items: ['Mamão Papaya', 'Maçã', 'Brócolis', 'Salada de folhas verdes'] },
    { category: 'Mercearia e Outros', items: ['Pão de Forma integral', 'Arroz Branco', 'Batata Inglesa', 'Café preto', 'Azeite Extravirgem', 'Pasta de Amendoim'] }
  ];

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const rootElement = document.getElementById('root');
    if (rootElement) {
        rootElement.scrollTop = 0;
    }
  }, []);

  const weekDays = [
    { id: 0, label: 'Dom' },
    { id: 1, label: 'Seg' },
    { id: 2, label: 'Ter' },
    { id: 3, label: 'Qua' },
    { id: 4, label: 'Qui' },
    { id: 5, label: 'Sex' },
    { id: 6, label: 'Sáb' },
  ];

  const meals = [
    {
      id: 'm1',
      time: '08:00',
      title: 'Café da Manhã',
      macros: '350 kcal',
      items: [
        '3 Ovos inteiros mexidos ou cozidos',
        '2 Fatias de Pão de Forma integral',
        '100g de Mamão Papaya',
        '1 Xícara de café preto sem açúcar',
      ]
    },
    {
      id: 'm2',
      time: '13:00',
      title: 'Almoço',
      macros: '550 kcal',
      items: [
        '150g de Peito de Frango grelhado',
        '120g de Arroz Branco (pesado cozido)',
        'Salada de folhas verdes à vontade',
        '1 Colher de sopa de Azeite Extravirgem',
      ]
    },
    {
      id: 'm3',
      time: '16:30',
      title: 'Café da Tarde (Pré-treino)',
      macros: '280 kcal',
      items: [
        '1 Scoop (30g) de Whey Protein Concentrado',
        '1 Maçã média',
        '15g de Pasta de Amendoim',
      ]
    },
    {
      id: 'm4',
      time: '20:30',
      title: 'Jantar',
      macros: '450 kcal',
      items: [
        '150g de Patinho moído magro',
        '150g de Batata Inglesa assada ou purê',
        '100g de Brócolis no vapor',
      ]
    }
  ];

  const avoidItems = [
    'Açúcar refinado e doces em geral',
    'Frituras em imersão (ex: batata frita, pastel)',
    'Refrigerantes tradicionais (liberado versão zero)',
    'Bebidas alcoólicas durante a semana de choque',
  ];

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } }
  };

  return (
    <div className="w-full min-h-[100dvh] bg-[#F2F2F7] dark:bg-black font-sans flex justify-center pb-20">
      <div className="w-full max-w-[480px] bg-[#F2F2F7] dark:bg-black relative flex flex-col sm:border-x sm:border-gray-200 dark:sm:border-gray-900">
        
        {/* Glass Header */}
        <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-[#F2F2F7]/80 dark:bg-black/80 backdrop-blur-xl z-50">
          <button 
            onClick={() => navigate('/consultoria-premium')}
            className="w-10 h-10 flex flex-col items-center justify-center -ml-2 rounded-full active:opacity-60 transition-opacity"
          >
            <ChevronLeft className="w-7 h-7 text-[#007AFF]" strokeWidth={2.5} />
          </button>
          <div className="flex flex-col items-center">
            <span className="font-semibold text-[17px] tracking-tight text-gray-900 dark:text-white">Estratégia Nutricional</span>
            <span className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">Fase 1</span>
          </div>
          <div className="w-10" />
        </div>

        <motion.div 
          className="px-5 pt-4 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Weekday Selector */}
          <motion.div variants={itemVariants} className="w-full overflow-x-auto pb-4 scrollbar-hide -mx-5 px-5">
            <div className="flex gap-2.5 min-w-max">
              {weekDays.map((day) => {
                const isActive = activeDay === day.id;
                return (
                  <button
                    key={day.id}
                    onClick={() => setActiveDay(day.id)}
                    className={`flex flex-col items-center justify-center w-14 h-16 rounded-[18px] transition-all active:scale-95 ${
                      isActive 
                        ? 'bg-[#007AFF] shadow-[0_4px_16px_rgba(0,122,255,0.4)] border border-[#007AFF]' 
                        : 'bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-[#2C2C2E] shadow-sm'
                    }`}
                  >
                    <span className={`text-[13px] font-bold tracking-tight ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                      {day.label}
                    </span>
                    {isActive && <div className="w-1 h-1 rounded-full bg-white mt-1" />}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Daily Macros Card */}
          <motion.div variants={itemVariants}>
             <div className="bg-white dark:bg-[#1C1C1E] rounded-[28px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100 dark:border-[#2C2C2E]">
               <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">Metas de Hoje</h3>
                  <div className="flex items-center gap-1.5 bg-[#FF9500]/10 px-2.5 py-1 rounded-full">
                     <Flame className="w-3.5 h-3.5 text-[#FF9500] fill-[#FF9500]" />
                     <span className="text-[#FF9500] text-[13px] font-bold">1.850 kcal</span>
                  </div>
               </div>

               <div className="space-y-4">
                  {/* Protein */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                       <span className="text-[13px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                         <Beef className="w-3.5 h-3.5 text-[#FF2D55]" /> Proteína
                       </span>
                       <span className="text-[13px] font-bold text-gray-900 dark:text-white">160g</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                       <div className="h-full bg-[#FF2D55] w-[80%] rounded-full" />
                    </div>
                  </div>

                  {/* Carbs */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                       <span className="text-[13px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                         <Wheat className="w-3.5 h-3.5 text-[#FFCC00]" /> Carbo
                       </span>
                       <span className="text-[13px] font-bold text-gray-900 dark:text-white">150g</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                       <div className="h-full bg-[#FFCC00] w-[60%] rounded-full" />
                    </div>
                  </div>

                  {/* Fats */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                       <span className="text-[13px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                         <Droplet className="w-3.5 h-3.5 text-[#5856D6] fill-[#5856D6]" /> Gordura
                       </span>
                       <span className="text-[13px] font-bold text-gray-900 dark:text-white">65g</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                       <div className="h-full bg-[#5856D6] w-[45%] rounded-full" />
                    </div>
                  </div>
               </div>
             </div>
          </motion.div>

          {/* Meals List */}
          <motion.div variants={itemVariants} className="space-y-4">
             <h3 className="text-[20px] font-bold text-gray-900 dark:text-white tracking-tight px-1 mt-2">
               Refeições
             </h3>
             
             {meals.map((meal) => (
               <div key={meal.id} className="bg-white dark:bg-[#1C1C1E] rounded-[24px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-[#2C2C2E] overflow-hidden relative group">
                  {/* Left accent line */}
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-[#007AFF] opacity-80" />
                  
                  <div className="flex items-center justify-between mb-4 pl-2">
                     <div>
                       <div className="flex items-center gap-2 mb-0.5">
                         <Clock className="w-3.5 h-3.5 text-[#8E8E93]" />
                         <span className="text-[13px] font-bold text-[#8E8E93]">{meal.time}</span>
                       </div>
                       <h4 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">
                         {meal.title}
                       </h4>
                     </div>
                     <div className="bg-gray-100 dark:bg-[#2C2C2E] px-3 py-1.5 rounded-[12px]">
                        <span className="text-[12px] font-bold text-gray-600 dark:text-gray-300">
                          {meal.macros}
                        </span>
                     </div>
                  </div>

                  <div className="space-y-2.5 pl-2">
                     {meal.items.map((item, idx) => (
                       <div key={idx} className="flex gap-3">
                          <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0 mt-0.5" />
                          <span className="text-[15px] text-gray-600 dark:text-gray-300 font-medium leading-snug">
                             {item}
                          </span>
                       </div>
                     ))}
                  </div>
               </div>
             ))}
          </motion.div>

          {/* Restrictions / Avoid */}
          <motion.div variants={itemVariants} className="pt-2">
             <div className="bg-[#FF3B30]/5 border border-[#FF3B30]/20 rounded-[24px] p-5">
               <div className="flex items-center gap-2 mb-3">
                  <Ban className="w-5 h-5 text-[#FF3B30]" strokeWidth={2.5} />
                  <h3 className="text-[18px] font-bold text-[#FF3B30] tracking-tight">
                    Evitar rigorosamente
                  </h3>
               </div>
               <ul className="space-y-2.5">
                  {avoidItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#FF3B30]/50 mt-2 shrink-0" />
                       <span className="text-[15px] font-medium text-gray-800 dark:text-gray-200 leading-snug">
                         {item}
                       </span>
                    </li>
                  ))}
               </ul>
             </div>
          </motion.div>

          {/* Smart Shopping List Button */}
          <motion.div variants={itemVariants} className="pt-2 pb-10">
             <button 
                onClick={() => setShowShoppingList(true)}
                className="w-full bg-[#34C759] hover:bg-[#2EB850] text-white font-bold py-[16px] rounded-[20px] shadow-[0_4px_16px_rgba(52,199,89,0.3)] flex items-center justify-center gap-2.5 active:scale-95 transition-transform"
             >
                <ShoppingCart className="w-[18px] h-[18px]" strokeWidth={2.5} />
                Gerar Lista de Compras
             </button>
          </motion.div>

        </motion.div>
      </div>

      {/* Shopping List Modal / Bottom Sheet */}
      <AnimatePresence>
        {showShoppingList && (
           <>
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
                 onClick={() => setShowShoppingList(false)}
              />
              <motion.div
                 initial={{ y: '100%' }}
                 animate={{ y: 0 }}
                 exit={{ y: '100%' }}
                 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                 className="fixed bottom-0 left-0 w-full bg-[#F2F2F7] dark:bg-black z-[9999] rounded-t-[32px] sm:max-w-[480px] sm:left-1/2 sm:-translate-x-1/2 flex flex-col pt-3 pb-8 px-5 shadow-2xl max-h-[85vh] border-x border-gray-200 dark:border-gray-900"
              >
                  {/* Handle */}
                  <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-5" />
                  
                  <div className="flex items-center justify-between mb-2">
                     <h2 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">Lista de Compras</h2>
                     <button onClick={() => setShowShoppingList(false)} className="w-[30px] h-[30px] bg-gray-200 dark:bg-[#2C2C2E] rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 active:scale-90 transition-transform">
                        <X className="w-4 h-4" />
                     </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 scrollbar-hide">
                      <p className="text-[15px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 pr-4">
                         Lista de compras gerada a partir dos alimentos necessários para sua dieta:
                      </p>

                      <div className="space-y-6">
                        {shoppingItems.map((group, i) => (
                          <div key={i}>
                             <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight mb-3 pl-1">{group.category}</h3>
                             <div className="bg-white dark:bg-[#1C1C1E] rounded-[20px] overflow-hidden border border-gray-100 dark:border-[#2C2C2E] shadow-sm">
                              {group.items.map((item, j) => {
                                 const isChecked = checkedItems[item];
                                 return (
                                    <div key={item} onClick={() => toggleCheck(item)} className={`flex items-center gap-3 p-4 cursor-pointer active:bg-gray-50 dark:active:bg-[#2C2C2E] transition-colors ${j !== group.items.length - 1 ? 'border-b border-gray-50 dark:border-[#2C2C2E]' : ''}`}>
                                       <div className={`w-[22px] h-[22px] rounded-full border-[2.5px] flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'border-[#34C759] bg-[#34C759]' : 'border-gray-300 dark:border-gray-600'}`}>
                                          {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                                       </div>
                                       <span className={`text-[15px] font-medium flex-1 transition-all ${isChecked ? 'text-gray-400 line-through dark:text-gray-600' : 'text-gray-800 dark:text-gray-200'}`}>
                                          {item}
                                       </span>
                                    </div>
                                 )
                              })}
                           </div>
                        </div>
                      ))}
                      </div>
                  </div>
              </motion.div>
           </>
        )}
      </AnimatePresence>
    </div>
  );
};
