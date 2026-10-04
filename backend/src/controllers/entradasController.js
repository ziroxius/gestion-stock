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

    if (!proveedor_id) {
        return res.status(400).json({
            mensaje: "El proveedor es obligatorio"
        });
    }

    if (!productos || productos.length === 0) {
        return res.status(400).json({
            mensaje: "Debe ingresar al menos un producto"
        });
    }

    // Verificar que el proveedor exista

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
                return res.status(500).json({
                    mensaje: "Error al verificar el proveedor"
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje: "El proveedor no existe"
                });
            }

            // Si el proveedor existe, iniciamos la transacción

            conexion.beginTransaction((error) => {

                if (error) {
                    console.log(error);

                    return res.status(500).json({
                        mensaje: 'Error al iniciar la transacción'
                    });
                }

                // 1. Crear la entrada

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
                                    mensaje: 'Error al crear la entrada'
                                });
                            });
                        }

                        const entradaId = resultadoEntrada.insertId;

                        // 2. Procesar los productos

                        procesarProductos(
                            productos,
                            entradaId,
                            0,
                            () => {

                                // 3. Si todo salió bien

                                conexion.commit((error) => {

                                    if (error) {
                                        return conexion.rollback(() => {
                                            console.log(error);

                                            res.status(500).json({
                                                mensaje: 'Error al confirmar la entrada'
                                            });
                                        });
                                    }

                                    res.status(201).json({
                                        mensaje: 'Entrada completa creada correctamente',
                                        entrada_id: entradaId
                                    });

                                });

                            },
                            (error) => {

                                conexion.rollback(() => {

                                    console.log(error);

                                    if (error.message.includes('no existe')) {
                                        return res.status(404).json({
                                            mensaje: error.message
                                        });
                                    }

                                    if (
                                        error.message.includes('cantidad') ||
                                        error.message.includes('costo')
                                    ) {
                                        return res.status(400).json({
                                            mensaje: error.message
                                        });
                                    }

                                    res.status(500).json({
                                        mensaje: 'Error al procesar la entrada'
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


module.exports = {
    crearEntrada,
    crearEntradaCompleta
};