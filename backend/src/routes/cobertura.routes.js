const { Router } = require('express');
const { listarCoberturas, crearCobertura, modificarCobertura, eliminarCobertura } = require('../controllers/cobertura.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const auditar = require('../middlewares/auditoria.middleware');

const router = Router();

router.get('/', listarCoberturas);

router.use(verificarToken);
router.use(verificarRol('administrador'));

router.post('/', auditar('cobertura'), crearCobertura);
router.put('/:id', auditar('cobertura'), modificarCobertura);
router.delete('/:id', auditar('cobertura'), eliminarCobertura);

module.exports = router;