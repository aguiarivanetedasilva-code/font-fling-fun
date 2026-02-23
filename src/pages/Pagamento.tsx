import { useNavigate, useSearchParams } from "react-router-dom";

const Pagamento = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const valor = searchParams.get("valor") || "0,00";
  const placa = searchParams.get("placa") || "ABC1234";

  const handlePix = () => {
    const params = new URLSearchParams({
      valor,
      placa,
      nome: "John Smith",
      email: "pagamento@pedagiodigital.com",
      telefone: "11999999999",
      cpf: "26208784620",
    });
    navigate(`/pix?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
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
        <h3 className="text-gray-900 font-bold text-lg mb-3">Forma de pagamento</h3>

        <button
          onClick={handlePix}
          className="w-full flex items-center gap-4 py-4 px-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
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
    </div>
  );
};

export default Pagamento;
