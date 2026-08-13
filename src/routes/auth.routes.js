const { Router } = require('express');
const { login, registro, perfil, obtenerCoberturas } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/coberturas', obtenerCoberturas);

router.post('/registro', registro);
router.post('/login', login);

router.get('/perfil', verificarToken, perfil);

module.exports = router;