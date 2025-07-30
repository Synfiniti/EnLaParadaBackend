import { findNearbyRoutes } from './bus.repository.js';
import fetch from 'node-fetch';

export const buscarRutas = async (req, res) => {
  try {
    const { origen, destino } = req.body;

    if (!origen || !destino) {
      return res.status(400).json({ message: 'Origen y destino son requeridos' });
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    const geocode = async (direccion) => {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        direccion,
      )}&region=VE&key=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        throw new Error(`No se pudo geocodificar la dirección: ${direccion}`);
      }

      return {
        lat: data.results[0].geometry.location.lat,
        lng: data.results[0].geometry.location.lng,
      };
    };

    // Geocodifica origen y destino
    const origenCoords = await geocode(origen);
    const destinoCoords = await geocode(destino);

    const rutas = (await findNearbyRoutes(origenCoords, destinoCoords)) || [];

    res.status(200).json({ rutas });
  } catch (error) {
    console.error('❌ Error buscando rutas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const geocodificarDireccion = async (req, res) => {
  const { direccion, lat, lng } = req.body; // Ahora acepta 'direccion' O 'lat' y 'lng'

  // Validar que al menos una de las formas de entrada está presente
  if (!direccion && (!lat || !lng)) {
    return res
      .status(400)
      .json({ message: 'Se requiere una dirección textual o coordenadas (lat, lng).' });
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    let url;

    if (direccion) {
      // Caso 1: Geocodificación (dirección textual a lat/lng)
      url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&region=VE&key=${apiKey}`;
    } else {
      // Caso 2: Geocodificación inversa (lat/lng a dirección textual)
      // Nota: Google Geocoding API usa 'latlng' para geocodificación inversa
      url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&region=VE&key=${apiKey}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      // Mensaje más general ya que podría ser una dirección o coordenadas
      return res
        .status(404)
        .json({ message: 'No se encontraron resultados para la ubicación proporcionada.' });
    }

    // Extraer la información relevante según el tipo de solicitud
    const resultLocation = data.results[0].geometry.location; // lat y lng del primer resultado
    const formattedAddress = data.results[0].formatted_address; // Dirección legible

    // Devolver las coordenadas y también la dirección formateada
    res.status(200).json({
      lat: resultLocation.lat,
      lng: resultLocation.lng,
      address: formattedAddress, // ¡Esto es nuevo y necesario para el frontend!
    });
  } catch (error) {
    console.error('❌ Error en el servicio de geocodificación:', error);
    res.status(500).json({ message: 'Error interno en el servicio de geocodificación.' });
  }
};
