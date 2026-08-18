const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { dni, contrasena } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM usuario WHERE dni = ?', [dni]);

        if (rows.length === 0) {
            return res.status(401).json({ codigo: 401, estado: "error", datos: { mensaje: "Credenciales inválidas" } });
        }

        const usuario = rows[0];
        const passwordValida = await bcrypt.compare(contrasena, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({ codigo: 401, estado: "error", datos: { mensaje: "Credenciales inválidas" } });
        }

        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, id_sede: usuario.id_sede },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({ codigo: 200, estado: "ok", datos: { token } });

    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error interno del servidor", detalle: error.message } });
    }
};


const registro = async (req, res) => {

    const { nombre, apellido, dni, email, contrasena, fecha_nacimiento, id_cobertura } = req.body;

    try {
        // Validación: DNI y email no deben estar duplicados[cite: 1]
        const [existentes] = await db.query('SELECT id FROM usuario WHERE dni = ? OR email = ?', [dni, email]);

        if (existentes.length > 0) {
            return res.status(400).json({
                codigo: 400,
                estado: "error",
                datos: { mensaje: "El DNI o el email ya se encuentran registrados" }
            });
        }


        const saltRounds = 10;
        const passwordHasheada = await bcrypt.hash(contrasena, saltRounds);


        const query = `
            INSERT INTO usuario (nombre, apellido, dni, email, password, fecha_nacimiento, id_cobertura, rol) 
            VALUES (?, ?, ?, ?, ?, ?, ?, 'paciente')
        `;

        await db.query(query, [nombre, apellido, dni, email, passwordHasheada, fecha_nacimiento, id_cobertura]);

        res.status(201).json({
            codigo: 201,
            estado: "ok",
            datos: { mensaje: "Usuario registrado con éxito" }
        });

    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al registrar", detalle: error.message } });
    }
};


const perfil = async (req, res) => {
    try {

        const idUsuario = req.usuario.id;

        // Buscamos los datos excluyendo la contraseña por seguridad
        const [rows] = await db.query('SELECT id, nombre, apellido, dni, email, fecha_nacimiento, rol, id_cobertura, id_sede FROM usuario WHERE id = ?', [idUsuario]);

        if (rows.length === 0) {
            return res.status(404).json({ codigo: 404, estado: "error", datos: { mensaje: "Usuario no encontrado" } });
        }

        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { usuario: rows[0] }
        });

    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al obtener perfil", detalle: error.message } });
    }
};


const obtenerCoberturas = async (req, res) => {
    try {

        const [rows] = await db.query('SELECT * FROM cobertura');
        res.status(200).json({ codigo: 200, estado: "ok", datos: { coberturas: rows } });
    } catch (error) {
        res.status(500).json({ codigo: 500, estado: "error", datos: { mensaje: "Error al obtener coberturas", detalle: error.message } });
    }
};

module.exports = { login, registro, perfil, obtenerCoberturas };