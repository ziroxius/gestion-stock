const conexion = require('../db/conexion');

function buscarProducto(req, res) {

    const id = req.params.id;

    conexion.query(
        'SELECT * FROM productos WHERE id = ?',
        [id],
        (error, resultados) => {

            if (error) {
                console.log(error);

                return res.status(500).json({
                    mensaje: 'Error al buscar el producto'
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje: 'Producto no encontrado'
                });
            }

            res.json(resultados[0]);
        }
    );
}


function buscarProductos(req, res) {

    conexion.query(
        'SELECT * FROM productos',
        (error, resultados) => {

            if (error) {
                console.log(error);

                return res.status(500).json({
                    mensaje: 'Error al consultar productos'
                });
            }

            res.json(resultados);
        }
    );
}

function buscarProductosPorNombre(req, res) {

    const nombre = req.query.nombre;

    conexion.query(
        'SELECT * FROM productos WHERE nombre LIKE ?',
        [`%${nombre}%`],
        (error, resultados) => {

            if (error) {
                console.log(error);

                return res.status(500).json({
                    mensaje: 'Error al buscar productos'
                });
            }

            res.json(resultados);
        }
    );
}

function crearProducto(req, res) {

    const {
        nombre,
        descripcion,
        categoria,
        costo_actual,
        precio_venta,
        stock_minimo
    } = req.body;

    const sql = `
        INSERT INTO productos
        (nombre, descripcion, categoria, costo_actual, precio_venta, stock_minimo)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const valores = [
        nombre,
        descripcion,
        categoria,
        costo_actual,
        precio_venta,
        stock_minimo
    ];

    conexion.query(sql, valores, (error, resultado) => {

        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: 'Error al crear el producto'
            });
        }

        res.status(201).json({
            mensaje: 'Producto creado correctamente',
            id: resultado.insertId
        });
    });
}

function actualizarProducto(req, res) {
    const id = req.params.id;

    const {
        nombre,
        descripcion,
        categoria,
        costo_actual,
        precio_venta,
        stock_minimo
    } = req.body;

    const sql = `
        UPDATE productos
        SET
            nombre = ?,
            descripcion = ?,
            categoria = ?,
            costo_actual = ?,
            precio_venta = ?,
            stock_minimo = ?
        WHERE id = ?
    `;

    const valores = [
        nombre,
        descripcion,
        categoria,
        costo_actual,
        precio_venta,
        stock_minimo,
        id
    ];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: 'Error al actualizar el producto'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Producto actualizado correctamente'
        });
    });
}

function eliminarProducto(req, res) {
    const id = req.params.id;

    const sql = `
        DELETE FROM productos
        WHERE id = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {
        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: 'Error al eliminar el producto'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Producto eliminado correctamente'
        });
    });
}



module.exports = {
    buscarProducto,
    buscarProductos,
    buscarProductosPorNombre,
    crearProducto,
    actualizarProducto,
    eliminarProducto
};