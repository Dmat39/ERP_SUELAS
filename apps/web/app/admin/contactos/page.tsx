import { apiFetch } from '@/lib/api';
import { getSession } from '@/lib/session';
import { EmptyState } from '../_components/PageHeader';
import { ModuleHeader } from '../_components/ModuleHeader';
import { NewContact } from './NewContact';
import { ContactActions } from './ContactActions';
import type { Contact } from '@/lib/types';

export default async function ContactosPage() {
  const [contacts, session] = await Promise.all([
    apiFetch<Contact[]>('/contacts'),
    getSession(),
  ]);
  const isAdmin = session?.role === 'ADMIN';

  return (
    <div>
      <ModuleHeader moduleKey="contactos">
        <NewContact />
      </ModuleHeader>

      <div className="card overflow-hidden">
        {contacts.length === 0 ? (
          <EmptyState message="No hay contactos registrados." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Contacto</th>
                  <th>Rol</th>
                  {isAdmin && <th className="text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.name}</td>
                    <td className="text-[var(--color-muted)] tnum">
                      {c.docType ? `${c.docType} ${c.docNumber ?? ''}` : '—'}
                    </td>
                    <td className="text-[var(--color-muted)]">
                      {c.phone && <div>{c.phone}</div>}
                      {c.email && <div>{c.email}</div>}
                      {!c.phone && !c.email && '—'}
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        {c.isCustomer && <span className="badge badge-info">Cliente</span>}
                        {c.isSupplier && <span className="badge badge-neutral">Proveedor</span>}
                      </div>
                    </td>
                    {isAdmin && (
                      <td>
                        <ContactActions contact={c} />
                      </td>
                    )}
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
