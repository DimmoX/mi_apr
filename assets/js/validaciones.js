
// Función para validar seguridad de contraseña (función global)
function validarSeguridadPassword(password) {
    const errores = [];
    
    // Validación 1: Longitud mínima de 8 caracteres
    if (password.length < 8) {
        errores.push('Debe tener al menos 8 caracteres');
    }
    
    // Validación 2: Al menos una letra mayúscula
    if (!/[A-Z]/.test(password)) {
        errores.push('Debe contener al menos una letra mayúscula');
    }
    
    // Validación 3: Al menos un número
    if (!/\d/.test(password)) {
        errores.push('Debe contener al menos un número');
    }
    
    // Validación 4: Al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errores.push('Debe contener al menos un carácter especial (!@#$%^&*...)');
    }
    
    return errores;
}

// Función para mostrar indicador de fortaleza de contraseña (función global)
function mostrarFortalezaPassword(password, passwordField) {
    const errores = validarSeguridadPassword(password);
    const fortaleza = Math.max(0, 4 - errores.length);
    
    // Remover indicador previo
    const indicadorPrevio = passwordField.parentNode.querySelector('.password-strength');
    if (indicadorPrevio) {
        indicadorPrevio.remove();
    }
    
    if (password.length > 0) {
        const indicador = document.createElement('div');
        indicador.className = 'password-strength mt-2';
        
        let color, texto, barWidth;
        
        if (fortaleza === 4) {
            color = 'var(--success-color)';
            texto = 'Contraseña fuerte';
            barWidth = '100%';
        } else if (fortaleza === 3) {
            color = '#ffc107';
            texto = 'Contraseña media';
            barWidth = '75%';
        } else if (fortaleza === 2) {
            color = '#fd7e14';
            texto = 'Contraseña débil';
            barWidth = '50%';
        } else if (fortaleza === 1) {
            color = '#dc3545';
            texto = 'Contraseña muy débil';
            barWidth = '25%';
        } else {
            color = 'var(--danger-color)';
            texto = 'Contraseña muy débil';
            barWidth = '10%';
        }
        
        indicador.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-1">
                <small class="text-muted">Fortaleza:</small>
                <small style="color: ${color}; font-weight: 500;">${texto}</small>
            </div>
            <div class="progress" style="height: 4px;">
                <div class="progress-bar" style="width: ${barWidth}; background-color: ${color}; transition: all 0.3s ease;"></div>
            </div>
        `;
        
        passwordField.parentNode.appendChild(indicador);
    }
}

// Validaciones del formulario de login
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        // Función para mostrar mensaje de error
        function mostrarError(field, message) {
            // Remover errores previos
            limpiarError(field);
            
            // Añadir clase de error al campo
            field.classList.add('is-invalid');
            
            // Crear elemento de feedback
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = message;
            
            // Insertar después del campo
            field.parentNode.appendChild(feedback);
        }
        
        // Función para limpiar errores de un campo
        function limpiarError(field) {
            field.classList.remove('is-invalid');
            const feedback = field.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.remove();
            }
        }
        
        // Función para mostrar mensaje de éxito
        function loginExitoso() {
            // Remover alertas previas
            const existingAlert = document.querySelector('.alert');
            if (existingAlert) {
                existingAlert.remove();
            }
            
            // Crear alerta de éxito
            const alert = document.createElement('div');
            alert.className = 'alert alert-custom-success alert-dismissible fade show mt-3';
            alert.innerHTML = `
                <strong>¡Éxito!</strong> Credenciales válidas. Redirigiendo...
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            // Insertar antes del formulario
            loginForm.parentNode.insertBefore(alert, loginForm);
        }
        
        // Función para mostrar mensaje de error general
        function loginError(message) {
            // Remover alertas previas
            const existingAlert = document.querySelector('.alert');
            if (existingAlert) {
                existingAlert.remove();
            }
            
            // Crear alerta de error
            const alert = document.createElement('div');
            alert.className = 'alert alert-danger alert-dismissible fade show mt-3';
            alert.innerHTML = `
                <strong>Error:</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            
            // Insertar antes del formulario
            loginForm.parentNode.insertBefore(alert, loginForm);
        }
        
        // Función para mostrar errores múltiples de contraseña
        function mostrarErroresPassword(field, errores) {
            // Limpiar errores previos
            limpiarError(field);
            
            if (errores.length > 0) {
                // Añadir clase de error al campo
                field.classList.add('is-invalid');
                
                // Crear elemento de feedback con lista de errores
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                
                if (errores.length === 1) {
                    feedback.textContent = errores[0];
                } else {
                    feedback.innerHTML = '<strong>La contraseña debe cumplir:</strong><ul class="mb-0 mt-1">' + 
                        errores.map(error => `<li>${error}</li>`).join('') + '</ul>';
                }
                
                // Insertar después del campo
                field.parentNode.appendChild(feedback);
            }
        }

        /**
         * Validación de campos email y contraseña
         * Se valida el formato del email y la seguridad de la contraseña.
         */
        const emailField = document.getElementById('email');
        const passwordField = document.getElementById('password');
        
        emailField.addEventListener('input', function() {
            // Se obtiene el valor del campo email evitando espacios.
            const email = this.value.trim();
            // Validar formato de email en tiempo real
            const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (email.length > 0) {
                if (validEmail) {
                    // No mostrar error en tiempo real, solo limpiar
                    limpiarError(this);
                } else {
                    limpiarError(this);
                }
            } else {
                limpiarError(this);
            }
        });
        
        passwordField.addEventListener('input', function() {
            console.log('Validando contraseña en tiempo real: ', this);
            // Remover errores previos
            // Se obtiene el valor del campo password.
            const password = this.value;
            // Solo mostrar indicador de fortaleza en register.html, no en login.html
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const isRegisterPage = currentPage === 'register.html';
            
            if (password.length > 0) {
                // Mostrar indicador de fortaleza solo en página de registro
                if (isRegisterPage) {
                    mostrarFortalezaPassword(password, this);
                }
                
                // Solo limpiar errores si la contraseña es válida
                const errores = validarSeguridadPassword(password);
                if (errores.length === 0) {
                    limpiarError(this);
                }
            } else {
                limpiarError(this);
                // Remover indicador de fortaleza solo si existe
                if (isRegisterPage) {
                    const indicador = this.parentNode.querySelector('.password-strength');
                    if (indicador) {
                        indicador.remove();
                    }
                }
            }
        });

        // Manejo del envío del formulario
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = emailField.value.trim();
            const password = passwordField.value;
            let isValid = true;
            
            // Limpiar errores previos
            limpiarError(emailField);
            limpiarError(passwordField);
            
            // Validar email
            if (!email) {
                mostrarError(emailField, 'El email es requerido');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                mostrarError(emailField, 'Ingresa un email válido');
                isValid = false;
            }
            
            // Validar contraseña (solo requerida para login, no todas las reglas de seguridad)
            if (!password) {
                mostrarError(passwordField, 'La contraseña es requerida');
                isValid = false;
            } else if (password.length < 8) {
                mostrarError(passwordField, 'La contraseña debe tener al menos 8 caracteres');
                isValid = false;
            }

            // Si todo es válido, proceder con el login
            if (isValid) {

                const user = await validarCredenciales(email, password);

                if (user) {
                    loginExitoso();

                    uploadDataUser(user);
                    
                    // Simular redirección después de 2 segundos
                    setTimeout(() => {
                        // se realiza redirección al perfil del usuario según su rol
                        window.location.href = `perfiles/${user.role}.html`;
                    }, 2000);
                } else {
                    loginError('Email o contraseña incorrectos');
                }
            }
        });
        
        /**
         * Función para validar las credenciales del usuario
         * @param {*} email 
         * @param {*} password 
         * @returns {json || boolean}
         */
        async function validarCredenciales(email, password) {

            let usuarios = await fetch('../config/users.json');
            let usuariosJson = await usuarios.json();
            let listaUsuarios = usuariosJson.users;

            // Validar si el usuario existe por email
            const usuarioValido = listaUsuarios.some(user => user.email === email && user.password === password);

            if (usuarioValido) {
                const usuario = listaUsuarios.find(user => user.email === email);
                return {
                    name: usuario.name,
                    lastname: usuario.lastname,
                    phone: usuario.phone,
                    email: usuario.email,
                    password: usuario.password,
                    role: usuario.role
                };
            } else {
                return false
            }
        }

        function uploadDataUser(user) {
           localStorage.setItem('login', 'true');
           localStorage.setItem('name', user.name);
           localStorage.setItem('lastname', user.lastname);
           localStorage.setItem('phone', user.phone);
           localStorage.setItem('email', user.email);
           localStorage.setItem('role', user.role);
        }
    }
});

// Validaciones del formulario de registro
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        const nameField = document.getElementById('name');
        const lastnameField = document.getElementById('lastname');
        const emailField = document.getElementById('email');
        const passwordField = document.getElementById('password');
        
        // Función para mostrar mensaje de error
        function mostrarError(field, message) {
            // Remover errores previos
            limpiarError(field);
            
            // Añadir clase de error al campo
            field.classList.add('is-invalid');
            
            // Crear elemento de feedback
            const feedback = document.createElement('div');
            feedback.className = 'invalid-feedback';
            feedback.textContent = message;
            
            // Insertar después del campo
            field.parentNode.appendChild(feedback);
        }
        
        // Función para limpiar errores de un campo
        function limpiarError(field) {
            field.classList.remove('is-invalid');
            field.classList.remove('is-valid');
            const feedback = field.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.remove();
            }
        }
        
        // Función para marcar campo como válido
        function marcarValido(field) {
            limpiarError(field);
            field.classList.add('is-valid');
        }
        
        // Validación en tiempo real para nombre
        nameField.addEventListener('input', function() {
            const name = this.value.trim();
            if (name.length === 0) {
                limpiarError(this);
            } else if (name.length < 2) {
                mostrarError(this, 'El nombre debe tener al menos 2 caracteres');
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
                mostrarError(this, 'El nombre solo puede contener letras');
            } else {
                marcarValido(this);
            }
        });
        
        // Validación en tiempo real para apellido
        lastnameField.addEventListener('input', function() {
            const lastname = this.value.trim();
            if (lastname.length === 0) {
                limpiarError(this);
            } else if (lastname.length < 2) {
                mostrarError(this, 'El apellido debe tener al menos 2 caracteres');
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastname)) {
                mostrarError(this, 'El apellido solo puede contener letras');
            } else {
                marcarValido(this);
            }
        });
        
        // Validación en tiempo real para email
        emailField.addEventListener('input', function() {
            const email = this.value.trim();
            if (email.length === 0) {
                limpiarError(this);
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                mostrarError(this, 'Ingresa un email válido');
            } else {
                marcarValido(this);
            }
        });
        
        // Validación en tiempo real para contraseña (con indicador de fortaleza)
        passwordField.addEventListener('input', function() {
            const password = this.value;
            
            if (password.length > 0) {
                // Mostrar indicador de fortaleza
                mostrarFortalezaPassword(password, this);
                
                // Validar contraseña
                const errores = validarSeguridadPassword(password);
                if (errores.length > 0) {
                    mostrarErroresPassword(this, errores);
                } else {
                    marcarValido(this);
                }
            } else {
                limpiarError(this);
                // Remover indicador de fortaleza
                const indicador = this.parentNode.querySelector('.password-strength');
                if (indicador) {
                    indicador.remove();
                }
            }
        });
        
        // Función para mostrar errores múltiples de contraseña
        function mostrarErroresPassword(field, errores) {
            // Limpiar errores previos
            limpiarError(field);
            
            if (errores.length > 0) {
                // Añadir clase de error al campo
                field.classList.add('is-invalid');
                
                // Crear elemento de feedback con lista de errores
                const feedback = document.createElement('div');
                feedback.className = 'invalid-feedback';
                
                if (errores.length === 1) {
                    feedback.textContent = errores[0];
                } else {
                    feedback.innerHTML = '<strong>La contraseña debe cumplir:</strong><ul class="mb-0 mt-1">' + 
                        errores.map(error => `<li>${error}</li>`).join('') + '</ul>';
                }
                
                // Insertar después del campo
                field.parentNode.appendChild(feedback);
            }
        }
        
        // Manejo del envío del formulario de registro
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = nameField.value.trim();
            const lastname = lastnameField.value.trim();
            const email = emailField.value.trim();
            const password = passwordField.value;
            let isValid = true;
            
            // Limpiar errores previos
            limpiarError(nameField);
            limpiarError(lastnameField);
            limpiarError(emailField);
            limpiarError(passwordField);
            
            // Validar nombre
            if (!name) {
                mostrarError(nameField, 'El nombre es requerido');
                isValid = false;
            } else if (name.length < 2) {
                mostrarError(nameField, 'El nombre debe tener al menos 2 caracteres');
                isValid = false;
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
                mostrarError(nameField, 'El nombre solo puede contener letras');
                isValid = false;
            }
            
            // Validar apellido
            if (!lastname) {
                mostrarError(lastnameField, 'El apellido es requerido');
                isValid = false;
            } else if (lastname.length < 2) {
                mostrarError(lastnameField, 'El apellido debe tener al menos 2 caracteres');
                isValid = false;
            } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastname)) {
                mostrarError(lastnameField, 'El apellido solo puede contener letras');
                isValid = false;
            }
            
            // Validar email
            if (!email) {
                mostrarError(emailField, 'El email es requerido');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                mostrarError(emailField, 'Ingresa un email válido');
                isValid = false;
            }
            
            // Validar contraseña con reglas de seguridad
            if (!password) {
                mostrarError(passwordField, 'La contraseña es requerida');
                isValid = false;
            } else {
                const erroresPassword = validarSeguridadPassword(password);
                if (erroresPassword.length > 0) {
                    mostrarErroresPassword(passwordField, erroresPassword);
                    isValid = false;
                }
            }
            
            // Si todo es válido, proceder con el registro
            if (isValid) {
                // Remover alertas previas
                const existingAlert = document.querySelector('.alert');
                if (existingAlert) {
                    existingAlert.remove();
                }
                
                // Crear alerta de éxito
                const alert = document.createElement('div');
                alert.className = 'alert alert-custom-success alert-dismissible fade show mt-3';
                alert.innerHTML = `
                    <strong>¡Éxito!</strong> Cuenta creada exitosamente. Redirigiendo al login...
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                `;
                
                // Insertar antes del formulario
                registerForm.parentNode.insertBefore(alert, registerForm);
                
                // Simular redirección después de 2 segundos
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        });
    }
});