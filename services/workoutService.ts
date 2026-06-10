
import type { WorkoutQuizAnswers, WorkoutPlan } from "../types";
import { generateContent } from "./geminiClientService";

function getFallbackWorkoutPlan(answers: WorkoutQuizAnswers): WorkoutPlan {
  const isHome = answers.location === 'Casa';
  const hasEquipment = answers.equipment;
  const days = answers.daysPerWeek || 3;
  const plan: WorkoutPlan = [];

  const homeNoEquipmentExercises = {
    upper: [
      { name: "Flexão de Braços (Push-up)", sets: "3", reps: "12", rest: "60", muscleGroups: ["Peito", "Tríceps", "Ombros"] },
      { name: "Flexão de Braços Corporal Controlada", sets: "3", reps: "15", rest: "60", muscleGroups: ["Peito", "Tríceps"] },
      { name: "Mergulho de Tríceps em Cadeira ou Banco", sets: "3", reps: "12", rest: "60", muscleGroups: ["Tríceps", "Peito"] },
      { name: "Superman (Extensão de Lombar)", sets: "3", reps: "15", rest: "60", muscleGroups: ["Lombar", "Glúteos"] },
      { name: "Prancha Abdominal Isométrica", sets: "3", reps: "45-60s", rest: "45", muscleGroups: ["Abdômen", "Core"] }
    ],
    lower: [
      { name: "Agachamento Livre (Air Squat)", sets: "4", reps: "20", rest: "60", muscleGroups: ["Quadríceps", "Glúteos"] },
      { name: "Afundo Alternado Traseiro", sets: "3", reps: "12", rest: "60", muscleGroups: ["Quadríceps", "Glúteos"] },
      { name: "Elevação Pélvica de Solo (Glute Bridge)", sets: "3", reps: "15", rest: "45", muscleGroups: ["Glúteos"] },
      { name: "Agachamento Búlgaro Corporal", sets: "3", reps: "10", rest: "60", muscleGroups: ["Quadríceps", "Glúteos"] },
      { name: "Elevação de Panturrilha de Pé", sets: "3", reps: "20", rest: "45", muscleGroups: ["Panturrilha"] }
    ],
    fullBody: [
      { name: "Polichinelos (Cardio Ativo)", sets: "3", reps: "45s", rest: "45", muscleGroups: ["Cardio", "Geral"] },
      { name: "Salto de Agachamento (Jump Squat)", sets: "3", reps: "12", rest: "60", muscleGroups: ["Quadríceps", "Cardio"] },
      { name: "Burpees Completos", sets: "3", reps: "10", rest: "60", muscleGroups: ["Full Body", "Cardio"] },
      { name: "Abdominal Remador", sets: "3", reps: "20", rest: "45", muscleGroups: ["Abdômen"] },
      { name: "Prancha com Deslocamento Lateral", sets: "3", reps: "45s", rest: "45", muscleGroups: ["Core"] }
    ]
  };

  const homeWithEquipmentExercises = {
    upper: [
      { name: "Desenvolvimento de Ombros com Halteres", sets: "3", reps: "12", rest: "60", muscleGroups: ["Ombros"] },
      { name: "Remada Curvada com Halteres", sets: "4", reps: "12", rest: "60", muscleGroups: ["Costas", "Bíceps"] },
      { name: "Floor Press (Supino no Chão com Halteres)", sets: "3", reps: "12", rest: "60", muscleGroups: ["Peito", "Tríceps"] },
      { name: "Rosca Direta com Halteres", sets: "3", reps: "12", rest: "45", muscleGroups: ["Bíceps"] },
      { name: "Tríceps Francês com Halter", sets: "3", reps: "12", rest: "60", muscleGroups: ["Tríceps"] }
    ],
    lower: [
      { name: "Agachamento Goblet com Halter", sets: "4", reps: "15", rest: "60", muscleGroups: ["Quadríceps", "Glúteos"] },
      { name: "Stiff Unilateral ou Bilateral com Halteres", sets: "3", reps: "12", rest: "60", muscleGroups: ["Posterior", "Glúteos"] },
      { name: "Passada / Lunge com Halteres", sets: "3", reps: "10", rest: "60", muscleGroups: ["Quadríceps", "Glúteos"] },
      { name: "Elevação Pélvica com Carga do Halter", sets: "3", reps: "15", rest: "60", muscleGroups: ["Glúteos"] },
      { name: "Panturrilhas Unilateral Segurando Halter", sets: "3", reps: "15", rest: "45", muscleGroups: ["Panturrilha"] }
    ],
    fullBody: [
      { name: "Agachamento Goblet Completo", sets: "3", reps: "15", rest: "60", muscleGroups: ["Quadríceps", "Glúteos"] },
      { name: "Remada Alta com Halteres", sets: "3", reps: "12", rest: "60", muscleGroups: ["Ombros", "Costas"] },
      { name: "Desenvolvimento Arnold Sentado", sets: "3", reps: "12", rest: "60", muscleGroups: ["Ombros"] },
      { name: "Abdominal Canivete", sets: "3", reps: "15", rest: "45", muscleGroups: ["Abdômen"] },
      { name: "Prancha com Toque nos Ombros", sets: "3", reps: "45s", rest: "45", muscleGroups: ["Core"] }
    ]
  };

  const gymExercises = {
    push: [
      { name: "Supino Inclinado com Halteres", sets: "4", reps: "10", rest: "90", muscleGroups: ["Peito", "Ombros"] },
      { name: "Crucifixo Reto na Polia", sets: "3", reps: "12", rest: "60", muscleGroups: ["Peito"] },
      { name: "Desenvolvimento com Halteres", sets: "4", reps: "10", rest: "90", muscleGroups: ["Ombros"] },
      { name: "Elevação Lateral com Halteres", sets: "3", reps: "12", rest: "60", muscleGroups: ["Ombros"] },
      { name: "Tríceps Corda na Polia", sets: "3", reps: "12", rest: "60", muscleGroups: ["Tríceps"] }
    ],
    pull: [
      { name: "Puxada Aberta na Polia", sets: "4", reps: "10", rest: "90", muscleGroups: ["Costas", "Bíceps"] },
      { name: "Remada Curvada com Barra", sets: "4", reps: "10", rest: "90", muscleGroups: ["Costas"] },
      { name: "Crucifixo Invertido com Halteres", sets: "3", reps: "12", rest: "60", muscleGroups: ["Posterior de Ombro"] },
      { name: "Rosca Direta com Barra W", sets: "3", reps: "12", rest: "60", muscleGroups: ["Bíceps"] },
      { name: "Abdominal Supra na Polia", sets: "3", reps: "15", rest: "45", muscleGroups: ["Abdômen"] }
    ],
    legs: [
      { name: "Agachamento Livre com Barra", sets: "4", reps: "10", rest: "120", muscleGroups: ["Quadríceps", "Glúteos"] },
      { name: "Leg Press 45º", sets: "4", reps: "10", rest: "90", muscleGroups: ["Quadríceps", "Glúteos"] },
      { name: "Cadeira Extensora", sets: "3", reps: "12", rest: "60", muscleGroups: ["Quadríceps"] },
      { name: "Mesa Flexora", sets: "3", reps: "12", rest: "60", muscleGroups: ["Posterior de Coxa"] },
      { name: "Elevação de Panturrilha Sentado", sets: "4", reps: "15", rest: "45", muscleGroups: ["Panturrilha"] }
    ],
    fullBody: [
      { name: "Agachamento Goblet", sets: "3", reps: "12", rest: "90", muscleGroups: ["Quadríceps"] },
      { name: "Puxada Supinada na Polia", sets: "3", reps: "12", rest: "90", muscleGroups: ["Costas", "Bíceps"] },
      { name: "Supino Reto com Halteres", sets: "3", reps: "12", rest: "90", muscleGroups: ["Peito", "Tríceps"] },
      { name: "Elevação Lateral", sets: "3", reps: "15", rest: "60", muscleGroups: ["Ombros"] },
      { name: "Prancha Abdominal", sets: "3", reps: "60s", rest: "45", muscleGroups: ["Core"] }
    ]
  };

  for (let i = 1; i <= days; i++) {
    let focus = "";
    let exercises: any[] = [];
    
    if (isHome) {
      const source = hasEquipment ? homeWithEquipmentExercises : homeNoEquipmentExercises;
      if (days === 2) {
        if (i === 1) {
          focus = "Membros Superiores & Core";
          exercises = [...source.upper];
        } else {
          focus = "Membros Inferiores & Cardio";
          exercises = [...source.lower];
        }
      } else if (days === 3) {
        if (i === 1) {
          focus = "Membros Superiores & Costas";
          exercises = [...source.upper];
        } else if (i === 2) {
          focus = "Membros Inferiores & Glúteos";
          exercises = [...source.lower];
        } else {
          focus = "Treino Full Body & Cardio";
          exercises = [...source.fullBody];
        }
      } else {
        const cycle = (i - 1) % 3;
        if (cycle === 0) {
          focus = `Treino A - Superiores & Core (Dia ${i})`;
          exercises = [...source.upper];
        } else if (cycle === 1) {
          focus = `Treino B - Inferiores & Cardio (Dia ${i})`;
          exercises = [...source.lower];
        } else {
          focus = `Treino C - Full Body Metabólico (Dia ${i})`;
          exercises = [...source.fullBody];
        }
      }
    } else {
      if (days === 2) {
        if (i === 1) {
          focus = "Superior Completo (Peito/Costa/Braço)";
          exercises = [...gymExercises.push.slice(0, 3), ...gymExercises.pull.slice(0, 2)];
        } else {
          focus = "Inferior Completo & Core";
          exercises = [...gymExercises.legs];
        }
      } else if (days === 3) {
        if (i === 1) {
          focus = "Treino A - Peito, Ombro & Tríceps (Empurrar)";
          exercises = [...gymExercises.push];
        } else if (i === 2) {
          focus = "Treino B - Costas, Bíceps & Core (Puxar)";
          exercises = [...gymExercises.pull];
        } else {
          focus = "Treino C - Coxas, Glúteos & Panturrilhas";
          exercises = [...gymExercises.legs];
        }
      } else {
        const cycle = (i - 1) % 4;
        if (cycle === 0) {
          focus = `Treino A - Peito, Ombro & Tríceps (Dia ${i})`;
          exercises = [...gymExercises.push];
        } else if (cycle === 1) {
          focus = `Treino B - Costas, Bíceps & Core (Dia ${i})`;
          exercises = [...gymExercises.pull];
        } else if (cycle === 2) {
          focus = `Treino C - Pernas Completo (Dia ${i})`;
          exercises = [...gymExercises.legs];
        } else {
          focus = `Treino D - Full Body Intensidade (Dia ${i})`;
          exercises = [...gymExercises.fullBody];
        }
      }
    }

    const finalExercises = exercises.map((ex, idx) => {
      let reps = ex.reps;
      let sets = ex.sets;
      
      if (answers.goal === 'ganhar massa') {
        reps = "8 a 12";
      } else if (answers.goal === 'emagrecer') {
        reps = "15";
      }
      
      if (answers.level === 'Iniciante') {
        sets = "3";
      } else if (answers.level === 'Avançado') {
        sets = "4";
      }

      return {
        id: idx + 1,
        name: ex.name,
        sets: sets,
        reps: reps,
        rest: ex.rest,
        muscleGroups: ex.muscleGroups
      };
    });

    plan.push({
      day: i,
      focus: focus,
      estimatedTime: parseInt(String(answers.duration)) || 45,
      exercises: finalExercises
    });
  }

  return plan;
}

const cleanAndParseJson = (text: string): any => {
  if (!text) return null;
  
  let cleaned = text.trim();
  
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\n?/, "").replace(/\n?```$/, "").trim();
  }
  
  const startArr = cleaned.indexOf('[');
  const startObj = cleaned.indexOf('{');
  const start = (startArr !== -1 && (startObj === -1 || startArr < startObj)) ? startArr : startObj;
  
  const endArr = cleaned.lastIndexOf(']');
  const endObj = cleaned.lastIndexOf('}');
  const end = (endArr !== -1 && (endObj === -1 || endArr > endObj)) ? endArr : endObj;
  
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }
  
  return JSON.parse(cleaned);
};

export const workoutService = {
  generateWorkoutPlan: async (answers: WorkoutQuizAnswers): Promise<WorkoutPlan> => {
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
      2. Cada dia deve ter um "focus" (ex: "Peito e Tríceps") e uma lista de exercícios adequados para o local selecionado (${answers.location}). Se for em casa e o usuário não tiver equipamentos, use apenas exercícios com o peso do corpo.
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
      const response = await generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                day: { type: "NUMBER" },
                focus: { type: "STRING" },
                estimatedTime: { type: "NUMBER" },
                exercises: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      sets: { type: "STRING" },
                      reps: { type: "STRING" },
                      rest: { type: "STRING" },
                      muscleGroups: { type: "ARRAY", items: { type: "STRING" } }
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

      const parsedPlan = cleanAndParseJson(response.text);
      if (Array.isArray(parsedPlan) && parsedPlan.length > 0) {
        return parsedPlan;
      }
      
      throw new Error("Invalid or empty workout plan generated by AI. Using dynamic fallback.");
    } catch (error) {
      console.error("Error generating workout plan via AI, returning custom fallback:", error);
      return getFallbackWorkoutPlan(answers);
    }
  }
};

