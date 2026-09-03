import type { ReactNode } from 'react';
import { useGeografia } from '../../hooks/useGeografia';
import { useEntidades } from '../../hooks/useEntidades';
import type { GeoSelection } from '../../types/geografia.types';

interface ResumenProyectoProps {
  nombre: string;
  geo: GeoSelection;
  entidadPublicaId: number | null;
}

const iconClass = 'h-5 w-5';

const IconoProyecto = (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);

const IconoUbicacion = (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const IconoEntidad = (
  <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 4.5H3L12 3zM4.5 21h15M5.25 9.75v9m4.5-9v9m4.5-9v9m4.5-9v9" />
  </svg>
);

interface FilaProps {
  icono: ReactNode;
  etiqueta: string;
  valor: string | null;
}

/** Una fila del resumen. Si no hay valor todavía, se marca en gris. */
const Fila = ({ icono, etiqueta, valor }: FilaProps) => (
  <div className="flex items-start gap-3">
    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
      {icono}
    </span>
    <div className="min-w-0">
      <p className="text-xs text-gray-500">{etiqueta}</p>
      <p
        className={`text-sm font-semibold break-words ${valor ? 'text-gray-900' : 'text-gray-400 italic font-normal'}`}
      >
        {valor ?? 'Sin definir'}
      </p>
    </div>
  </div>
);

/** Ilustración decorativa del pie del panel, como en el mockup. */
const Ilustracion = () => (
  <svg viewBox="0 0 320 180" className="w-full" role="presentation" aria-hidden="true">
    <rect x="0" y="0" width="320" height="180" rx="12" className="fill-gray-50" />
    <circle cx="70" cy="40" r="12" className="fill-gray-200" />
    <circle cx="86" cy="40" r="16" className="fill-gray-200" />
    <circle cx="250" cy="34" r="10" className="fill-gray-200" />
    <circle cx="264" cy="34" r="14" className="fill-gray-200" />
    {/* Grúa */}
    <path d="M40 150V50h4v100z" className="fill-brand-primary/40" />
    <path d="M30 50h90v5H30z" className="fill-brand-primary/40" />
    <path d="M110 55v22h3V55z" className="fill-brand-primary/30" />
    <path d="M100 77h23v9h-23z" className="fill-brand-primary/30" />
    {/* Edificios */}
    <rect x="150" y="70" width="46" height="80" rx="3" className="fill-brand-primary/25" />
    <rect x="204" y="95" width="38" height="55" rx="3" className="fill-brand-primary/35" />
    <rect x="250" y="80" width="42" height="70" rx="3" className="fill-brand-primary/20" />
    {[0, 1, 2, 3].map((fila) =>
      [0, 1, 2].map((columna) => (
        <rect
          key={`${fila}-${columna}`}
          x={158 + columna * 12}
          y={80 + fila * 16}
          width="7"
          height="9"
          rx="1"
          className="fill-white"
        />
      )),
    )}
    {[0, 1, 2].map((fila) =>
      [0, 1].map((columna) => (
        <rect
          key={`b-${fila}-${columna}`}
          x={212 + columna * 14}
          y={105 + fila * 15}
          width="8"
          height="9"
          rx="1"
          className="fill-white"
        />
      )),
    )}
    {/* Casas y suelo */}
    <path d="M60 150v-28l22-14 22 14v28z" className="fill-brand-primary/15" />
    <path d="M82 100l30 18H52z" className="fill-brand-primary/30" />
    <rect x="0" y="150" width="320" height="4" className="fill-gray-200" />
  </svg>
);

/**
 * Panel lateral "Resumen del proyecto": refleja en vivo lo que se va llenando
 * en el formulario.
 *
 * Resuelve los nombres a partir de los ids con los mismos hooks que alimentan
 * los selectores. No dispara peticiones extra: las cachés de
 * `geografiaService` y `entidadService` deduplican por clave, así que el panel
 * y los selectores comparten la misma respuesta.
 */
export const ResumenProyecto = ({ nombre, geo, entidadPublicaId }: ResumenProyectoProps) => {
  const { departamentos, provincias, municipios } = useGeografia(geo);
  const { entidades } = useEntidades();

  const nombrePorId = (items: { id: number; nombre: string }[], id: number | null) =>
    id === null ? null : (items.find((item) => item.id === id)?.nombre ?? null);

  const departamento = nombrePorId(departamentos.items, geo.departamentoId);
  const provincia = nombrePorId(provincias.items, geo.provinciaId);
  const municipio = nombrePorId(municipios.items, geo.municipioId);

  // Se muestra lo que haya: "La Paz → Murillo" mientras falte el municipio.
  const ubicacion = [departamento, provincia, municipio].filter(Boolean).join(' → ') || null;

  const entidad = nombrePorId(entidades, entidadPublicaId);

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">Resumen del proyecto</h3>
      <div className="mt-2 mb-6 h-0.5 w-10 rounded bg-brand-primary" />

      <div className="space-y-5">
        <Fila icono={IconoProyecto} etiqueta="Proyecto" valor={nombre.trim() || null} />
        <Fila icono={IconoUbicacion} etiqueta="Ubicación" valor={ubicacion} />
        <Fila icono={IconoEntidad} etiqueta="Entidad financiadora" valor={entidad} />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-100">
        <Ilustracion />
      </div>
    </aside>
  );
};
