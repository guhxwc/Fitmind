
import { GoogleGenAI } from "@google/genai";
import { supabase } from '../supabaseClient';
import { foodDatabaseService, FoodItem } from './foodDatabaseService';
import type { UserData, DietQuizAnswers, DietPlan, DietDay, DietMeal, DietIngredient } from '../types';

export const dietService = {
  async generateDietPlan(user: UserData, preferences: DietQuizAnswers): Promise<DietPlan> {
    let planStructure: any;

    try {
      // 1. Try calling Supabase Edge Function 'meal-planner'
      const { data, error } = await supabase.functions.invoke('meal-planner', {
        body: {
          user,
          preferences
        }
      });

      if (error) throw error;
      if (!data || !data.days) throw new Error("Invalid response from meal-planner function");
      
      planStructure = data;

    } catch (edgeError) {
      console.warn("Edge Function failed, falling back to client-side AI:", edgeError);
      
      // 2. Fallback: Client-side GoogleGenAI
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const model = "gemini-3.1-flash-lite-preview";

      const prompt = `
        Crie um plano de dieta semanal (7 dias) para um usuário com o seguinte perfil:
        - Nome: ${user.name}
        - Dados: ${user.weight}kg, ${user.height}cm, ${user.age} anos, Nível de Atividade: ${user.activityLevel}
        - Objetivo: Emagrecimento com saúde (foco em GLP-1: Proteína e Fibras)
        - Metas Diárias: ${user.goals.calories} kcal, ${user.goals.protein}g de Proteína
        - Preferência de Complexidade: ${preferences.complexity}
        - Tempo para Cozinhar: ${preferences.cookingTime}
        - Refeições por dia: ${preferences.mealsPerDay}
        - Estilo Alimentar Preferido: ${preferences.dietaryPreference}
        - Alimentos que não gosta: ${preferences.dislikedFoods || 'Nenhum'}
        - Restrições: ${preferences.restrictions.join(', ') || 'Nenhuma'}
        
        Diretrizes de Contexto de Refeição (HORÁRIOS RÍGIDOS):
        - Café da manhã (08:00): Apenas alimentos típicos de café da manhã (ex: ovos, frutas, aveia, iogurte, pão integral, café, leite). PROIBIDO: Macarrão, arroz, feijão, carnes de almoço/jantar.
        - Almoço (12:00): Refeição principal equilibrada (ex: arroz, feijão, carnes magras, saladas, legumes).
        - Lanche da tarde (15:30): Prático e complementar (ex: castanhas, frutas, iogurte, whey protein).
        - Jantar (20:00): Mais leve ou conforme objetivo (ex: sopas, saladas com proteína, omeletes).

        IMPORTANTE:
        1. Você DEVE calcular as porções para atingir as metas diárias de ${user.goals.calories} kcal e ${user.goals.protein}g de Proteína.
        2. Use APENAS alimentos da tabela TACO como base.
        3. Seja específico e não genérico.
        4. Para cada ingrediente, forneça um termo de busca simples e preciso para encontrar no banco de dados (ex: "arroz integral", "peito de frango", "ovo").
        5. Forneça a quantidade em gramas estimada (campo "grams").
        6. NÃO forneça estimativas de calorias ou proteínas. O sistema calculará isso automaticamente a partir do banco de dados.
        7. Interprete nomes de alimentos: remova pontos e caracteres especiais (ex: "Carne. hambúrguer. cru." -> "Hambúrguer bovino").
        
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
                      "searchTerm": "ovo", 
                      "amount": "2 unidades", 
                      "grams": 100,
                      "description": "Ovos mexidos"
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

      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            responseMimeType: "application/json"
          }
        });

        planStructure = JSON.parse(response.text || '{}');
      } catch (aiError) {
        console.error("Client-side AI fallback also failed:", aiError);
        throw edgeError; // Throw original error if fallback fails
      }
    }

    if (!planStructure || !planStructure.days) {
      throw new Error("Failed to generate diet plan structure");
    }

    // 3. Hydrate the plan with real data from Supabase (Common logic)
    const fullDays: DietDay[] = [];

    for (const dayData of planStructure.days) {
      const fullMeals: DietMeal[] = [];
      let dayCalories = 0;
      let dayProtein = 0;

      for (const mealData of dayData.meals) {
        const fullIngredients: DietIngredient[] = [];
        let mealCalories = 0;
        let mealProtein = 0;

        for (const ingData of mealData.ingredients) {
          // Search Supabase for the ingredient
          const searchResults = await foodDatabaseService.searchFood(ingData.searchTerm);
          
          const foodItem = searchResults.length > 0 ? searchResults[0] : null;
          const portionRatio = (ingData.grams || 100) / 100; // Default to 100g if grams missing

          if (foodItem) {
            const calories = (foodItem.calorias || 0) * portionRatio;
            const protein = (foodItem.proteinas || 0) * portionRatio;
            const carbs = (foodItem.carboidratos || 0) * portionRatio;
            const fats = (foodItem.gorduras || 0) * portionRatio;
            const fiber = (foodItem.fibras || 0) * portionRatio;

            fullIngredients.push({
              id: Math.random().toString(36).substr(2, 9),
              foodId: foodItem.id,
              name: foodItem.nome, // Use the database name to be accurate
              amount: ingData.amount, // Keep the display amount
              calories,
              protein,
              carbs,
              fats,
              fiber
            });

            mealCalories += calories;
            mealProtein += protein;
          } else {
             // Fallback: If DB lookup fails, we have no data.
             // We should probably log this or handle it gracefully.
             console.warn(`Food item not found in DB: ${ingData.searchTerm}`);
             
             fullIngredients.push({
              id: Math.random().toString(36).substr(2, 9),
              name: ingData.description || ingData.searchTerm, // Use the AI description
              amount: ingData.amount,
              calories: 0, 
              protein: 0,
              carbs: 0, 
              fats: 0,
              fiber: 0
            });
          }
        }

        fullMeals.push({
          id: Math.random().toString(36).substr(2, 9),
          name: mealData.name,
          time: mealData.time || "08:00", // Use time from AI or fallback
          ingredients: fullIngredients,
          totalCalories: mealCalories,
          totalProtein: mealProtein
        });
        
        dayCalories += mealCalories;
        dayProtein += mealProtein;
      }

      fullDays.push({
        day: dayData.day,
        meals: fullMeals,
        totalCalories: dayCalories,
        totalProtein: dayProtein
      });
    }

    return {
      days: fullDays,
      createdAt: new Date().toISOString()
    };
  },

  async swapIngredient(currentIngredient: DietIngredient, customPreference?: string): Promise<DietIngredient[]> {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
    const model = "gemini-3-flash-preview";

    const prefText = customPreference ? `Preferência/Restrição do usuário: ${customPreference}` : '';

    // 1. Ask AI for alternatives
    const prompt = `
      O usuário quer substituir o ingrediente "${currentIngredient.name}" (aprox. ${currentIngredient.calories}kcal, ${currentIngredient.protein}g prot).
      ${prefText}
      Sugira 3 substitutos saudáveis e nutricionalmente equivalentes.
      
      Para cada substituto, forneça:
      1. Um termo de busca simples para o banco de dados (ex: "batata doce", "ovo", "frango").
      2. A quantidade sugerida (ex: "100g", "2 unidades").
      3. A quantidade em gramas (para cálculo).
      4. Uma estimativa de calorias e proteínas para essa quantidade.

      Retorne APENAS um JSON:
      {
        "suggestions": [
          {
            "searchTerm": "termo de busca",
            "amount": "quantidade sugerida",
            "grams": 100,
            "description": "nome descritivo",
            "estimatedCalories": 100,
            "estimatedProtein": 10
          }
        ]
      }
    `;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        
        const data = JSON.parse(response.text || '{}');
        const suggestions = data.suggestions || [];
        
        const results: DietIngredient[] = [];
        
        for (const sug of suggestions) {
            const items = await foodDatabaseService.searchFood(sug.searchTerm);
            const item = items.length > 0 ? items[0] : null;
            const portionRatio = (sug.grams || 100) / 100;

            if (item) {
                results.push({
                    id: Math.random().toString(36).substr(2, 9),
                    foodId: item.id,
                    name: item.nome,
                    amount: sug.amount,
                    calories: (item.calorias || 0) * portionRatio,
                    protein: (item.proteinas || 0) * portionRatio,
                    carbs: (item.carboidratos || 0) * portionRatio,
                    fats: (item.gorduras || 0) * portionRatio,
                    fiber: (item.fibras || 0) * portionRatio
                });
            } else {
                results.push({
                    id: Math.random().toString(36).substr(2, 9),
                    name: sug.description || sug.searchTerm,
                    amount: sug.amount,
                    calories: sug.estimatedCalories || 0,
                    protein: sug.estimatedProtein || 0,
                    carbs: 0,
                    fats: 0,
                    fiber: 0
                });
            }
        }
        
        return results;

    } catch (error) {
        console.error("Error swapping ingredient:", error);
        return [];
    }
  }
};
