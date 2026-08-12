const jwt = require('jsonwebtoken');

// Middleware para verificar que el JWT es válido
const verificarToken = (req, res, next) => {
    // El token suele venir en el header "Authorization" como "Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];


    if (!token) {
        return res.status(401).json({
            codigo: 401,
            estado: "error",
            datos: { mensaje: "Acceso denegado. Token no proporcionado." }
        });
    }


    jwt.verify(token, process.env.JWT_SECRET, (err, usuarioDecodificado) => {
        if (err) {
            return res.status(401).json({
                codigo: 401,
                estado: "error",
                datos: { mensaje: "Acceso denegado. Token inválido o vencido." }
            });
        }


        req.usuario = usuarioDecodificado;
        next();
    });
};


const verificarRol = (...rolesPermitidos) => {
    return (req, res, next) => {

        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                codigo: 403,
                estado: "error",
                datos: { mensaje: "Acceso denegado. No tenés permisos para esta acción." }
            });
        }
        next();
    };
};

module.exports = { verificarToken, verificarRol };