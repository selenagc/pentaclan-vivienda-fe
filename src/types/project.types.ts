/**
 * Tipos del módulo de Proyectos (backend PV-21).
 *
 * ⚠️ Este módulo reemplazó a la tabla `projects`: `description`, `status`,
 * `startDate`, `endDate` y `clientId` **ya no existen**. A cambio apareció
 * `contractNo`, obligatorio y único.
 */

/** Entidad financiadora tal como llega anidada en el proyecto (sin taxId ni acronym). */
export interface ProjectPublicEntity {
  id: number;
  name: string;
}

/**
 * Ubicación del proyecto, resuelta hasta el departamento por el backend.
 * Llega completa para poder mostrar "Huacareta (Hernando Siles, Chuquisaca)"
 * sin volver a consultar el catálogo geográfico.
 */
export interface ProjectMunicipality {
  id: number;
  name: string;
  province: { id: number; name: string };
  department: { id: number; name: string };
}

export interface Project {
  id: string;
  name: string;
  contractNo: string;
  publicEntity: ProjectPublicEntity;
  municipality: ProjectMunicipality;
  /** Nombre del usuario que lo registró. Es auditoría: no llega su id. */
  userName: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cuerpo del POST /projects. **Son exactamente estos cuatro campos.**
 *
 * El validator del backend usa `stripUnknown: true`: cualquier campo extra
 * (descripcion, estado, departmentId, provinceId…) se descarta en silencio
 * y la petición igual responde 201. Añadir algo aquí sin que exista en el
 * backend equivale a perder el dato sin aviso.
 */
export interface CreateProjectInput {
  /** 1..200 caracteres. */
  name: string;
  /** 1..50 caracteres. Único en toda la tabla: repetirlo devuelve 409. */
  contractNo: string;
  publicEntityId: number;
  /** Solo el municipio se persiste; departamento y provincia son navegación. */
  municipalityId: number;
}

/**
 * Cuerpo del PUT /projects/:id. Parcial, pero exige al menos un campo.
 *
 * ⚠️ `id`, `userId`, `createdAt` y `updatedAt` están `forbidden()` en el
 * backend: reenviar el objeto que devolvió el GET provoca un 400. Hay que
 * armar el cuerpo con solo estos campos.
 */
export type UpdateProjectInput = Partial<CreateProjectInput>;

/** Parámetros de GET /projects. */
export interface ListProjectsParams {
  page?: number;
  /** Máximo 100 (lo impone el backend). */
  limit?: number;
  sortBy?: 'name' | 'contractNo' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  /** Busca en name y contractNo. */
  search?: string;
  publicEntityId?: number;
  municipalityId?: number;
  userId?: string;
}

/** "Huacareta (Hernando Siles, Chuquisaca)" para el listado. */
export const fullLocation = (municipality: ProjectMunicipality): string =>
  `${municipality.name} (${municipality.province.name}, ${municipality.department.name})`;
