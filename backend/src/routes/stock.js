const express = require('express');

const {
    obtenerStock,
    obtenerStockBajo
} = require('../controllers/stockController');

const router = express.Router();

router.get('/stock', obtenerStock);

router.get('/stock/bajo', obtenerStockBajo);

module.exports = router;