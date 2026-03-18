
import { GoogleGenAI } from "@google/genai";
import type { UserData, DietQuizAnswers, DietPlan, DietDay, DietMeal, DietIngredient } from '../types';

export const dietService = {
  async generateDietPlan(user: UserData, preferences: DietQuizAnswers): Promise<DietPlan> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const model = "gemini-3.1-pro-preview";

      const prompt = `
        Crie um plano de dieta semanal (7 dias) simples e prático para um usuário com o seguinte perfil:
        - Nome: ${user.name}
        - Dados: ${user.weight}kg, ${user.height}cm, ${user.age} anos, Nível de Atividade: ${user.activityLevel}
        - Objetivo: Emagrecimento com saúde
        - Preferência de Complexidade: ${preferences.complexity}
        - Tempo para Cozinhar: ${preferences.cookingTime}
        - Refeições por dia: ${preferences.mealsPerDay}
        - Estilo Alimentar Preferido: ${preferences.dietaryPreference}
        - Alimentos que não gosta: ${preferences.dislikedFoods || 'Nenhum'}
        - Restrições: ${preferences.restrictions.join(', ') || 'Nenhuma'}
        
        Diretrizes de Contexto de Refeição (HORÁRIOS RÍGIDOS):
        - Café da manhã (08:00): Apenas alimentos típicos de café da manhã (ex: ovos, frutas, aveia, iogurte, pão integral, café, leite).
        - Almoço (12:00): Refeição principal equilibrada (ex: arroz, feijão, carnes magras, saladas, legumes).
        - Lanche da tarde (15:30): Prático e complementar (ex: castanhas, frutas, iogurte, whey protein).
        - Jantar (20:00): Mais leve ou conforme objetivo (ex: sopas, saladas com proteína, omeletes).

        IMPORTANTE:
        1. Foque apenas nos NOMES dos pratos e ingredientes (ex: "Arroz integral", "Filé de tilápia grelhado", "Salada de alface e tomate").
        2. Inclua uma estimativa de calorias (em kcal, número inteiro) e proteínas (em gramas, número inteiro) para cada ingrediente.
        3. Seja específico e não genérico.
        4. Forneça uma quantidade sugerida em texto simples (ex: "2 colheres de sopa", "1 filé médio", "1 xícara").
        
        Retorne APENAS um JSON com a seguinte estrutura:
        {
          "days": [
            {
              "day": "Segunda-feira",
              "meals": [
                {
                  "name": "Café da Manhã",
                  "time": "08:00",
                  "ingredients": [
                    { 
                      "name": "Ovos mexidos", 
                      "amount": "2 unidades",
                      "calories": 140,
                      "protein": 12
                    },
                    {
                      "name": "Pão integral",
                      "amount": "2 fatias",
                      "calories": 120,
                      "protein": 4
                    }
                  ]
                },
                {
                  "name": "Almoço",
                  "time": "12:00",
                  "ingredients": []
                },
                {
                  "name": "Lanche da Tarde",
                  "time": "15:30",
                  "ingredients": []
                },
                {
                  "name": "Jantar",
                  "time": "20:00",
                  "ingredients": []
                }
              ]
            }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const planStructure = JSON.parse(response.text || '{}');

      if (!planStructure || !planStructure.days) {
        throw new Error("Failed to generate diet plan structure");
      }

      // Add unique IDs to the generated plan
      const fullDays: DietDay[] = planStructure.days.map((dayData: any) => ({
        day: dayData.day,
        meals: dayData.meals.map((mealData: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: mealData.name,
          time: mealData.time || "08:00",
          ingredients: mealData.ingredients.map((ingData: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: ingData.name,
            amount: ingData.amount,
            calories: ingData.calories,
            protein: ingData.protein
          }))
        }))
      }));

      return {
        days: fullDays,
        createdAt: new Date().toISOString()
      };

    } catch (error) {
      console.error("Error generating diet plan:", error);
      throw error;
    }
  },

  async swapIngredient(currentIngredient: DietIngredient, customPreference?: string): Promise<DietIngredient[]> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const model = "gemini-3.1-pro-preview";

      const prefText = customPreference ? `Preferência/Restrição do usuário: ${customPreference}` : '';

      const prompt = `
        O usuário quer substituir o ingrediente "${currentIngredient.name}" (quantidade: ${currentIngredient.amount}).
        ${prefText}
        Sugira 3 substitutos saudáveis e equivalentes em termos de tipo de alimento.
        
        Para cada substituto, forneça:
        1. O nome do prato/ingrediente.
        2. A quantidade sugerida em texto simples (ex: "100g", "2 unidades", "1 colher").
        3. Uma estimativa de calorias (em kcal, número inteiro).
        4. Uma estimativa de proteínas (em gramas, número inteiro).

        Retorne APENAS um JSON:
        {
          "suggestions": [
            {
              "name": "Batata doce cozida",
              "amount": "1 xícara",
              "calories": 114,
              "protein": 2
            }
          ]
        }
      `;

      const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text || '{}');
      const suggestions = data.suggestions || [];
      
      return suggestions.map((sug: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: sug.name,
          amount: sug.amount,
          calories: sug.calories,
          protein: sug.protein
      }));

    } catch (error) {
        console.error("Error swapping ingredient:", error);
        return [];
    }
  }
};
