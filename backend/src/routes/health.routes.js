const { Router } = require('express');
const db = require('../database/db');
const router = Router();

router.get('/', async (req, res) => {
    try {
        // consulta súper liviana para ver si MySQL responde
        await db.query('SELECT 1');

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { mensaje: "API funcionando y conectada a la base de datos" }
        });
    } catch (error) {
        res.status(500).json({
            codigo: 500,
            estado: "error",
            datos: { mensaje: "Error de conexión a la base de datos", detalle: error.message }
        });
    }
});

module.exports = router;