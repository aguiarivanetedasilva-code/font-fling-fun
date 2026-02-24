import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transactionId, gateway } = await req.json();

    if (!transactionId) {
      return new Response(
        JSON.stringify({ success: false, message: 'transactionId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine active gateway
    let activeGateway = gateway;
    if (!activeGateway) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: settingsData } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'active_gateway')
        .single();
      activeGateway = settingsData?.value || 'blackcat';
    }

    let status = 'PENDING';

    if (activeGateway === 'blackcat') {
      const apiKey = Deno.env.get('BLACKCAT_API_KEY');
      if (!apiKey) throw new Error('BLACKCAT_API_KEY não configurada');

      const response = await fetch(`https://api.blackcatpagamentos.online/api/sales/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
      });
      const data = await response.json();
      console.log('BlackCat status response:', JSON.stringify(data));
      status = data?.data?.status || data?.status || 'PENDING';

    } else if (activeGateway === 'blackpay') {
      const apiKey = Deno.env.get('BLACKPAY_API_KEY');
      const apiSecret = Deno.env.get('BLACKPAY_API_SECRET');
      if (!apiKey || !apiSecret) throw new Error('BlackPay API keys não configuradas');

      const response = await fetch(`https://api.paymentsblack.com/api/v1/pix/status/${transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'X-API-Secret': apiSecret,
        },
      });
      const data = await response.json();
      console.log('BlackPay status response:', JSON.stringify(data));
      status = data?.status || data?.data?.status || 'PENDING';

    } else if (activeGateway === 'blackpayments') {
      const publicKey = Deno.env.get('BLACKPAYMENTS_PUBLIC_KEY');
      const secretKey = Deno.env.get('BLACKPAYMENTS_SECRET_KEY');
      if (!publicKey || !secretKey) throw new Error('BlackPayments API keys não configuradas');

      const credentials = btoa(`${publicKey}:${secretKey}`);
      const response = await fetch(`https://api.blackpayments.pro/v1/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('BlackPayments status response:', JSON.stringify(data));
      status = data?.data?.status || data?.status || 'PENDING';

    } else if (activeGateway === 'streetpay') {
      const publicKey = Deno.env.get('STREETPAY_PUBLIC_KEY');
      const secretKey = Deno.env.get('STREETPAY_SECRET_KEY');
      if (!publicKey || !secretKey) throw new Error('StreetPay API keys não configuradas');

      const credentials = btoa(`${publicKey}:${secretKey}`);
      const response = await fetch(`https://api.streetpayments.com.br/v1/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      console.log('StreetPay status response:', JSON.stringify(data));
      status = data?.data?.status || data?.status || 'waiting_payment';
    }

    // Normalize statuses
    const normalizedStatus = normalizeStatus(status);

    return new Response(
      JSON.stringify({ success: true, status: normalizedStatus, rawStatus: status }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Check status error:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Erro ao verificar status' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function normalizeStatus(status: string): string {
  const s = status?.toLowerCase() || '';
  if (['paid', 'approved', 'completed', 'confirmed', 'settled'].includes(s)) return 'PAID';
  if (['expired', 'cancelled', 'canceled', 'refunded'].includes(s)) return 'EXPIRED';
  if (['failed', 'rejected', 'declined'].includes(s)) return 'FAILED';
  return 'PENDING';
}
