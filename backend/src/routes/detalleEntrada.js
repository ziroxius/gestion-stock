const express = require('express');

const {
    crearDetalleEntrada
} = require('../controllers/detalleEntradaController');

const router = express.Router();

router.post('/detalle-entrada', crearDetalleEntrada);

module.exports = router;