// routes/pedidos.js
const express = require('express'); // Importa Express
const router = express.Router(); // Crea un router de Express
const db = require('../config/db'); // Importa la conexión a la base de datos
const { verifyToken } = require('./usuarios'); // Importa el middleware de verificación de token

// Ruta para crear un nuevo pedido
// Requiere autenticación (verifyToken)
router.post('/', verifyToken, async (req, res) => {
    const { items } = req.body; // Obtiene los ítems del pedido del cuerpo de la solicitud
    const userId = req.userId; // Obtiene el ID del usuario del token decodificado

    // Valida que haya ítems en el pedido
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'El pedido debe contener al menos un producto.' });
    }

    let totalPedido = 0; // Inicializa el total del pedido
    let transaction; // Declarar la variable de transacción fuera del try para que esté disponible en finally

    try {
        transaction = await db.getConnection(); // Obtiene una conexión para la transacción
        await transaction.beginTransaction(); // Inicia la transacción

        // 1. Verificar stock y calcular total
        for (const item of items) {
            const [productRows] = await transaction.query('SELECT precio, stock FROM PRODUCTOS WHERE id_producto = ?', [item.id_producto]);

            if (productRows.length === 0) {
                throw new Error(`Producto con ID ${item.id_producto} no encontrado.`);
            }

            const product = productRows[0];

            if (product.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para el producto: ${item.nombre || item.id_producto}. Stock disponible: ${product.stock}, solicitado: ${item.cantidad}.`);
            }

            totalPedido += product.precio * item.cantidad;
        }

        // 2. Crear el pedido principal
        const [orderResult] = await transaction.query('INSERT INTO PEDIDOS (id_usuario, total, estado) VALUES (?, ?, ?)', [userId, totalPedido, 'Pendiente']); // Estado inicial 'Pendiente'
        const id_pedido = orderResult.insertId; // Obtiene el ID del pedido recién creado

        // 3. Insertar detalles del pedido y actualizar stock
        for (const item of items) {
            // No es necesario volver a consultar el precio si ya lo tenemos del paso 1
            // Sin embargo, para mayor robustez, se puede volver a obtener el precio unitario del producto
            // para asegurar que el precio_unitario en el detalle del pedido sea el actual de la DB.
            const [productRows] = await transaction.query('SELECT precio FROM PRODUCTOS WHERE id_producto = ?', [item.id_producto]);
            const productPrice = productRows[0].precio;

            await transaction.query(
                'INSERT INTO DETALLES_PEDIDO (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
                [id_pedido, item.id_producto, item.cantidad, productPrice]
            );

            await transaction.query(
                'UPDATE PRODUCTOS SET stock = stock - ? WHERE id_producto = ?',
                [item.cantidad, item.id_producto]
            );
        }

        await transaction.commit(); // Confirma la transacción
        res.status(201).json({ message: 'Pedido creado exitosamente.', id_pedido });

    } catch (error) {
        if (transaction) {
            await transaction.rollback(); // Si hay un error, revierte la transacción
        }
        console.error('Error al crear el pedido:', error.message);
        res.status(500).json({ message: 'Error al procesar el pedido.', error: error.message });
    } finally {
        if (transaction) {
            transaction.release(); // Libera la conexión
        }
    }
});

// Ruta para obtener los pedidos de un usuario específico
// Requiere autenticación (verifyToken)
router.get('/user/:userId', verifyToken, async (req, res) => { // Agregado async
    const { userId } = req.params; // Obtiene el ID del usuario de los parámetros de la URL

    // Verifica que el usuario que solicita los pedidos sea el mismo que está autenticado
    if (req.userId != userId) {
        return res.status(403).json({ message: 'No tienes permiso para ver los pedidos de este usuario.' });
    }

    // Consulta para obtener los pedidos del usuario y sus detalles
    const query = `
        SELECT
            p.id_pedido,
            p.fecha_pedido,
            p.total,
            dp.cantidad,
            dp.precio_unitario,
            prod.nombre AS nombre_producto,
            prod.descripcion AS descripcion_producto
        FROM
            PEDIDOS p
        JOIN
            DETALLES_PEDIDO dp ON p.id_pedido = dp.id_pedido
        JOIN
            PRODUCTOS prod ON dp.id_producto = prod.id_producto
        WHERE
            p.id_usuario = ?
        ORDER BY
            p.fecha_pedido DESC;
    `;

    try {
        const [results] = await db.query(query, [userId]); // Usado await y desestructuración

        // Agrupar los detalles del pedido por id_pedido
        const pedidosAgrupados = {};
        results.forEach(row => {
            if (!pedidosAgrupados[row.id_pedido]) {
                pedidosAgrupados[row.id_pedido] = {
                    id_pedido: row.id_pedido,
                    fecha_pedido: row.fecha_pedido,
                    total: row.total,
                    items: []
                };
            }
            pedidosAgrupados[row.id_pedido].items.push({
                nombre_producto: row.nombre_producto,
                descripcion_producto: row.descripcion_producto,
                cantidad: row.cantidad,
                precio_unitario: row.precio_unitario
            });
        });

        res.status(200).json(Object.values(pedidosAgrupados));
    } catch (err) {
        console.error('Error al obtener pedidos del usuario:', err);
        res.status(500).json({ message: 'Error al obtener los pedidos.', error: err.message });
    }
});

module.exports = router;

