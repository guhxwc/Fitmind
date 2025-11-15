import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAppContext } from '../AppContext';
import { WaterDropIcon, FlameIcon, LeafIcon, EditIcon } from '../core/Icons';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; unit: string; progress?: number; color: string }> = ({ icon, title, value, unit, progress, color }) => {
  const progressWidth = progress ? `${progress}%` : '0%';
  return (
    <div className="bg-gray-100/50 dark:bg-gray-800/50 p-4 rounded-2xl flex-1 min-w-[140px]">
      <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
        {icon}
        <span className="ml-2 font-medium">{title}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {value} <span className="text-lg font-medium text-gray-500 dark:text-gray-400">{unit}</span>
      </div>
      {progress !== undefined && (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
          <div className={`h-1.5 rounded-full`} style={{ width: progressWidth, backgroundColor: color }}></div>
        </div>
      )}
    </div>
  );
};

const DonutCard: React.FC<{ icon: React.ReactNode; title: string; value: number; goal: number; unit: string; color: string }> = ({ icon, title, value, goal, unit, color }) => {
  const data = [
    { name: 'completed', value: value, color: color },
    { name: 'remaining', value: Math.max(0, goal - value), color: '#374151' }, // dark:bg-gray-700
  ];

  return (
    <div className="bg-gray-100/50 dark:bg-gray-800/50 p-4 rounded-2xl flex-1 min-w-[140px] text-center h-full flex flex-col">
      <div className="flex items-center justify-center text-gray-500 dark:text-gray-400 mb-2">
        {icon}
        <span className="ml-2 font-medium">{title}</span>
      </div>
      <div className="relative h-24 w-24 mx-auto flex-grow flex items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" dataKey="value" innerRadius={28} outerRadius={38} startAngle={90} endAngle={-270} paddingAngle={0} cornerRadius={5}>
              {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color}/>))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{unit === 'L' ? value.toFixed(1) : value}</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">/ {goal}{unit}</span>
        </div>
      </div>
    </div>
  );
};

const MiniControlButton: React.FC<{onClick: () => void, children: React.ReactNode, position: string, disabled?: boolean}> = ({onClick, children, position, disabled = false}) => (
    <button 
      onClick={!disabled ? onClick : undefined} 
      className={`absolute bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center text-gray-800 dark:text-gray-200 font-bold text-xl shadow-md transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-90 hover:bg-white dark:hover:bg-gray-700' } ${position}`}
      disabled={disabled}
    >
      {children}
    </button>
);

const StreakIndicator: React.FC<{ count: number }> = ({ count }) => {
  const [animate, setAnimate] = useState(false);
  const prevCountRef = useRef(count);

  useEffect(() => {
    if (count > prevCountRef.current) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600); // Animation duration
      return () => clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  return (
    <div className={`flex items-center gap-1 text-lg font-bold ${count > 0 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'}`}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={animate ? 'animate-streak' : ''}>
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
      </svg>
      <span className={animate ? 'animate-streak' : ''}>{count}</span>
    </div>
  );
};


export const SummaryTab: React.FC = () => {
  const { userData, meals, quickAddProtein, setQuickAddProtein, currentWater, setCurrentWater } = useAppContext();

  if (!userData) return null;
  
  const totalProteinFromMeals = meals.reduce((sum, meal) => sum + meal.protein, 0);
  const totalProtein = totalProteinFromMeals + quickAddProtein;

  const handleAddProtein = () => {
    setQuickAddProtein(p => p + 5);
  };

  const handleRemoveProtein = () => {
    setQuickAddProtein(p => Math.max(0, p - 5));
  };
  
  const canRemoveProtein = quickAddProtein > 0;


  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 bg-white dark:bg-black animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Resumo</h1>
            <p className="text-gray-500 dark:text-gray-400">Seu progresso de hoje</p>
        </div>
        <StreakIndicator count={userData.streak} />
      </header>

      <section>
        <div className="bg-gray-100/50 dark:bg-gray-800/50 p-5 rounded-2xl">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Seu Plano Personalizado</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Baseado em suas metas e perfil</p>
                </div>
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                </div>
            </div>
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between items-baseline">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Peso Atual</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userData.weight}kg</p>
                </div>
                 <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Meta Final</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userData.targetWeight}kg</p>
                </div>
            </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
         <div className="bg-gray-100/50 dark:bg-gray-800/50 p-4 rounded-2xl col-span-2">
            <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
                <EditIcon className="w-5 h-5" />
                <span className="ml-2 font-medium">Próxima Aplicação</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{userData.medication.nextApplication}</p>
            <p className="text-gray-500 dark:text-gray-400">Semanalmente</p>
        </div>
        
        <div className="relative">
          <DonutCard icon={<FlameIcon className="w-5 h-5 text-orange-500"/>} title="Proteína" value={totalProtein} goal={userData.goals.protein} unit="g" color="#f97316" />
          <MiniControlButton onClick={handleRemoveProtein} position="bottom-3 left-3" disabled={!canRemoveProtein}>-</MiniControlButton>
          <MiniControlButton onClick={handleAddProtein} position="bottom-3 right-3">+</MiniControlButton>
        </div>
        
        <div className="relative">
          <DonutCard icon={<WaterDropIcon className="w-5 h-5 text-blue-500"/>} title="Água" value={currentWater} goal={userData.goals.water} unit="L" color="#3b82f6" />
          <MiniControlButton onClick={() => setCurrentWater(w => Math.max(0, parseFloat((w - 0.2).toFixed(1))))} position="bottom-3 left-3">-</MiniControlButton>
          <MiniControlButton onClick={() => setCurrentWater(w => parseFloat((w + 0.2).toFixed(1)))} position="bottom-3 right-3">+</MiniControlButton>
        </div>
      </section>

      <section>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Fontes médicas usadas no app</h2>
          <div className="space-y-2">
            <a href="https://www.cnnbrasil.com.br/saude/remedios-para-emagrecer-ozempic-wegovy-e-mounjaro-entenda-semelhancas-e-diferencas/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 dark:text-blue-400 hover:underline">Eficácia e Riscos do GLP-1</a>
            <a href="https://saude.abril.com.br/medicina/o-futuro-do-tratamento-da-obesidade/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 dark:text-blue-400 hover:underline">Futuro do Tratamento da Obesidade</a>
            <a href="https://abeso.org.br/obesidade-e-sindrome-metabolica/calculadora-imc/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 dark:text-blue-400 hover:underline">Medição de Gordura Corporal e IMC</a>
            <a href="https://saude.abril.com.br/medicina/novos-remedios-para-obesidade-o-que-vem-por-ai/" target="_blank" rel="noopener noreferrer" className="block text-blue-600 dark:text-blue-400 hover:underline">Pesquisas sobre Medicamentos GLP-1</a>
          </div>
      </section>
    </div>
  );
};