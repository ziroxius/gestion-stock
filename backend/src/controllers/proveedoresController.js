const conexion = require('../db/conexion');

function buscarProveedores(req, res) {
    conexion.query(
        'SELECT * FROM proveedores',
        (error, resultados) => {

            if (error) {
                console.log(error);

                return res.status(500).json({
                    mensaje: 'Error al consultar proveedores'
                });
            }

            res.json(resultados);
        }
    );
}

function buscarProveedor(req, res) {
    const id = req.params.id;

    conexion.query(
        'SELECT * FROM proveedores WHERE id = ?',
        [id],
        (error, resultados) => {

            if (error) {
                console.log(error);

                return res.status(500).json({
                    mensaje: 'Error al buscar el proveedor'
                });
            }

            if (resultados.length === 0) {
                return res.status(404).json({
                    mensaje: 'Proveedor no encontrado'
                });
            }

            res.json(resultados[0]);
        }
    );
}

function crearProveedor(req, res) {
    const {
        nombre,
        telefono,
        email,
        direccion
    } = req.body;

    const sql = `
        INSERT INTO proveedores
        (nombre, telefono, email, direccion)
        VALUES (?, ?, ?, ?)
    `;

    const valores = [
        nombre,
        telefono,
        email,
        direccion
    ];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: 'Error al crear el proveedor'
            });
        }

        res.status(201).json({
            mensaje: 'Proveedor creado correctamente',
            id: resultado.insertId
        });
    });
}

function actualizarProveedor(req, res) {
    const id = req.params.id;

    const {
        nombre,
        telefono,
        email,
        direccion
    } = req.body;

    const sql = `
        UPDATE proveedores
        SET
            nombre = ?,
            telefono = ?,
            email = ?,
            direccion = ?
        WHERE id = ?
    `;

    const valores = [
        nombre,
        telefono,
        email,
        direccion,
        id
    ];

    conexion.query(sql, valores, (error, resultado) => {
        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: 'Error al actualizar el proveedor'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Proveedor no encontrado'
            });
        }

        res.json({
            mensaje: 'Proveedor actualizado correctamente'
        });
    });
}

function eliminarProveedor(req, res) {
    const id = req.params.id;

    const sql = `
        DELETE FROM proveedores
        WHERE id = ?
    `;

    conexion.query(sql, [id], (error, resultado) => {
        if (error) {
            console.log(error);

            return res.status(500).json({
                mensaje: 'Error al eliminar el proveedor'
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensaje: 'Proveedor no encontrado'
            });
        }

        res.json({
            mensaje: 'Proveedor eliminado correctamente'
        });
    });
}

module.exports = {
    buscarProveedores,
    buscarProveedor,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor
};