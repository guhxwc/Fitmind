# Supabase Edge Function: create-affiliate

Esta função permite criar afiliados e cupons automaticamente, sincronizando Supabase e Stripe. Ideal para usar no seu Dashboard administrativo.

### 1. Comando para criar a função (via CLI):
```bash
supabase functions new create-affiliate
```

### 2. Código da Função (`index.ts`):
Substitua o conteúdo do arquivo `supabase/functions/create-affiliate/index.ts` pelo código abaixo:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { code, discount_rate, commission_rate, user_id } = await req.json()

    // Validações básicas
    if (!code) throw new Error("O código do cupom é obrigatório.")

    const normalizedCode = code.toUpperCase().trim();
    const discount = discount_rate || 10; // Padrão 10%
    const commission = commission_rate || 20; // Padrão 20%

    // 1. Criar o Cupom no Stripe (se tiver desconto)
    let stripeCouponId = null;
    if (discount > 0) {
      try {
        // Verifica se já existe
        try {
          const existingCoupon = await stripe.coupons.retrieve(normalizedCode);
          stripeCouponId = existingCoupon.id;
          console.log(`Cupom ${normalizedCode} já existia no Stripe.`);
        } catch (e) {
          // Se não existe, cria
          const newCoupon = await stripe.coupons.create({
            id: normalizedCode,
            percent_off: discount,
            duration: 'forever', // Ou 'once', 'repeating'
            name: `Cupom ${normalizedCode}`,
          });
          stripeCouponId = newCoupon.id;
          console.log(`Cupom ${normalizedCode} criado no Stripe.`);
        }
      } catch (stripeError) {
        console.error("Erro no Stripe:", stripeError);
        throw new Error(`Erro ao criar cupom no Stripe: ${stripeError.message}`);
      }
    }

    // 2. Salvar no Banco de Dados (Supabase)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data, error } = await supabase
      .from('affiliates')
      .insert([
        {
          code: normalizedCode,
          discount_rate: discount,
          commission_rate: commission,
          user_id: user_id || null, // Pode ser nulo se for um cupom genérico
        }
      ])
      .select()
      .single()

    if (error) {
      // Se der erro de duplicidade (código 23505), avisa amigavelmente
      if (error.code === '23505') {
        throw new Error(`O cupom "${normalizedCode}" já existe no sistema.`);
      }
      throw error;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Afiliado ${normalizedCode} criado com sucesso!`,
      data: data,
      stripe_coupon: stripeCouponId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
```

### 3. Deploy da Função:
```bash
supabase functions deploy create-affiliate
```

---

### Exemplo de Uso no seu Dashboard (React):

Copie este componente para o seu projeto do Dashboard administrativo:

```tsx
import { useState } from 'react';
import { supabase } from './supabaseClient'; // Seu cliente supabase

export function CreateAffiliateForm() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-affiliate', {
        body: { 
          code: code,
          discount_rate: 10, // Opcional
          commission_rate: 20 // Opcional
        }
      });

      if (error) throw error;
      
      alert('Afiliado criado com sucesso!');
      setCode('');
    } catch (err) {
      alert('Erro: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="p-4 border rounded bg-white">
      <h3 className="text-lg font-bold mb-4">Criar Novo Afiliado</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código (ex: VITINHO)"
          className="border p-2 rounded flex-1"
          required
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Criando...' : 'Criar Cupom'}
        </button>
      </div>
    </form>
  );
}
```
