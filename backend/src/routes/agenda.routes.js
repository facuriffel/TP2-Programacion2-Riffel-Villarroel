const { Router } = require('express');
const { crearAgenda, listarAgenda, modificarAgenda, eliminarAgenda } = require('../controllers/agenda.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verificarToken);
router.use(verificarRol('medico', 'operador'));

// endpoints del CRUD de agenda medica
router.post('/', crearAgenda);
router.get('/', listarAgenda);
router.put('/:id', modificarAgenda);
router.delete('/:id', eliminarAgenda);

module.exports = router;