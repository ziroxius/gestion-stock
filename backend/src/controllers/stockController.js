const conexion = require('../db/conexion');

function obtenerStock(req, res) {

    const sql = `
    SELECT
        id,
        nombre,
        categoria,
        costo_actual,
        precio_venta,
        stock,
        stock_minimo,
        CASE
            WHEN stock <= stock_minimo THEN 'BAJO'
            ELSE 'NORMAL'
        END AS estado_stock
    FROM productos
    ORDER BY nombre
    
    `;
    
    conexion.query(sql, (error, resultados) => {

    if (error) {
        console.log(error);

        return res.status(500).json({
            mensaje: "Error al obtener el stock"
        });
    }

    res.status(200).json(resultados);
    
});

}


function obtenerStockBajo(req, res) {

    const sql = `
        SELECT
            id,
            nombre,
            categoria,
            costo_actual,
            precio_venta,
            stock,
            stock_minimo
        FROM productos
        WHERE stock <= stock_minimo
        ORDER BY stock ASC
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: "Error al obtener productos con stock bajo"
            });
        }

        res.status(200).json(resultados);
    });
}


module.exports = {
    obtenerStock,
    obtenerStockBajo
};