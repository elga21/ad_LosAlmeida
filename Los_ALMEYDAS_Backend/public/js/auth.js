// public/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const registerTab = document.getElementById('register-tab');
    const loginTab = document.getElementById('login-tab');
    const registerFormContainer = document.getElementById('register-form-container');
    const loginFormContainer = document.getElementById('login-form-container');
    const messageBox = document.getElementById('message-box');
    const loadingSpinner = document.getElementById('loading-spinner');

    const API_BASE_URL = 'http://localhost:3000/api'; // URL base de tu API

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

    // Función para cambiar entre las pestañas de registro e inicio de sesión
    function switchTab(tab) {
        if (registerFormContainer && loginFormContainer && registerTab && loginTab) {
            if (tab === 'register') {
                registerFormContainer.classList.remove('hidden');
                loginFormContainer.classList.add('hidden');
                registerTab.classList.add('border-blue-500', 'text-blue-600');
                loginTab.classList.remove('border-green-500', 'text-green-600');
            } else {
                loginFormContainer.classList.remove('hidden');
                registerFormContainer.classList.add('hidden');
                loginTab.classList.add('border-green-500', 'text-green-600');
                registerTab.classList.remove('border-blue-500', 'text-blue-600');
            }
        }
    }

    // Event listeners para cambiar de pestaña al hacer clic
    if (registerTab) {
        registerTab.addEventListener('click', () => switchTab('register'));
    }
    if (loginTab) {
        loginTab.addEventListener('click', () => switchTab('login'));
    }

    // Determinar la pestaña inicial basada en el parámetro de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab');
    if (initialTab === 'login') {
        switchTab('login');
    } else {
        switchTab('register');
    }

    // Maneja el envío del formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            toggleLoading(true); // Muestra el spinner

            const data = {
                nombre_usuario: document.getElementById('register-username').value,
                email: document.getElementById('register-email').value,
                contrasena: document.getElementById('register-password').value,
                rol: document.getElementById('register-rol').value || 'cliente' // Por defecto 'cliente'
            };

            try {
                const response = await fetch(`${API_BASE_URL}/usuarios/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage(result.message, 'success');
                    registerForm.reset(); // Limpia el formulario
                    switchTab('login'); // Cambia a la pestaña de login después del registro exitoso
                } else {
                    showMessage(result.message || 'Error en el registro.', 'error');
                }
            } catch (error) {
                console.error('Error de red al registrar:', error);
                showMessage('Error de conexión. Inténtalo de nuevo.', 'error');
            } finally {
                toggleLoading(false); // Oculta el spinner
            }
        });
    }

    // Maneja el envío del formulario de inicio de sesión
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            toggleLoading(true); // Muestra el spinner

            const data = {
                email: document.getElementById('login-email').value,
                contrasena: document.getElementById('login-password').value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage(result.message, 'success');
                    localStorage.setItem('token', result.token); // Almacena el token
                    localStorage.setItem('user', JSON.stringify(result.user)); // Almacena la info del usuario

                    // Redirige según el rol del usuario
                    const userRole = result.user.rol;
                    if (userRole === 'admin') {
                        window.location.href = '/dashboard.html'; // Redirige a la página de administración
                    } else {
                        window.location.href = '/'; // Redirige a la página principal de productos para clientes
                    }
                } else {
                    showMessage(result.message || 'Error en el inicio de sesión.', 'error');
                }
            } catch (error) {
                console.error('Error de red al iniciar sesión:', error);
                showMessage('Error de conexión. Inténtalo de nuevo.', 'error');
            } finally {
                toggleLoading(false); // Oculta el spinner
            }
        });
    }
});

