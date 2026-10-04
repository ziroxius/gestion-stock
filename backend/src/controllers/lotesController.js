const conexion = require('../db/conexion');

function crearLote(req, res) {

    const {
        producto_id,
        detalle_entrada_id,
        numero_lote,
        cantidad_inicial,
        cantidad_actual,
        fecha_vencimiento
    } = req.body;

    const sql = `
        INSERT INTO lotes
        (
            producto_id,
            detalle_entrada_id,
            numero_lote,
            cantidad_inicial,
            cantidad_actual,
            fecha_vencimiento
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        producto_id,
        detalle_entrada_id,
        numero_lote,
        cantidad_inicial,
        cantidad_actual,
        fecha_vencimiento
    ];

    conexion.query(sql, valores, (error, resultado) => {

        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: 'Error al crear el lote'
            });
        }

        res.status(201).json({
            mensaje: 'Lote creado correctamente',
            id: resultado.insertId
        });
    });
}

module.exports = {
    crearLote
};