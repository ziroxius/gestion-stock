const express = require('express');

const {
    buscarProveedores,
    buscarProveedor,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor
} = require('../controllers/proveedoresController');

const router = express.Router();

router.get('/proveedores', buscarProveedores);
router.get('/proveedores/:id', buscarProveedor);
router.post('/proveedores', crearProveedor);
router.put('/proveedores/:id', actualizarProveedor);
router.delete('/proveedores/:id', eliminarProveedor);

module.exports = router;