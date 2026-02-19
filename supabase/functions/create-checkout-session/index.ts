
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

serve(async (req) => {
  // Resposta para Preflight request (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error("Chave STRIPE_SECRET_KEY não configurada no Supabase.");

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const body = await req.json();
    const { priceId, email, userId, returnUrl } = body;
    
    if (!priceId) throw new Error("Price ID é obrigatório.");
    if (!userId) throw new Error("User ID é obrigatório.");
    if (!returnUrl) throw new Error("Return URL é obrigatória.");

    console.log(`[Checkout] Criando sessão para: ${email || 'Sem email'}, User: ${userId}, Price: ${priceId}`);

    // Configurações da Sessão
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${returnUrl}?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl.replace('/success', '')}?payment_canceled=true`,
      client_reference_id: userId,
      metadata: { supabase_user_id: userId },
      allow_promotion_codes: true,
    };

    // Só adiciona email se existir, para evitar erro de validação do Stripe se for string vazia
    if (email && email.trim() !== "") {
      sessionOptions.customer_email = email;
    }

    const session = await stripe.checkout.sessions.create(sessionOptions);

    if (!session.url) {
      throw new Error("Stripe falhou ao gerar a URL de checkout.");
    }

    console.log(`[Checkout] Sessão criada com sucesso: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(`[Checkout Error]: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
