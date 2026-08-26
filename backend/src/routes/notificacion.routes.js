const { Router } = require('express');
const { listarNotificaciones, marcarLeida } = require('../controllers/notificacion.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verificarToken);

// Endpoints accesibles por cualquier usuario autenticado sobre sus propios datos[cite: 3]
router.get('/', listarNotificaciones);
router.put('/:id/leida', marcarLeida);

module.exports = router;