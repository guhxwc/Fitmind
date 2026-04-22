# Configuração do Stripe e Supabase

Para implementar o checkout da consultoria, siga os passos abaixo:

### 1. SQL para o Banco de Dados
Execute este SQL no seu painel do Supabase (SQL Editor) para preparar a tabela de consultas para receber os dados do Stripe:

```sql
-- Adicionar colunas para rastrear a assinatura na tabela de consultas
ALTER TABLE public.consultations 
ADD COLUMN IF NOT EXISTS plan_type TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending_payment';

-- Criar a tabela de transações para histórico financeiro
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'pro' ou 'consultation'
    amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'completed',
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissões
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- Criar um índice para busca rápida por preço se necessário
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON public.consultations(user_id);
```

### 2. Edge Function: `create-checkout-session`
Crie uma nova Edge Function no seu projeto Supabase:
`supabase functions new create-checkout-session`

Substitua o conteúdo de `supabase/functions/create-checkout-session/index.ts` por:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, planType, userId, is_consultation } = await req.json()
    
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const origin = req.headers.get('origin')
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/consultation?success=true`,
      cancel_url: `${origin}/consultation?canceled=true`,
      metadata: {
        userId: userId,
        planType: planType,
        priceId: priceId, // Passando o priceId nos metadados para garantir
        is_consultation: is_consultation ? 'true' : 'false'
      },
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
```

### 3. Edge Function: `stripe-webhook-sync-profile`
Essa função lida com o webhook do Stripe e também pode ser chamada manualmente para sincronizar o perfil.
`supabase functions new stripe-webhook-sync-profile`

Código para `supabase/functions/stripe-webhook-sync-profile/index.ts`:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
  })
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  )

  try {
    let userId, planType, stripePriceId, isConsultation;

    // Detect if it's a Stripe Webhook or a manual call
    const signature = req.headers.get('stripe-signature')
    
    if (signature) {
      const body = await req.text()
      const event = stripe.webhooks.constructEvent(
        body, signature, Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
      )

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        userId = session.metadata.userId
        planType = session.metadata.planType
        isConsultation = session.metadata.is_consultation === 'true'
        // Pegamos o priceId direto dos metadados da sessão criada anteriormente
        stripePriceId = session.metadata.priceId || session.line_items?.data?.[0]?.price?.id || session.price
      } else {
        return new Response(JSON.stringify({ received: true }), { status: 200 })
      }
    } else {
      // Manual call (Sync)
      const body = await req.json()
      userId = body.userId
      planType = body.planType
      isConsultation = body.is_consultation === true
      stripePriceId = body.stripe_price_id
    }

    if (!userId) throw new Error("userId não fornecido")

    if (isConsultation) {
      // REGRA: Is Consultation
      // 1. Não promove para PRO (is_pro continua false)
      // 2. Cria/Atualiza consultas com status 'pending'
      const { error: consultError } = await supabase
        .from('consultations')
        .upsert({
          user_id: userId,
          plan_type: planType,
          status: 'pending', // Libera a anamnese
          stripe_price_id: stripePriceId,
          subscription_status: 'active'
        }, { onConflict: 'user_id' })

      if (consultError) throw consultError

      // 3. Registra transação como 'consultation'
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'consultation',
        amount: 0, // Opcional: registrar valor
        status: 'completed',
        metadata: { priceId: stripePriceId, planType }
      })

    } else {
      // REGRA: Assinatura PRO padrão
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_pro: true, subscription_status: 'pro' })
        .eq('id', userId)
      
      if (profileError) throw profileError
    }

    return new Response(JSON.stringify({ success: true, is_consultation: isConsultation }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    })
  }
})
```

### 4. Configurar Variáveis no Supabase
Execute no terminal (Supabase CLI):
```bash
supabase secrets set STRIPE_SECRET_KEY=sua_sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=seu_whsec_...
```
