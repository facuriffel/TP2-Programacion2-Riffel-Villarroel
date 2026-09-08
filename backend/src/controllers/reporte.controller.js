const db = require('../database/db');

/**
 * GET /reportes/especialidades
 * Conteo de turnos por especialidad
 * Query params opcionales: desde, hasta (YYYY-MM-DD)
 */
const obtenerTurnosPorEspecialidad = async (req, res) => {
    const { desde, hasta } = req.query;

    try {
        let query = `
            SELECT 
                e.id AS id_especialidad,
                e.descripcion,
                COUNT(t.id) AS cantidad_turnos
            FROM turno t
            INNER JOIN especialidad e ON t.id_especialidad = e.id
            WHERE 1=1
        `;
        const params = [];

        if (desde) {
            query += ' AND t.fecha >= ?';
            params.push(desde);
        }

        if (hasta) {
            query += ' AND t.fecha <= ?';
            params.push(hasta);
        }

        query += ' GROUP BY e.id, e.descripcion ORDER BY cantidad_turnos DESC, e.descripcion ASC';

        const [rows] = await db.query(query, params);

        const especialidades = rows.map(row => ({
            id_especialidad: row.id_especialidad,
            descripcion: row.descripcion,
            cantidad_turnos: Number(row.cantidad_turnos)
        }));

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { especialidades }
        });
    } catch (error) {
        res.status(500).json({
            codigo: 500,
            estado: "error",
            datos: { mensaje: "Error al obtener reporte de turnos por especialidad", detalle: error.message }
        });
    }
};

/**
 * GET /reportes/sedes
 * Conteo de turnos por sede
 * Query params opcionales: desde, hasta (YYYY-MM-DD)
 */
const obtenerTurnosPorSede = async (req, res) => {
    const { desde, hasta } = req.query;

    try {
        let query = `
            SELECT 
                s.id AS id_sede,
                s.nombre,
                COUNT(t.id) AS cantidad_turnos
            FROM turno t
            INNER JOIN sede s ON t.id_sede = s.id
            WHERE 1=1
        `;
        const params = [];

        if (desde) {
            query += ' AND t.fecha >= ?';
            params.push(desde);
        }

        if (hasta) {
            query += ' AND t.fecha <= ?';
            params.push(hasta);
        }

        query += ' GROUP BY s.id, s.nombre ORDER BY cantidad_turnos DESC, s.nombre ASC';

        const [rows] = await db.query(query, params);

        const sedes = rows.map(row => ({
            id_sede: row.id_sede,
            nombre: row.nombre,
            cantidad_turnos: Number(row.cantidad_turnos)
        }));

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { sedes }
        });
    } catch (error) {
        res.status(500).json({
            codigo: 500,
            estado: "error",
            datos: { mensaje: "Error al obtener reporte de turnos por sede", detalle: error.message }
        });
    }
};

/**
 * GET /reportes/ranking-medicos
 * Médicos ordenados descendente por cantidad de turnos atendidos
 * Query params opcionales: desde, hasta (YYYY-MM-DD)
 */
const obtenerRankingMedicos = async (req, res) => {
    const { desde, hasta } = req.query;

    try {
        let query = `
            SELECT 
                u.id AS id_medico,
                u.nombre,
                u.apellido,
                COUNT(t.id) AS cantidad_turnos
            FROM turno t
            INNER JOIN usuario u ON t.id_medico = u.id
            WHERE t.estado = 'atendido'
        `;
        const params = [];

        if (desde) {
            query += ' AND t.fecha >= ?';
            params.push(desde);
        }

        if (hasta) {
            query += ' AND t.fecha <= ?';
            params.push(hasta);
        }

        query += ' GROUP BY u.id, u.nombre, u.apellido ORDER BY cantidad_turnos DESC, u.apellido ASC, u.nombre ASC';

        const [rows] = await db.query(query, params);

        const ranking = rows.map(row => ({
            id_medico: row.id_medico,
            nombre: row.nombre,
            apellido: row.apellido,
            cantidad_turnos: Number(row.cantidad_turnos)
        }));

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { ranking }
        });
    } catch (error) {
        res.status(500).json({
            codigo: 500,
            estado: "error",
            datos: { mensaje: "Error al obtener ranking de médicos", detalle: error.message }
        });
    }
};

/**
 * GET /reportes/tasa-cancelacion
 * Tasa de cancelación del período (turnos cancelados / total turnos * 100)
 * Query params opcionales: desde, hasta (YYYY-MM-DD)
 */
const obtenerTasaCancelacion = async (req, res) => {
    const { desde, hasta } = req.query;

    try {
        let query = `
            SELECT 
                COUNT(*) AS total_turnos,
                SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) AS turnos_cancelados
            FROM turno t
            WHERE 1=1
        `;
        const params = [];

        if (desde) {
            query += ' AND t.fecha >= ?';
            params.push(desde);
        }

        if (hasta) {
            query += ' AND t.fecha <= ?';
            params.push(hasta);
        }

        const [rows] = await db.query(query, params);

        const total_turnos = Number(rows[0]?.total_turnos) || 0;
        const turnos_cancelados = Number(rows[0]?.turnos_cancelados) || 0;
        const tasa_cancelacion = total_turnos > 0 
            ? Number(((turnos_cancelados / total_turnos) * 100).toFixed(2)) 
            : 0;

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: {
                total_turnos,
                turnos_cancelados,
                tasa_cancelacion
            }
        });
    } catch (error) {
        res.status(500).json({
            codigo: 500,
            estado: "error",
            datos: { mensaje: "Error al obtener tasa de cancelación", detalle: error.message }
        });
    }
};

module.exports = {
    obtenerTurnosPorEspecialidad,
    obtenerTurnosPorSede,
    obtenerRankingMedicos,
    obtenerTasaCancelacion
};
