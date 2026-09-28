// Gera um CSV simples a partir de um array de objetos, compatível com Excel (separador ; para BR)
export function toCsv(rows: Record<string, unknown>[], headers: { key: string; label: string }[]): string {
  const separator = ";";
  const headerLine = headers.map((h) => h.label).join(separator);

  const lines = rows.map((row) =>
    headers
      .map((h) => {
        const value = row[h.key];
        const stringValue = value === null || value === undefined ? "" : String(value);
        // Escapa aspas e envolve em aspas se contiver o separador, quebra de linha ou aspas
        const needsQuotes = stringValue.includes(separator) || stringValue.includes("\n") || stringValue.includes('"');
        const escaped = stringValue.replace(/"/g, '""');
        return needsQuotes ? `"${escaped}"` : escaped;
      })
      .join(separator)
  );

  // BOM UTF-8 para o Excel reconhecer acentuação corretamente
  return "\uFEFF" + [headerLine, ...lines].join("\n");
}
