import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header superior */}
      <header className="bg-gray-50 px-6 py-4 lg:px-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            {/* Logo pequeño Pentaclan */}
            <svg width="32" height="32" viewBox="0 0 64 64" fill="none">
              <defs>
                <linearGradient id="headerPenta" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#6B21A8" />
                </linearGradient>
              </defs>
              <path d="M32 4 L60 24 L49 58 L15 58 L4 24 Z" fill="url(#headerPenta)" />
              <path d="M32 18 L48 30 L42 48 L22 48 L16 30 Z" fill="#F9FAFB" />
            </svg>
            <span className="text-lg font-bold text-brand-primary tracking-wide">
              PENTACLAN
            </span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-gray-300" />
          <p className="hidden sm:block text-sm text-gray-600 leading-tight">
            Sistema de gestión para proyectos
            <br />
            de vivienda social
          </p>
        </div>

        {/* Logo AE Vivienda */}
        <div className="flex items-center gap-2">
          <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
            <path
              d="M8 32 L32 12 L56 32 L56 56 L40 56 L40 40 L24 40 L24 56 L8 56 Z"
              stroke="#8B9D3F"
              strokeWidth="3"
              fill="none"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold text-brand-olive">AE</span>
            <span className="text-xs text-gray-600 -mt-0.5">Vivienda</span>
          </div>
        </div>
      </header>

      {/* Contenido principal: tarjeta con dos paneles */}
      <main className="flex-1 px-4 pb-6 lg:px-10 lg:pb-10">
        <div className="h-full max-w-[1400px] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[680px] h-full">
            {/* Panel izquierdo: solo visible en lg+ */}
            <div className="hidden lg:block">
              {/* El panel de branding se inyecta aquí desde la página */}
              {Array.isArray(children) ? children[0] : null}
            </div>

            {/* Panel derecho (formulario) */}
            <div>
              {Array.isArray(children) ? children[1] : children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
