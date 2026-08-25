import { api } from '../lib/axios';
import { DEPARTMENTS_KEY, geographyCache } from '../lib/geographyCache';
import type {
  Department,
  GeoResponse,
  Municipality,
  Province,
} from '../types/geography.types';

/**
 * Servicio del catálogo geográfico (PV-16). Solo lectura: el backend no
 * expone POST/PUT/DELETE (un POST cae en el middleware `notFound` y responde
 * 404 "Route not found", no 405).
 *
 * Endpoints: GET /departments, GET /departments/:id/provinces,
 * GET /provinces/:id/municipalities. Todos exigen Bearer y los puede consumir
 * cualquier rol. No aceptan paginación ni filtros: lo que se mande se ignora.
 * El orden viene siempre por `nombre` ASC desde el backend.
 *
 * Ojo con el desempaquetado: estos endpoints responden `{ data }` sin
 * `success`, de ahí `GeoResponse<T>` en vez de `ApiResponse<T>`.
 * Todas las respuestas pasan por la caché (ver geografiaCache.ts).
 */
export const geographyService = {
  /** Los 9 departamentos. Una sola petición por sesión. */
  listDepartments(): Promise<Department[]> {
    return geographyCache.departments.get(DEPARTMENTS_KEY, async () => {
      const { data } = await api.get<GeoResponse<Department>>('/departments');
      return data.data;
    });
  },

  /**
   * Provincias de un departamento. Si el departamento no existe el backend
   * devuelve 404 (decisión deliberada), no una lista vacía.
   */
  listProvinces(departmentId: number): Promise<Province[]> {
    return geographyCache.provinces.get(departmentId, async () => {
      const { data } = await api.get<GeoResponse<Province>>(
        `/departments/${departmentId}/provinces`,
      );
      return data.data;
    });
  },

  /**
   * Municipios de una provincia. Aquí una lista vacía sí es posible y
   * significa "la provincia existe pero no tiene municipios": es un estado
   * vacío, no un error. El 404 sigue significando "la provincia no existe".
   */
  listMunicipalities(provinceId: number): Promise<Municipality[]> {
    return geographyCache.municipalities.get(provinceId, async () => {
      const { data } = await api.get<GeoResponse<Municipality>>(
        `/provinces/${provinceId}/municipalities`,
      );
      return data.data;
    });
  },
};
