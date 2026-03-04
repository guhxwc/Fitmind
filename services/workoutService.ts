
import { GoogleGenAI, Type } from "@google/genai";
import type { WorkoutQuizAnswers, WorkoutPlan } from "../types";

export const workoutService = {
  generateWorkoutPlan: async (answers: WorkoutQuizAnswers): Promise<WorkoutPlan> => {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
    const prompt = `
      Você é um Personal Trainer de elite especializado em musculação e condicionamento físico.
      Crie um plano de treino personalizado baseado nas seguintes informações do usuário:
      
      - Local: ${answers.location}
      - Dias por semana: ${answers.daysPerWeek}
      - Duração da sessão: ${answers.duration} minutos
      - Objetivo: ${answers.goal}
      - Nível: ${answers.level}
      - Biotipo: ${answers.bodyType}
      - Músculos prioritários: ${answers.priorityMuscles.join(', ')}
      - Possui equipamentos (se em casa): ${answers.equipment ? 'Sim' : 'Não'}
      - Preferência de divisão: ${answers.splitPreference}
      - Lesões/Limitações: ${answers.injuries.join(', ')}
      
      Regras para o plano:
      1. O plano deve cobrir todos os dias de treino da semana (de 1 a ${answers.daysPerWeek}).
      2. Cada dia deve ter um "focus" (ex: "Peito e Tríceps") e uma lista de exercícios.
      3. Para cada exercício, forneça: nome, séries (sets), repetições (reps), descanso em segundos (rest) e os grupos musculares (muscleGroups).
      4. O tempo estimado total por sessão deve respeitar os ${answers.duration} minutos.
      5. Se o usuário tiver lesões, evite exercícios que sobrecarreguem essas áreas.
      
      Retorne APENAS um JSON com a seguinte estrutura:
      [
        {
          "day": 1,
          "focus": "Peito e Tríceps",
          "estimatedTime": 60,
          "exercises": [
            { "name": "Supino Reto", "sets": "4", "reps": "10", "rest": "90", "muscleGroups": ["Peito"] }
          ]
        }
      ]
    `;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                focus: { type: Type.STRING },
                estimatedTime: { type: Type.NUMBER },
                exercises: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      sets: { type: Type.STRING },
                      reps: { type: Type.STRING },
                      rest: { type: Type.STRING },
                      muscleGroups: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["name", "sets", "reps", "rest", "muscleGroups"]
                  }
                }
              },
              required: ["day", "focus", "estimatedTime", "exercises"]
            }
          }
        }
      });

      return JSON.parse(response.text || '[]');
    } catch (error) {
      console.error("Error generating workout plan:", error);
      throw error;
    }
  }
};
