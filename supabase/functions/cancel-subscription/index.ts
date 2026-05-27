import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

declare const Deno: { env: { get(key: string): string | undefined } };

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // ── Cliente com permissão do usuário (para validar autenticação) ──────────
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) throw new Error('Usuário não autenticado.')

    // ── Admin client (contorna RLS para ler stripe_customer_id com segurança) ─
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id, is_pro, subscription_status')
      .eq('id', user.id)
      .single()

    if (profileError) throw new Error(`Erro ao buscar perfil: ${profileError.message}`)

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // ── Resolve o customer ID ─────────────────────────────────────────────────
    // Bug #2: se o webhook não rodou, stripe_customer_id pode estar nulo.
    // Fallback: busca pelo email do usuário direto no Stripe.
    let customerId: string | null = profile?.stripe_customer_id ?? null

    if (!customerId) {
      console.log(`[cancel-subscription] stripe_customer_id nulo para ${user.id}. Buscando por email no Stripe...`)
      const userEmail = user.email
      if (!userEmail) throw new Error('Email do usuário não encontrado.')

      const customers = await stripe.customers.list({ email: userEmail, limit: 5 })
      if (customers.data.length === 0) {
        throw new Error('Nenhuma conta Stripe encontrada para este usuário. Sem assinatura ativa.')
      }

      // Pega o customer mais recente com assinatura ativa
      for (const customer of customers.data) {
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 5,
        })
        const hasActive = subs.data.some(s => s.status === 'active' || s.status === 'trialing')
        if (hasActive) {
          customerId = customer.id
          // Salva para não precisar buscar de novo
          await supabaseAdmin
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', user.id)
          console.log(`[cancel-subscription] Customer encontrado por email: ${customerId}`)
          break
        }
      }

      if (!customerId) {
        throw new Error('Nenhuma assinatura ativa encontrada para este usuário.')
      }
    }

    // ── Busca assinaturas ativas/trial ────────────────────────────────────────
    const allStatuses: Stripe.SubscriptionListParams.Status[] = ['active', 'trialing']
    let subscription: Stripe.Subscription | null = null

    for (const status of allStatuses) {
      const list = await stripe.subscriptions.list({ customer: customerId, status })
      if (list.data.length > 0) {
        subscription = list.data[0]
        break
      }
    }

    if (!subscription) {
      // Assinatura não encontrada no Stripe — pode já ter sido cancelada.
      // Garante que o banco está consistente e retorna sucesso para não travar o usuário.
      console.warn(`[cancel-subscription] Assinatura não encontrada no Stripe para ${customerId}. Atualizando banco.`)
      await supabaseAdmin
        .from('profiles')
        .update({ is_pro: false, subscription_status: 'canceled' })
        .eq('id', user.id)

      return new Response(
        JSON.stringify({ success: true, message: 'Assinatura já estava cancelada. Perfil atualizado.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // ── Bug #5 corrigido: cancela no fim do período (não imediatamente) ───────
    // O usuário paga por um período — deve ter acesso até o fim.
    // cancel_at_period_end = true: acesso continua até a data de renovação,
    // depois o webhook customer.subscription.updated vai setar is_pro = false.
    let canceledSubscription: Stripe.Subscription

    if (subscription.cancel_at_period_end) {
      // Já estava agendado para cancelar — não faz nada no Stripe
      canceledSubscription = subscription
      console.log(`[cancel-subscription] Assinatura ${subscription.id} já estava com cancel_at_period_end=true`)
    } else {
      canceledSubscription = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      })
      console.log(`[cancel-subscription] Assinatura ${subscription.id} agendada para cancelar em ${new Date(canceledSubscription.current_period_end * 1000).toISOString()}`)
    }

    // ── Atualiza o banco com status de cancelamento agendado ──────────────────
    // is_pro permanece true até o fim do período — o webhook fará is_pro = false
    // quando a assinatura expirar de fato.
    const periodEnd = new Date(canceledSubscription.current_period_end * 1000).toISOString()

    await supabaseAdmin
      .from('profiles')
      .update({
        subscription_status: 'cancel_at_period_end',
        // Mantém is_pro = true até o fim do período pago
      })
      .eq('id', user.id)

    console.log(`[cancel-subscription] ✅ Sucesso: usuário ${user.id} cancelamento agendado para ${periodEnd}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Assinatura cancelada. Você mantém o acesso PRO até ${new Date(periodEnd).toLocaleDateString('pt-BR')}.`,
        cancel_at: periodEnd,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error: any) {
    console.error(`[cancel-subscription] Erro: ${error.message}`)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})