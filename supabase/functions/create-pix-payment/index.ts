import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const apiKey = Deno.env.get('BLACKCAT_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, message: 'API key não configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = {
      amount,
      currency: 'BRL',
      paymentMethod: 'pix',
      items: [
        {
          title: `Débito veicular - ${placa || 'N/A'}`,
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

    const response = await fetch('https://api.blackcatpagamentos.online/api/sales/create-sale', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('BlackCat error:', data);
      return new Response(
        JSON.stringify({ success: false, message: data.message || 'Erro ao criar pagamento' }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(data),
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
