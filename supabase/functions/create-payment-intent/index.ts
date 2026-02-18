
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno"

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // 1. Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
        throw new Error("STRIPE_SECRET_KEY não configurada no ambiente.");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { priceId, email, userId, returnUrl } = await req.json()

    if (!priceId || !email || !userId || !returnUrl) {
      throw new Error("Parâmetros obrigatórios ausentes.");
    }

    // 1. Criar ou recuperar cliente Stripe
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : null;

    if (!customerId) {
        const customer = await stripe.customers.create({ 
          email, 
          metadata: { supabase_uid: userId } 
        });
        customerId = customer.id;
    }

    // 2. Criar Sessão de Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}&payment_success=true`,
      cancel_url: `${returnUrl}?payment_canceled=true`,
      subscription_data: {
        metadata: {
            supabase_uid: userId
        }
      },
      allow_promotion_codes: true,
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )

  } catch (error) {
    console.error("Erro Edge Function:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno." }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})
