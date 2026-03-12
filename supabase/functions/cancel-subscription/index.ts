import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Usuário não autenticado.')

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
        throw new Error('Nenhuma assinatura ativa encontrada para este usuário.');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Buscar assinaturas ativas do cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      // Tentar buscar assinaturas em trial
      const trialSubscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'trialing',
      });

      if (trialSubscriptions.data.length === 0) {
        throw new Error('Nenhuma assinatura ativa encontrada no Stripe.');
      }
      
      // Cancelar a assinatura em trial
      await stripe.subscriptions.cancel(trialSubscriptions.data[0].id);
    } else {
      // Cancelar a assinatura ativa
      await stripe.subscriptions.cancel(subscriptions.data[0].id);
    }

    // Atualizar o banco de dados para refletir o cancelamento
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabaseAdmin
      .from('profiles')
      .update({ 
        is_pro: false, 
        subscription_status: 'canceled' 
      })
      .eq('id', user.id);

    return new Response(
      JSON.stringify({ success: true, message: 'Assinatura cancelada com sucesso.' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )

  } catch (error: any) {
    console.error(`Erro ao cancelar assinatura: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      }
    )
  }
})
