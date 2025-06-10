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

// Función para validar teléfono (función global)
function validarTelefono(telefono) {
    // Eliminar solo espacios, guiones y paréntesis para validación (mantener +)
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    
    // Verificar que solo contenga números, espacios, guiones, paréntesis y signo +
    if (!/^\+?[\d\s\-\(\)]+$/.test(telefono)) {
        return false;
    }
    
    // Extraer solo los dígitos (sin + ni otros caracteres)
    const soloDigitos = telefonoLimpio.replace(/\+/g, '');
    
    // Validaciones específicas
    if (telefonoLimpio.startsWith('+')) {
        // Formato internacional
        // Chile: +56 + 9 dígitos = 12 caracteres total
        // Otros países: entre 7 y 15 dígitos después del código de país
        if (soloDigitos.length < 7 || soloDigitos.length > 15) {
            return false;
        }
        
        // Validación específica para Chile (+56)
        if (telefonoLimpio.startsWith('+56')) {
            // Teléfonos móviles chilenos: +56 9 XXXXXXXX (11 dígitos total después de +56)
            // Teléfonos fijos chilenos: +56 X XXXXXXXX (9-10 dígitos después de +56)
            const digitosDespuesDeCodigo = soloDigitos.substring(2); // Quitar "56"
            if (digitosDespuesDeCodigo.length < 8 || digitosDespuesDeCodigo.length > 9) {
                return false;
            }
        }
    } else {
        // Formato nacional
        // Chile: 8-9 dígitos para móviles y fijos
        if (soloDigitos.length < 8 || soloDigitos.length > 9) {
            return false;
        }
    }
    
    return true; // Teléfono válido
}

// Función para obtener mensaje de error específico del teléfono
function obtenerErrorTelefono(telefono) {
    // Eliminar solo espacios, guiones y paréntesis para validación (mantener +)
    const telefonoLimpio = telefono.replace(/[\s\-\(\)]/g, '');
    
    // Verificar que solo contenga números, espacios, guiones, paréntesis y signo +
    if (!/^\+?[\d\s\-\(\)]+$/.test(telefono)) {
        return 'El teléfono solo puede contener números, espacios, guiones, paréntesis y signo +';
    }
    
    // Extraer solo los dígitos (sin + ni otros caracteres)
    const soloDigitos = telefonoLimpio.replace(/\+/g, '');
    
    // Validaciones específicas con mensajes detallados
    if (telefonoLimpio.startsWith('+')) {
        // Formato internacional
        if (soloDigitos.length < 7) {
            return 'El teléfono internacional debe tener al menos 7 dígitos después del código de país';
        }
        if (soloDigitos.length > 15) {
            return 'El teléfono internacional no puede tener más de 15 dígitos después del signo +';
        }
        
        // Validación específica para Chile (+56)
        if (telefonoLimpio.startsWith('+56')) {
            const digitosDespuesDeCodigo = soloDigitos.substring(2); // Quitar "56"
            if (digitosDespuesDeCodigo.length < 8) {
                return 'Los teléfonos chilenos deben tener al menos 8 dígitos después del código +56';
            }
            if (digitosDespuesDeCodigo.length > 9) {
                return 'Los teléfonos chilenos no pueden tener más de 9 dígitos después del código +56';
            }
        }
    } else {
        // Formato nacional
        if (soloDigitos.length < 8) {
            return 'El teléfono debe tener al menos 8 dígitos';
        }
        if (soloDigitos.length > 9) {
            return 'El teléfono no puede tener más de 9 dígitos para formato nacional';
        }
    }
    
    return null; // Sin errores
}

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