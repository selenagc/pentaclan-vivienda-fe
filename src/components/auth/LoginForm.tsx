import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { Logo } from '../common/Logo';
import { useLogin } from '../../hooks/useLogin';

export const LoginForm = () => {
  const { credentials, errors, isLoading, updateField, handleSubmit } = useLogin();

  const EmailIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );

  const LockIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );

  const ArrowRightIcon = (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );

  const InstitutionIcon = (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
    </svg>
  );

  return (
    <div className="h-full w-full bg-white flex flex-col p-6 sm:p-10 lg:p-12 overflow-y-auto">
      {/* Contenedor centrado del formulario */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm">
          {/* Logo y título */}
          <div className="flex flex-col items-center mb-8">
            <Logo size={56} showText />
            <h2 className="mt-6 text-xl font-bold text-gray-900">
              Inicia sesión en tu cuenta
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Correo electrónico"
              type="email"
              name="email"
              placeholder="maria.gutierrez@aevivienda.gob.mx"
              icon={EmailIcon}
              value={credentials.email}
              onChange={(e) => updateField('email', e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Contraseña"
              type="password"
              name="password"
              placeholder="••••••••••"
              icon={LockIcon}
              value={credentials.password}
              onChange={(e) => updateField('password', e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between pt-1">
              <Checkbox
                label="Recordarme"
                name="rememberMe"
                checked={credentials.rememberMe}
                onChange={(e) => updateField('rememberMe', e.target.checked)}
              />
              <a
                href="#"
                className="text-sm text-brand-primary hover:text-brand-primary-dark font-medium"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} icon={ArrowRightIcon}>
                Iniciar sesión
              </Button>
            </div>

            {/* Divisor "o" */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200" />
              <span className="flex-shrink mx-3 text-xs text-gray-400">o</span>
              <div className="flex-grow border-t border-gray-200" />
            </div>

            <Button type="button" variant="outline" icon={InstitutionIcon}>
              Iniciar sesión con cuenta institucional
            </Button>
          </form>

          {/* Pie */}
          <p className="mt-8 text-center text-xs text-gray-500">
            ¿Necesitas ayuda? Contacta a{' '}
            <a
              href="mailto:soporte@aevivienda.gob.mx"
              className="text-brand-primary hover:underline font-medium"
            >
              soporte@aevivienda.gob.mx
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
