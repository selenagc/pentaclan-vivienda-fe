interface LogoProps {
  size?: number;
  variant?: 'light' | 'dark';
  showText?: boolean;
  className?: string;
}

export const Logo = ({
  size = 48,
  variant = 'dark',
  showText = true,
  className = '',
}: LogoProps) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-brand-primary';
  const subTextColor = variant === 'light' ? 'text-gray-300' : 'text-gray-500';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Pentágono con gradiente */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="pentaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>
        </defs>
        {/* Pentágono externo */}
        <path
          d="M32 4 L60 24 L49 58 L15 58 L4 24 Z"
          fill="url(#pentaGradient)"
          opacity="0.95"
        />
        {/* Pentágono interno (hueco) */}
        <path
          d="M32 18 L48 30 L42 48 L22 48 L16 30 Z"
          fill="white"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`text-xl font-bold tracking-wide ${textColor}`}>
            PENTACLAN
          </span>
          <span className={`text-[10px] tracking-[0.2em] mt-0.5 ${subTextColor}`}>
            AE VIVIENDA
          </span>
        </div>
      )}
    </div>
  );
};
