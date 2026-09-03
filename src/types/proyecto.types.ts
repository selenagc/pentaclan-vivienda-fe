/**
 * Tipos del módulo de Proyectos (backend PV-21).
 *
 * ⚠️ Este módulo reemplazó a la tabla `projects`: `description`, `status`,
 * `startDate`, `endDate` y `clientId` **ya no existen**. A cambio apareció
 * `nroContrato`, obligatorio y único.
 */

/** Entidad financiadora tal como llega anidada en el proyecto (sin nit ni sigla). */
export interface ProyectoEntidadPublica {
  id: number;
  nombre: string;
}

/**
 * Ubicación del proyecto, resuelta hasta el departamento por el backend.
 * Llega completa para poder mostrar "Huacareta (Hernando Siles, Chuquisaca)"
 * sin volver a consultar el catálogo geográfico.
 */
export interface ProyectoMunicipio {
  id: number;
  nombre: string;
  provincia: { id: number; nombre: string };
  departamento: { id: number; nombre: string };
}

export interface Proyecto {
  id: string;
  nombre: string;
  nroContrato: string;
  entidadPublica: ProyectoEntidadPublica;
  municipio: ProyectoMunicipio;
  /** Nombre del usuario que lo registró. Es auditoría: no llega su id. */
  usuarioNombre: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cuerpo del POST /proyectos. **Son exactamente estos cuatro campos.**
 *
 * El validator del backend usa `stripUnknown: true`: cualquier campo extra
 * (descripcion, estado, departamentoId, provinciaId…) se descarta en silencio
 * y la petición igual responde 201. Añadir algo aquí sin que exista en el
 * backend equivale a perder el dato sin aviso.
 */
export interface CreateProyectoInput {
  /** 1..200 caracteres. */
  nombre: string;
  /** 1..50 caracteres. Único en toda la tabla: repetirlo devuelve 409. */
  nroContrato: string;
  entidadPublicaId: number;
  /** Solo el municipio se persiste; departamento y provincia son navegación. */
  municipioId: number;
}

/**
 * Cuerpo del PUT /proyectos/:id. Parcial, pero exige al menos un campo.
 *
 * ⚠️ `id`, `usuarioId`, `createdAt` y `updatedAt` están `forbidden()` en el
 * backend: reenviar el objeto que devolvió el GET provoca un 400. Hay que
 * armar el cuerpo con solo estos campos.
 */
export type UpdateProyectoInput = Partial<CreateProyectoInput>;

/** Parámetros de GET /proyectos. */
export interface ListProyectosParams {
  page?: number;
  /** Máximo 100 (lo impone el backend). */
  limit?: number;
  sortBy?: 'nombre' | 'nroContrato' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  /** Busca en nombre y nroContrato. */
  search?: string;
  entidadPublicaId?: number;
  municipioId?: number;
  usuarioId?: string;
}

/** "Huacareta (Hernando Siles, Chuquisaca)" para el listado. */
export const ubicacionCompleta = (municipio: ProyectoMunicipio): string =>
  `${municipio.nombre} (${municipio.provincia.nombre}, ${municipio.departamento.nombre})`;
