import { api } from '../lib/axios';
import type { DataEnvelope, PagedEnvelope } from '../types/api.types';
import type {
  CreateProjectInput,
  ListProjectsParams,
  Project,
  ProjectAssignment,
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

  /** Proyectos asignados al usuario autenticado (PV-35). */
  async getMyProjects(): Promise<Project[]> {
    const { data } = await api.get<{ success?: boolean; data: Project[] }>('/api/me/projects');
    return data.data;
  },

  /** Evaluadores asignados a un proyecto (solo admin). */
  async getAssignments(projectId: string): Promise<ProjectAssignment[]> {
    const { data } = await api.get<{ success?: boolean; data: ProjectAssignment[] }>(
      `/api/projects/${projectId}/assignments`,
    );
    return data.data;
  },

  /** Asignar uno o varios evaluadores a un proyecto (solo admin). */
  async assignUsers(projectId: string, userIds: string[]): Promise<ProjectAssignment[]> {
    const { data } = await api.post<{ success?: boolean; data: ProjectAssignment[] }>(
      `/api/projects/${projectId}/assignments`,
      { userIds },
    );
    return data.data;
  },

  /** Desasignar evaluador de un proyecto (solo admin). */
  async unassignUser(projectId: string, userId: string): Promise<void> {
    await api.delete(`/api/projects/${projectId}/assignments/${userId}`);
  },
};
