const express = require('express');

const {
    crearLote
} = require('../controllers/lotesController');

const router = express.Router();

router.post('/lotes', crearLote);

module.exports = router;