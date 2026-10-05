const express = require('express');

const {
    obtenerAlertasVencimiento,
    obtenerResumenAlertas
} = require('../controllers/alertasController');

const router = express.Router();

router.get('/alertas/vencimiento', obtenerAlertasVencimiento);

router.get('/alertas/resumen', obtenerResumenAlertas);

module.exports = router;