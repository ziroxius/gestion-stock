const express = require('express');

const {
    crearEntrada,
    crearEntradaCompleta
} = require('../controllers/entradasController');

const router = express.Router();

router.post('/entradas', crearEntrada);
router.post('/entradas/completa', crearEntradaCompleta);

module.exports = router;