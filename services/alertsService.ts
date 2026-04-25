import { GoogleGenAI, Type } from "@google/genai";
import { supabase } from "../supabaseClient";

export interface PatientAlert {
  title: string;
  subtitle: string;
  severity: "high" | "medium" | "low";
  icon: "weight" | "protein" | "water" | "energy" | "hunger" | "general";
}

/**
 * Busca o snapshot do paciente e pergunta pro Gemini os 3 maiores riscos
 * atuais. Salva/atualiza em patient_alerts e retorna a lista.
 */
export const alertsService = {
  async loadAlerts(userId: string): Promise<{ alerts: PatientAlert[]; generatedAt: string | null }> {
    const { data } = await supabase
      .from("patient_alerts")
      .select("alerts, generated_at")
      .eq("user_id", userId)
      .maybeSingle();

    return {
      alerts: (data?.alerts as PatientAlert[]) || [],
      generatedAt: data?.generated_at || null,
    };
  },

  /**
   * Verifica se precisa regerar (>= 20h desde última geração) e, se sim, roda o Gemini.
   * Retorna sempre os alertas finais (atualizados ou não).
   */
  async getOrGenerate(userId: string, patientContext: {
    name?: string;
    age?: number;
    gender?: string;
    weight?: number;
    targetWeight?: number;
    startWeight?: number;
    height?: number;
    goals?: any;
  }): Promise<PatientAlert[]> {
    try {
      const current = await this.loadAlerts(userId);

      const twentyHoursAgo = Date.now() - 20 * 60 * 60 * 1000;
      const lastGen = current.generatedAt ? new Date(current.generatedAt).getTime() : 0;

      if (lastGen > twentyHoursAgo && current.alerts.length > 0) {
        return current.alerts;
      }

      // Regerar
      return await this.generateAndSave(userId, patientContext);
    } catch (err) {
      console.error("[alertsService.getOrGenerate] error:", err);
      return [];
    }
  },

  async generateAndSave(userId: string, patientContext: any): Promise<PatientAlert[]> {
    try {
      // Busca dados ricos
      const [weightRes, dailyRes, checkinRes] = await Promise.all([
        supabase.from("weight_history")
          .select("weight, date")
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(30),
        supabase.from("daily_records")
          .select("date, meals, water_liters, quick_add_protein_grams")
          .eq("user_id", userId)
          .order("date", { ascending: false })
          .limit(14),
        supabase.from("consultation_checkins")
          .select("hunger, energy, mood, humor, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(7),
      ]);

      const weightHistory = weightRes.data || [];
      const dailyRecords = dailyRes.data || [];
      const checkins = checkinRes.data || [];

      // Métricas derivadas
      const daysSinceWeight = weightHistory[0]
        ? Math.floor((Date.now() - new Date(weightHistory[0].date).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const last7Daily = dailyRecords.slice(0, 7);
      const avgWater = last7Daily.length
        ? last7Daily.reduce((s, d) => s + (Number(d.water_liters) || 0), 0) / last7Daily.length
        : 0;

      const avgProtein = last7Daily.length
        ? last7Daily.reduce((s, d) => {
            const mealsP = Array.isArray(d.meals)
              ? d.meals.reduce((t: number, m: any) => t + (Number(m.protein) || 0), 0)
              : 0;
            return s + mealsP + (Number(d.quick_add_protein_grams) || 0);
          }, 0) / last7Daily.length
        : 0;

      const avgCalories = last7Daily.length
        ? last7Daily.reduce((s, d) => {
            const cal = Array.isArray(d.meals)
              ? d.meals.reduce((t: number, m: any) => t + (Number(m.calories) || 0), 0)
              : 0;
            return s + cal;
          }, 0) / last7Daily.length
        : 0;

      const daysWithoutMealLog = (() => {
        if (!last7Daily.length) return 7;
        let count = 0;
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split("T")[0];
          const rec = last7Daily.find((r: any) => r.date === dateStr);
          if (!rec || !Array.isArray(rec.meals) || rec.meals.length === 0) count++;
        }
        return count;
      })();

      const avgCheckinEnergy = checkins.length
        ? checkins.reduce((s, c) => s + (c.energy || 0), 0) / checkins.length
        : null;
      const avgCheckinMood = checkins.length
        ? checkins.reduce((s, c) => s + (c.mood || 0), 0) / checkins.length
        : null;

      const snapshot = {
        paciente: {
          nome: patientContext.name,
          idade: patientContext.age,
          sexo: patientContext.gender,
          altura_cm: patientContext.height,
          peso_atual_kg: patientContext.weight,
          peso_inicial_kg: patientContext.startWeight,
          peso_meta_kg: patientContext.targetWeight,
          meta_calorias: patientContext.goals?.calories,
          meta_proteina_g: patientContext.goals?.protein,
          meta_agua_l: patientContext.goals?.water,
        },
        metricas_7_dias: {
          dias_sem_registrar_refeicao: daysWithoutMealLog,
          media_agua_litros: Number(avgWater.toFixed(2)),
          media_proteina_g: Math.round(avgProtein),
          media_calorias_kcal: Math.round(avgCalories),
        },
        peso: {
          dias_desde_ultimo_registro: daysSinceWeight,
          ultimos_registros: weightHistory.slice(0, 10).map((w: any) => ({
            data: w.date,
            peso: w.weight,
          })),
        },
        checkins_recentes: {
          qtd: checkins.length,
          media_energia: avgCheckinEnergy ? Number(avgCheckinEnergy.toFixed(1)) : null,
          media_humor: avgCheckinMood ? Number(avgCheckinMood.toFixed(1)) : null,
        },
      };

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

      const prompt = `Você é um assistente clínico analisando o progresso de um paciente em acompanhamento nutricional.
Analise o snapshot abaixo e identifique OS 3 MAIORES RISCOS / ALERTAS atuais que o nutricionista deveria ver.
Seja específico e acionável. Se o paciente estiver bem numa métrica, NÃO liste um alerta para ela.
Se houver menos de 3 riscos reais, retorne apenas os que existem (podem ser 1, 2 ou 3).

Snapshot:
${JSON.stringify(snapshot, null, 2)}

Regras:
- title: máx 40 caracteres, direto ao ponto. Ex: "Peso parado há 10 dias", "Proteína abaixo da meta"
- subtitle: máx 50 caracteres, com número concreto. Ex: "Média: 82g / dia", "Meta: 140g"
- severity: "high" (precisa ação imediata), "medium" (atenção), "low" (observação)
- icon: um dos valores: "weight", "protein", "water", "energy", "hunger", "general"

Retorne APENAS um JSON válido.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              alerts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    subtitle: { type: Type.STRING },
                    severity: { type: Type.STRING, enum: ["high", "medium", "low"] },
                    icon: {
                      type: Type.STRING,
                      enum: ["weight", "protein", "water", "energy", "hunger", "general"],
                    },
                  },
                  required: ["title", "subtitle", "severity", "icon"],
                },
              },
            },
            required: ["alerts"],
          },
        },
      });

      const text = (response as any).text || "";
      const parsed = JSON.parse(text);
      const alerts: PatientAlert[] = (parsed.alerts || []).slice(0, 3);

      // Upsert em patient_alerts
      await supabase.from("patient_alerts").upsert(
        {
          user_id: userId,
          alerts: alerts,
          generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      return alerts;
    } catch (err) {
      console.error("[alertsService.generateAndSave] error:", err);
      // Retorna últimos alertas salvos (fallback) ao invés de vazio
      const fallback = await this.loadAlerts(userId);
      return fallback.alerts;
    }
  },
};
