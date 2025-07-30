import { findNearbyRoutes } from './bus.repository.js';
import fetch from 'node-fetch';

export const buscarRutas = async (req, res) => {
  try {
    const { origen, destino } = req.body;

    if (!origen || !destino) {
      return res.status(400).json({ message: 'Origen y destino son requeridos' });
    }

    const rutas = (await findNearbyRoutes(origen, destino)) || [];

    res.status(200).json({ rutas });
  } catch (error) {
    console.error('❌ Error buscando rutas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const geocodificarDireccion = async (req, res) => {
  const { direccion } = req.body;

  if (!direccion) {
    return res.status(400).json({ message: 'La dirección es requerida' });
  }

  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      direccion,
    )}&region=VE&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ message: 'No se encontraron coordenadas para esa dirección' });
    }

    const { lat, lng } = data.results[0].geometry.location;

    res.status(200).json({ lat, lng });
  } catch (error) {
    console.error('❌ Error geocodificando dirección:', error);
    res.status(500).json({ message: 'Error geocodificando dirección' });
  }
};
