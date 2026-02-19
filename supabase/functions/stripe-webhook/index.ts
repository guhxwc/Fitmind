
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

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  
  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret
    )

    console.log(`🔔 Evento Stripe: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      // Tenta pegar o ID do usuário de dois lugares possíveis
      const userId = session.client_reference_id || session.metadata?.supabase_user_id;
      const customerId = session.customer

      if (!userId) {
          console.error("❌ Erro: ID do usuário não encontrado na sessão.");
          return new Response("User ID not found", { status: 400 });
      }

      console.log(`✅ Processando PRO para usuário: ${userId}`);

      // Atualiza o perfil usando SERVICE_ROLE (bypassa RLS)
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_pro: true, 
          subscription_status: 'active',
          stripe_customer_id: customerId 
        })
        .eq('id', userId);
      
      if (error) {
          console.error("❌ Erro ao atualizar banco:", error.message);
          throw error;
      }
      
      console.log(`🚀 Sucesso: Usuário ${userId} agora é PRO.`);
    }

    return new Response(JSON.stringify({ received: true }), { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (err) {
    console.error(`❌ Erro no Webhook: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { 
        status: 400, 
        headers: corsHeaders 
    });
  }
})
