import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { MyProjectsView } from '../components/projects/MyProjectsView';

/**
 * Página de aterrizaje tras iniciar sesión.
 * Si el usuario tiene rol de evaluador de campo (social_lead o technical_lead),
 * aterriza directamente en la vista de sus proyectos asignados.
 * Si es administrador o supervisor, muestra el resumen y accesos rápidos.
 */
export const HomePage = () => {
  const { user } = useAuth();
  const isFieldEvaluator = user?.role === 'social_lead' || user?.role === 'technical_lead';

  if (isFieldEvaluator) {
    return (
      <MyProjectsView
        title={`Bienvenido${user?.name ? `, ${user.name}` : ''}`}
        subtitle="Aquí tienes los proyectos en los que estás asignado para realizar evaluaciones de campo."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Bienvenido{user?.name ? `, ${user.name}` : ''}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Panel de control y gestión del programa de vivienda social.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-brand-primary ring-1 ring-purple-500/20 w-fit">
            Rol: {user?.role === 'admin' ? 'Administrador' : user?.role ?? 'Usuario'}
          </span>
        </div>
      </div>

      {/* Accesos rápidos administrativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <NavLink
          to="/proyectos"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs hover:border-brand-primary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-primary transition-colors">
              Catálogo de Proyectos
            </h3>
            <span className="text-brand-primary">→</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Administrar proyectos, contratos y asignación de técnicos y trabajadores sociales a proyectos.
          </p>
        </NavLink>

        <NavLink
          to="/usuarios"
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs hover:border-brand-primary/40 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-primary transition-colors">
              Gestión de Usuarios
            </h3>
            <span className="text-brand-primary">→</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Creación, edición y administración de cuentas con roles de campo y supervisión.
          </p>
        </NavLink>
      </div>
    </div>
  );
};

export default HomePage;

