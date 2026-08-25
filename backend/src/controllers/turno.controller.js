const db = require('../database/db');

// Función auxiliar interna para generar notificaciones automáticamente
const crearNotificacionInterna = async (id_usuario, tipo, mensaje) => {
    try {
        await db.query(
            'INSERT INTO notificacion (id_usuario, tipo, mensaje, leida, fecha) VALUES (?, ?, ?, 0, NOW())',
            [id_usuario, tipo, mensaje]
        );
    } catch (error) {
        console.error('Error al generar notificación interna:', error.message);
    }
};

const crearTurno = async (req, res) => {
    const { id_especialidad, id_sede, id_medico, fecha, hora, nota, id_paciente_body } = req.body;

    if (!nota || nota.trim() === "") {
        return res.status(400).json({
            codigo: 400,
            estado: "error",
            datos: { mensaje: "La nota del turno es obligatoria." }
        });
    }

    try {
        // Determinar paciente según el rol autenticado
        let id_paciente = req.usuario.id;
        if (req.usuario.rol === 'operador') {
            if (!id_paciente_body) {
                return res.status(400).json({
                    codigo: 400,
                    estado: "error",
                    datos: { mensaje: "El operador debe especificar el id_paciente." }
                });
            }
            id_paciente = id_paciente_body;
        }

        // Obtener la cobertura registrada del paciente de forma automática
        const [pacienteRows] = await db.query('SELECT id_cobertura FROM usuario WHERE id = ?', [id_paciente]);
        if (pacienteRows.length === 0) {
            return res.status(404).json({
                codigo: 404,
                estado: "error",
                datos: { mensaje: "El paciente indicado no existe." }
            });
        }
        const id_cobertura = pacienteRows[0].id_cobertura;

        // Validar disponibilidad en la agenda del médico
        const [agendaRows] = await db.query(
            `SELECT id FROM agenda 
             WHERE id_medico = ? AND id_sede = ? AND id_especialidad = ? AND fecha = ? 
             AND ? >= hora_entrada AND ? < hora_salida`,
            [id_medico, id_sede, id_especialidad, fecha, hora, hora]
        );

        if (agendaRows.length === 0) {
            return res.status(400).json({
                codigo: 400,
                estado: "error",
                datos: { mensaje: "El horario solicitado no se encuentra disponible en la agenda del médico." }
            });
        }

        // Validar que no haya superposición con otro turno confirmado
        const [superpuestoRows] = await db.query(
            `SELECT t.id FROM turno t
             INNER JOIN agenda a ON t.id_agenda = a.id
             WHERE a.id_medico = ? AND t.fecha = ? AND t.hora = ? AND t.estado = 'confirmado'`,
            [id_medico, fecha, hora]
        );

        if (superpuestoRows.length > 0) {
            return res.status(400).json({
                codigo: 400,
                estado: "error",
                datos: { mensaje: "Ya existe un turno confirmado para ese médico en la fecha y hora solicitadas." }
            });
        }

        const id_agenda = agendaRows[0].id;

        // Insertar turno con estado confirmado
        const insertQuery = `
            INSERT INTO turno (fecha, hora, estado, nota, id_paciente, id_agenda, id_cobertura) 
            VALUES (?, ?, 'confirmado', ?, ?, ?, ?)
        `;
        await db.query(insertQuery, [fecha, hora, nota, id_paciente, id_agenda, id_cobertura]);

        // Disparar notificación automática al paciente
        await crearNotificacionInterna(
            id_paciente,
            'turno_confirmado',
            `Tu turno para el ${fecha} a las ${hora} hs ha sido confirmado.`
        );

        res.status(201).json({
            codigo: 201,
            estado: "ok",
            datos: { mensaje: "Turno reservado y confirmado exitosamente." }
        });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al crear el turno", detalle: error.message } });
    }
};

const cancelarTurno = async (req, res) => {
    const { id } = req.params;

    try {
        const [turnoRows] = await db.query(`
            SELECT t.*, a.id_medico, a.id_sede 
            FROM turno t
            INNER JOIN agenda a ON t.id_agenda = a.id
            WHERE t.id = ?
        `, [id]);
        if (turnoRows.length === 0) {
            return res.status(404).json({
                codigo: 404,
                estado: "error",
                datos: { mensaje: "Turno no encontrado." }
            });
        }

        const turno = turnoRows[0];

        // Validar permisos por rol para cancelación
        if (req.usuario.rol === 'paciente' && turno.id_paciente !== req.usuario.id) {
            return res.status(403).json({
                codigo: 403,
                estado: "error",
                datos: { mensaje: "Acceso denegado. Solo podés cancelar tus propios turnos." }
            });
        }

        if (req.usuario.rol === 'medico' && turno.id_medico !== req.usuario.id) {
            return res.status(403).json({
                codigo: 403,
                estado: "error",
                datos: { mensaje: "Acceso denegado. Solo podés cancelar turnos de tu agenda." }
            });
        }

        if (req.usuario.rol === 'operador' && turno.id_sede !== req.usuario.id_sede) {
            return res.status(403).json({
                codigo: 403,
                estado: "error",
                datos: { mensaje: "Acceso denegado. Solo podés cancelar turnos correspondientes a tu sede." }
            });
        }

        await db.query("UPDATE turno SET estado = 'cancelado' WHERE id = ?", [id]);

        // Disparar notificación automática al paciente
        await crearNotificacionInterna(
            turno.id_paciente,
            'turno_cancelado',
            `Tu turno del día ${turno.fecha} a las ${turno.hora} hs ha sido cancelado.`
        );

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { mensaje: "Turno cancelado exitosamente." }
        });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al cancelar el turno", detalle: error.message } });
    }
};

const atenderTurno = async (req, res) => {
    const { id } = req.params;

    try {
        const [turnoRows] = await db.query(`
            SELECT t.*, a.id_medico 
            FROM turno t
            INNER JOIN agenda a ON t.id_agenda = a.id
            WHERE t.id = ?
        `, [id]);
        if (turnoRows.length === 0) {
            return res.status(404).json({
                codigo: 404,
                estado: "error",
                datos: { mensaje: "Turno no encontrado." }
            });
        }

        const turno = turnoRows[0];

        // Solo el médico asignado puede marcarlo atendido
        if (turno.id_medico !== req.usuario.id) {
            return res.status(403).json({
                codigo: 403,
                estado: "error",
                datos: { mensaje: "Acceso denegado. Solo podés atender turnos asignados a tu usuario." }
            });
        }

        await db.query("UPDATE turno SET estado = 'atendido' WHERE id = ?", [id]);

        // Disparar notificación automática al paciente
        await crearNotificacionInterna(
            turno.id_paciente,
            'turno_atendido',
            `Tu turno del día ${turno.fecha} ha sido registrado como atendido.`
        );

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { mensaje: "Turno marcado como atendido exitosamente." }
        });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al atender el turno", detalle: error.message } });
    }
};

const listarTurnos = async (req, res) => {
    const { fecha } = req.query;

    try {
        let query = 'SELECT t.* FROM turno t ';
        const params = [];

        if (req.usuario.rol === 'paciente') {
            // "Mis turnos" ordenados del más próximo al menos próximo
            query += 'WHERE t.id_paciente = ? ORDER BY t.fecha ASC, t.hora ASC';
            params.push(req.usuario.id);
        } else if (req.usuario.rol === 'medico') {
            // Turnos del médico, filtrable por fecha
            query += 'INNER JOIN agenda a ON t.id_agenda = a.id WHERE a.id_medico = ?';
            params.push(req.usuario.id);
            if (fecha) {
                query += ' AND t.fecha = ?';
                params.push(fecha);
            }
            query += ' ORDER BY t.hora ASC';
        } else if (req.usuario.rol === 'operador') {
            // Turnos de la sede del operador para una fecha
            query += 'INNER JOIN agenda a ON t.id_agenda = a.id WHERE a.id_sede = ?';
            params.push(req.usuario.id_sede);
            if (fecha) {
                query += ' AND t.fecha = ?';
                params.push(fecha);
            }
            query += ' ORDER BY t.hora ASC';
        }

        const [rows] = await db.query(query, params);

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { turnos: rows }
        });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al listar los turnos", detalle: error.message } });
    }
};

module.exports = { crearTurno, cancelarTurno, atenderTurno, listarTurnos };