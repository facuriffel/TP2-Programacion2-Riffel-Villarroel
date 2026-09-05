const { Router } = require('express');
const { crearSede, listarSedes, modificarSede, eliminarSede } = require('../controllers/sede.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const auditar = require('../middlewares/auditoria.middleware');

const router = Router();

router.use(verificarToken);
router.use(verificarRol('administrador'));
router.use(auditar('sede'));

router.post('/', crearSede);
router.get('/', listarSedes);
router.put('/:id', modificarSede);
router.delete('/:id', eliminarSede);

module.exports = router;