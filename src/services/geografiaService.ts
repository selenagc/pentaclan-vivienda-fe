import { api } from '../lib/axios';
import { DEPARTAMENTOS_KEY, geografiaCache } from '../lib/geografiaCache';
import type {
  Departamento,
  GeoResponse,
  Municipio,
  Provincia,
} from '../types/geografia.types';

/**
 * Servicio del catálogo geográfico (PV-16). Solo lectura: el backend no
 * expone POST/PUT/DELETE (un POST cae en el middleware `notFound` y responde
 * 404 "Route not found", no 405).
 *
 * Endpoints: GET /departamentos, GET /departamentos/:id/provincias,
 * GET /provincias/:id/municipios. Todos exigen Bearer y los puede consumir
 * cualquier rol. No aceptan paginación ni filtros: lo que se mande se ignora.
 * El orden viene siempre por `nombre` ASC desde el backend.
 *
 * Ojo con el desempaquetado: estos endpoints responden `{ data }` sin
 * `success`, de ahí `GeoResponse<T>` en vez de `ApiResponse<T>`.
 * Todas las respuestas pasan por la caché (ver geografiaCache.ts).
 */
export const geografiaService = {
  /** Los 9 departamentos. Una sola petición por sesión. */
  listDepartamentos(): Promise<Departamento[]> {
    return geografiaCache.departamentos.get(DEPARTAMENTOS_KEY, async () => {
      const { data } = await api.get<GeoResponse<Departamento>>('/departamentos');
      return data.data;
    });
  },

  /**
   * Provincias de un departamento. Si el departamento no existe el backend
   * devuelve 404 (decisión deliberada), no una lista vacía.
   */
  listProvincias(departamentoId: number): Promise<Provincia[]> {
    return geografiaCache.provincias.get(departamentoId, async () => {
      const { data } = await api.get<GeoResponse<Provincia>>(
        `/departamentos/${departamentoId}/provincias`,
      );
      return data.data;
    });
  },

  /**
   * Municipios de una provincia. Aquí una lista vacía sí es posible y
   * significa "la provincia existe pero no tiene municipios": es un estado
   * vacío, no un error. El 404 sigue significando "la provincia no existe".
   */
  listMunicipios(provinciaId: number): Promise<Municipio[]> {
    return geografiaCache.municipios.get(provinciaId, async () => {
      const { data } = await api.get<GeoResponse<Municipio>>(
        `/provincias/${provinciaId}/municipios`,
      );
      return data.data;
    });
  },
};
