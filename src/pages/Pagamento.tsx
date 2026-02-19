import { useNavigate, useSearchParams } from "react-router-dom";

const Pagamento = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const valor = searchParams.get("valor") || "0,00";

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
        <h2 className="text-gray-900 font-bold text-xl">Forma de pagamento</h2>
        <p className="text-gray-500 text-sm mt-1">Selecione abaixo como quer fazer o pagamento</p>

        {/* Pix option */}
        <button
          onClick={() => {/* futura navegação para Pix */}}
          className="w-full flex items-center justify-between mt-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors rounded-lg px-2"
        >
          <div className="flex items-center gap-4">
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
              <p className="text-gray-500 text-xs">Informações para pagamento</p>
            </div>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Pagamento;
