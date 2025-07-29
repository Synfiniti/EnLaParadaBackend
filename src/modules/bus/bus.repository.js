import db from '../../db/index.js';

export const findNearbyRoutes = async (origen, destino, maxDistanceMeters = 500) => {
  const { lat: latOrigen, lng: lngOrigen } = origen;
  const { lat: latDestino, lng: lngDestino } = destino;

  // Encuentra rutas donde al menos un punto esté cerca del origen
  const resOrigen = await db.query(
    `
    SELECT DISTINCT r.id_ruta
    FROM rutas r
    JOIN puntos_ruta p ON r.id_ruta = p.id_ruta
    WHERE r.activa = true AND (
      earth_distance(ll_to_earth($1, $2), ll_to_earth(p.latitud, p.longitud)) < $3
    )
  `,
    [latOrigen, lngOrigen, maxDistanceMeters],
  );

  const resDestino = await db.query(
    `
    SELECT DISTINCT r.id_ruta
    FROM rutas r
    JOIN puntos_ruta p ON r.id_ruta = p.id_ruta
    WHERE r.activa = true AND (
      earth_distance(ll_to_earth($1, $2), ll_to_earth(p.latitud, p.longitud)) < $3
    )
  `,
    [latDestino, lngDestino, maxDistanceMeters],
  );

  const rutasOrigen = resOrigen.rows.map((r) => r.id_ruta);
  const rutasDestino = resDestino.rows.map((r) => r.id_ruta);

  const rutasCoincidentes = rutasOrigen.filter((id) => rutasDestino.includes(id));

  if (rutasCoincidentes.length === 0) return [];

  const rutasCompletas = await db.query(
    `
    SELECT r.*, 
           json_agg(json_build_object('lat', p.latitud, 'lng', p.longitud, 'orden', p.orden) ORDER BY p.orden) AS puntos
    FROM rutas r
    JOIN puntos_ruta p ON r.id_ruta = p.id_ruta
    WHERE r.id_ruta = ANY($1)
    GROUP BY r.id_ruta
  `,
    [rutasCoincidentes],
  );

  return rutasCompletas.rows;
};
