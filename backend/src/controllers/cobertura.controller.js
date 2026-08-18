const db = require('../database/db');

const obtenerCoberturas = async (req, res) => {
  try {
    const [coberturas] = await db.query('SELECT id_cobertura, nombre FROM cobertura');

    return res.status(200).json({
      codigo: 200,
      estado: "ok",
      datos: coberturas
    });
  } catch (error) {
    return res.status(500).json({
      codigo: 500,
      estado: error.message || "Error al obtener las coberturas",
      datos: null
    });
  }
};

module.exports = { obtenerCoberturas };