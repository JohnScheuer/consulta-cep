import { useState, useCallback } from "react";

interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

interface StateInfo {
  sigla: string;
  nome: string;
  capital: string;
  regiao: string;
}

const estadosBrasil: Record<string, StateInfo> = {
  AC: { sigla: "AC", nome: "Acre", capital: "Rio Branco", regiao: "Norte" },
  AL: { sigla: "AL", nome: "Alagoas", capital: "Maceió", regiao: "Nordeste" },
  AP: { sigla: "AP", nome: "Amapá", capital: "Macapá", regiao: "Norte" },
  AM: { sigla: "AM", nome: "Amazonas", capital: "Manaus", regiao: "Norte" },
  BA: { sigla: "BA", nome: "Bahia", capital: "Salvador", regiao: "Nordeste" },
  CE: { sigla: "CE", nome: "Ceará", capital: "Fortaleza", regiao: "Nordeste" },
  DF: { sigla: "DF", nome: "Distrito Federal", capital: "Brasília", regiao: "Centro-Oeste" },
  ES: { sigla: "ES", nome: "Espírito Santo", capital: "Vitória", regiao: "Sudeste" },
  GO: { sigla: "GO", nome: "Goiás", capital: "Goiânia", regiao: "Centro-Oeste" },
  MA: { sigla: "MA", nome: "Maranhão", capital: "São Luís", regiao: "Nordeste" },
  MT: { sigla: "MT", nome: "Mato Grosso", capital: "Cuiabá", regiao: "Centro-Oeste" },
  MS: { sigla: "MS", nome: "Mato Grosso do Sul", capital: "Campo Grande", regiao: "Centro-Oeste" },
  MG: { sigla: "MG", nome: "Minas Gerais", capital: "Belo Horizonte", regiao: "Sudeste" },
  PA: { sigla: "PA", nome: "Pará", capital: "Belém", regiao: "Norte" },
  PB: { sigla: "PB", nome: "Paraíba", capital: "João Pessoa", regiao: "Nordeste" },
  PR: { sigla: "PR", nome: "Paraná", capital: "Curitiba", regiao: "Sul" },
  PE: { sigla: "PE", nome: "Pernambuco", capital: "Recife", regiao: "Nordeste" },
  PI: { sigla: "PI", nome: "Piauí", capital: "Teresina", regiao: "Nordeste" },
  RJ: { sigla: "RJ", nome: "Rio de Janeiro", capital: "Rio de Janeiro", regiao: "Sudeste" },
  RN: { sigla: "RN", nome: "Rio Grande do Norte", capital: "Natal", regiao: "Nordeste" },
  RS: { sigla: "RS", nome: "Rio Grande do Sul", capital: "Porto Alegre", regiao: "Sul" },
  RO: { sigla: "RO", nome: "Rondônia", capital: "Porto Velho", regiao: "Norte" },
  RR: { sigla: "RR", nome: "Roraima", capital: "Boa Vista", regiao: "Norte" },
  SC: { sigla: "SC", nome: "Santa Catarina", capital: "Florianópolis", regiao: "Sul" },
  SP: { sigla: "SP", nome: "São Paulo", capital: "São Paulo", regiao: "Sudeste" },
  SE: { sigla: "SE", nome: "Sergipe", capital: "Aracaju", regiao: "Nordeste" },
  TO: { sigla: "TO", nome: "Tocantins", capital: "Palmas", regiao: "Norte" },
};

const regiaoColors: Record<string, string> = {
  Norte: "from-emerald-500 to-teal-600",
  Nordeste: "from-orange-500 to-amber-600",
  "Centro-Oeste": "from-yellow-500 to-orange-500",
  Sudeste: "from-blue-500 to-indigo-600",
  Sul: "from-green-500 to-emerald-600",
};

const regiaoBadgeColors: Record<string, string> = {
  Norte: "bg-emerald-100 text-emerald-800",
  Nordeste: "bg-orange-100 text-orange-800",
  "Centro-Oeste": "bg-yellow-100 text-yellow-800",
  Sudeste: "bg-blue-100 text-blue-800",
  Sul: "bg-green-100 text-green-800",
};

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return digits;
}

function App() {
  const [cepInput, setCepInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CepResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const consultarCep = useCallback(async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setLoading(true);
    setError(null);
    setShowResult(false);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      const json: CepResponse = await response.json();

      if (json.erro) {
        setError("CEP não encontrado. Verifique o número digitado.");
        setData(null);
      } else {
        setData(json);
        setError(null);
        setTimeout(() => setShowResult(true), 100);
      }
    } catch {
      setError("Erro ao consultar o CEP. Verifique sua conexão.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    setCepInput(formatted);

    if (formatted.replace(/\D/g, "").length === 8) {
      consultarCep(formatted);
    } else {
      setData(null);
      setError(null);
      setShowResult(false);
    }
  };

  const handleClear = () => {
    setCepInput("");
    setData(null);
    setError(null);
    setShowResult(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      consultarCep(cepInput);
    }
  };

  const stateInfo = data?.uf ? estadosBrasil[data.uf] : null;
  const cepLimpo = cepInput.replace(/\D/g, "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Descubra seu Estado
          </h1>
          <p className="text-purple-200/70 mt-2 text-sm">
            Digite um CEP para descobrir a sigla do estado brasileiro
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/10">
          <label
            htmlFor="cep-input"
            className="block text-sm font-medium text-purple-200 mb-2"
          >
            CEP
          </label>
          <div className="relative">
            <input
              id="cep-input"
              type="text"
              inputMode="numeric"
              value={cepInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="00000-000"
              maxLength={9}
              className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white text-lg font-mono placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all"
              autoFocus
            />
            {cepInput && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1"
                aria-label="Limpar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Progress indicator */}
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  i < cepLimpo.length
                    ? "bg-purple-400"
                    : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-white/30 mt-2">
            {cepLimpo.length}/8 dígitos
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 flex items-center justify-center gap-3 text-purple-200">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Buscando...</span>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mt-6 bg-red-500/20 backdrop-blur-xl rounded-2xl p-4 border border-red-500/30 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {data && stateInfo && !loading && !error && (
          <div
            className={`mt-6 transition-all duration-500 ${
              showResult
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {/* Main State Card */}
            <div className={`bg-gradient-to-br ${regiaoColors[stateInfo.regiao]} rounded-3xl p-6 shadow-2xl relative overflow-hidden`}>
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 right-4 text-8xl font-black text-white/20">
                  {stateInfo.sigla}
                </div>
              </div>
              
              <div className="relative">
                <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">
                  Sigla do Estado
                </p>
                <h2 className="text-6xl font-black text-white mb-1 tracking-tight">
                  {data.uf}
                </h2>
                <p className="text-white/90 text-lg font-semibold">
                  {stateInfo.nome}
                </p>
                <div className="mt-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${regiaoBadgeColors[stateInfo.regiao]}`}>
                    Região {stateInfo.regiao}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="mt-3 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/10 space-y-3">
              {data.localidade && (
                <DetailRow
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  label="Cidade"
                  value={data.localidade}
                />
              )}
              {data.bairro && (
                <DetailRow
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  }
                  label="Bairro"
                  value={data.bairro}
                />
              )}
              {data.logradouro && (
                <DetailRow
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                  label="Logradouro"
                  value={data.logradouro}
                />
              )}
              {data.ddd && (
                <DetailRow
                  icon={
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                  label="DDD"
                  value={data.ddd}
                />
              )}
            </div>
          </div>
        )}

        {/* Footer hint */}
        <p className="text-center text-white/20 text-xs mt-8">
          Dados via{" "}
          <a
            href="https://viacep.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white/40 transition-colors"
          >
            ViaCEP
          </a>
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-purple-300">{icon}</div>
      <div>
        <p className="text-white/40 text-xs">{label}</p>
        <p className="text-white text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export default App;
