const conexion = require('../db/conexion');

function ejecutarConsulta(sql) {

    return new Promise((resolve, reject) => {

        conexion.query(sql, (error, resultados) => {

            if (error) {
                reject(error);
                return;
            }

            resolve(resultados);
        });

    });
}

async function obtenerDashboard(req, res) {

    const consultas = {

        productos: `
            SELECT COUNT(*) AS total
            FROM productos
        `,

        stockTotal: `
            SELECT COALESCE(SUM(stock), 0) AS total
            FROM productos
        `,

        stockBajo: `
            SELECT COUNT(*) AS total
            FROM productos
            WHERE stock <= stock_minimo
        `,

        valorInventario: `
            SELECT COALESCE(SUM(stock * costo_actual), 0) AS total
            FROM productos
        `,

        entradas: `
            SELECT COUNT(*) AS total
            FROM entradas
        `,

        alertasVencimiento: `
            SELECT COUNT(*) AS total
            FROM lotes
            WHERE cantidad_actual > 0
            AND fecha_vencimiento <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        `,

        ultimasEntradas: `
            SELECT
                entradas.id,
                entradas.fecha,
                proveedores.nombre AS proveedor
            FROM entradas
            INNER JOIN proveedores
                ON entradas.proveedor_id = proveedores.id
            ORDER BY entradas.fecha DESC
            LIMIT 5
        `,

        productosStockBajo: `
            SELECT
                id,
                nombre,
                categoria,
                stock,
                stock_minimo
            FROM productos
            WHERE stock <= stock_minimo
            ORDER BY stock ASC
            LIMIT 5
        `,

        proximosVencimientos: `
            SELECT
                lotes.id,
                productos.nombre AS producto,
                lotes.numero_lote,
                lotes.cantidad_actual,
                lotes.fecha_vencimiento,
                DATEDIFF(
                    lotes.fecha_vencimiento,
                    CURDATE()
                ) AS dias_restantes
            FROM lotes
            INNER JOIN productos
                ON lotes.producto_id = productos.id
            WHERE
                lotes.cantidad_actual > 0
                AND lotes.fecha_vencimiento >= CURDATE()
                AND lotes.fecha_vencimiento <= DATE_ADD(
                    CURDATE(),
                    INTERVAL 30 DAY
                )
            ORDER BY lotes.fecha_vencimiento ASC
            LIMIT 5
        `
    };


    try {

        const [
            productos,
            stockTotal,
            stockBajo,
            valorInventario,
            entradas,
            alertasVencimiento,
            ultimasEntradas,
            productosStockBajo,
            proximosVencimientos
        ] = await Promise.all([

            ejecutarConsulta(consultas.productos),

            ejecutarConsulta(consultas.stockTotal),

            ejecutarConsulta(consultas.stockBajo),

            ejecutarConsulta(consultas.valorInventario),

            ejecutarConsulta(consultas.entradas),

            ejecutarConsulta(consultas.alertasVencimiento),

            ejecutarConsulta(consultas.ultimasEntradas),

            ejecutarConsulta(consultas.productosStockBajo),

            ejecutarConsulta(consultas.proximosVencimientos)

        ]);


        res.status(200).json({

            productos: productos[0].total,

            stock_total: stockTotal[0].total,

            stock_bajo: stockBajo[0].total,

            valor_inventario: valorInventario[0].total,

            entradas: entradas[0].total,

            alertas_vencimiento: alertasVencimiento[0].total,

            ultimas_entradas: ultimasEntradas,

            productos_stock_bajo: productosStockBajo,

            proximos_vencimientos: proximosVencimientos

        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: "Error al obtener información del Dashboard"
        });
    }
}

module.exports = {
    obtenerDashboard
};