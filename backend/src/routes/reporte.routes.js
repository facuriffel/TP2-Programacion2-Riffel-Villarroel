const { Router } = require('express');
const {
    obtenerTurnosPorEspecialidad,
    obtenerTurnosPorSede,
    obtenerRankingMedicos,
    obtenerTasaCancelacion
} = require('../controllers/reporte.controller');
const { verificarToken, verificarRol } = require('../middlewares/auth.middleware');

const router = Router();

// Todos los reportes son exclusivos para el rol administrador
router.use(verificarToken);
router.use(verificarRol('administrador'));

router.get('/especialidades', obtenerTurnosPorEspecialidad);
router.get('/sedes', obtenerTurnosPorSede);
router.get('/ranking-medicos', obtenerRankingMedicos);
router.get('/tasa-cancelacion', obtenerTasaCancelacion);

module.exports = router;
