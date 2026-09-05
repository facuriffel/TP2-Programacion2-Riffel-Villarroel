const db = require('../database/db');

const listarLogs = async (req, res) => {
    const { id_usuario, entidad, desde, hasta } = req.query;

    try {
        let query = `
            SELECT l.id, l.id_usuario, u.nombre, u.apellido, u.email, 
                   l.accion, l.entidad, l.detalle, l.fecha
            FROM log_auditoria l
            JOIN usuario u ON l.id_usuario = u.id
            WHERE 1=1
        `;
        const params = [];

        if (id_usuario) {
            query += ' AND l.id_usuario = ?';
            params.push(id_usuario);
        }

        if (entidad) {
            query += ' AND l.entidad = ?';
            params.push(entidad);
        }

        if (desde) {
            query += ' AND l.fecha >= ?';
            params.push(`${desde} 00:00:00`);
        }

        if (hasta) {
            query += ' AND l.fecha <= ?';
            params.push(`${hasta} 23:59:59`);
        }

        query += ' ORDER BY l.fecha DESC';

        const [rows] = await db.query(query, params);

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { logs: rows }
        });
    } catch (error) {
        res.status(500).json({
            codigo: 500,
            estado: "error",
            datos: { mensaje: "Error al obtener los logs de auditoría", detalle: error.message }
        });
    }
};

module.exports = { listarLogs };