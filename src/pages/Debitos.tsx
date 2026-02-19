import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Debitos = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const placa = searchParams.get("placa") || "ABC1234";
  const [showModal, setShowModal] = useState(true);

  const now = new Date();
  const diasSemana = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
  const dia = diasSemana[now.getDay()];
  const hora = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-center relative px-6 py-4 border-b border-border">
        <button
          onClick={() => navigate("/")}
          className="absolute left-6 text-foreground text-2xl font-bold hover:text-primary transition-colors"
        >
          ‹
        </button>
        <h1 className="text-foreground font-bold text-lg">Débitos</h1>
      </header>

      {/* Banner */}
      <div className="relative h-56 overflow-hidden">
        <img src={heroBg} alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-4 left-6 flex items-center gap-2 text-white">
          <span className="text-xl">🚗</span>
          <span className="font-semibold text-sm">Seus veículos</span>
        </div>
      </div>

      {/* Placa */}
      <div className="px-6 py-4">
        <div className="bg-card border border-border rounded-lg px-4 py-3 inline-block">
          <span className="text-card-foreground font-bold text-sm tracking-widest">{placa}</span>
        </div>
      </div>

      {/* Tabela de débitos */}
      <div className="px-6">
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="grid grid-cols-4 bg-muted px-4 py-3 text-muted-foreground text-xs font-semibold">
            <span>Débitos</span>
            <span>Selecionar</span>
            <span></span>
            <span className="text-right">{now.toLocaleDateString("pt-BR")} - {hora}</span>
          </div>
          <div className="grid grid-cols-4 items-center px-4 py-4 border-t border-border">
            <div className="col-span-1">
              <input type="checkbox" className="w-4 h-4 appearance-none border border-gray-300 rounded-sm bg-white cursor-pointer" />
            </div>
            <div className="col-span-2">
              <p className="text-card-foreground font-bold text-sm">{placa}</p>
              <p className="text-muted-foreground text-xs">19/02/2025</p>
              <p className="text-muted-foreground text-xs">CCR</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-xs">Total: <strong className="text-card-foreground">67,19</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Total a pagar */}
      <div className="px-6 mt-6">
        <div className="border border-border rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer">
            <span className="text-card-foreground font-semibold text-sm">Total a pagar:</span>
            <span className="text-card-foreground text-lg">▼</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-card-foreground font-bold text-lg">R$ 0,00</span>
            <button className="border border-foreground text-foreground font-semibold text-sm px-6 py-2 rounded-md hover:bg-foreground hover:text-background transition-colors">
              Continuar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Atenção */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg mx-4 mb-0 sm:mb-0 p-8 relative">
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
              <span className="text-red-600 font-bold">R$ 195,23</span> e{" "}
              <span className="text-yellow-500 font-bold">5 pontos na CNH</span>.
            </p>

            {/* Artigo */}
            <div className="border-l-4 border-red-500 bg-gray-50 rounded-r-lg p-4 mb-6">
              <h3 className="text-gray-900 font-extrabold text-base mb-2">Art. 209-A - CTB:</h3>
              <p className="text-gray-500 text-xs mb-3">
                Conforme o Art. 209-A do CTB: "Efetuar o pagamento de pedágio eletrônico fora do prazo estabelecido pelo órgão..."
              </p>
              <p className="text-sm">
                Infração: <span className="text-yellow-500 font-bold">Grave.</span>
              </p>
              <p className="text-sm">
                Penalidade: <span className="text-red-600 font-bold">Multa de R$ 195,23.</span>
              </p>
              <p className="text-sm">
                Pontuação: <span className="text-yellow-500 font-bold">5 pontos na CNH.</span>
              </p>
            </div>

            {/* Botão Continuar */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-4 rounded-lg bg-gray-900 text-white font-bold text-base tracking-wider hover:bg-gray-800 transition-colors"
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
