import { api } from '../lib/axios';
import type { DataEnvelope, PagedEnvelope } from '../types/api.types';
import type {
  Application,
  ListApplicationsParams,
  RegisterApplicationInput,
  RejectApplicationInput,
  UpdateApplicationInput,
} from '../types/application.types';

/**
 * Servicio del módulo de Solicitantes.
 *
 * Endpoints: GET /applications, GET /applications/:id, POST /applications,
 * PUT /applications/:id, DELETE /applications/:id, y las dos decisiones,
 * POST /applications/:id/approve y /reject.
 *
 * Permisos: leer, cualquier usuario autenticado; registrar y corregir,
 * `admin`, `social_lead` y `technical_lead`; **decidir, `admin` y
 * `project_supervisor`**; **eliminar, solo `admin`**.
 *
 * Registrar y decidir están separados a propósito: quien levanta la ficha en
 * campo no es quien la aprueba.
 *
 * Ojo con el desempaquetado: como proyectos, estos endpoints responden
 * `{ data }` / `{ data, meta }` **sin** `success`.
 */
/**
 * Prepara los query params para axios.
 *
 * `status` puede ser una lista, y axios serializaría un array como
 * `status[]=a&status[]=b`, que el backend lee como otro parámetro. Se une por
 * comas, que es una de las dos formas que el endpoint acepta.
 */
const serializeParams = (params: ListApplicationsParams) => ({
  ...params,
  ...(Array.isArray(params.status) ? { status: params.status.join(',') } : {}),
});

export const applicationService = {
  /** Listado paginado. Devuelve { data, meta } tal cual el backend. */
  async list(params: ListApplicationsParams = {}): Promise<PagedEnvelope<Application>> {
    const { data } = await api.get<PagedEnvelope<Application>>('/applications', {
      params: serializeParams(params),
    });
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

  /**
   * Aprueba la ficha: el solicitante pasa a beneficiario. Solo `admin` y
   * `project_supervisor`; al resto el backend le responde 403.
   *
   * No lleva cuerpo —quién decide sale del token y la fecha del servidor— y
   * devuelve la ficha ya decidida, así que no hace falta volver a pedirla.
   *
   * Dos conflictos posibles, con código propio para poder explicarlos:
   * `APPLICATION_ALREADY_DECIDED` (alguien decidió antes) y
   * `PROPERTY_ALREADY_BENEFITED` (esa vivienda ya tiene un beneficiario en
   * este proyecto, que es la regla anti doble beneficio del programa).
   */
  async approve(id: string): Promise<Application> {
    const { data } = await api.post<DataEnvelope<Application>>(`/applications/${id}/approve`);
    return data.data;
  },

  /**
   * Rechaza la ficha con su motivo, que es obligatorio.
   *
   * El rechazado **no** desaparece del padrón: sigue consultable con su
   * motivo, y eso es lo que permite explicar la decisión en una auditoría.
   */
  async reject(id: string, input: RejectApplicationInput): Promise<Application> {
    const { data } = await api.post<DataEnvelope<Application>>(
      `/applications/${id}/reject`,
      input,
    );
    return data.data;
  },
};
