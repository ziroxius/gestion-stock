const express = require('express');
const conexion = require('../db/conexion');
const { buscarProducto, buscarProductos, buscarProductosPorNombre, crearProducto, actualizarProducto, eliminarProducto } = require('../controllers/productosController');

const router = express.Router();

router.get('/productos', buscarProductos);
router.get('/productos/buscar', buscarProductosPorNombre);
router.get('/productos/:id', buscarProducto);
router.post('/productos', crearProducto);
router.put('/productos/:id', actualizarProducto);
router.delete('/productos/:id', eliminarProducto);

module.exports = router;