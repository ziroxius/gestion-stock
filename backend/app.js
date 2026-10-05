const express = require('express');
const conexion = require('./src/db/conexion');
const productosRoutes = require('./src/routes/productos');
const proveedoresRoutes = require('./src/routes/proveedores');
const entradasRoutes = require('./src/routes/entradas');
const detalleEntradaRoutes = require('./src/routes/detalleEntrada');
const lotesRoutes = require('./src/routes/lotes');
const stockRoutes = require('./src/routes/stock');
const alertasRoutes = require('./src/routes/alertas');
const dashboardRoutes = require('./src/routes/dashboard');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});

app.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});

app.use('/api', productosRoutes);
app.use('/api', proveedoresRoutes);
app.use('/api', entradasRoutes);
app.use('/api', detalleEntradaRoutes);
app.use('/api', lotesRoutes);
app.use('/api', stockRoutes);
app.use('/api', alertasRoutes);
app.use('/api', dashboardRoutes);