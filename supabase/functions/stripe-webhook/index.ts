
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno"

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
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  
  try {
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      webhookSecret
    )

    console.log(`🔔 Evento recebido: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const userId = session.client_reference_id
      const customerId = session.customer

      console.log(`✅ Pagamento Confirmado! Preparando promoção.`);
      console.log(`👤 ID Usuário Supabase: ${userId}`);

      if (!userId) {
          console.error("❌ ERRO: client_reference_id (ID do usuário) não encontrado na sessão.");
          return new Response("Missing client_reference_id", { status: 400 });
      }

      // Atualiza o perfil para PRO no banco de dados
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          is_pro: true, 
          subscription_status: 'active',
          stripe_customer_id: customerId 
        })
        .eq('id', userId)
        .select();
      
      if (error) {
          console.error("❌ Erro ao atualizar banco de dados:", error.message);
          throw error;
      }
      
      console.log(`🚀 Sucesso: Usuário ${userId} promovido a PRO.`);
    }

    return new Response(JSON.stringify({ received: true }), { 
        status: 200, 
        headers: { "Content-Type": "application/json" } 
    });

  } catch (err) {
    console.error(`❌ Erro Crítico no Webhook: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
})
