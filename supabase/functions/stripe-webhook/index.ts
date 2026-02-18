
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno"

// Declare Deno namespace to satisfy TypeScript in edge function environment
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
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Usa a service_role para editar perfis
)

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  let event
  try {
    if (!signature || !webhookSecret) throw new Error("Assinatura ou Segredo faltando.");
    
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    )
  } catch (err) {
    return new Response(err.message, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const userId = session.client_reference_id // Pegamos o ID que enviamos no checkout
    const customerId = session.customer

    if (userId) {
      console.log(`Pagamento confirmado para o usuário: ${userId}`)
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
            is_pro: true, 
            subscription_status: 'active',
            stripe_customer_id: customerId 
        })
        .eq('id', userId)

      if (error) console.error('Erro ao atualizar perfil:', error)
    }
  }

  // Lidar com cancelamentos
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object
    const customerId = subscription.customer
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (profile) {
      await supabase
        .from('profiles')
        .update({ is_pro: false, subscription_status: 'canceled' })
        .eq('id', profile.id)
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
