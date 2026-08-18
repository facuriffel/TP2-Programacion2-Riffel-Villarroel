const { Router } = require('express');
const { listarCoberturas, crearCobertura, modificarCobertura, eliminarCobertura } = require('../controllers/cobertura.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const router = Router();

// Endpoint público para el registro de pacientes[cite: 1]
router.get('/', listarCoberturas);

// Resto bloqueado solo para administradores[cite: 1]
router.use(verificarToken);
router.use(verificarRol('administrador'));

router.post('/', crearCobertura);
router.put('/:id', modificarCobertura);
router.delete('/:id', eliminarCobertura);

module.exports = router;