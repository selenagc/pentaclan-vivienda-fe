import { Fragment } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ProjectApplicantsPage from './pages/ProjectApplicantsPage';
import ProjectBeneficiariesPage from './pages/ProjectBeneficiariesPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import ApplicationDataPage from './pages/ApplicationDataPage';
import ApplicationDiagnosisPage from './pages/ApplicationDiagnosisPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import GeographyDemoPage from './pages/GeographyDemoPage';
import ModulePlaceholder from './pages/ModulePlaceholder';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import type { ProjectSection } from './components/applications/applicationOutlet';

/** Las dos direcciones de diagnóstico, para montarlas o redirigirlas. */
const DIAGNOSIS_PATHS = {
  social: 'diagnostico-social',
  technical: 'diagnostico-tecnico',
} as const;

/**
 * Las rutas de una ficha, iguales bajo las dos pestañas que llevan a ella.
 *
 * Se repiten a propósito bajo *solicitantes* y bajo *beneficiarios*: son la
 * misma ficha, pero entrar por una u otra es lo que mantiene marcada la
 * pestaña de origen y lo que hace que *volver* devuelva a la lista correcta.
 *
 * Van con la ruta completa (`solicitantes/:applicationId`) y no anidadas bajo
 * un `<Route path="solicitantes">` sin `element`: esa ruta intermedia pintaría
 * un `<Outlet />` propio, y como el contexto del outlet lo fija quien lo
 * renderiza, el proyecto que `ProjectDetailPage` pasa a sus hijos se perdería
 * antes de llegar al formulario.
 *
 * Los dos diagnósticos **solo cuelgan de beneficiarios**: son suyos, y un
 * solicitante no los tiene ni siquiera vacíos. Bajo *solicitantes* esas dos
 * direcciones no dejan de existir, redirigen a la ficha: una guardada de antes
 * o escrita a mano cae donde el usuario quería ir, en vez de echarlo al inicio.
 */
const applicationRoutes = (section: ProjectSection) => (
  <Fragment key={section}>
    <Route
      path={`${section}/:applicationId`}
      element={<ApplicationDetailPage section={section} />}
    >
      <Route index element={<ApplicationDataPage />} />
      {section === 'beneficiarios' ? (
        <Fragment key="diagnosticos">
          <Route path={DIAGNOSIS_PATHS.social} element={<ApplicationDiagnosisPage kind="social" />} />
          <Route
            path={DIAGNOSIS_PATHS.technical}
            element={<ApplicationDiagnosisPage kind="technical" />}
          />
        </Fragment>
      ) : (
        Object.values(DIAGNOSIS_PATHS).map((path) => (
          // `relative="path"` para que `..` quite un segmento de la URL y no
          // suba por el árbol de rutas, que llevaría al listado del proyecto.
          <Route key={path} path={path} element={<Navigate to=".." relative="path" replace />} />
        ))
      )}
    </Route>
    <Route
      path={`${section}/:applicationId/editar`}
      element={<ApplicationFormPage section={section} />}
    />
  </Fragment>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas: requieren sesión y se renderizan dentro de la plantilla. */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/inicio" element={<HomePage />} />
          <Route path="/usuarios" element={<UsersPage />} />
          {/* Temporal: banco de pruebas del selector geográfico (PV-17). */}
          <Route path="/geografia" element={<GeographyDemoPage />} />
          <Route path="/proyectos" element={<ProjectsPage />} />
          <Route path="/proyectos/nuevo" element={<CreateProjectPage />} />

          {/* Detalle del proyecto: la tarjeta con sus datos y una pestaña por
              cada cosa que cuelga de él. **Todo** lo del proyecto se abre aquí
              dentro —listas, fichas y formularios—, así que la cabecera y las
              pestañas nunca desaparecen y siempre se sabe en qué proyecto se
              está trabajando. */}
          <Route path="/proyectos/:projectId" element={<ProjectDetailPage />}>
            <Route index element={<Navigate to="solicitantes" replace />} />

            {/* Los solicitantes cuelgan del proyecto: una postulación siempre
                es *a* un proyecto, y su vivienda debe estar en el municipio
                donde se ejecuta la obra. La ruta deja ese contexto fijado. */}
            <Route path="solicitantes" element={<ProjectApplicantsPage />} />
            {/* `nuevo` gana a `:applicationId` porque el router prioriza los
                segmentos estáticos sobre los dinámicos. */}
            <Route
              path="solicitantes/nuevo"
              element={<ApplicationFormPage section="solicitantes" />}
            />
            {applicationRoutes('solicitantes')}

            {/* Beneficiarios no es otro recurso: es este mismo padrón filtrado
                por estado `approved`. No se dan de alta aquí, se llega por
                aprobación. */}
            <Route path="beneficiarios" element={<ProjectBeneficiariesPage />} />
            {applicationRoutes('beneficiarios')}
          </Route>

          <Route path="/beneficiarios" element={<ModulePlaceholder title="Beneficiarios" />} />
          <Route path="/reportes" element={<ModulePlaceholder title="Reportes" />} />
          <Route path="/configuracion" element={<ModulePlaceholder title="Configuración" />} />
        </Route>
      </Route>

      {/* Por defecto, llevamos a Inicio (el guard redirige a login si no hay sesión). */}
      <Route path="*" element={<Navigate to="/inicio" replace />} />
    </Routes>
  );
}

export default App;
