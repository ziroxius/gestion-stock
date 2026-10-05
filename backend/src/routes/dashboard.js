const express = require('express');

const {
    obtenerDashboard
} = require('../controllers/dashboardController');

const router = express.Router();

router.get('/dashboard', obtenerDashboard);

module.exports = router;