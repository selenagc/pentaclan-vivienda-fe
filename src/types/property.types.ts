/**
 * Tipos del módulo de Viviendas (backend PV-30).
 *
 * La vivienda es el objeto real del programa: lo que se mejora. Existe por sí
 * misma y no pertenece a nadie de forma permanente — quién la habita en cada
 * trámite lo dice la postulación, no esta entidad.
 *
 * **Solo lectura desde el front.** El backend expone `GET /properties` y nada
 * más: el alta ocurre dentro del registro de una postulación, en una sola
 * transacción, para que no queden viviendas cargadas sin ficha asociada.
 * Este listado alimenta el buscador del formulario, que es lo que evita que la
 * misma casa se cargue dos veces.
 */

import type { ResolvedMunicipality } from './geography.types';

/** Misma forma que la del proyecto: el backend la resuelve hasta departamento. */
export type PropertyMunicipality = ResolvedMunicipality;

export interface Property {
  id: string;
  /**
   * Los tres son opcionales y el backend exige al menos comunidad o dirección:
   * en área rural la dirección suele ser solo el nombre de la comunidad.
   */
  community: string | null;
  zone: string | null;
  address: string | null;
  /**
   * Obligatorias. Al no haber código catastral, la ubicación es lo único que
   * identifica físicamente la vivienda.
   *
   * Llegan como **número**: el driver de Postgres devuelve los DECIMAL como
   * string y el backend los convierte antes de responder.
   */
  latitude: number;
  longitude: number;
  municipality: PropertyMunicipality;
  createdAt: string;
  updatedAt: string;
}

/** Query params de GET /properties. */
export interface ListPropertiesParams {
  page?: number;
  /** Máximo 100 (lo impone el backend). */
  limit?: number;
  sortBy?: 'community' | 'zone' | 'address' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  /** Busca en comunidad, zona y dirección. */
  search?: string;
  municipalityId?: number;
}

/**
 * Una línea que identifique la vivienda en un listado o en el buscador.
 *
 * Se arma con lo que haya: una vivienda rural puede traer solo la comunidad y
 * una urbana solo la dirección, así que concatenar a ciegas dejaría comas
 * sueltas. Si no hubiera ninguno de los tres —el backend no lo permite, pero
 * el tipo sí— se cae a las coordenadas antes que devolver una cadena vacía.
 */
export const propertyLabel = (property: Property): string => {
  const parts = [property.community, property.zone, property.address].filter(Boolean);
  if (parts.length > 0) return parts.join(', ');
  return `${property.latitude}, ${property.longitude}`;
};
