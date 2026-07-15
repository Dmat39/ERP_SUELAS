import { apiFetch } from '@/lib/api';
import { getSession } from '@/lib/session';
import { soles, qty } from '@/lib/format';
import { EmptyState } from '../_components/PageHeader';
import { ModuleHeader } from '../_components/ModuleHeader';
import { NewRawMaterial } from './NewRawMaterial';
import { RawMaterialActions } from './RawMaterialActions';
import type { RawMaterial } from '@/lib/types';

export default async function MateriaPrimaPage() {
  const [materials, session] = await Promise.all([
    apiFetch<RawMaterial[]>('/raw-materials'),
    getSession(),
  ]);
  const isAdmin = session?.role === 'ADMIN';

  return (
    <div>
      <ModuleHeader moduleKey="materia-prima">
        <NewRawMaterial />
      </ModuleHeader>

      <div className="card overflow-hidden">
        {materials.length === 0 ? (
          <EmptyState message="No hay materia prima registrada." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Unidad</th>
                  <th className="text-right">Costo unit.</th>
                  <th className="text-right">Stock total</th>
                  <th className="text-right">Mínimo</th>
                  <th>Estado</th>
                  {isAdmin && <th className="text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {materials.map((m) => {
                  const total = m.stock.reduce((s, x) => s + Number(x.quantity), 0);
                  const bajo = total < Number(m.minStock);
                  return (
                    <tr key={m.id}>
                      <td className="font-medium">{m.name}</td>
                      <td className="text-[var(--color-muted)]">{m.unit}</td>
                      <td className="text-right tnum">{soles(m.costPerUnit)}</td>
                      <td
                        className={`text-right tnum font-medium ${
                          bajo ? 'text-[var(--color-warn)]' : ''
                        }`}
                      >
                        {qty(total)} {m.unit}
                      </td>
                      <td className="text-right tnum text-[var(--color-muted)]">
                        {qty(m.minStock)} {m.unit}
                      </td>
                      <td>
                        {bajo ? (
                          <span className="badge badge-warn">Bajo mínimo</span>
                        ) : (
                          <span className="badge badge-ok">OK</span>
                        )}
                      </td>
                      {isAdmin && (
                        <td>
                          <RawMaterialActions material={m} />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
