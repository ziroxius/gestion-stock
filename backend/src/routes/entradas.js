const express = require('express');

const router = express.Router();

const {
    crearEntrada,
    crearEntradaCompleta,
    obtenerEntradas,
    obtenerEntradaPorId,
    obtenerHistorialEntradas
} = require('../controllers/entradasController');


router.post('/entradas', crearEntrada);

router.post('/entradas/completa', crearEntradaCompleta);

router.get('/entradas', obtenerEntradas);

router.get('/entradas/:id', obtenerEntradaPorId);

router.get('/historial/entradas', obtenerHistorialEntradas);

module.exports = router;