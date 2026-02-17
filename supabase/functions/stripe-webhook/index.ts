
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Inicializa Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

// Inicializa Supabase com a Service Role Key (para poder editar qualquer usuário)
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Necessário para verificar a assinatura do webhook no Deno
const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  // Alterado de STRIPE_WEBHOOK_SIGNING_SECRET para STRIPE_WEBHOOK_SECRET conforme solicitação do usuário
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  let event
  try {
    if (!signature || !webhookSecret) {
        throw new Error("Missing signature or signing secret");
    }
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(err.message, { status: 400 })
  }

  console.log(`🔔 Event received: ${event.type}`)

  try {
    // Tratamento dos eventos de Assinatura
    if (
        event.type === 'customer.subscription.created' ||
        event.type === 'customer.subscription.updated' ||
        event.type === 'customer.subscription.deleted'
    ) {
        const subscription = event.data.object
        const customerId = subscription.customer
        
        // 1. Buscar o cliente no Stripe para recuperar o ID do usuário no Supabase
        const customer = await stripe.customers.retrieve(customerId as string)
        
        // @ts-ignore
        const userId = customer.deleted ? null : customer.metadata?.supabase_uid

        if (userId) {
            // 2. Determinar o status
            const status = subscription.status
            // Consideramos PRO se estiver ativo ou em período de teste
            const isPro = status === 'active' || status === 'trialing'
            
            console.log(`Updating user ${userId}: status=${status}, isPro=${isPro}`)

            // 3. Atualizar o perfil do usuário no banco de dados
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    is_pro: isPro,
                    subscription_status: status 
                })
                .eq('id', userId)
            
            if (error) throw error
        } else {
            console.log('No supabase_uid found in customer metadata')
        }
    }
    
    // Tratamento de Pagamento com Falha
    if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        console.log(`Payment failed for customer ${customerId}`)
    }

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})
