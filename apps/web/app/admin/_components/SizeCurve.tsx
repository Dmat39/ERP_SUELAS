import type { VariantFlat } from '@/lib/types';

// "Curva de tallas": la forma en que la industria del calzado mira el stock —
// una fila por modelo, una celda por talla, coloreada por nivel de stock.
// Es la visualización insignia del panel (reemplaza barras genéricas).

export interface SizeCell {
  talla: string;
  qty: number;
}
export interface SizeRow {
  product: string;
  cells: SizeCell[];
}

// Agrupa variantes planas (sku, producto, talla, stock) en filas por producto.
export function sizeCurveRows(variants: VariantFlat[]): SizeRow[] {
  const map = new Map<string, SizeCell[]>();
  for (const v of variants) {
    const talla =
      v.attributes.find((a) => a.attribute.toLowerCase() === 'talla')?.value ?? v.sku;
    const arr = map.get(v.productName) ?? [];
    arr.push({ talla, qty: v.stock });
    map.set(v.productName, arr);
  }
  return [...map.entries()].map(([product, cells]) => ({
    product,
    cells: cells.sort(
      (a, b) => Number(a.talla) - Number(b.talla) || a.talla.localeCompare(b.talla),
    ),
  }));
}

function tone(qty: number, lowAt: number) {
  if (qty <= 0)
    return { bg: 'var(--color-danger-soft)', fg: 'var(--color-danger)', label: 'sin stock' };
  if (qty < lowAt)
    return { bg: 'var(--color-warn-soft)', fg: 'var(--color-warn)', label: 'poco' };
  return { bg: 'var(--color-ok-soft)', fg: 'var(--color-ok)', label: 'ok' };
}

export function SizeCurve({ rows, lowAt = 100 }: { rows: SizeRow[]; lowAt?: number }) {
  if (rows.length === 0) return null;
  return (
    <div className="space-y-4">
      {rows.map((row) => (
        <div key={row.product}>
          <div className="text-sm font-medium mb-2">{row.product}</div>
          <div className="flex flex-wrap gap-2">
            {row.cells.map((c) => {
              const t = tone(c.qty, lowAt);
              return (
                <div
                  key={c.talla}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-2 min-w-[4.5rem] text-center"
                  style={{ backgroundColor: t.bg }}
                  title={`Talla ${c.talla}: ${c.qty} en stock (${t.label})`}
                >
                  <div className="text-[11px] font-semibold text-[var(--color-muted)] tracking-wide">
                    T-{c.talla}
                  </div>
                  <div className="text-lg font-semibold tnum leading-tight" style={{ color: t.fg }}>
                    {c.qty}
                  </div>
                  <div className="text-[10px]" style={{ color: t.fg }}>
                    {t.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-4 text-[11px] text-[var(--color-muted)] pt-1">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--color-ok-soft)', border: '1px solid var(--color-ok)' }} />
          ok
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--color-warn-soft)', border: '1px solid var(--color-warn)' }} />
          poco (&lt;{lowAt})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: 'var(--color-danger-soft)', border: '1px solid var(--color-danger)' }} />
          sin stock
        </span>
      </div>
    </div>
  );
}
