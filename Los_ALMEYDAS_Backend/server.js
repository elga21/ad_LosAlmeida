// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Importa el módulo 'path'
const app = express();
require('dotenv').config();

// Importa las rutas de la API
const productosRoutes = require('./routes/productos');
const usuariosRoutes = require('./routes/usuarios');
const pedidosRoutes = require('./routes/pedidos');
const categoriasRoutes = require('./routes/categorias'); // Nueva importación para categorías

// Configura los middlewares
app.use(cors()); // Habilita CORS para permitir solicitudes desde el frontend
app.use(bodyParser.json()); // Parsea los cuerpos de solicitud como JSON

// =====================================================================================
// RUTAS DE LA API (DEBEN IR ANTES DE SERVIR ARCHIVOS ESTÁTICOS)
// =====================================================================================
// Al colocar estas rutas aquí, Express intentará emparejar las solicitudes de API
// antes de buscar archivos estáticos.
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/categorias', categoriasRoutes); // Nueva ruta para categorías

// =====================================================================================
// RUTA PARA SERVIR index.html ESPECÍFICO
// =====================================================================================
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =====================================================================================
// SIRVE ARCHIVOS ESTÁTICOS (CSS, JS, HTML, imágenes, etc.)
// ¡Esta línea va DESPUÉS de las rutas de la API y las rutas HTML explícitas!
// Si una solicitud no coincide con una ruta de API o una ruta HTML específica anterior,
// Express buscará el archivo en la carpeta 'public'.
// Esto servirá auth.html, cart.html, dashboard.html, register.html, login.html
// y sus respectivos archivos JS y CSS.
// =====================================================================================
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));

