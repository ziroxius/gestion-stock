const conexion = require('../db/conexion');

function crearDetalleEntrada(req, res) {

    const {
        entrada_id,
        producto_id,
        cantidad,
        costo_unitario
    } = req.body;

    const sql = `
        INSERT INTO detalle_entrada
        (entrada_id, producto_id, cantidad, costo_unitario)
        VALUES (?, ?, ?, ?)
    `;

    const valores = [
        entrada_id,
        producto_id,
        cantidad,
        costo_unitario
    ];

    conexion.query(sql, valores, (error, resultado) => {

        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: 'Error al crear el detalle de entrada'
            });
        }

        res.status(201).json({
            mensaje: 'Detalle de entrada creado correctamente',
            id: resultado.insertId
        });
    });
}

module.exports = {
    crearDetalleEntrada
};