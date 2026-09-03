import { api } from '../lib/axios';
import type { DataEnvelope, PagedEnvelope } from '../types/api.types';
import type {
  CreateProyectoInput,
  ListProyectosParams,
  Proyecto,
  UpdateProyectoInput,
} from '../types/proyecto.types';

/**
 * Servicio del módulo de Proyectos (backend PV-21).
 *
 * Endpoints: GET /proyectos, GET /proyectos/:id, POST /proyectos,
 * PUT /proyectos/:id. **No existe DELETE.**
 *
 * Lectura: cualquier usuario autenticado. Escritura: solo `admin` (el backend
 * responde 403 al resto).
 *
 * Ojo con el desempaquetado: estos endpoints responden `{ data }` /
 * `{ data, meta }` **sin** `success`, de ahí `DataEnvelope`/`PagedEnvelope` en
 * vez de `ApiResponse`/`PaginatedResponse`.
 */
export const proyectoService = {
  /** Listado paginado. Devuelve { data, meta } tal cual el backend. */
  async list(params: ListProyectosParams = {}): Promise<PagedEnvelope<Proyecto>> {
    const { data } = await api.get<PagedEnvelope<Proyecto>>('/proyectos', { params });
    return data;
  },

  async getById(id: string): Promise<Proyecto> {
    const { data } = await api.get<DataEnvelope<Proyecto>>(`/proyectos/${id}`);
    return data.data;
  },

  /** Solo admin. 409 si el `nroContrato` ya existe. */
  async create(input: CreateProyectoInput): Promise<Proyecto> {
    const { data } = await api.post<DataEnvelope<Proyecto>>('/proyectos', input);
    return data.data;
  },

  /** Solo admin. Exige al menos un campo; los de auditoría dan 400. */
  async update(id: string, input: UpdateProyectoInput): Promise<Proyecto> {
    const { data } = await api.put<DataEnvelope<Proyecto>>(`/proyectos/${id}`, input);
    return data.data;
  },
};
