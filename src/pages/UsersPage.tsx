import { useState } from 'react';
import Alert from '@mui/material/Alert';
import MuiButton from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { Table, type Column } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
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
  const { users, meta, page, limit, isLoading, error, refresh, goToPage, changeLimit } =
    useUsers();
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
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <MuiButton size="small" onClick={() => openEdit(user)} aria-label={`Editar ${user.name}`}>
            Editar
          </MuiButton>
          <MuiButton
            size="small"
            color="error"
            onClick={() => setDeleting(user)}
            aria-label={`Eliminar ${user.name}`}
          >
            Eliminar
          </MuiButton>
        </Stack>
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
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Table
            columns={columns}
            data={users}
            rowKey="id"
            isLoading={isLoading}
            emptyMessage="No hay usuarios registrados."
          />
          {meta && (
            <Pagination
              page={page}
              totalPages={meta.totalPages}
              total={meta.total}
              limit={limit}
              isLoading={isLoading}
              onPageChange={goToPage}
              onLimitChange={changeLimit}
              itemLabel={{ singular: 'usuario', plural: 'usuarios' }}
            />
          )}
        </>
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
