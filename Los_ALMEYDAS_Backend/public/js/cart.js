// public/js/cart.js

document.addEventListener('DOMContentLoaded', () => {
    const cartList = document.getElementById('cart-list');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const logoutButton = document.getElementById('logout-button');
    const messageBox = document.getElementById('message-box');
    const loadingSpinner = document.getElementById('loading-spinner');

    const API_BASE_URL = 'http://localhost:3000/api'; // URL base de tu API

    // Cargar el carrito desde localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Función para mostrar mensajes en la caja de mensajes global
    function showMessage(message, type = 'success') {
        if (messageBox) {
            messageBox.textContent = message;
            messageBox.className = `message-box show ${type}`;
            setTimeout(() => {
                messageBox.classList.remove('show');
            }, 3000);
        }
    }

    // Función para mostrar/ocultar el spinner de carga global
    function toggleLoading(show) {
        if (loadingSpinner) {
            if (show) {
                loadingSpinner.classList.add('show');
            } else {
                loadingSpinner.classList.remove('show');
            }
        }
    }

    // Función para actualizar el total del carrito y el estado del botón de checkout
    function updateCartSummary() {
        const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        cartTotalSpan.textContent = total.toFixed(2);

        if (cart.length === 0) {
            checkoutButton.disabled = true;
            emptyCartMessage.classList.remove('hidden');
        } else {
            checkoutButton.disabled = false;
            emptyCartMessage.classList.add('hidden');
        }
    }

    // Función para renderizar los ítems del carrito
    function renderCartItems() {
        cartList.innerHTML = ''; // Limpia la lista antes de renderizar
        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            updateCartSummary(); // Asegura que el total se actualice a 0
            return;
        } else {
            emptyCartMessage.classList.add('hidden');
        }

        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'flex items-center justify-between border-b border-gray-200 py-3';
            itemDiv.innerHTML = `
                <div class="flex-grow">
                    <h3 class="text-lg font-semibold text-gray-800">${item.nombre}</h3>
                    <p class="text-gray-600 text-sm">$${item.precio.toFixed(2)} c/u</p>
                </div>
                <div class="flex items-center space-x-3">
                    <button class="decrease-quantity-btn bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-lg transition duration-200" data-id="${item.id_producto}">-</button>
                    <span class="text-lg font-medium">${item.cantidad}</span>
                    <button class="increase-quantity-btn bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-1 px-3 rounded-lg transition duration-200" data-id="${item.id_producto}" data-stock="${item.stock}">+</button>
                    <button class="remove-item-btn bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded-lg transition duration-200" data-id="${item.id_producto}">Eliminar</button>
                </div>
            `;
            cartList.appendChild(itemDiv);
        });

        // Añadir event listeners a los botones de cantidad y eliminar
        document.querySelectorAll('.decrease-quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                updateQuantity(id, -1);
            });
        });

        document.querySelectorAll('.increase-quantity-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const stock = parseInt(e.target.dataset.stock); // Obtener el stock del producto
                updateQuantity(id, 1, stock);
            });
        });

        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                removeItem(id);
            });
        });

        updateCartSummary(); // Actualiza el resumen del carrito después de renderizar
    }

    // Función para actualizar la cantidad de un producto en el carrito
    function updateQuantity(id, change, stock = Infinity) {
        const itemIndex = cart.findIndex(item => item.id_producto === id);
        if (itemIndex > -1) {
            const currentItem = cart[itemIndex];
            const newQuantity = currentItem.cantidad + change;

            if (newQuantity <= 0) {
                // Si la cantidad es 0 o menos, elimina el producto
                removeItem(id);
            } else if (newQuantity > stock) {
                showMessage(`No hay suficiente stock para añadir más de "${currentItem.nombre}". Stock disponible: ${stock}.`, 'error');
            } else {
                currentItem.cantidad = newQuantity;
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCartItems(); // Vuelve a renderizar para actualizar la interfaz
            }
        }
    }

    // Función para eliminar un producto del carrito
    function removeItem(id) {
        cart = cart.filter(item => item.id_producto !== id);
        localStorage.setItem('cart', JSON.stringify(cart));
        showMessage('Producto eliminado del carrito.', 'success');
        renderCartItems(); // Vuelve a renderizar para actualizar la interfaz
    }

    // Manejar el cierre de sesión (si el botón existe en esta página)
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('cart'); // Limpia el carrito al cerrar sesión
            window.location.href = '/'; // Redirige a la página de inicio
        });
    }

    // Manejar la finalización de la compra
    if (checkoutButton) {
        checkoutButton.addEventListener('click', async () => {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user'));

            if (!token || !user) {
                showMessage('Debes iniciar sesión para finalizar la compra.', 'error');
                setTimeout(() => {
                    window.location.href = '/auth.html?tab=login'; // Redirige al login
                }, 2000);
                return;
            }

            if (cart.length === 0) {
                showMessage('Tu carrito está vacío. Añade productos antes de finalizar la compra.', 'error');
                return;
            }

            // Mapear el carrito a la estructura esperada por el backend (id_producto, cantidad)
            const orderItems = cart.map(item => ({
                id_producto: item.id_producto,
                cantidad: item.cantidad,
                nombre: item.nombre // Incluir nombre para mensajes de error del backend
            }));

            toggleLoading(true); // Muestra el spinner

            try {
                const response = await fetch(`${API_BASE_URL}/pedidos`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}` // Envía el token en los encabezados
                    },
                    body: JSON.stringify({ items: orderItems }) // Envía los ítems del carrito
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage(result.message || 'Pedido realizado con éxito!', 'success');
                    localStorage.removeItem('cart'); // Limpia el carrito después de la compra exitosa
                    cart = []; // Resetea el carrito en memoria
                    renderCartItems(); // Vuelve a renderizar para mostrar el carrito vacío
                } else {
                    showMessage(result.message || 'Error al procesar el pedido.', 'error');
                }
            } catch (error) {
                console.error('Error de red al finalizar la compra:', error);
                showMessage('Error de conexión. No se pudo finalizar la compra.', 'error');
            } finally {
                toggleLoading(false); // Oculta el spinner
            }
        });
    }

    // Renderizar los ítems del carrito al cargar la página
    renderCartItems();
});
