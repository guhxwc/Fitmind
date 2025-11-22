
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useAppContext } from './AppContext';
import Portal from './core/Portal';
import { SparklesIcon, CheckCircleIcon } from './core/Icons';
import { supabase } from '../supabaseClient';
import { useToast } from './ToastProvider';

interface SmartLogModalProps {
  onClose: () => void;
}

export const SmartLogModal: React.FC<SmartLogModalProps> = ({ onClose }) => {
  const { userData, setMeals, updateStreak, setCurrentWater, setWeightHistory, setUserData } = useAppContext();
  const { addToast } = useToast();
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    if (!input.trim() || !userData) return;
    
    setIsProcessing(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const schema = {
        type: Type.OBJECT,
        properties: {
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
              },
              required: ['name', 'calories', 'protein'],
            },
          },
          water_liters: { type: Type.NUMBER, description: "Amount of water in liters to ADD to current total. E.g., 0.5" },
          weight_kg: { type: Type.NUMBER, description: "New weight in kg, if mentioned." },
        },
        required: ['meals', 'water_liters'],
      };

      const prompt = `
        Analise o texto do usuário sobre sua ingestão alimentar, água ou peso.
        Extraia os dados estruturados.
        Para alimentos, estime calorias e proteínas se não especificado.
        Para água, converta para litros.
        Para peso, extraia o valor em kg.
        
        Texto do usuário: "${input}"
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const result = JSON.parse(response.text);
      
      // 1. Add Meals
      if (result.meals && result.meals.length > 0) {
          const newMeals = result.meals.map((m: any) => ({
              ...m,
              id: new Date().toISOString() + Math.random(),
              time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          }));
          setMeals(prev => [...prev, ...newMeals]);
      }

      // 2. Update Water
      if (result.water_liters && result.water_liters > 0) {
          setCurrentWater(prev => parseFloat((prev + result.water_liters).toFixed(1)));
      }

      // 3. Update Weight
      if (result.weight_kg && result.weight_kg > 0) {
          setUserData(prev => prev ? ({ ...prev, weight: result.weight_kg }) : null);
          
          // Persist Weight
          const { data: weightData } = await supabase.from('weight_history').insert({ 
              user_id: userData.id, 
              date: new Date().toISOString(), 
              weight: result.weight_kg 
          }).select();
          
          if (weightData) {
             setWeightHistory(prev => [...prev, weightData[0]].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          }
          
          // Update Profile
          await supabase.from('profiles').update({ weight: result.weight_kg }).eq('id', userData.id);
      }

      updateStreak();
      addToast('Registrado com sucesso!', 'success');
      onClose();

    } catch (error) {
      console.error(error);
      addToast('Não entendi. Tente detalhar melhor.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={onClose}>
        <div className="bg-white dark:bg-black w-full max-w-md rounded-t-[32px] p-6 animate-slide-up shadow-2xl relative" onClick={e => e.stopPropagation()}>
            
            <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto mb-6 opacity-50"></div>

            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                    <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Registro Inteligente</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
                    Escreva naturalmente o que comeu, bebeu ou seu peso. A IA organiza tudo para você.
                </p>
            </div>

            <div className="relative mb-6">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ex: Comi 2 ovos mexidos no café e bebi 500ml de água. Também me pesei e estou com 70kg."
                    className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 text-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    autoFocus
                />
            </div>

            <button
                onClick={handleProcess}
                disabled={isProcessing || !input.trim()}
                className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
                {isProcessing ? (
                    <>
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Processando...
                    </>
                ) : (
                    <>
                        Processar com IA
                    </>
                )}
            </button>
        </div>
      </div>
    </Portal>
  );
};
