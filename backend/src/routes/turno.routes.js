const { Router } = require('express');
const { crearTurno, cancelarTurno, atenderTurno, listarTurnos } = require('../controllers/turno.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const router = Router();

router.use(verificarToken);

// Listado accesible por paciente, médico u operador según reglas de negocio
router.get('/', verificarRol('paciente', 'medico', 'operador'), listarTurnos);

// Alta de turno solo para paciente u operador
router.post('/', verificarRol('paciente', 'operador'), crearTurno);

// Cancelación disponible para paciente, médico u operador de sede
router.put('/:id/cancelar', verificarRol('paciente', 'medico', 'operador'), cancelarTurno);

// Atención exclusiva del rol médico
router.put('/:id/atender', verificarRol('medico'), atenderTurno);

module.exports = router;