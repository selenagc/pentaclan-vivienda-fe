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
import ApplicationFormPage from './pages/ApplicationFormPage';
import GeographyDemoPage from './pages/GeographyDemoPage';
import ModulePlaceholder from './pages/ModulePlaceholder';
import { DiagnosisPlaceholder } from './components/applications/DiagnosisPlaceholder';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';

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
              cada cosa que cuelga de él. Cada pestaña es una ruta hija para que
              su dirección se pueda compartir y el botón *atrás* funcione. Las
              secciones futuras (documentos, seguimiento…) se añaden aquí y en
              la lista de pestañas de `ProjectDetailPage`. */}
          <Route path="/proyectos/:projectId" element={<ProjectDetailPage />}>
            <Route index element={<Navigate to="solicitantes" replace />} />
            {/* Los solicitantes cuelgan del proyecto: una postulación siempre
                es *a* un proyecto, y su vivienda debe estar en el municipio
                donde se ejecuta la obra. La ruta deja ese contexto fijado. */}
            <Route path="solicitantes" element={<ProjectApplicantsPage />} />
            {/* Beneficiarios no es otro recurso: es este mismo padrón filtrado
                por estado `approved`. */}
            <Route path="beneficiarios" element={<ProjectBeneficiariesPage />} />
          </Route>

          {/* El formulario va a pantalla completa, fuera de las pestañas: son
              cuatro bloques largos y se captura en campo, muchas veces en un
              móvil. `nuevo` gana a `:applicationId` porque el router prioriza
              los segmentos estáticos sobre los dinámicos. */}
          <Route
            path="/proyectos/:projectId/solicitantes/nuevo"
            element={<ApplicationFormPage />}
          />
          <Route
            path="/proyectos/:projectId/solicitantes/:applicationId/editar"
            element={<ApplicationFormPage />}
          />

          {/* Ficha del solicitante: datos generales y los dos diagnósticos,
              que hoy solo reservan su sitio. */}
          <Route
            path="/proyectos/:projectId/solicitantes/:applicationId"
            element={<ApplicationDetailPage />}
          >
            <Route index element={<ApplicationDataPage />} />
            <Route
              path="diagnostico-social"
              element={
                <DiagnosisPlaceholder
                  title="Diagnóstico social"
                  description="La evaluación socioeconómica del hogar, que levanta el líder social."
                />
              }
            />
            <Route
              path="diagnostico-tecnico"
              element={
                <DiagnosisPlaceholder
                  title="Diagnóstico técnico"
                  description="El estado constructivo de la vivienda, que levanta el líder técnico."
                />
              }
            />
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
