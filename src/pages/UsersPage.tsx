import { useState } from 'react';
import { Table, type Column } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { UserFormModal } from '../components/users/UserFormModal';
import { ConfirmDeleteModal } from '../components/users/ConfirmDeleteModal';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import { USER_ROLE_LABELS } from '../constants/userRoles';
import type { User } from '../types/user.types';

const PlusIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

/**
 * Módulo de gestión de usuarios (CRUD). Lista en una tabla reutilizable y
 * gestiona crear/editar/eliminar mediante modales. Las acciones del CRUD solo
 * se muestran a administradores (el backend además las protege con 403).
 */
export const UsersPage = () => {
  const { users, isLoading, error, refresh } = useUsers();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setFormOpen(true);
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nombre',
      render: (user) => <span className="font-medium text-gray-900">{user.name}</span>,
    },
    { key: 'email', header: 'Correo' },
    {
      key: 'role',
      header: 'Rol',
      render: (user) => USER_ROLE_LABELS[user.role] ?? user.role,
    },
  ];

  if (isAdmin) {
    columns.push({
      key: 'actions',
      header: '',
      align: 'right',
      render: (user) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={() => openEdit(user)}
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary/5"
            aria-label={`Editar ${user.name}`}
          >
            Editar
          </button>
          <button
            type="button"
            onClick={() => setDeleting(user)}
            className="rounded-md px-2.5 py-1.5 text-sm font-medium text-error transition-colors hover:bg-error/5"
            aria-label={`Eliminar ${user.name}`}
          >
            Eliminar
          </button>
        </div>
      ),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Usuarios</h2>
          <p className="text-sm text-gray-500">
            Gestiona las cuentas de acceso al sistema.
          </p>
        </div>
        {isAdmin && (
          <Button fullWidth={false} onClick={openCreate} icon={PlusIcon}>
            Nuevo usuario
          </Button>
        )}
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
        >
          {error}
        </div>
      ) : (
        <Table
          columns={columns}
          data={users}
          rowKey="id"
          isLoading={isLoading}
          emptyMessage="No hay usuarios registrados."
        />
      )}

      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={refresh}
        user={editing}
      />
      <ConfirmDeleteModal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onSuccess={refresh}
        user={deleting}
      />
    </div>
  );
};

export default UsersPage;
