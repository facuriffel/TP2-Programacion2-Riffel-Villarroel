const db = require('../database/db');

const crearAgenda = async (req, res) => {
    const { hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede } = req.body;

    try {
        if (req.usuario.rol === 'medico' && req.usuario.id !== id_medico) {
            return res.status(403).json({
                codigo: 403,
                estado: "error",
                datos: { mensaje: "Acceso denegado. Solo podés crear turnos para tu propia agenda." }
            });
        }

        const query = `INSERT INTO agenda (hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede) VALUES (?, ?, ?, ?, ?, ?)`;
        await db.query(query, [hora_entrada, hora_salida, fecha, id_medico, id_especialidad, id_sede]);

        res.status(201).json({ codigo: 201, estado: "ok", datos: { mensaje: "Turno de agenda creado exitosamente" } });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al crear agenda", detalle: error.message } });
    }
};

const listarAgenda = async (req, res) => {
    try {
        const { id_medico, id_sede, fecha } = req.query;
        let query = 'SELECT * FROM agenda WHERE 1=1';
        const queryParams = [];

        if (req.usuario.rol === 'medico') {
            query += ' AND id_medico = ?';
            queryParams.push(req.usuario.id);
        } else if (id_medico) {
            query += ' AND id_medico = ?';
            queryParams.push(id_medico);
        }

        if (id_sede) {
            query += ' AND id_sede = ?';
            queryParams.push(id_sede);
        }
        if (fecha) {
            query += ' AND fecha = ?';
            queryParams.push(fecha);
        }

        const [rows] = await db.query(query, queryParams);

        res.status(200).json({ codigo: 200, estado: "ok", datos: { agenda: rows } });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al listar agenda", detalle: error.message } });
    }
};

const modificarAgenda = async (req, res) => {
    const { id } = req.params;
    const { hora_entrada, hora_salida, fecha, id_especialidad, id_sede } = req.body;

    try {
        const [agendaExistente] = await db.query('SELECT * FROM agenda WHERE id = ?', [id]);

        if (agendaExistente.length === 0) {
            return res.status(404).json({ codigo: 404, estado: "error", datos: { mensaje: "Turno de agenda no encontrado" } });
        }

        if (req.usuario.rol === 'medico' && agendaExistente[0].id_medico !== req.usuario.id) {
            return res.status(403).json({
                codigo: 403,
                estado: "error",
                datos: { mensaje: "Acceso denegado. No tenés permiso para modificar la agenda de otro médico." }
            });
        }

        const query = `UPDATE agenda SET hora_entrada = ?, hora_salida = ?, fecha = ?, id_especialidad = ?, id_sede = ? WHERE id = ?`;
        await db.query(query, [hora_entrada, hora_salida, fecha, id_especialidad, id_sede, id]);

        res.status(200).json({ codigo: 200, estado: "ok", datos: { mensaje: "Agenda modificada exitosamente" } });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al modificar agenda", detalle: error.message } });
    }
};

const eliminarAgenda = async (req, res) => {
    const { id } = req.params;

    try {
        const [agendaExistente] = await db.query('SELECT * FROM agenda WHERE id = ?', [id]);

        if (agendaExistente.length === 0) {
            return res.status(404).json({ codigo: 404, estado: "error", datos: { mensaje: "Turno de agenda no encontrado" } });
        }

        if (req.usuario.rol === 'medico' && agendaExistente[0].id_medico !== req.usuario.id) {
            return res.status(403).json({
                codigo: 403,
                estado: "error",
                datos: { mensaje: "Acceso denegado. No tenés permiso para eliminar la agenda de otro médico." }
            });
        }

        await db.query('DELETE FROM agenda WHERE id = ?', [id]);

        res.status(200).json({ codigo: 200, estado: "ok", datos: { mensaje: "Turno de agenda eliminado exitosamente" } });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al eliminar agenda", detalle: error.message } });
    }
};

module.exports = { crearAgenda, listarAgenda, modificarAgenda, eliminarAgenda };