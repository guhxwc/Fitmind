
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.6.0?target=deno"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { code, discountRate, commissionRate, userId } = await req.json();
    
    if (!code || !userId) throw new Error("Parâmetros obrigatórios ausentes (code ou userId).");

    const normalizedCode = code.toUpperCase();

    // 1. Criar o cupom no Stripe
    let stripeCoupon;
    try {
      // Tentar recuperar se já existir
      stripeCoupon = await stripe.coupons.retrieve(normalizedCode);
      console.log(`Cupom ${normalizedCode} já existe no Stripe.`);
    } catch (e) {
      // Criar se não existir
      stripeCoupon = await stripe.coupons.create({
        id: normalizedCode,
        percent_off: discountRate || 10, // Padrão 10%
        duration: 'forever',
        name: `Cupom Afiliado: ${normalizedCode}`,
      });
      console.log(`Cupom ${normalizedCode} criado no Stripe.`);
    }

    // 2. Criar o registro na tabela de afiliados do Supabase
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .upsert({
        user_id: userId,
        code: normalizedCode,
        discount_rate: discountRate || 10,
        commission_rate: commissionRate || 20, // Padrão 20%
        updated_at: new Date().toISOString()
      }, { onConflict: 'code' })
      .select()
      .single();

    if (affiliateError) throw affiliateError;

    return new Response(JSON.stringify({ 
      success: true,
      affiliate,
      stripeCouponId: stripeCoupon.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error("[Create Affiliate Error]:", error.message);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
