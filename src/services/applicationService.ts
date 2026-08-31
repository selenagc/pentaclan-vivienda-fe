import { api } from '../lib/axios';
import type { DataEnvelope, PagedEnvelope } from '../types/api.types';
import type {
  Application,
  ListApplicationsParams,
  RegisterApplicationInput,
  UpdateApplicationInput,
} from '../types/application.types';

/**
 * Servicio del módulo de Solicitantes (backend PV-30).
 *
 * Endpoints: GET /applications, GET /applications/:id, POST /applications,
 * PUT /applications/:id, DELETE /applications/:id.
 *
 * Permisos: leer, cualquier usuario autenticado; registrar y corregir,
 * `admin`, `social_lead` y `technical_lead`; **eliminar, solo `admin`**.
 *
 * Ojo con el desempaquetado: como proyectos, estos endpoints responden
 * `{ data }` / `{ data, meta }` **sin** `success`.
 */
export const applicationService = {
  /** Listado paginado. Devuelve { data, meta } tal cual el backend. */
  async list(params: ListApplicationsParams = {}): Promise<PagedEnvelope<Application>> {
    const { data } = await api.get<PagedEnvelope<Application>>('/applications', { params });
    return data;
  },

  async getById(id: string): Promise<Application> {
    const { data } = await api.get<DataEnvelope<Application>>(`/applications/${id}`);
    return data.data;
  },

  /**
   * 409 si la persona ya postuló a ese proyecto, o si la vivienda no está en
   * el municipio donde se ejecuta la obra.
   */
  async create(input: RegisterApplicationInput): Promise<Application> {
    const { data } = await api.post<DataEnvelope<Application>>('/applications', input);
    return data.data;
  },

  /** Exige al menos un campo; `status` y los de auditoría dan 400. */
  async update(id: string, input: UpdateApplicationInput): Promise<Application> {
    const { data } = await api.put<DataEnvelope<Application>>(`/applications/${id}`, input);
    return data.data;
  },

  /**
   * Solo admin. Responde 204 sin cuerpo.
   *
   * Es **borrado lógico**: la ficha sale de los listados pero la fila queda en
   * la base, porque en un programa con fondos públicos no puede desaparecer
   * evidencia. Tampoco borra a la persona ni a la vivienda, que pueden estar
   * referenciadas por otras fichas.
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/applications/${id}`);
  },
};
