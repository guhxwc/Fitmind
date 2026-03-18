
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

  try {
    const { sessionId, userId } = await req.json();
    
    if (!sessionId && !userId) {
      throw new Error("Session ID or User ID is required");
    }

    let targetUserId = userId;
    let isPaid = false;
    let customerId = null;

    // 1. Se temos sessionId, verificamos no Stripe
    if (sessionId) {
      console.log(`🔍 Verificando sessão Stripe: ${sessionId}`);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid' || session.status === 'complete') {
        isPaid = true;
        targetUserId = session.client_reference_id || session.metadata?.supabase_user_id;
        customerId = session.customer;
      }
    } 
    // 2. Se não temos sessionId mas temos userId, buscamos sessões recentes
    else if (userId) {
      console.log(`🔍 Buscando sessões recentes para usuário: ${userId}`);
      // Busca sessões de checkout completas para este usuário
      const sessions = await stripe.checkout.sessions.list({
        limit: 5,
      });
      
      // Filtra manualmente as sessões que pertencem a este usuário (Stripe list não filtra por client_reference_id diretamente na API de listagem simples)
      const userSession = sessions.data.find(s => 
        (s.client_reference_id === userId || s.metadata?.supabase_user_id === userId) && 
        (s.payment_status === 'paid' || s.status === 'complete')
      );

      if (userSession) {
        console.log(`✅ Sessão encontrada para ${userId}: ${userSession.id}`);
        isPaid = true;
        targetUserId = userId;
        customerId = userSession.customer;
      } else {
        // Tenta buscar por assinaturas ativas se o cliente já existir
        const { data: profile } = await supabase
          .from('profiles')
          .select('stripe_customer_id')
          .eq('id', userId)
          .maybeSingle();
        
        if (profile?.stripe_customer_id) {
          console.log(`🔍 Buscando assinaturas ativas para cliente Stripe: ${profile.stripe_customer_id}`);
          const subscriptions = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: 'active',
            limit: 1,
          });
          
          if (subscriptions.data.length > 0) {
            console.log(`✅ Assinatura ativa encontrada para ${userId}`);
            isPaid = true;
            targetUserId = userId;
            customerId = profile.stripe_customer_id;
          }
        }
      }
    }

    if (isPaid && targetUserId) {
      console.log(`✅ Pagamento confirmado para ${targetUserId}. Atualizando perfil...`);
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          is_pro: true, 
          subscription_status: 'active',
          stripe_customer_id: customerId 
        })
        .eq('id', targetUserId);

      if (updateError) throw updateError;

      return new Response(JSON.stringify({ success: true, isPro: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ success: true, isPro: false, message: "Pagamento não confirmado ainda." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error(`❌ Erro no Sync: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message, success: false }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})
