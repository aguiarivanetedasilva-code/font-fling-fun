import { useState } from "react";
import heroBg from "@/assets/hero-bg.jpg";

const Header = () => (
  <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-5 lg:px-16">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
        <span className="text-primary-foreground font-black text-xl">P</span>
      </div>
      <div className="leading-tight">
        <span className="text-foreground font-extrabold text-lg block">Pedágio</span>
        <span className="text-primary font-extrabold text-lg block -mt-1">Digital</span>
      </div>
    </div>
    <nav className="hidden md:flex items-center gap-6">
      <a href="#" className="text-foreground font-semibold text-sm hover:text-primary transition-colors">
        Fazer Login
      </a>
      <a href="#" className="text-foreground font-semibold text-sm hover:text-primary transition-colors">
        Perguntas frequentes
      </a>
      <a
        href="#"
        className="border border-foreground text-foreground font-semibold text-sm px-5 py-2 rounded-md hover:bg-foreground hover:text-background transition-colors"
      >
        Criar Conta
      </a>
    </nav>
  </header>
);

const SearchCard = () => {
  const [placa, setPlaca] = useState("");
  const [termos, setTermos] = useState(false);
  const [privacidade, setPrivacidade] = useState(false);

  return (
    <div className="bg-card rounded-xl p-10 shadow-2xl w-full max-w-md min-h-[520px] flex flex-col justify-between">
      <p className="text-card-foreground text-base mb-6">
        Um <strong>único</strong> lugar para <strong>acessar</strong> e{" "}
        <strong>controlar</strong> seus pagamentos.
      </p>

      <input
        type="text"
        placeholder="DIGITE SUA PLACA"
        value={placa}
        onChange={(e) => setPlaca(e.target.value.toUpperCase())}
        className="w-full px-4 py-3 rounded-md border border-border bg-input text-card-foreground placeholder:text-muted-foreground text-sm font-semibold tracking-widest mb-5 focus:outline-none focus:ring-2 focus:ring-primary"
        maxLength={7}
      />

      <label className="flex items-start gap-3 mb-3 cursor-pointer">
        <input
          type="checkbox"
          checked={termos}
          onChange={(e) => setTermos(e.target.checked)}
          className="mt-0.5 w-4 h-4 appearance-none border border-gray-300 rounded-sm bg-white checked:bg-primary checked:border-primary cursor-pointer shrink-0"
        />
        <span className="text-card-foreground text-xs leading-relaxed">
          Aceito os{" "}
          <a href="#" className="underline font-semibold hover:text-primary">
            Termos e Condições de Uso
          </a>
          .
        </span>
      </label>

      <label className="flex items-start gap-3 mb-6 cursor-pointer">
        <input
          type="checkbox"
          checked={privacidade}
          onChange={(e) => setPrivacidade(e.target.checked)}
          className="mt-0.5 w-4 h-4 appearance-none border border-gray-300 rounded-sm bg-white checked:bg-primary checked:border-primary cursor-pointer shrink-0"
        />
        <span className="text-card-foreground text-xs leading-relaxed">
          Estou ciente da{" "}
          <a href="#" className="underline font-semibold hover:text-primary">
            Política de Privacidade
          </a>{" "}
          e me responsabilizo pela veracidade dos dados.
        </span>
      </label>

      <button className="w-full py-3 rounded-md bg-muted text-muted-foreground font-semibold text-sm hover:bg-primary hover:text-primary-foreground transition-colors mb-4">
        Buscar débitos
      </button>

      <a
        href="#"
        className="block text-center text-card-foreground text-sm font-semibold underline hover:text-primary transition-colors"
      >
        Começar agora
      </a>
    </div>
  );
};

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Pessoas felizes"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/75" />
      </div>

      <Header />

      {/* Hero */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-between min-h-screen px-8 lg:px-16 pt-28 pb-16 gap-12">
        <div className="max-w-xl">
          <h1 className="text-foreground text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
            DESFRUTE DE TODA A COMODIDADE DO PEDÁGIO{" "}
            <span className="text-primary">DIGITAL</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            Uma nova era para o pedágio começou: ágil e digital como tem que ser.
          </p>
        </div>

        <SearchCard />
      </main>
    </div>
  );
};

export default Index;
