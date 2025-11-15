import React, { useState, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Meal } from '../../types';
import { CameraIcon, PlusIcon, ArrowPathIcon } from '../core/Icons';

// Helper to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

interface CalorieCamModalProps {
  onClose: () => void;
  onAddMeal: (meal: Omit<Meal, 'id' | 'time'>) => void;
}

interface AnalysisResult {
  foodName: string;
  calories: number;
  protein: number;
}

export const CalorieCamModal: React.FC<CalorieCamModalProps> = ({ onClose, onAddMeal }) => {
  const [stage, setStage] = useState<'capture' | 'analyzing' | 'results'>('capture');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImageSrc(imageUrl);
    setStage('analyzing');
    setError(null);

    try {
      const base64Data = await blobToBase64(file);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      const schema = {
        type: Type.OBJECT,
        properties: {
          foodName: { type: Type.STRING, description: "O nome do prato ou dos alimentos principais na imagem. Ex: 'Frango grelhado com brócolis'" },
          calories: { type: Type.NUMBER, description: "Estimativa do total de calorias (kcal) do prato." },
          protein: { type: Type.NUMBER, description: "Estimativa do total de proteína (em gramas) do prato." },
        },
        required: ['foodName', 'calories', 'protein']
      };

      const prompt = "Analise a imagem desta refeição. Identifique os alimentos, estime o total de calorias (kcal) e o total de proteína (em gramas). Seja realista. Se a imagem não contiver comida, retorne valores nulos.";
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
          parts: [
            { inlineData: { mimeType: file.type, data: base64Data } },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
        },
      });

      const result = JSON.parse(response.text) as AnalysisResult;
      setAnalysisResult(result);
      setStage('results');

    } catch (e) {
      console.error("Error analyzing image:", e);
      setError("Não foi possível analisar a imagem. Tente uma foto mais clara ou um prato diferente.");
      setStage('capture');
      setImageSrc(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(event.target.files?.[0] || null);
  };

  const handleAdd = () => {
    if (analysisResult) {
      onAddMeal({
        name: analysisResult.foodName,
        calories: analysisResult.calories,
        protein: analysisResult.protein,
      });
      onClose();
    }
  };
  
  const handleRetry = () => {
    setImageSrc(null);
    setAnalysisResult(null);
    setError(null);
    setStage('capture');
  }

  const renderContent = () => {
    switch (stage) {
      case 'analyzing':
        return (
          <div className="text-center">
            <img src={imageSrc!} alt="Meal to analyze" className="w-full h-64 object-cover rounded-2xl mb-6 animate-pulse" />
            <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin mx-auto"></div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-4">Analisando sua refeição...</h3>
            <p className="text-gray-500 dark:text-gray-400">A IA está calculando as informações nutricionais.</p>
          </div>
        );
      
      case 'results':
        return (
          analysisResult && (
            <div className="animate-fade-in">
              <img src={imageSrc!} alt="Analyzed meal" className="w-full h-56 object-cover rounded-2xl mb-4" />
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nome da Refeição</label>
                <input
                  type="text"
                  value={analysisResult.foodName}
                  onChange={(e) => setAnalysisResult({ ...analysisResult, foodName: e.target.value })}
                  className="w-full p-2 border-b-2 border-gray-200 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none text-xl font-bold bg-transparent text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Calorias (kcal)</label>
                    <input
                      type="number"
                      value={analysisResult.calories}
                      onChange={(e) => setAnalysisResult({ ...analysisResult, calories: parseInt(e.target.value, 10) || 0 })}
                      className="w-full p-2 border-b-2 border-gray-200 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none text-lg font-semibold bg-transparent text-gray-900 dark:text-white"
                    />
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Proteína (g)</label>
                    <input
                      type="number"
                      value={analysisResult.protein}
                      onChange={(e) => setAnalysisResult({ ...analysisResult, protein: parseInt(e.target.value, 10) || 0 })}
                      className="w-full p-2 border-b-2 border-gray-200 dark:border-gray-600 focus:border-black dark:focus:border-white outline-none text-lg font-semibold bg-transparent text-gray-900 dark:text-white"
                    />
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                A análise da IA não foi perfeita? Sinta-se à vontade para corrigir os valores acima antes de adicionar.
              </p>
            </div>
          )
        );

      case 'capture':
      default:
        return (
          <div className="text-center">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-64 bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200/60 dark:hover:bg-gray-700/60 transition-colors"
            >
              <CameraIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              <p className="mt-2 font-semibold text-gray-700 dark:text-gray-300">Toque para enviar uma foto</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Escolha da sua galeria</p>
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {error && <p className="text-red-500 mt-4">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
      <div className="bg-white dark:bg-black w-full max-w-md h-[90%] rounded-t-3xl p-6 flex flex-col animate-slide-up">
        <div className="flex-shrink-0 flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">CalorieCam</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {renderContent()}
        </div>

        {stage === 'results' && (
          <div className="mt-auto pt-6 flex gap-3">
            <button onClick={handleRetry} className="w-1/3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2">
              <ArrowPathIcon className="w-5 h-5" />
              Tentar
            </button>
            <button
              onClick={handleAdd}
              disabled={!analysisResult || !analysisResult.foodName}
              className="w-2/3 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl text-lg font-semibold disabled:bg-gray-300 dark:disabled:bg-gray-600 flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-6 h-6" />
              Adicionar ao Diário
            </button>
          </div>
        )}
      </div>
    </div>
  );
};