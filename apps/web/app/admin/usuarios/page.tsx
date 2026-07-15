import { apiFetch } from '@/lib/api';
import { fecha } from '@/lib/format';
import { EmptyState } from '../_components/PageHeader';
import { ModuleHeader } from '../_components/ModuleHeader';
import type { AdminUser } from '@/lib/types';

const roleBadge: Record<string, string> = {
  ADMIN: 'badge badge-info',
  ALMACENERO: 'badge badge-neutral',
  VENDEDOR: 'badge badge-ok',
};

export default async function UsuariosPage() {
  const users = await apiFetch<AdminUser[]>('/users');

  return (
    <div>
      <ModuleHeader moduleKey="usuarios" />

      <div className="card overflow-hidden">
        {users.length === 0 ? (
          <EmptyState message="No hay usuarios." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Creado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name}</td>
                    <td className="text-[var(--color-muted)]">{u.email}</td>
                    <td>
                      <span className={roleBadge[u.role] ?? 'badge badge-neutral'}>{u.role}</span>
                    </td>
                    <td>
                      {u.active ? (
                        <span className="badge badge-ok">Activo</span>
                      ) : (
                        <span className="badge badge-danger">Inactivo</span>
                      )}
                    </td>
                    <td className="text-[var(--color-muted)]">{fecha(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
