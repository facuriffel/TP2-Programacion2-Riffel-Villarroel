const { Router } = require('express');
const { crearHistorial, consultarHistorial } = require('../controllers/historial.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verificarToken);

// Alta de historial clínico solo para médicos[cite: 3]
router.post('/', verificarRol('medico'), crearHistorial);

// Consulta disponible para paciente o médico[cite: 3]
router.get('/', verificarRol('paciente', 'medico'), consultarHistorial);

module.exports = router;