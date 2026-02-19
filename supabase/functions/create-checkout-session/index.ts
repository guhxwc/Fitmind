
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
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error("Chave STRIPE_SECRET_KEY não encontrada nas configurações do Supabase.");

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const body = await req.json();
    const { priceId, email, userId, returnUrl } = body;
    
    // Validações básicas
    if (!priceId) throw new Error("Parâmetro 'priceId' está faltando.");
    if (!userId) throw new Error("Parâmetro 'userId' está faltando.");
    if (!returnUrl) throw new Error("Parâmetro 'returnUrl' está faltando.");

    console.log(`[Stripe Edge] Criando sessão para User=${userId}, Price=${priceId}`);

    const session = await stripe.checkout.sessions.create({
      customer_email: email && email.trim() !== "" ? email : undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${returnUrl}?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl.replace('/success', '')}?payment_canceled=true`,
      client_reference_id: userId,
      metadata: { supabase_user_id: userId },
      allow_promotion_codes: true,
    });

    if (!session.url) {
        console.error("[Stripe Edge] Stripe não retornou URL. Session ID:", session.id);
        throw new Error("Erro na geração do link de checkout pela Stripe.");
    }

    console.log(`[Stripe Edge] Sessão criada com sucesso: ${session.id}`);

    // Retorna a URL em vários níveis para máxima compatibilidade com o frontend
    return new Response(JSON.stringify({ 
      url: session.url, 
      session: session, // Mantém o objeto completo se necessário
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error(`[Stripe Edge Error]: ${error.message}`);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
