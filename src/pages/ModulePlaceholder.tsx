interface ModulePlaceholderProps {
  title: string;
}

/**
 * Marcador genérico para módulos aún no implementados. Permite navegar por la
 * plantilla mientras cada módulo se desarrolla en su propio ticket.
 */
export const ModulePlaceholder = ({ title }: ModulePlaceholderProps) => {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
      <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
      <p className="mt-2 text-sm text-gray-500">
        Módulo en construcción. Su contenido se incorporará en su propio ticket.
      </p>
    </div>
  );
};

export default ModulePlaceholder;
