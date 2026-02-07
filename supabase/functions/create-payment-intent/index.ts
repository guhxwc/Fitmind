
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

// Declare Deno for TypeScript environment compatibility
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

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
    const { priceId, email, userId } = await req.json()

    // 1. Criar ou recuperar cliente Stripe
    const customers = await stripe.customers.list({ email: email, limit: 1 });
    let customerId = customers.data.length > 0 ? customers.data[0].id : null;

    if (!customerId) {
        const customer = await stripe.customers.create({ email, metadata: { supabase_uid: userId } });
        customerId = customer.id;
    }

    // 2. Criar Assinatura (Subscription)
    // O parametro trial_period_days força o período de teste de 7 dias
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent', 'pending_setup_intent'],
        trial_period_days: 7, 
    });

    // 3. Determinar o Client Secret para o Frontend
    let clientSecret = "";
    let type = "payment";

    // Em assinaturas com Trial, geralmente o Stripe gera um SetupIntent (validação de cartão sem cobrança)
    // ou um PaymentIntent de valor zero se configurado.
    if (subscription.pending_setup_intent) {
        // @ts-ignore
        clientSecret = subscription.pending_setup_intent.client_secret;
        type = "setup";
    } else if (subscription.latest_invoice && typeof subscription.latest_invoice !== 'string' && subscription.latest_invoice.payment_intent) {
        // @ts-ignore
        clientSecret = subscription.latest_invoice.payment_intent.client_secret;
        type = "payment";
    }

    return new Response(
      JSON.stringify({ subscriptionId: subscription.id, clientSecret, type }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
