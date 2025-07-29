import { findNearbyRoutes } from './bus.repository.js';
import fetch from 'node-fetch';

export const buscarRutas = async (req, res) => {
  try {
    const { origen, destino } = req.body;

    if (!origen || !destino) {
      return res.status(400).json({ message: 'Origen y destino son requeridos' });
    }

    const rutas = await findNearbyRoutes(origen, destino);

    res.status(200).json({ rutas });
  } catch (error) {
    console.error('Error buscando rutas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const geocodificarDireccion = async (req, res) => {
  const { direccion } = req.body;

  if (!direccion) {
    return res.status(400).json({ message: 'La dirección es requerida' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      direccion,
    )}&limit=1&viewbox=-67.0,10.7,-66.7,10.3&bounded=1&countrycodes=ve`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EnLaParada/1.0 (jeangutierrez18@gmail.com)',
      },
    });

    const data = await response.json();

    if (data.length === 0) {
      return res.status(404).json({ message: 'No se encontraron coordenadas para esa dirección' });
    }

    const { lat, lon } = data[0];

    res.status(200).json({ lat: parseFloat(lat), lng: parseFloat(lon) });
  } catch (error) {
    console.error('Error geocodificando dirección:', error);
    res.status(500).json({ message: 'Error geocodificando dirección' });
  }
};
