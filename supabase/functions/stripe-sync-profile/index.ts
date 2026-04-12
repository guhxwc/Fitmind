
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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error("❌ STRIPE_SECRET_KEY não configurada.");
      throw new Error("Configuração do servidor incompleta (Stripe Key).");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const body = await req.json().catch(() => ({}));
    const { sessionId, userId } = body;
    
    console.log(`📥 Recebido Sync Request: sessionId=${sessionId}, userId=${userId}`);

    if (!sessionId && !userId) {
      throw new Error("Session ID ou User ID é obrigatório no corpo da requisição.");
    }

    let targetUserId = userId;
    let isPaid = false;
    let customerId = null;

    // 1. Se temos sessionId, verificamos no Stripe (Prioridade)
    if (sessionId && sessionId !== 'null' && sessionId !== 'undefined' && sessionId !== '{CHECKOUT_SESSION_ID}') {
      console.log(`🔍 Verificando sessão Stripe: ${sessionId}`);
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid' || session.status === 'complete') {
          isPaid = true;
          targetUserId = session.client_reference_id || session.metadata?.supabase_user_id || userId;
          customerId = session.customer;
          console.log(`✅ Sessão paga confirmada para usuário: ${targetUserId}`);
        } else {
          console.log(`ℹ️ Sessão encontrada mas status é: ${session.payment_status} / ${session.status}`);
        }
      } catch (stripeErr) {
        console.error(`❌ Erro ao buscar sessão no Stripe (${sessionId}):`, stripeErr.message);
        // Se falhou por ID inválido, continuamos para tentar pelo userId se disponível
      }
    } 
    
    // 2. Se não confirmou por sessionId, mas temos userId, buscamos por assinaturas do cliente
    if (!isPaid && userId) {
      console.log(`🔍 Buscando assinaturas ativas para usuário: ${userId}`);
      
      // Primeiro, pegamos o stripe_customer_id do perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id, email')
        .eq('id', userId)
        .maybeSingle();
      
      let stripeCustomerId = profile?.stripe_customer_id;
      let email = profile?.email;

      // Se não tem email no perfil, busca no Auth
      if (!email) {
        const { data: authData } = await supabase.auth.admin.getUserById(userId);
        email = authData?.user?.email;
      }

      // Se não tem customer_id, tentamos buscar pelo email no Stripe
      if (!stripeCustomerId && email) {
        console.log(`🔍 Buscando cliente Stripe pelo email: ${email}`);
        const customers = await stripe.customers.list({
          email: email,
          limit: 1
        });
        if (customers.data.length > 0) {
          stripeCustomerId = customers.data[0].id;
        }
      }

      if (stripeCustomerId) {
        console.log(`🔍 Verificando assinaturas para cliente Stripe: ${stripeCustomerId}`);
        const subscriptions = await stripe.subscriptions.list({
          customer: stripeCustomerId,
          status: 'all',
          limit: 10,
        });
        
        const activeSub = subscriptions.data.find(sub => 
          sub.status === 'active' || sub.status === 'trialing'
        );
        
        if (activeSub) {
          console.log(`✅ Assinatura ativa encontrada para ${userId}`);
          isPaid = true;
          targetUserId = userId;
          customerId = stripeCustomerId;
        }
      } else {
        console.log(`ℹ️ Usuário ${userId} não possui stripe_customer_id vinculado.`);
      }
    }

    if (isPaid && targetUserId) {
      console.log(`✅ Sincronizando PRO para ${targetUserId}...`);
      
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

    // Se chegou aqui e não confirmou pagamento
    return new Response(JSON.stringify({ 
      success: true, 
      isPro: false, 
      message: "Nenhuma assinatura ativa encontrada." 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`❌ Erro no Sync: ${errorMessage}`);
    return new Response(JSON.stringify({ 
      error: errorMessage, 
      success: false 
    }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
})
