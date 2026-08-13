const express = require('express');
const router = express.Router();
const { login, registro, obtenerPerfil } = require('../controllers/auth.controller');
const { verificarToken } = require('../middlewares/verificarToken'); // Revisa cómo exportó/nombró Facu este middleware

// Ruta existente de Facu
router.post('/login', login);

// Tus rutas
router.post('/registro', registro);
router.get('/perfil', verificarToken, obtenerPerfil);

module.exports = router;