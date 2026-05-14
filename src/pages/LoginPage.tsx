import { AuthLayout } from '../layouts/AuthLayout';
import { BrandingPanel } from '../components/auth/BrandingPanel';
import { LoginForm } from '../components/auth/LoginForm';

export const LoginPage = () => {
  return (
    <AuthLayout>
      <BrandingPanel />
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
