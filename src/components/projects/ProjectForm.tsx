import type { FormEvent } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { GeoSelector } from '../geography/GeoSelector';
import { PublicEntitySelector } from '../public-entities/PublicEntitySelector';
import { FormSection } from './FormSection';
import type { ProjectFormErrors, ProjectFormValues } from '../../hooks/useCreateProject';

interface ProjectFormProps {
  values: ProjectFormValues;
  setField: <K extends keyof ProjectFormValues>(field: K, value: ProjectFormValues[K]) => void;
  errors: ProjectFormErrors;
  /** Error que no corresponde a ningún campo (500, 404, sin conexión…). */
  generalError: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

const CreateIcon = (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/**
 * Formulario de creación de proyecto, en las tres secciones del mockup.
 *
 * Es presentacional: el estado, la validación y el envío viven en
 * `useCrearProyecto`.
 *
 * ⚠️ Lo que se ve aquí es exactamente lo que el backend guarda. *Descripción*
 * y *Estado del proyecto* aparecían en el mockup pero el módulo de proyectos
 * (PV-21) no tiene dónde guardarlos, y su validator descarta lo desconocido en
 * silencio: pintarlos daría un formulario que parece funcionar y pierde datos.
 * Departamento y provincia sí se piden, pero solo para llegar al municipio,
 * que es lo único que viaja al backend.
 */
export const ProjectForm = ({
  values,
  setField,
  errors,
  generalError,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProjectFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      // La validación la hacemos nosotros, en español: el navegador se queda
      // al margen para que sus burbujas no se adelanten a nuestros mensajes.
      noValidate
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="space-y-6">
        <FormSection stepNumber={1} title="Información del proyecto" withDivider={false}>
          <div className="space-y-4">
            <Input
              label="Título del proyecto"
              name="name"
              value={values.name}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="Ej. Construcción de 100 Viviendas Sociales"
              error={errors.name}
              maxLength={200}
              required
              disabled={isSubmitting}
            />
            <Input
              label="Nº de contrato"
              name="nroContrato"
              value={values.contractNo}
              onChange={(event) => setField('contractNo', event.target.value)}
              placeholder="Ej. AEV-2026-389"
              error={errors.contractNo}
              maxLength={50}
              required
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              El número de contrato identifica al proyecto y no puede repetirse.
            </p>
          </div>
        </FormSection>

        <FormSection stepNumber={2} title="Ubicación del proyecto">
          <GeoSelector
            value={values.geo}
            onChange={(geo) => setField('geo', geo)}
            errors={{
              departmentId: errors.departmentId,
              provinceId: errors.provinceId,
              municipalityId: errors.municipalityId,
            }}
            disabled={isSubmitting}
            required
            withArrows
          />
          <p className="mt-3 text-xs text-gray-500">
            Selección en cascada: Departamento → Provincia → Municipio. Se registra el municipio.
          </p>
        </FormSection>

        <FormSection stepNumber={3} title="Entidad pública financiadora">
          <PublicEntitySelector
            value={values.publicEntityId}
            onChange={(publicEntityId) => setField('publicEntityId', publicEntityId)}
            error={errors.publicEntityId}
            disabled={isSubmitting}
            required
          />
        </FormSection>
      </div>

      {generalError && (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
        >
          {generalError}
        </div>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          fullWidth={false}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" fullWidth={false} isLoading={isSubmitting} icon={CreateIcon}>
          Crear proyecto
        </Button>
      </div>
    </form>
  );
};
