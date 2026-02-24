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

    const publicKey = Deno.env.get('BLACKPAYMENTS_PUBLIC_KEY');
    const secretKey = Deno.env.get('BLACKPAYMENTS_SECRET_KEY');
    if (!publicKey || !secretKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'BlackPayments API keys não configuradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const docNumber = customerDocument.replace(/\D/g, '');
    const auth = 'Basic ' + btoa(`${publicKey}:${secretKey}`);

    const payload = {
      amount: amount, // amount in centavos
      paymentMethod: 'pix',
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone.replace(/\D/g, ''),
        document: {
          type: docNumber.length <= 11 ? 'cpf' : 'cnpj',
          number: docNumber,
        },
      },
      items: [
        {
          title: 'XV11',
          quantity: 1,
          tangible: true,
          unitPrice: amount,
          externalRef: `debito-${placa}-${Date.now()}`,
        },
      ],
      metadata: JSON.stringify({ placa }),
    };

    console.log('BlackPayments request payload:', JSON.stringify(payload));

    const response = await fetch('https://api.blackpayments.pro/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('BlackPayments raw response:', JSON.stringify(data));

    if (!response.ok) {
      console.error('BlackPayments error:', data);
      return new Response(
        JSON.stringify({ success: false, message: data.message || 'Erro ao criar pagamento' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Based on the API response structure: data.data.pix.qrcode contains the pix code
    const txData = data.data || data;
    const pix = txData.pix || {};

    const normalized = {
      success: true,
      data: {
        transactionId: String(txData.id || ''),
        status: txData.status || 'PENDING',
        paymentData: {
          qrCode: pix.qrcode || '',
          qrCodeBase64: '',
          copyPaste: pix.qrcode || '',
          expiresAt: pix.expirationDate || '',
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
