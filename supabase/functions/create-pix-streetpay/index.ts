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

    const publicKey = Deno.env.get('STREETPAY_PUBLIC_KEY');
    const secretKey = Deno.env.get('STREETPAY_SECRET_KEY');
    if (!publicKey || !secretKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'Street Pay API keys não configuradas' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Basic auth: base64(publicKey:secretKey)
    const credentials = btoa(`${publicKey}:${secretKey}`);

    const payload = {
      amount,
      paymentMethod: 'pix',
      currency: 'BRL',
      items: [
        {
          title: 'XV11',
          unitPrice: amount,
          quantity: 1,
          tangible: false,
        },
      ],
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone.replace(/\D/g, ''),
        document: {
          number: customerDocument.replace(/\D/g, ''),
          type: customerDocument.replace(/\D/g, '').length <= 11 ? 'cpf' : 'cnpj',
        },
      },
      pix: {
        expiresInDays: 1,
      },
      externalRef: `DEBITO-${placa}-${Date.now()}`,
    };

    const response = await fetch('https://api.streetpayments.com.br/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('StreetPay error:', data);
      return new Response(
        JSON.stringify({ success: false, message: data.message || 'Erro ao criar pagamento' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize response to match frontend expected format
    const normalized = {
      success: true,
      data: {
        transactionId: String(data.data?.id || data.id || ''),
        status: data.data?.status || data.status || 'waiting_payment',
        paymentData: {
          qrCode: data.data?.pix?.qrcode || '',
          qrCodeBase64: '',
          copyPaste: data.data?.pix?.qrcode || '',
          expiresAt: data.data?.pix?.expirationDate || '',
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
