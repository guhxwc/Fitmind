
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { RefrigeratorIcon, SparklesIcon, ArrowPathIcon } from '../core/Icons';
import Portal from '../core/Portal';
import type { Recipe } from './recipesData';

interface PantryChefModalProps {
  onClose: () => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export const PantryChefModal: React.FC<PantryChefModalProps> = ({ onClose, onSelectRecipe }) => {
  const [ingredients, setIngredients] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!ingredients.trim()) return;
    setIsGenerating(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const schema = {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          ingredients: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          category: { type: Type.STRING, enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'] },
          prepTime: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ['Fácil', 'Médio', 'Difícil'] },
          calories: { type: Type.NUMBER },
          protein: { type: Type.NUMBER },
          rating: { type: Type.NUMBER },
        },
        required: ['name', 'ingredients', 'instructions', 'calories', 'protein', 'prepTime'],
      };

      const prompt = `
        Você é um Chef de Cozinha especializado em nutrição para usuários de medicamentos GLP-1 (como Ozempic/Mounjaro).
        O usuário tem estes ingredientes: "${ingredients}".
        
        Crie UMA receita deliciosa, saudável e rica em proteínas usando principalmente esses ingredientes.
        A receita deve ser fácil de digerir.
        Retorne a resposta estritamente em JSON.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const recipe = JSON.parse(response.text) as Recipe;
      recipe.image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop';
      
      onSelectRecipe(recipe);
      onClose();

    } catch (e) {
      console.error("Error generating recipe:", e);
      setError("Não consegui criar uma receita com esses ingredientes. Tente ser mais específico.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white dark:bg-[#1C1C1E] w-full max-w-md rounded-[32px] p-6 shadow-2xl animate-pop-in" onClick={e => e.stopPropagation()}>
            
            <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                    <RefrigeratorIcon className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">O que tem na geladeira?</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm px-4">
                    Diga quais ingredientes você tem e eu criarei uma receita perfeita para sua dieta.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Ingredientes</label>
                    <textarea 
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        placeholder="Ex: 3 ovos, meio tomate, queijo branco e espinafre..."
                        className="w-full h-32 mt-2 bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600 text-lg"
                        autoFocus
                    />
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl text-red-600 dark:text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !ingredients.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-70 disabled:scale-100"
                >
                    {isGenerating ? (
                        <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            Criando Mágica...
                        </>
                    ) : (
                        <>
                            <SparklesIcon className="w-5 h-5" />
                            Criar Receita
                        </>
                    )}
                </button>
            </div>
            
            <button onClick={onClose} className="w-full mt-4 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-semibold">
                Cancelar
            </button>
        </div>
      </div>
    </Portal>
  );
};
