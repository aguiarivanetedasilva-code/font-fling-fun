import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, customerName, customerEmail, customerPhone, customerDocument, placa } = await req.json();

    if (!amount || !customerName || !customerEmail || !customerPhone || !customerDocument) {
      return new Response(
        JSON.stringify({ success: false, message: 'Campos obrigatórios faltando' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('BLACKPAY_API_KEY');
    const apiSecret = Deno.env.get('BLACKPAY_API_SECRET');
    if (!apiKey || !apiSecret) {
      return new Response(
        JSON.stringify({ success: false, message: 'BlackPay API keys não configuradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const docNumber = customerDocument.replace(/\D/g, '');

    const payload = {
      amount,
      description: `DEBITO-${placa}-${Date.now()}`,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone.replace(/\D/g, ''),
        document: {
          number: docNumber,
          type: docNumber.length <= 11 ? 'cpf' : 'cnpj',
        },
      },
      items: [
        {
          title: 'XV11',
          unitPrice: amount,
          quantity: 1,
        },
      ],
    };

    console.log('BlackPay request payload:', JSON.stringify(payload));

    const response = await fetch('https://api.paymentsblack.com/api/v1/pix/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
        'X-API-Secret': apiSecret,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log('BlackPay raw response:', JSON.stringify(data));

    if (!response.ok || data.status === "false" || data.status === false) {
      console.error('BlackPay error:', data);
      return new Response(
        JSON.stringify({ success: false, message: data.message || 'Erro ao criar pagamento' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize to match frontend expected format
    const pd = data.paymentData || {};

    const normalized = {
      success: true,
      data: {
        transactionId: pd.transactionId || '',
        status: pd.status || 'PENDING',
        paymentData: {
          qrCode: pd.copiaecola || '',
          qrCodeBase64: pd.qrcode || '',
          copyPaste: pd.copiaecola || '',
          expiresAt: '',
        },
      },
    };

    return new Response(
      JSON.stringify(normalized),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
