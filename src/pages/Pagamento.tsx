import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Pagamento = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const valor = searchParams.get("valor") || "0,00";
  const placa = searchParams.get("placa") || "ABC1234";

  const [nome, setNome] = useState("Pedagio Digital LTDA.");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");

  const handleContinue = () => {
    if (!nome || !email || !telefone || !cpf) return;
    const params = new URLSearchParams({
      valor,
      placa,
      nome,
      email,
      telefone,
      cpf,
    });
    navigate(`/pix?${params.toString()}`);
  };

  const formatCpf = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const formatPhone = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const isValid = nome.trim() && email.includes("@") && telefone.replace(/\D/g, "").length >= 10 && cpf.replace(/\D/g, "").length >= 11;

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
        <h1 className="text-gray-900 font-bold text-lg">Pagamento</h1>
      </header>

      <div className="max-w-3xl mx-auto px-6 pt-8">
        <h2 className="text-gray-900 font-bold text-xl">Dados do pagador</h2>
        <p className="text-gray-500 text-sm mt-1">Preencha os dados abaixo para gerar o Pix</p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="text-gray-700 text-sm font-medium block mb-1">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="João da Silva"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="text-gray-700 text-sm font-medium block mb-1">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@email.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="text-gray-700 text-sm font-medium block mb-1">Telefone</label>
            <input
              type="tel"
              value={telefone}
              onChange={(e) => setTelefone(formatPhone(e.target.value))}
              placeholder="(11) 99999-9999"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
          <div>
            <label className="text-gray-700 text-sm font-medium block mb-1">CPF</label>
            <input
              type="text"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>
        </div>

        {/* Payment method */}
        <div className="mt-8">
          <h3 className="text-gray-900 font-bold text-lg mb-3">Forma de pagamento</h3>
          <div className="flex items-center gap-4 py-4 px-4 bg-white border border-gray-200 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-lime-400 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
                <path d="M13.17 6.17L17 2l4 4-3.83 3.83" />
                <path d="M10.83 17.83L7 22l-4-4 3.83-3.83" />
                <path d="M6.17 6.17L2 10l4.83 4.83" />
                <path d="M17.83 17.83L22 14l-4.83-4.83" />
                <path d="m10 10 4 4" />
              </svg>
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-sm">Pix</p>
              <p className="text-gray-500 text-xs">Pagamento instantâneo</p>
            </div>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="w-full mt-8 mb-8 py-4 rounded-xl bg-gray-950 text-white font-bold text-base tracking-wider hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Gerar Pix - R$ {valor}
        </button>
      </div>
    </div>
  );
};

export default Pagamento;
