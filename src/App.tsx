import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import UsersPage from './pages/UsersPage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectApplicantsPage from './pages/ProjectApplicantsPage';
import ApplicationFormPage from './pages/ApplicationFormPage';
import GeographyDemoPage from './pages/GeographyDemoPage';
import ModulePlaceholder from './pages/ModulePlaceholder';
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
          {/* Los solicitantes cuelgan del proyecto: una postulación siempre es
              *a* un proyecto, y su vivienda debe estar en el municipio donde
              se ejecuta la obra. La ruta deja ese contexto fijado. */}
          <Route
            path="/proyectos/:projectId/solicitantes"
            element={<ProjectApplicantsPage />}
          />
          <Route
            path="/proyectos/:projectId/solicitantes/nuevo"
            element={<ApplicationFormPage />}
          />
          <Route
            path="/proyectos/:projectId/solicitantes/:applicationId/editar"
            element={<ApplicationFormPage />}
          />
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
