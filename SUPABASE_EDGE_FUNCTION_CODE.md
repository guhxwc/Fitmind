# Supabase Edge Function: gemini-nutrition

Para que o aplicativo funcione com a Edge Function, você precisa criar uma nova função no seu projeto Supabase chamada `gemini-nutrition`.

### 1. Comando para criar a função (via CLI):
```bash
supabase functions new gemini-nutrition
```

### 2. Código da Função (`index.ts`):
Substitua o conteúdo do arquivo `supabase/functions/gemini-nutrition/index.ts` pelo código abaixo:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, input, audio, image, mimeType, currentTime } = await req.json()
    const apiKey = Deno.env.get('GEMINI_API_KEY')
    
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    let prompt = ""
    let parts = []

    if (type === 'text' || type === 'audio') {
      prompt = `
        Analise a entrada do usuário (texto ou áudio) sobre sua ingestão alimentar, água ou peso.
        Horário atual do sistema: ${currentTime}

        Extraia os dados estruturados em JSON.
        Para alimentos, estime calorias e proteínas se não especificado.
        Para água, converta para litros.
        Para peso, extraia o valor em kg.
        
        REGRAS DE TIPO DE REFEIÇÃO (meal_type):
        1. VERBOS E PALAVRAS-CHAVE:
           - "Almoçar", "almocei", "almoçamos", "almoço": Almoço.
           - "Jantar", "jantei", "jantamos", "janta": Jantar.
           - "Café da manhã", "tomei café", "desjejum": Café da manhã.
           - "Lanche", "lanchei", "comi um lanche", "belisquei": Lanche.
        
        2. INFERÊNCIA POR HORÁRIO:
           - Se o usuário mencionar um horário, use-o para classificar.
           - Se não mencionar, use o horário atual (${currentTime}) para inferir se não houver verbo:
             - 05:00 - 10:30: Café da manhã
             - 11:00 - 15:00: Almoço
             - 18:00 - 23:00: Jantar
             - Outros: Lanche
        
        3. HORÁRIO PADRÃO (campo time):
           - Se o usuário disser "agora", use ${currentTime}.
           - Se o usuário não especificar horário, use:
             - Café da manhã -> 08:30
             - Almoço -> 12:30
             - Jantar -> 20:00
             - Lanche -> ${currentTime}

        Retorne APENAS o JSON no formato:
        {
          "meals": [{"name": string, "calories": number, "protein": number, "meal_type": string, "time": string}],
          "water_liters": number,
          "weight_kg": number
        }
      `
      if (type === 'text') {
        parts = [prompt, `Texto do usuário: "${input}"`]
      } else {
        parts = [prompt, { inlineData: { data: audio, mimeType } }]
      }
    } else if (type === 'image') {
      prompt = "Analise a imagem desta refeição. Identifique os alimentos, estime o total de calorias (kcal) e o total de proteína (em gramas). Seja realista. Retorne APENAS um JSON no formato: {\"foodName\": string, \"calories\": number, \"protein\": number}"
      parts = [{ inlineData: { data: image, mimeType } }, prompt]
    }

    const result = await model.generateContent(parts)
    const response = await result.response
    const text = response.text()
    
    // Limpar markdown se houver
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
    const data = JSON.parse(jsonStr)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
```

### 3. Configurar a Secret no Supabase:
Certifique-se de que você já executou:
```bash
supabase secrets set GEMINI_API_KEY=sua_chave_aqui
```

### 4. Deploy da Função:
```bash
supabase functions deploy gemini-nutrition
```
