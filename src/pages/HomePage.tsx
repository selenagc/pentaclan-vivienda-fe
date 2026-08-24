import { useAuth } from '../hooks/useAuth';

/**
 * Página de aterrizaje tras iniciar sesión. El shell (sidebar/topbar) lo aporta
 * AppLayout; aquí solo va el contenido de bienvenida.
 */
export const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8">
      <h2 className="text-2xl font-bold text-gray-900">
        Bienvenido{user?.name ? `, ${user.name}` : ''}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Esta es la plantilla principal. El contenido de cada módulo se
        incorporará en sus tickets correspondientes.
      </p>
    </div>
  );
};

export default HomePage;
