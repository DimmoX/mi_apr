// Gestión del formulario de registro
document.addEventListener('DOMContentLoaded', function() {
    setupRegistrationForm();
});

function setupRegistrationForm() {
    const form = document.getElementById('registerForm');
    
    if (!form) {
        console.error('Formulario de registro no encontrado');
        return;
    }
    
    // Configurar validaciones en tiempo real
    setupRealtimeValidations();
    
    // Manejar envío del formulario
    form.addEventListener('submit', handleFormSubmit);
}

function setupRealtimeValidations() {
    // Validación en tiempo real para cada campo
    const nameField = document.getElementById('name');
    const lastnameField = document.getElementById('lastname');
    const phoneField = document.getElementById('phone');
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    const confirmPasswordField = document.getElementById('confirmPassword');
    
    if (nameField) {
        nameField.addEventListener('input', function() {
            validateNameField(this);
        });
    }
    
    if (lastnameField) {
        lastnameField.addEventListener('input', function() {
            validateLastnameField(this);
        });
    }
    
    if (phoneField) {
        phoneField.addEventListener('input', function() {
            validatePhoneField(this);
        });
    }
    
    if (emailField) {
        emailField.addEventListener('input', function() {
            validateEmailField(this);
        });
    }
    
    if (passwordField) {
        passwordField.addEventListener('input', function() {
            validatePasswordField(this);
            // Revalidar confirmación cuando cambie la contraseña principal
            if (confirmPasswordField && confirmPasswordField.value) {
                validateConfirmPasswordField(confirmPasswordField);
            }
        });
    }
    
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('input', function() {
            validateConfirmPasswordField(this);
        });
    }
}

// Validaciones individuales de campos
function validateNameField(field) {
    const value = field.value.trim();
    
    clearFieldError(field);
    
    if (value.length === 0) {
        return; // No mostrar error si está vacío hasta el submit
    }
    
    if (value.length < 2) {
        showFieldError(field, 'El nombre debe tener al menos 2 caracteres');
        return false;
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        showFieldError(field, 'El nombre solo puede contener letras');
        return false;
    }
    
    showFieldSuccess(field);
    return true;
}

function validateLastnameField(field) {
    const value = field.value.trim();
    
    clearFieldError(field);
    
    if (value.length === 0) {
        return; // No mostrar error si está vacío hasta el submit
    }
    
    if (value.length < 2) {
        showFieldError(field, 'El apellido debe tener al menos 2 caracteres');
        return false;
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        showFieldError(field, 'El apellido solo puede contener letras');
        return false;
    }
    
    showFieldSuccess(field);
    return true;
}

function validatePhoneField(field) {
    const value = field.value.trim();
    
    clearFieldError(field);
    
    if (value.length === 0) {
        return; // No mostrar error si está vacío hasta el submit
    }
    
    try {
        if (!validarTelefono(value)) {
            const error = obtenerErrorTelefono(value);
            showFieldError(field, error || 'Número de teléfono inválido');
            return false;
        }
    } catch (e) {
        // Si hay error en la validación, usar validación básica
        if (value.length < 8) {
            showFieldError(field, 'El teléfono debe tener al menos 8 dígitos');
            return false;
        }
    }
    
    showFieldSuccess(field);
    return true;
}

function validateEmailField(field) {
    const value = field.value.trim();
    
    clearFieldError(field);
    
    if (value.length === 0) {
        return; // No mostrar error si está vacío hasta el submit
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
        showFieldError(field, 'Ingrese un correo electrónico válido');
        return false;
    }
    
    // Verificar si el email ya existe
    if (isEmailTaken(value)) {
        showFieldError(field, 'Este correo electrónico ya está registrado');
        return false;
    }
    
    showFieldSuccess(field);
    return true;
}

/**
 * @description Valida el campo de contraseña.
 * @param {*} field 
 * @returns 
 */
function validatePasswordField(field) {
    const value = field.value;
    
    clearFieldError(field);
    
    if (value.length === 0) {
        return;
    }
    
    if (value.length < 6) {
        showFieldError(field, 'La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    
    // Validación de seguridad usando la función creada en validaciones.js
    try {
        const securityErrors = validarSeguridadPassword(value);
        if (securityErrors.length > 0) {
            showFieldError(field, securityErrors[0]);
            return false;
        }
    } catch (e) {
        // Si hay error, solo validar longitud
        console.warn('Error en validación de seguridad:', e);
    }
    
    showFieldSuccess(field);
    return true;
}

function validateConfirmPasswordField(field) {
    const value = field.value;
    const passwordValue = document.getElementById('password').value;
    
    clearFieldError(field);
    
    if (value.length === 0) {
        return; // No mostrar error si está vacío hasta el submit
    }
    
    if (value !== passwordValue) {
        showFieldError(field, 'Las contraseñas no coinciden');
        return false;
    }
    
    showFieldSuccess(field);
    return true;
}

// Verificar si un email ya está registrado
function isEmailTaken(email) {
    try {
        const usersData = localStorage.getItem('users');
        if (!usersData) {
            return false;
        }
        
        const parsedData = JSON.parse(usersData);
        
        // Los datos están directamente como array en localStorage
        if (Array.isArray(parsedData)) {
            return parsedData.some(user => user.email && user.email.toLowerCase() === email.toLowerCase());
        }
        
        // Compatibilidad con estructura antigua {users: []}
        if (parsedData.users && Array.isArray(parsedData.users)) {
            return parsedData.users.some(user => user.email && user.email.toLowerCase() === email.toLowerCase());
        }
        
        return false; // Estructura no reconocida
    } catch (error) {
        console.error('Error al verificar email:', error);
        return false; // En caso de error, permitir el registro
    }
}

// Manejar envío del formulario
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Obtener datos del formulario
    const formData = {
        name: document.getElementById('name').value.trim(),
        lastname: document.getElementById('lastname').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
    
    // Validar todos los campos
    if (!validateAllFields(formData)) {
        showAlert('Por favor, corrija los errores en el formulario', 'error');
        return;
    }
    
    // Registrar usuario
    registerUser(formData);
}

// Validar todos los campos del formulario
function validateAllFields(data) {
    let isValid = true;
    
    // Validar nombre
    if (!data.name || data.name.length < 2) {
        showFieldError(document.getElementById('name'), 'El nombre es obligatorio y debe tener al menos 2 caracteres');
        isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.name)) {
        showFieldError(document.getElementById('name'), 'El nombre solo puede contener letras');
        isValid = false;
    }
    
    // Validar apellido
    if (!data.lastname || data.lastname.length < 2) {
        showFieldError(document.getElementById('lastname'), 'El apellido es obligatorio y debe tener al menos 2 caracteres');
        isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.lastname)) {
        showFieldError(document.getElementById('lastname'), 'El apellido solo puede contener letras');
        isValid = false;
    }
    
    // Validar teléfono
    if (!data.phone) {
        showFieldError(document.getElementById('phone'), 'El teléfono es obligatorio');
        isValid = false;
    } else {
        try {
            if (!validarTelefono(data.phone)) {
                const errorMessage = obtenerErrorTelefono(data.phone);
                showFieldError(document.getElementById('phone'), errorMessage || 'Ingrese un número de teléfono válido');
                isValid = false;
            }
        } catch (e) {
            // Validación básica si hay error
            if (data.phone.length < 8) {
                showFieldError(document.getElementById('phone'), 'El teléfono debe tener al menos 8 dígitos');
                isValid = false;
            }
        }
    }
    
    // Validar email
    if (!data.email) {
        showFieldError(document.getElementById('email'), 'El correo electrónico es obligatorio');
        isValid = false;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showFieldError(document.getElementById('email'), 'Ingrese un correo electrónico válido');
            isValid = false;
        } else if (isEmailTaken(data.email)) {
            showFieldError(document.getElementById('email'), 'Este correo electrónico ya está registrado');
            isValid = false;
        }
    }
    
    // Validar contraseña
    if (!data.password) {
        showFieldError(document.getElementById('password'), 'La contraseña es obligatoria');
        isValid = false;
    } else if (data.password.length < 6) {
        showFieldError(document.getElementById('password'), 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    } else {
        try {
            const securityErrors = validarSeguridadPassword(data.password);
            if (securityErrors.length > 0) {
                showFieldError(document.getElementById('password'), securityErrors[0]);
                isValid = false;
            }
        } catch (e) {
            // Si hay error en validación de seguridad, solo validar longitud
            console.warn('Error en validación de seguridad de contraseña:', e);
        }
    }
    
    // Validar confirmación de contraseña
    if (!data.confirmPassword) {
        showFieldError(document.getElementById('confirmPassword'), 'Debe confirmar la contraseña');
        isValid = false;
    } else if (data.password !== data.confirmPassword) {
        showFieldError(document.getElementById('confirmPassword'), 'Las contraseñas no coinciden');
        isValid = false;
    }
    
    return isValid;
}

// Registrar nuevo usuario
function registerUser(userData) {
    try {
        // Crear objeto de usuario con rol de cliente
        const newUser = {
            name: userData.name,
            lastname: userData.lastname,
            phone: userData.phone,
            email: userData.email,
            password: userData.password,
            role: 'cliente', // Siempre será cliente desde el registro público
            id: generateUserId() // Generar ID único
        };
        
        // Obtener lista actual de usuarios
        const existingData = localStorage.getItem('users');
        let users = [];
        
        if (existingData) {
            const parsedData = JSON.parse(existingData);
            
            // Los datos están directamente como array en localStorage
            if (Array.isArray(parsedData)) {
                users = parsedData;
            } 
            // Compatibilidad con estructura antigua {users: []}
            else if (parsedData.users && Array.isArray(parsedData.users)) {
                users = parsedData.users;
            }
        }
        
        // Agregar nuevo usuario a la lista
        users.push(newUser);
        
        // Guardar lista actualizada en localStorage como array directo
        localStorage.setItem('users', JSON.stringify(users));
        
        console.log('Usuario registrado exitosamente:', newUser);
        
        // Mostrar mensaje de éxito
        showAlert('¡Cuenta creada exitosamente! Serás redirigido al login.', 'success');
        
        // Limpiar formulario
        clearForm();
        
        // Redirigir al login después de 2 segundos SOLO SI FUE EXITOSO
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        showAlert('Error al crear la cuenta. Inténtelo de nuevo.', 'error');
        // NO REDIRIGIR en caso de error - mantener en register.html
    }
}

// Generar ID único para el usuario
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Limpiar formulario
function clearForm() {
    const form = document.getElementById('registerForm');
    if (form) {
        form.reset();
        
        // Limpiar validaciones visuales
        const fields = form.querySelectorAll('.form-control');
        fields.forEach(field => {
            clearFieldError(field);
        });
    }
}

// Utilidades para validación visual
function showFieldError(field, message) {
    clearFieldError(field);
    field.classList.add('is-invalid');
    
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    field.parentNode.appendChild(feedback);
}

function showFieldSuccess(field) {
    clearFieldError(field);
    field.classList.add('is-valid');
}

function clearFieldError(field) {
    field.classList.remove('is-invalid', 'is-valid');
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.remove();
    }
}

// Función para mostrar alertas
function showAlert(message, type = 'info') {
    // Remover alertas previas
    const existingAlert = document.querySelector('.alert.position-fixed');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // Crear nueva alerta
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remover después de 5 segundos (excepto para success que dura menos)
    const autoRemoveTime = type === 'success' ? 3000 : 5000;
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, autoRemoveTime);
}

// Función para mostrar/ocultar contraseñas (disponible globalmente)
window.togglePasswordVisibility = function(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = document.getElementById(fieldId + '-icon');
    
    if (field && icon) {
        if (field.type === 'password') {
            field.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            field.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
}