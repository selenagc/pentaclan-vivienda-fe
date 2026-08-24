import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
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
          <Route path="/proyectos" element={<ModulePlaceholder title="Proyectos" />} />
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
