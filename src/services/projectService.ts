import { api } from '../lib/axios';
import type { DataEnvelope, PagedEnvelope } from '../types/api.types';
import type {
  CreateProjectInput,
  ListProjectsParams,
  Project,
  UpdateProjectInput,
} from '../types/project.types';

/**
 * Servicio del módulo de Proyectos (backend PV-21).
 *
 * Endpoints: GET /projects, GET /projects/:id, POST /projects,
 * PUT /projects/:id. **No existe DELETE.**
 *
 * Lectura: cualquier usuario autenticado. Escritura: solo `admin` (el backend
 * responde 403 al resto).
 *
 * Ojo con el desempaquetado: estos endpoints responden `{ data }` /
 * `{ data, meta }` **sin** `success`, de ahí `DataEnvelope`/`PagedEnvelope` en
 * vez de `ApiResponse`/`PaginatedResponse`.
 */
export const projectService = {
  /** Listado paginado. Devuelve { data, meta } tal cual el backend. */
  async list(params: ListProjectsParams = {}): Promise<PagedEnvelope<Project>> {
    const { data } = await api.get<PagedEnvelope<Project>>('/projects', { params });
    return data;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await api.get<DataEnvelope<Project>>(`/projects/${id}`);
    return data.data;
  },

  /** Solo admin. 409 si el `contractNo` ya existe. */
  async create(input: CreateProjectInput): Promise<Project> {
    const { data } = await api.post<DataEnvelope<Project>>('/projects', input);
    return data.data;
  },

  /** Solo admin. Exige al menos un campo; los de auditoría dan 400. */
  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const { data } = await api.put<DataEnvelope<Project>>(`/projects/${id}`, input);
    return data.data;
  },
};
