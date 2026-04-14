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

      // 2. Processar comissão de afiliado OFICIAL se houver
      const affiliateId = session.metadata?.affiliate_id;
      const amountTotal = session.amount_total; // em centavos

      if (affiliateId && amountTotal) {
        console.log(`💰 Processando comissão para afiliado oficial: ${affiliateId}`);
        
        const { data: affiliate, error: affError } = await supabase
          .from('affiliates')
          .select('commission_rate, balance, conversions')
          .eq('id', affiliateId)
          .single();

        if (affiliate && !affError) {
          // commission_rate no banco é 0.30 (30%), amountTotal está em centavos
          const commissionAmount = (amountTotal / 100) * Number(affiliate.commission_rate);
          
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
            await supabase
              .from('affiliates')
              .update({
                balance: Number(affiliate.balance) + commissionAmount,
                conversions: Number(affiliate.conversions) + 1
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
      
      // 3. Atualizar status da indicação (referrals) para 'completed' e bonificar o indicador P2P
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
          console.log(`✅ Indicação atualizada para 'completed' (Código: ${affiliateCode}, Usuário: ${userId})`);
          
          // ─────────────────────────────────────────────────────────────────
          // BUG CORRIGIDO: Antes usava .filter('id', 'like', ...) que nunca
          // dava match. Agora usa a função SQL get_referrer_by_code que busca
          // corretamente pelo prefixo do UUID (indicação P2P).
          // ─────────────────────────────────────────────────────────────────
          const { data: referrerRows, error: referrerError } = await supabase
            .rpc('get_referrer_by_code', { p_code: affiliateCode });

          const referrer = referrerRows && referrerRows.length > 0 ? referrerRows[0] : null;

          if (referrer && !referrerError) {
            console.log(`👤 Indicador encontrado: ${referrer.name} (${referrer.id})`);

            // Contar quantas indicações CONCLUÍDAS esse indicador já tem
            const { count: completedCount, error: countError } = await supabase
              .from('referrals')
              .select('*', { count: 'exact', head: true })
              .eq('affiliate_ref', affiliateCode)
              .eq('status', 'completed');

            if (!countError && completedCount !== null) {
              console.log(`📊 Total de indicações concluídas para ${affiliateCode}: ${completedCount}`);
              
              let daysToAdd = 0;
              let rewardDesc = '';

              if (completedCount === 1) {
                daysToAdd = 7;
                rewardDesc = 'Nível Bronze: +7 dias grátis';
              } else if (completedCount === 2) {
                // Nível Prata: 30% de desconto (desconto na próxima renovação — apenas notificação aqui)
                console.log(`🥈 Recompensa Nível Prata (2 indicações): desconto 30% para ${referrer.name}`);
                // O desconto será aplicado no próximo ciclo via cupom Stripe — não é dias
              } else if (completedCount === 3) {
                daysToAdd = 30;
                rewardDesc = 'Nível Ouro: +30 dias grátis';
              }

              if (daysToAdd > 0) {
                // Calcular nova data de expiração
                let newExpiry = new Date();
                const currentExpiry = referrer.pro_expires_at ? new Date(referrer.pro_expires_at) : null;
                
                // Extende a partir da data atual ou da expiração existente (o que for maior)
                if (currentExpiry && currentExpiry > new Date()) {
                  newExpiry = currentExpiry;
                }
                
                newExpiry.setDate(newExpiry.getDate() + daysToAdd);

                const { error: rewardError } = await supabase
                  .from('profiles')
                  .update({
                    is_pro: true,
                    pro_expires_at: newExpiry.toISOString(),
                    subscription_status: 'active'
                  })
                  .eq('id', referrer.id);

                if (!rewardError) {
                  console.log(`🎁 ${rewardDesc} entregue para ${referrer.name}! Nova expiração: ${newExpiry.toLocaleDateString('pt-BR')}`);
                } else {
                  console.error("❌ Erro ao entregar benefício:", rewardError.message);
                }
              }
            }
          } else {
            // Código é de afiliado oficial (não P2P) — sem recompensa de dias, já processou comissão acima
            console.log(`ℹ️ Código ${affiliateCode} é de afiliado oficial — sem recompensa P2P.`);
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