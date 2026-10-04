const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mundoziroxius',
    database: 'gestion_stock'
});

conexion.connect((error) => {
    if (error) {
        console.log('Error al conectar con MySQL:', error);
        return;
    }

    console.log('Conectado a MySQL correctamente');
});

module.exports = conexion;