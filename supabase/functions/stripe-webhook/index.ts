
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

      // 1. Atualizar o perfil do usuário para PRO
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          is_pro: true, 
          subscription_status: 'active',
          stripe_customer_id: customerId 
        })
        .eq('id', userId);
      
      if (profileError) {
          console.error("❌ Erro ao atualizar banco:", profileError.message);
          throw profileError;
      }

      // 2. Processar comissão de afiliado se houver
      const affiliateId = session.metadata?.affiliate_id;
      const amountTotal = session.amount_total; // Valor em centavos

      if (affiliateId && amountTotal) {
        console.log(`💰 Processando comissão para afiliado: ${affiliateId}`);
        
        // Buscar dados do afiliado
        const { data: affiliate, error: affError } = await supabase
          .from('affiliates')
          .select('commission_rate, balance, conversions')
          .eq('id', affiliateId)
          .single();

        if (affiliate && !affError) {
          const commissionAmount = (amountTotal / 100) * (affiliate.commission_rate / 100);
          
          // Registrar a transação de comissão
          const { error: transError } = await supabase
            .from('affiliate_transactions')
            .insert({
              affiliate_id: affiliateId,
              amount: commissionAmount,
              type: 'commission',
              description: `Comissão de venda para usuário ${userId}`,
              reference_id: session.id
            });

          if (!transError) {
            // Atualizar saldo e conversões do afiliado
            await supabase
              .from('affiliates')
              .update({
                balance: affiliate.balance + commissionAmount,
                conversions: affiliate.conversions + 1
              })
              .eq('id', affiliateId);
            
            console.log(`✅ Comissão de R$ ${commissionAmount.toFixed(2)} registrada.`);
          } else {
            console.error("❌ Erro ao registrar transação de afiliado:", transError.message);
          }
        } else {
          console.error("❌ Erro ao buscar dados do afiliado:", affError?.message);
        }
      }
      
      // 3. Atualizar o status da indicação (referrals) para 'completed' e bonificar o indicador
      const affiliateCode = session.metadata?.affiliate_code;
      if (affiliateCode) {
        console.log(`🔗 Processando conclusão de indicação para o código: ${affiliateCode}`);
        
        // Atualiza a indicação para 'completed'
        const { data: updatedRefs, error: refUpdateError } = await supabase
          .from('referrals')
          .update({ status: 'completed' })
          .eq('user_id', userId)
          .eq('affiliate_ref', affiliateCode)
          .select();
          
        if (refUpdateError) {
          console.error("❌ Erro ao atualizar status da indicação:", refUpdateError.message);
        } else if (updatedRefs && updatedRefs.length > 0) {
          console.log(`✅ Indicação atualizada para concluída (Afiliado: ${affiliateCode}, Usuário: ${userId})`);
          
          // Tentar encontrar o usuário que indicou para aplicar o benefício (O "Pai")
          const { data: referrer, error: referrerError } = await supabase
            .from('profiles')
            .select('id, name, pro_expires_at, is_pro')
            .filter('id', 'like', `${affiliateCode.toLowerCase()}%`)
            .maybeSingle();

          if (referrer && !referrerError) {
            console.log(`🎁 Concedendo 30 dias de PRO para o indicador: ${referrer.name}`);
            
            // Calcular nova data de expiração
            let newExpiry = new Date();
            const currentExpiry = referrer.pro_expires_at ? new Date(referrer.pro_expires_at) : null;
            
            // Se ele já for PRO e a data for futura, adicionamos a partir de lá. 
            // Caso contrário, adicionamos a partir de hoje.
            if (currentExpiry && currentExpiry > new Date()) {
              newExpiry = currentExpiry;
            }
            
            newExpiry.setDate(newExpiry.getDate() + 30);

            const { error: rewardError } = await supabase
              .from('profiles')
              .update({
                is_pro: true,
                pro_expires_at: newExpiry.toISOString(),
                subscription_status: 'active'
              })
              .eq('id', referrer.id);

            if (!rewardError) {
              console.log(`✅ Benefício entregue! Nova expiração de ${referrer.name}: ${newExpiry.toLocaleDateString()}`);
            } else {
              console.error("❌ Erro ao entregar benefício:", rewardError.message);
            }
          }
        }
      }
      
      console.log(`🚀 Sucesso: Usuário ${userId} agora é PRO.`);
    } else if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const status = subscription.status;

      if (status !== 'active' && status !== 'trialing') {
        console.log(`❌ Assinatura inativa (${status}) para cliente ${customerId}. Removendo PRO...`);
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_pro: false, 
            subscription_status: status
          })
          .eq('stripe_customer_id', customerId);
        
        if (profileError) {
            console.error("❌ Erro ao atualizar banco:", profileError.message);
        } else {
            console.log(`✅ Status PRO removido para cliente ${customerId}.`);
        }
      } else if (status === 'active' || status === 'trialing') {
        console.log(`✅ Assinatura ativa (${status}) para cliente ${customerId}. Mantendo PRO...`);
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            is_pro: true, 
            subscription_status: status
          })
          .eq('stripe_customer_id', customerId);
          
        if (profileError) {
            console.error("❌ Erro ao atualizar banco:", profileError.message);
        }
      }
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
