const { Router } = require('express');
const { login } = require('../controllers/auth.controller');
const router = Router();

// Endpoint POST /auth/login
router.post('/login', login);

module.exports = router;