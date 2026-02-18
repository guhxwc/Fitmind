
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
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
    // 1. Lida com o término do checkout (momento que sabemos o client_reference_id)
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        
        // 'client_reference_id' é passado na URL do Payment Link no frontend
        const userId = session.client_reference_id;
        const customerId = session.customer;

        if (userId && customerId) {
            console.log(`Checkout completed for user ${userId}. Granting PRO access.`);

            // Atualiza o usuário para PRO imediatamente
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    is_pro: true,
                    subscription_status: 'active',
                    stripe_customer_id: customerId
                })
                .eq('id', userId);

            if (error) {
                console.error('Error updating profile:', error);
            } else {
                // Opcional: Atualiza o Customer no Stripe com o ID do usuário
                // Isso ajuda em eventos futuros (como invoice.payment_failed) que não têm client_reference_id
                await stripe.customers.update(customerId as string, {
                    metadata: { supabase_uid: userId }
                });
            }
        }
    }

    // 2. Lida com atualizações de assinatura (cancelamentos, falhas futuras)
    if (
        event.type === 'customer.subscription.updated' ||
        event.type === 'customer.subscription.deleted'
    ) {
        const subscription = event.data.object
        const customerId = subscription.customer
        
        // Busca o cliente no Stripe para recuperar o ID do Supabase (salvo no passo anterior)
        const customer = await stripe.customers.retrieve(customerId as string)
        
        // @ts-ignore
        const userId = customer.deleted ? null : customer.metadata?.supabase_uid

        if (userId) {
            const status = subscription.status
            const isPro = status === 'active' || status === 'trialing'
            
            console.log(`Updating subscription for user ${userId}: status=${status}`)

            await supabase
                .from('profiles')
                .update({ 
                    is_pro: isPro,
                    subscription_status: status 
                })
                .eq('id', userId)
        }
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
