import { Logo } from '../common/Logo';

const features = [
  {
    title: 'Gestión integral',
    description: 'Planifica y da seguimiento a cada etapa del proyecto.',
    bgColor: 'bg-brand-primary',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    title: 'Transparencia',
    description: 'Información confiable para una mejor toma de decisiones.',
    bgColor: 'bg-brand-olive',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    title: 'Impacto social',
    description: 'Más y mejores hogares para comunidades sostenibles.',
    bgColor: 'bg-brand-teal',
    icon: (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
];

export const BrandingPanel = () => {
  return (
    <div className="relative h-full w-full overflow-hidden bg-brand-dark-deep">
      {/* Imagen de fondo (edificios). Reemplaza con tu imagen real. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80')",
        }}
      />

      {/* Overlay con gradiente diagonal (azul oscuro → morado) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(115deg, rgba(15, 42, 63, 0.95) 0%, rgba(15, 42, 63, 0.75) 35%, rgba(15, 42, 63, 0.15) 55%, rgba(107, 33, 168, 0.35) 80%, rgba(107, 33, 168, 0.75) 100%)',
        }}
      />

      {/* Contenido */}
      <div className="relative h-full flex flex-col justify-between p-8 lg:p-12 text-white">
        {/* Logo arriba */}
        <Logo variant="light" size={44} />

        {/* Texto principal */}
        <div className="max-w-md">
          <h1 className="text-3xl lg:text-4xl font-bold leading-tight mb-4">
            Construyendo <span className="font-extrabold">hogares,</span>
            <br />
            transformando <span className="font-extrabold">vidas</span>
          </h1>
          <p className="text-gray-200 text-sm lg:text-base leading-relaxed mb-6">
            Gestiona proyectos de vivienda social de forma eficiente,
            transparente y centrada en las personas.
          </p>
          {/* Línea dorada decorativa */}
          <div className="w-16 h-1 bg-brand-accent rounded-full mb-8" />

          {/* Features */}
          <ul className="space-y-5">
            {features.map((feature) => (
              <li key={feature.title} className="flex items-start gap-3">
                <div
                  className={`flex-shrink-0 w-10 h-10 ${feature.bgColor} rounded-lg flex items-center justify-center shadow-md`}
                >
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Pie del panel */}
        <div className="flex items-center gap-2 text-xs text-gray-300">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21"
            />
          </svg>
          <span>
            Plataforma oficial de <strong className="text-white">AE VIVIENDA</strong>
            <br />
            para la gestión de proyectos.
          </span>
        </div>
      </div>
    </div>
  );
};
