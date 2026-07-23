/**
 * Propriedades para o componente ResultMetadata.
 * @property resourceName - Nome do recurso a ser exibido (ex: "Negociações", "Subgrupos").
 * @property total - Total de registros retornados pela API.
 * @property displayed - Quantidade de registros exibidos na tela.
 * @property isLoading - Indica se os dados ainda estão sendo carregados (opcional).
 */
interface ResultMetadataProps {
  /** Nome do recurso a ser exibido (ex: "Negociações", "Subgrupos") */
  resourceName: string;
  /** Total de registros retornados pela API */
  total: number;
  /** Quantidade de registros exibidos na tela */
  displayed: number;
  /** Indica se os dados ainda estão sendo carregados (opcional) */
  isLoading?: boolean;
}

export function ResultMetadata({
  resourceName,
  total,
  displayed,
  isLoading = false,
}: ResultMetadataProps) {
  return (
    <div className="mt-4 mb-4" role="status" aria-live="polite">
      <div style={{ fontSize: "medium", fontWeight: "bold", color: "#004A8D" }}>
        {`${resourceName} encontrad${
          resourceName.endsWith("a") ? "a" : "o"
        }s | ${isLoading ? "carregando ..." : total?.toLocaleString("pt-BR")}`}
      </div>
      {displayed >= 30 && (
        <div>
          Exibindo os <span className="font-bold">{displayed}</span> primeiros
          registros. Utilize os filtros para refinar sua busca.
        </div>
      )}
    </div>
  );
}
