'use client';

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const AXIS = '#94a3b8';
const GRID = '#e2e8f0';

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontSize: 12,
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
};

// ---- KPI con tendencia (▲/▼ vs periodo anterior) y mini-sparkline ----
export function KpiSpark({
  label,
  value,
  delta,
  data,
  color = '#0d9488',
  counter = false,
}: {
  label: string;
  value: string;
  delta?: number | null; // % vs 7 días previos; null = sin comparación
  data: { v: number }[];
  color?: string;
  counter?: boolean; // estilo "contador de planta" (dígitos teal sobre pizarra)
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted)]">
            {label}
          </div>
          {counter ? (
            <div className="mt-1.5">
              <span className="counter text-xl">{value}</span>
            </div>
          ) : (
            <div className="text-2xl font-semibold mt-1 tnum">{value}</div>
          )}
          {delta != null ? (
            <div
              className={`text-xs mt-1 font-medium ${
                up ? 'text-[var(--color-ok)]' : 'text-[var(--color-danger)]'
              }`}
            >
              {up ? '▲' : '▼'} {Math.abs(delta).toFixed(0)}%{' '}
              <span className="text-[var(--color-muted)] font-normal">vs 7 días previos</span>
            </div>
          ) : (
            <div className="text-xs mt-1 text-[var(--color-muted)]">últimos 7 días</div>
          )}
        </div>
        <div style={{ width: 92, height: 48 }} className="shrink-0">
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <Area
                type="monotone"
                dataKey="v"
                stroke={color}
                strokeWidth={1.5}
                fill={color}
                fillOpacity={0.14}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ---- Ventas por día (área) ----
export function SalesArea({ data }: { data: { day: string; total: number }[] }) {
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: AXIS }} axisLine={{ stroke: GRID }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [`S/ ${Number(v).toFixed(2)}`, 'Ventas']}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#0d9488"
            strokeWidth={2}
            fill="url(#salesFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---- Dona genérica con leyenda (pedidos por estado, ventas por origen) ----
export function Donut({
  data,
  centerLabel,
}: {
  data: { name: string; value: number; color: string }[];
  centerLabel: string;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex items-center gap-4">
      <div style={{ width: 150, height: 150 }} className="relative shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={48}
              outerRadius={68}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-semibold tnum">{total}</span>
          <span className="text-xs text-[var(--color-muted)]">{centerLabel}</span>
        </div>
      </div>
      <ul className="text-sm space-y-1.5 flex-1 min-w-0">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 min-w-0">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="truncate">{d.name}</span>
            </span>
            <span className="tnum font-medium">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Compatibilidad con el nombre anterior.
export function StatusDonut({
  data,
}: {
  data: { name: string; value: number; color: string }[];
}) {
  return <Donut data={data} centerLabel="pedidos" />;
}

// ---- Stock por producto (barras verticales) ----
export function StockBars({ data }: { data: { sku: string; stock: number }[] }) {
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <XAxis dataKey="sku" tick={{ fontSize: 11, fill: AXIS }} axisLine={{ stroke: GRID }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: AXIS }} axisLine={false} tickLine={false} width={48} />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: '#f1f5f9' }}
            formatter={(v) => [`${Number(v)} u.`, 'Stock']}
          />
          <Bar dataKey="stock" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---- Top productos vendidos (barras horizontales) ----
export function TopBars({
  data,
  color = '#7c3aed',
}: {
  data: { name: string; value: number }[];
  color?: string;
}) {
  return (
    <div style={{ width: '100%', height: Math.max(170, data.length * 42) }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            width={104}
            tick={{ fontSize: 11, fill: AXIS }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: '#f1f5f9' }}
            formatter={(v) => [`${Number(v)} u.`, 'Vendidas']}
          />
          <Bar dataKey="value" fill={color} radius={[0, 4, 4, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
