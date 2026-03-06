# Supabase Edge Function: create-checkout-session

Esta função cria uma sessão de checkout no Stripe para assinatura do plano PRO.

### 1. Comando para criar a função (via CLI):
```bash
supabase functions new create-checkout-session
```

### 2. Código da Função (`index.ts`):
Substitua o conteúdo do arquivo `supabase/functions/create-checkout-session/index.ts` pelo código abaixo:

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, email, userId, returnUrl, affiliateCode } = await req.json()

    // 1. Buscar se existe um cupom válido para esse código de afiliado
    let couponId = null;
    let metadata = { userId };

    if (affiliateCode) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Buscar o afiliado pelo código
      const { data: affiliate, error } = await supabase
        .from('affiliates')
        .select('id, discount_rate, code')
        .eq('code', affiliateCode)
        .single()

      if (affiliate && !error) {
        // Adicionar o código do afiliado aos metadados para rastreamento
        metadata = { ...metadata, affiliate_code: affiliate.code, affiliate_id: affiliate.id };

        // Se o afiliado tiver uma taxa de desconto configurada (> 0), tentar aplicar o cupom
        if (affiliate.discount_rate > 0) {
          // Tentar encontrar um cupom no Stripe com o mesmo código
          try {
            const coupon = await stripe.coupons.retrieve(affiliate.code);
            if (coupon && coupon.valid) {
              couponId = coupon.id;
            }
          } catch (e) {
            console.log(`Cupom ${affiliate.code} não encontrado no Stripe ou inválido.`);
            // Opcional: Criar o cupom dinamicamente no Stripe se não existir
          }
        }
      }
    }

    // 2. Criar a sessão de checkout
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?payment_canceled=true`,
      customer_email: email,
      metadata: metadata,
    };

    // Adicionar cupom se existir
    if (couponId) {
      sessionConfig.discounts = [{ coupon: couponId }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return new Response(JSON.stringify({ url: session.url }), {
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
supabase secrets set STRIPE_SECRET_KEY=sua_chave_secreta_do_stripe
```

### 4. Deploy da Função:
```bash
supabase functions deploy create-checkout-session
```
