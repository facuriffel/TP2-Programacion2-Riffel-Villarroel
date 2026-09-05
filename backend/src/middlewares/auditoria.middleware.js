const db = require('../database/db');

const auditar = (entidad) => {
    return (req, res, next) => {

        res.on('finish', async () => {

            if (res.statusCode >= 200 && res.statusCode < 300 && req.usuario) {
                let accion = null;
                if (req.method === 'POST') accion = 'ALTA';
                else if (req.method === 'PUT' || req.method === 'PATCH') accion = 'MODIFICACION';
                else if (req.method === 'DELETE') accion = 'BAJA';

                if (!accion) return;

                const detalleObj = {
                    parametros: req.params,
                    body: req.body,
                    query: req.query
                };


                if (detalleObj.body && detalleObj.body.password) {
                    detalleObj.body = { ...detalleObj.body, password: '[OCULTO]' };
                }

                const detalle = JSON.stringify(detalleObj);

                try {
                    await db.query(
                        'INSERT INTO log_auditoria (id_usuario, accion, entidad, detalle, fecha) VALUES (?, ?, ?, ?, NOW())',
                        [req.usuario.id, accion, entidad, detalle]
                    );
                } catch (error) {
                    console.error('Error al registrar auditoría:', error.message);
                }
            }
        });

        next();
    };
};

module.exports = auditar;