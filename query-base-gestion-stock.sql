CREATE DATABASE gestion_stock;
USE gestion_stock;
SELECT DATABASE();

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    categoria VARCHAR(100),
    costo_actual DECIMAL(10,2) NOT NULL,
    precio_venta DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    stock_minimo INT NOT NULL DEFAULT 0,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proveedores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    telefono VARCHAR(30),
    email VARCHAR(100),
    direccion VARCHAR(255),
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE entradas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proveedor_id INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(255),

    FOREIGN KEY (proveedor_id)
        REFERENCES proveedores(id)
);

CREATE TABLE detalle_entrada (
    id INT AUTO_INCREMENT PRIMARY KEY,
    entrada_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    costo_unitario DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (entrada_id)
        REFERENCES entradas(id),

    FOREIGN KEY (producto_id)
        REFERENCES productos(id)
);

CREATE TABLE lotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    detalle_entrada_id INT NOT NULL,
    numero_lote VARCHAR(100),
    cantidad_inicial INT NOT NULL,
    cantidad_actual INT NOT NULL,
    fecha_vencimiento DATE NOT NULL,

    FOREIGN KEY (producto_id)
        REFERENCES productos(id),

    FOREIGN KEY (detalle_entrada_id)
        REFERENCES detalle_entrada(id),

    UNIQUE (detalle_entrada_id)
);


INSERT INTO proveedores (nombre, telefono, email, direccion)
VALUES
('Distribuidora Mendoza', '2615551111', 'ventas@distribuidora.com', 'Mendoza 123'),
('Mayorista Cuyo', '2615552222', 'contacto@mayoristacuyo.com', 'San Martin 456');

INSERT INTO productos
(nombre, descripcion, categoria, costo_actual, precio_venta, stock, stock_minimo)
VALUES
('Coca Cola 2.25L', 'Gaseosa Coca Cola', 'Bebidas', 1800, 2500, 0, 10),
('Pepsi 2.25L', 'Gaseosa Pepsi', 'Bebidas', 1700, 2400, 0, 10),
('Alfajor Rasta', 'Alfajor de chocolate', 'Alfajores', 800, 1200, 0, 20),
('Ibuprofeno 400mg', 'Caja de ibuprofeno 400mg', 'Medicamentos', 2500, 3500, 0, 5);

INSERT INTO entradas (proveedor_id, fecha, observaciones)
VALUES
(1, '2026-09-28 10:30:00', 'Entrega semanal');

INSERT INTO detalle_entrada
(entrada_id, producto_id, cantidad, costo_unitario)
VALUES
(1, 1, 20, 1800),
(1, 2, 15, 1700),
(1, 3, 10, 800);

INSERT INTO lotes
(producto_id, detalle_entrada_id, numero_lote, cantidad_inicial, cantidad_actual, fecha_vencimiento)
VALUES
(1, 1, 'CC-001', 20, 20, '2026-12-15'),
(2, 2, 'PE-001', 15, 15, '2027-01-20'),
(3, 3, 'RA-001', 10, 10, '2026-11-30');

UPDATE productos
SET stock = stock + 20
WHERE id = 1;

UPDATE productos
SET stock = stock + 15
WHERE id = 2;

UPDATE productos
SET stock = stock + 10
WHERE id = 3;


SELECT * FROM entradas;
SELECT * FROM detalle_entrada;
SELECT * FROM lotes;
SELECT
    id,
    nombre,
    stock,
    costo_actual
FROM productos;
