const db = require('../database/db');
const bcrypt = require('bcrypt');

const listarUsuarios = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, nombre, apellido, email, rol, id_cobertura, id_sede FROM usuario');
        res.status(200).json({ codigo: 200, estado: "ok", datos: { usuarios: rows } });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al listar usuarios", detalle: error.message } });
    }
};

const crearUsuario = async (req, res) => {
    const { nombre, apellido, dni, fecha_nacimiento, email, password, rol, id_cobertura, id_sede } = req.body;
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        await db.query(
            `INSERT INTO usuario (nombre, apellido, dni, fecha_nacimiento, email, password, rol, id_cobertura, id_sede) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre, apellido, dni, fecha_nacimiento || null, email, passwordHash, rol, id_cobertura || null, id_sede || null]
        );
        res.status(201).json({ codigo: 201, estado: "ok", datos: { mensaje: "Usuario creado exitosamente" } });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al crear usuario", detalle: error.message } });
    }
};

const modificarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, dni, fecha_nacimiento, email, rol, id_cobertura, id_sede } = req.body;
    try {
        await db.query(
            `UPDATE usuario 
             SET nombre = ?, apellido = ?, dni = ?, fecha_nacimiento = ?, email = ?, rol = ?, id_cobertura = ?, id_sede = ? 
             WHERE id = ?`,
            [nombre, apellido, dni, fecha_nacimiento || null, email, rol, id_cobertura || null, id_sede || null, id]
        );
        res.status(200).json({ codigo: 200, estado: "ok", datos: { mensaje: "Usuario modificado exitosamente" } });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al modificar usuario", detalle: error.message } });
    }
};

const eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const [turnos] = await db.query('SELECT id FROM turno WHERE id_paciente = ? OR id_medico = ?', [id, id]);
        const [agendas] = await db.query('SELECT id FROM agenda WHERE id_medico = ?', [id]);

        if (turnos.length > 0 || agendas.length > 0) {
            return res.status(400).json({
                codigo: 400,
                estado: "error",
                datos: { mensaje: "No se puede eliminar el usuario porque cuenta con turnos o agendas asociadas." }
            });
        }

        await db.query('DELETE FROM usuario WHERE id = ?', [id]);
        res.status(200).json({ codigo: 200, estado: "ok", datos: { mensaje: "Usuario eliminado exitosamente" } });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al eliminar usuario", detalle: error.message } });
    }
};

module.exports = { listarUsuarios, crearUsuario, modificarUsuario, eliminarUsuario };
