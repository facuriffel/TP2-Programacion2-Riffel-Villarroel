const db = require('../database/db');

const listarNotificaciones = async (req, res) => {
    try {
        // Notificaciones del usuario autenticado ordenadas de más reciente a más antigua[cite: 3]
        const query = `
            SELECT id, tipo, mensaje, leida, fecha 
            FROM notificacion 
            WHERE id_usuario = ? 
            ORDER BY fecha DESC
        `;
        const [rows] = await db.query(query, [req.usuario.id]);

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { notificaciones: rows }
        });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al obtener notificaciones", detalle: error.message } });
    }
};

const marcarLeida = async (req, res) => {
    const { id } = req.params;

    try {
        // Validar que la notificación exista y pertenezca al usuario autenticado[cite: 3]
        const [notifRows] = await db.query('SELECT * FROM notificacion WHERE id = ?', [id]);
        if (notifRows.length === 0) {
            return res.status(404).json({
                codigo: 404,
                estado: "error",
                datos: { mensaje: "Notificación no encontrada." }
            });
        }

        if (notifRows[0].id_usuario !== req.usuario.id) {
            return res.status(403).json({
                codigo: 403,
                estado: "error",
                datos: { mensaje: "Acceso denegado. No podés modificar notificaciones de otros usuarios." }
            });
        }

        await db.query('UPDATE notificacion SET leida = 1 WHERE id = ?', [id]);

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { mensaje: "Notificación marcada como leída exitosamente." }
        });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al actualizar la notificación", detalle: error.message } });
    }
};

module.exports = { listarNotificaciones, marcarLeida };