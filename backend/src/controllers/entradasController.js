const conexion = require('../db/conexion');

function crearEntrada(req, res) {

    const {
        proveedor_id,
        observaciones
    } = req.body;

    const sql = `
        INSERT INTO entradas
        (proveedor_id, observaciones)
        VALUES (?, ?)
    `;

    const valores = [
        proveedor_id,
        observaciones
    ];

    conexion.query(sql, valores, (error, resultado) => {

        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: 'Error al crear la entrada'
            });
        }

        res.status(201).json({
            mensaje: 'Entrada creada correctamente',
            id: resultado.insertId
        });
    });
}


function crearEntradaCompleta(req, res) {

    const {
        proveedor_id,
        observaciones,
        productos
    } = req.body;


    // =========================
    // VALIDAR PROVEEDOR
    // =========================

    if (!proveedor_id) {
        return res.status(400).json({
            mensaje: "El proveedor es obligatorio"
        });
    }


    // =========================
    // VALIDAR PRODUCTOS
    // =========================

    if (!productos || productos.length === 0) {
        return res.status(400).json({
            mensaje: "Debe ingresar al menos un producto"
        });
    }


    // =========================
    // VERIFICAR PROVEEDOR
    // =========================

    const sqlProveedor = `
        SELECT id
        FROM proveedores
        WHERE id = ?
    `;

    conexion.query(
        sqlProveedor,
        [proveedor_id],
        (error, resultados) => {

            if (error) {
                console.log(error);

                return res.status(500).json({
                    mensaje: "Error al verificar el proveedor"
                });
            }


            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje: "El proveedor no existe"
                });
            }


            // =========================
            // INICIAR TRANSACCIÓN
            // =========================

            conexion.beginTransaction((error) => {

                if (error) {
                    console.log(error);

                    return res.status(500).json({
                        mensaje: "Error al iniciar la transacción"
                    });
                }


                // =========================
                // CREAR ENTRADA
                // =========================

                const sqlEntrada = `
                    INSERT INTO entradas
                    (proveedor_id, observaciones)
                    VALUES (?, ?)
                `;

                conexion.query(
                    sqlEntrada,
                    [proveedor_id, observaciones],
                    (error, resultadoEntrada) => {

                        if (error) {

                            return conexion.rollback(() => {

                                console.log(error);

                                res.status(500).json({
                                    mensaje: "Error al crear la entrada"
                                });

                            });
                        }


                        // ID de la entrada recién creada

                        const entradaId = resultadoEntrada.insertId;


                        // =========================
                        // PROCESAR PRODUCTOS
                        // =========================

                        procesarProductos(
                            productos,
                            entradaId,
                            0,

                            // =========================
                            // TODO SALIÓ BIEN
                            // =========================

                            () => {

                                conexion.commit((error) => {

                                    if (error) {

                                        return conexion.rollback(() => {

                                            console.log(error);

                                            res.status(500).json({
                                                mensaje: "Error al confirmar la entrada"
                                            });

                                        });
                                    }


                                    // =========================
                                    // RESPUESTA FINAL
                                    // =========================

                                    res.status(201).json({
                                        mensaje: "Entrada completa creada correctamente",
                                        entrada_id: entradaId
                                    });

                                });

                            },


                            // =========================
                            // OCURRIÓ UN ERROR
                            // =========================

                            (error) => {

                                conexion.rollback(() => {

                                    console.log(error);


                                    // Errores producidos
                                    // por datos enviados
                                    // por el usuario

                                    if (
                                        error.message.includes("cantidad") ||
                                        error.message.includes("costo") ||
                                        error.message.includes("lote") ||
                                        error.message.includes("fecha")
                                    ) {

                                        return res.status(400).json({
                                            mensaje: error.message
                                        });

                                    }


                                    // Producto inexistente

                                    if (error.message.includes("no existe")) {

                                        return res.status(404).json({
                                            mensaje: error.message
                                        });

                                    }


                                    // Error desconocido

                                    res.status(500).json({
                                        mensaje: "Error al procesar la entrada"
                                    });

                                });

                            }

                        );

                    }

                );

            });

        }

    );

}

function obtenerEntradas(req, res) {

    const sql = `
    SELECT
        entradas.id,
        entradas.fecha,
        entradas.observaciones,
        proveedores.nombre AS proveedor,
        COUNT(detalle_entrada.id) AS cantidad_productos,
        COALESCE(SUM(detalle_entrada.cantidad), 0) AS cantidad_unidades
    FROM entradas

    INNER JOIN proveedores
        ON entradas.proveedor_id = proveedores.id

    LEFT JOIN detalle_entrada
        ON entradas.id = detalle_entrada.entrada_id

    GROUP BY
        entradas.id,
        entradas.fecha,
        entradas.observaciones,
        proveedores.nombre

    ORDER BY entradas.fecha DESC
    
    `;

    conexion.query(sql, (error, resultados) => {

        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: "Error al obtener las entradas"
            });
        }

        res.status(200).json(resultados);
    });
}

function procesarProductos(
    productos,
    entradaId,
    indice,
    finalizar,
    errorCallback
) {

    // Finaliza cuando ya procesamos todos los productos

    if (indice >= productos.length) {
        return finalizar();
    }

    const producto = productos[indice];


    // =========================
    // VALIDAR CANTIDAD
    // =========================

    if (!Number.isInteger(producto.cantidad) || producto.cantidad <= 0) {
        return errorCallback(
            new Error("La cantidad debe ser un número entero mayor a 0")
        );
    }


    // =========================
    // VALIDAR COSTO
    // =========================

    if (
        typeof producto.costo_unitario !== 'number' ||
        producto.costo_unitario < 0
    ) {
        return errorCallback(
            new Error("El costo debe ser un número mayor o igual a 0")
        );
    }


    // =========================
    // VALIDAR NÚMERO DE LOTE
    // =========================

    if (!producto.numero_lote || producto.numero_lote.trim() === '') {
        return errorCallback(
            new Error("El número de lote es obligatorio")
        );
    }


    // =========================
    // VALIDAR FECHA DE VENCIMIENTO
    // =========================

    if (!producto.fecha_vencimiento) {
        return errorCallback(
            new Error("La fecha de vencimiento es obligatoria")
        );
    }

    const fechaVencimiento = new Date(producto.fecha_vencimiento);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (isNaN(fechaVencimiento.getTime())) {
        return errorCallback(
            new Error("La fecha de vencimiento no es válida")
        );
    }

    if (fechaVencimiento < hoy) {
        return errorCallback(
            new Error("La fecha de vencimiento no puede ser anterior a hoy")
        );
    }


    // =========================
    // VERIFICAR PRODUCTO
    // =========================

    const sqlProducto = `
        SELECT id
        FROM productos
        WHERE id = ?
    `;

    conexion.query(
        sqlProducto,
        [producto.producto_id],
        (error, resultados) => {

            if (error) {
                return errorCallback(error);
            }

            if (resultados.length === 0) {
                return errorCallback(
                    new Error(
                        `El producto con ID ${producto.producto_id} no existe`
                    )
                );
            }


            // =========================
            // CREAR DETALLE DE ENTRADA
            // =========================

            const sqlDetalle = `
                INSERT INTO detalle_entrada
                (entrada_id, producto_id, cantidad, costo_unitario)
                VALUES (?, ?, ?, ?)
            `;

            const valoresDetalle = [
                entradaId,
                producto.producto_id,
                producto.cantidad,
                producto.costo_unitario
            ];

            conexion.query(
                sqlDetalle,
                valoresDetalle,
                (error, resultadoDetalle) => {

                    if (error) {
                        return errorCallback(error);
                    }

                    const detalleId = resultadoDetalle.insertId;


                    // =========================
                    // CREAR LOTE
                    // =========================

                    const sqlLote = `
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

                    const valoresLote = [
                        producto.producto_id,
                        detalleId,
                        producto.numero_lote,
                        producto.cantidad,
                        producto.cantidad,
                        producto.fecha_vencimiento
                    ];

                    conexion.query(
                        sqlLote,
                        valoresLote,
                        (error) => {

                            if (error) {
                                return errorCallback(error);
                            }


                            // =========================
                            // ACTUALIZAR STOCK
                            // =========================

                            const sqlStock = `
                                UPDATE productos
                                SET
                                    stock = stock + ?,
                                    costo_actual = ?
                                WHERE id = ?
                            `;

                            const valoresStock = [
                                producto.cantidad,
                                producto.costo_unitario,
                                producto.producto_id
                            ];

                            conexion.query(
                                sqlStock,
                                valoresStock,
                                (error) => {

                                    if (error) {
                                        return errorCallback(error);
                                    }


                                    // =========================
                                    // SIGUIENTE PRODUCTO
                                    // =========================

                                    procesarProductos(
                                        productos,
                                        entradaId,
                                        indice + 1,
                                        finalizar,
                                        errorCallback
                                    );

                                }
                            );

                        }
                    );

                }
            );

        }
    );
}

function obtenerEntradaPorId(req, res) {

    const id = req.params.id;

    const sql = `
    SELECT
        entradas.id,
        entradas.fecha,
        entradas.observaciones,
        proveedores.nombre AS proveedor,
        productos.nombre AS producto,
        detalle_entrada.cantidad,
        detalle_entrada.costo_unitario,
        lotes.numero_lote,
        lotes.fecha_vencimiento
    FROM entradas

    INNER JOIN proveedores
        ON entradas.proveedor_id = proveedores.id

    INNER JOIN detalle_entrada
        ON entradas.id = detalle_entrada.entrada_id

    INNER JOIN productos
        ON detalle_entrada.producto_id = productos.id

    INNER JOIN lotes
        ON detalle_entrada.id = lotes.detalle_entrada_id

    WHERE entradas.id = ?
`;

conexion.query(
    sql,
    [id],
    (error, resultados) => {

        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: "Error al obtener la entrada"
            });
        }

        if (resultados.length === 0) {
    return res.status(404).json({
        mensaje: "La entrada no existe"
    });
}

const entrada = {
    id: resultados[0].id,
    fecha: resultados[0].fecha,
    observaciones: resultados[0].observaciones,
    proveedor: resultados[0].proveedor,
    productos: []
};

resultados.forEach((resultado) => {

    entrada.productos.push({
        nombre: resultado.producto,
        cantidad: resultado.cantidad,
        costo_unitario: resultado.costo_unitario,
        numero_lote: resultado.numero_lote,
        fecha_vencimiento: resultado.fecha_vencimiento
    });

});

res.status(200).json(entrada);
    }
);

}

function obtenerHistorialEntradas(req, res) {

    const {
        desde,
        hasta,
        proveedor,
        producto
    } = req.query;

    let sql = `
        SELECT
            entradas.id AS entrada_id,
            entradas.fecha,
            proveedores.nombre AS proveedor,
            productos.nombre AS producto,
            detalle_entrada.cantidad,
            detalle_entrada.costo_unitario,
            lotes.numero_lote,
            lotes.fecha_vencimiento
        FROM entradas

        INNER JOIN proveedores
            ON entradas.proveedor_id = proveedores.id

        INNER JOIN detalle_entrada
            ON entradas.id = detalle_entrada.entrada_id

        INNER JOIN productos
            ON detalle_entrada.producto_id = productos.id

        INNER JOIN lotes
            ON detalle_entrada.id = lotes.detalle_entrada_id
    `;

    const valores = [];
    const condiciones = [];

    if (desde) {
        condiciones.push('DATE(entradas.fecha) >= ?');
        valores.push(desde);
    }

    if (hasta) {
        condiciones.push('DATE(entradas.fecha) <= ?');
        valores.push(hasta);
    }

    if (proveedor) {
        condiciones.push('entradas.proveedor_id = ?');
        valores.push(proveedor);
    }

    if (producto) {
        condiciones.push('detalle_entrada.producto_id = ?');
        valores.push(producto);
    }

    if (condiciones.length > 0) {
        sql += ` WHERE ${condiciones.join(' AND ')}`;
    }

    sql += `
        ORDER BY entradas.fecha DESC
    `;

    conexion.query(
        sql,
        valores,
        (error, resultados) => {

            if (error) {
                console.log(error);

                return res.status(500).json({
                    mensaje: "Error al obtener el historial de entradas"
                });
            }

            res.status(200).json(resultados);
        }
    );
}


module.exports = {
    crearEntrada,
    crearEntradaCompleta,
    obtenerEntradas,
    obtenerEntradaPorId,
    obtenerHistorialEntradas
};