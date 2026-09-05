const { Router } = require('express');
const { listarUsuarios, crearUsuario, modificarUsuario, eliminarUsuario } = require('../controllers/usuario.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');
const auditar = require('../middlewares/auditoria.middleware');

const router = Router();

router.use(verificarToken);
router.use(verificarRol('administrador'));

router.get('/', listarUsuarios);

router.post('/', auditar('usuario'), crearUsuario);
router.put('/:id', auditar('usuario'), modificarUsuario);
router.delete('/:id', auditar('usuario'), eliminarUsuario);

module.exports = router;
