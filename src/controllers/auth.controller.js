const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    // recibe dni y contraseña
    const { dni, contrasena } = req.body;

    try {
        // busca al usuario en la base de datos usando el DNI
        const [rows] = await db.query('SELECT * FROM usuario WHERE dni = ?', [dni]);

        if (rows.length === 0) {
            return res.status(401).json({ codigo: 401, estado: "error", datos: { mensaje: "Credenciales inválidas" } });
        }

        const usuario = rows[0];

        // validar la contraseña contra el hash almacenado
        const passwordValida = await bcrypt.compare(contrasena, usuario.password);

        if (!passwordValida) {
            return res.status(401).json({ codigo: 401, estado: "error", datos: { mensaje: "Credenciales inválidas" } });
        }

        // genera el JWT con al menos: id, rol y id_sede
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol, id_sede: usuario.id_sede },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        // devolvemos el token en el formato uniforme
        res.status(200).json({
            codigo: 200,
            estado: "ok",
            datos: { token }
        });

    } catch (error) {
        res.status(500).json({
            codigo: 500,
            estado: "error",
            datos: { mensaje: "Error interno del servidor", detalle: error.message }
        });
    }
};

module.exports = { login };