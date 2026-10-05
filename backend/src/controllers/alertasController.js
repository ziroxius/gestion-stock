const conexion = require('../db/conexion');

function obtenerAlertasVencimiento(req, res) {

    const sql = `
        SELECT
            lotes.id,
            productos.nombre AS producto,
            lotes.numero_lote,
            lotes.cantidad_actual,
            lotes.fecha_vencimiento,
            DATEDIFF(lotes.fecha_vencimiento, CURDATE()) AS dias_restantes,

            CASE
                WHEN lotes.fecha_vencimiento < CURDATE()
                    THEN 'VENCIDO'

                WHEN DATEDIFF(lotes.fecha_vencimiento, CURDATE()) <= 7
                    THEN 'URGENTE'

                WHEN DATEDIFF(lotes.fecha_vencimiento, CURDATE()) <= 30
                    THEN 'PROXIMO'

                ELSE 'NORMAL'
            END AS estado

        FROM lotes

        INNER JOIN productos
            ON lotes.producto_id = productos.id

        WHERE lotes.cantidad_actual > 0

        ORDER BY lotes.fecha_vencimiento ASC
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: "Error al obtener alertas de vencimiento"
            });
        }

        res.status(200).json(resultados);
    });
}

function obtenerResumenAlertas(req, res) {

    const sql = `
        SELECT
            SUM(
                CASE
                    WHEN fecha_vencimiento < CURDATE()
                    THEN 1
                    ELSE 0
                END
            ) AS vencidos,

            SUM(
                CASE
                    WHEN fecha_vencimiento >= CURDATE()
                    AND DATEDIFF(fecha_vencimiento, CURDATE()) <= 7
                    THEN 1
                    ELSE 0
                END
            ) AS urgentes,

            SUM(
                CASE
                    WHEN DATEDIFF(fecha_vencimiento, CURDATE()) > 7
                    AND DATEDIFF(fecha_vencimiento, CURDATE()) <= 30
                    THEN 1
                    ELSE 0
                END
            ) AS proximos

        FROM lotes

        WHERE cantidad_actual > 0
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: "Error al obtener resumen de alertas"
            });
        }

        res.status(200).json(resultados[0]);
    });
}

module.exports = {
    obtenerAlertasVencimiento,
    obtenerResumenAlertas
};