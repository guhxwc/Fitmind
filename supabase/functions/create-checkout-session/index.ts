
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) throw new Error("Chave STRIPE_SECRET_KEY não configurada.");

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { priceId, email, userId, returnUrl, affiliateCode } = await req.json();
    
    if (!priceId || !userId) throw new Error("Parâmetros obrigatórios ausentes (priceId ou userId).");

    // 1. Buscar se existe um cupom válido para esse código de afiliado
    let couponId = null;
    let metadata: any = { supabase_user_id: userId };

    if (affiliateCode) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Buscar o afiliado pelo código
      const { data: affiliate, error } = await supabase
        .from('affiliates')
        .select('id, discount_rate, code')
        .eq('code', affiliateCode)
        .single()

      if (affiliate && !error) {
        // Adicionar o código do afiliado aos metadados para rastreamento
        metadata = { ...metadata, affiliate_code: affiliate.code, affiliate_id: affiliate.id };

        // Se o afiliado tiver uma taxa de desconto configurada (> 0), tentar aplicar o cupom
        if (affiliate.discount_rate > 0) {
          // Tentar encontrar um cupom no Stripe com o mesmo código
          try {
            const coupon = await stripe.coupons.retrieve(affiliate.code);
            if (coupon && coupon.valid) {
              couponId = coupon.id;
            }
          } catch (e) {
            console.log(`Cupom ${affiliate.code} não encontrado no Stripe ou inválido.`);
          }
        }
      }
    }

    // 2. Criar a sessão de checkout
    const sessionConfig: any = {
      customer_email: email && email.trim() !== "" ? email : undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${returnUrl}?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl.replace('/success', '')}?payment_canceled=true`,
      client_reference_id: userId,
      metadata: metadata,
      allow_promotion_codes: true,
    };

    // Adicionar cupom se existir
    if (couponId) {
      sessionConfig.discounts = [{ coupon: couponId }];
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    if (!session.url) {
        throw new Error("O Stripe não gerou uma URL para esta sessão.");
    }

    return new Response(JSON.stringify({ 
      url: session.url,
      id: session.id,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("[Checkout Error]:", error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
