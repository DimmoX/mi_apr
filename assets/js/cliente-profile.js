// Gestión del perfil de cliente
let isEditMode = false;
let originalUserData = {};

// Verificar autenticación y cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    checkClientAuthentication();
    loadClientData();
    setupFormValidations();
});

// Verificar que el usuario sea cliente y esté autenticado
function checkClientAuthentication() {
    const isLoggedIn = localStorage.getItem('login') === 'true';
    const userRole = localStorage.getItem('role');
    
    if (!isLoggedIn) {
        window.location.href = '../login.html';
        return;
    }
    
    if (userRole !== 'cliente') {
        window.location.href = '../noauth.html';
        return;
    }
}

// Cargar datos del cliente desde localStorage
function loadClientData() {
    try {
        // Cargar datos individuales del usuario actual
        const userData = {
            name: localStorage.getItem('name') || '',
            lastname: localStorage.getItem('lastname') || '',
            email: localStorage.getItem('email') || '',
            phone: localStorage.getItem('phone') || '',
            role: localStorage.getItem('role') || 'cliente'
        };
        
        // Guardar datos originales para cancelar edición
        originalUserData = { ...userData };
        
        // Llenar formulario con datos actuales
        document.getElementById('client-name').value = userData.name;
        document.getElementById('client-lastname').value = userData.lastname;
        document.getElementById('client-email').value = userData.email;
        document.getElementById('client-phone').value = userData.phone;
        document.getElementById('role-display').textContent = 'Cliente';
        
        console.log('Datos del cliente cargados:', userData);
        
    } catch (error) {
        console.error('Error al cargar datos del cliente:', error);
        showAlert('Error al cargar los datos del perfil', 'danger');
    }
}

// Alternar modo de edición
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const editButton = document.getElementById('btn-editar-perfil');
    const editIcon = document.getElementById('edit-icon');
    const editText = document.getElementById('edit-text');
    const actionButtons = document.getElementById('action-buttons');
    
    // Campos editables (email siempre readonly)
    const editableFields = ['client-name', 'client-lastname', 'client-phone', 'client-password', 'client-confirm-password'];
    
    if (isEditMode) {
        // Modo edición: habilitar campos
        editableFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            field.removeAttribute('readonly');
            field.classList.add('bg-white');
        });
        
        // Limpiar campos de contraseña
        document.getElementById('client-password').value = '';
        document.getElementById('client-confirm-password').value = '';
        
        // Cambiar botón
        editIcon.textContent = '❌';
        editText.textContent = 'Cancelar Edición';
        editButton.className = 'btn btn-outline-light btn-sm';
        
        // Mostrar botones de acción
        actionButtons.style.display = 'block';
        
        showAlert('Modo edición activado. Modifica los campos que desees.', 'info');
        
    } else {
        cancelEdit();
    }
}

// Cancelar edición
function cancelEdit() {
    isEditMode = false;
    
    const editButton = document.getElementById('btn-editar-perfil');
    const editIcon = document.getElementById('edit-icon');
    const editText = document.getElementById('edit-text');
    const actionButtons = document.getElementById('action-buttons');
    
    // Restaurar datos originales
    document.getElementById('client-name').value = originalUserData.name;
    document.getElementById('client-lastname').value = originalUserData.lastname;
    document.getElementById('client-email').value = originalUserData.email;
    document.getElementById('client-phone').value = originalUserData.phone;
    document.getElementById('client-password').value = '';
    document.getElementById('client-confirm-password').value = '';
    
    // Se dejan los campos del perfel bloqueados (readonly).
    const editableFields = ['client-name', 'client-lastname', 'client-phone', 'client-password', 'client-confirm-password'];
    editableFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.setAttribute('readonly', true);
        field.classList.remove('bg-white');
        clearFieldError(field);
    });
    
    // Botón para editar perfil.
    editIcon.textContent = '✏️';
    editText.textContent = 'Editar Perfil';
    editButton.className = 'btn btn-light btn-sm';
    
    // Se oculta botones de acción
    actionButtons.style.display = 'none';
    
    showAlert('Edición cancelada. Los cambios no se guardaron.', 'warning');
}

// Configurar validaciones del formulario
function setupFormValidations() {
    const form = document.getElementById('profile-form');
    
    // Validaciones en tiempo real
    setupRealtimeValidation('client-name', validateName);
    setupRealtimeValidation('client-lastname', validateLastname);
    setupRealtimeValidation('client-phone', validatePhone);
    setupRealtimeValidation('client-password', validatePasswordOptional);
    setupRealtimeValidation('client-confirm-password', validateConfirmPassword);
    
    // Manejar envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (isEditMode) {
            saveProfile();
        }
    });
}

// Guardar perfil actualizado
function saveProfile() {
    const updatedData = {
        name: document.getElementById('client-name').value.trim(),
        lastname: document.getElementById('client-lastname').value.trim(),
        email: document.getElementById('client-email').value.trim(),
        phone: document.getElementById('client-phone').value.trim(),
        password: document.getElementById('client-password').value,
        confirmPassword: document.getElementById('client-confirm-password').value
    };
    
    // Validar formulario
    if (!validateProfileForm(updatedData)) {
        return;
    }
    
    try {
        // Actualizar datos individuales en localStorage
        localStorage.setItem('name', updatedData.name);
        localStorage.setItem('lastname', updatedData.lastname);
        localStorage.setItem('phone', updatedData.phone);
        // Email no se cambia
        
        // Actualizar en la lista de usuarios si hay contraseña nueva
        const usersData = JSON.parse(localStorage.getItem('users') || '{"users":[]}');
        const userIndex = usersData.users.findIndex(user => user.email === updatedData.email);
        
        if (userIndex !== -1) {
            // Actualizar datos del usuario en la lista
            usersData.users[userIndex].name = updatedData.name;
            usersData.users[userIndex].lastname = updatedData.lastname;
            usersData.users[userIndex].phone = updatedData.phone;
            
            // Actualizar contraseña si se proporcionó una nueva
            if (updatedData.password) {
                usersData.users[userIndex].password = updatedData.password;
            }
            
            // Guardar lista actualizada
            localStorage.setItem('users', JSON.stringify(usersData));
        }
        
        // Actualizar datos originales para futuras cancelaciones
        originalUserData = {
            name: updatedData.name,
            lastname: updatedData.lastname,
            email: updatedData.email,
            phone: updatedData.phone,
            role: 'cliente'
        };
        
        // Salir del modo edición
        cancelEdit();
        
        // Actualizar navbar con nuevo nombre si cambió
        const userNameSpan = document.getElementById('user-name');
        if (userNameSpan) {
            userNameSpan.textContent = `${updatedData.name} ${updatedData.lastname}`.trim();
        }
        
        showAlert('Perfil actualizado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error al guardar perfil:', error);
        showAlert('Error al guardar los cambios. Inténtalo de nuevo.', 'danger');
    }
}

// Validar formulario de perfil
function validateProfileForm(data) {
    let isValid = true;
    
    // Limpiar errores previos
    clearAllFieldErrors();
    
    // Validar nombre
    if (!data.name || data.name.length < 2) {
        showFieldError('client-name', 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.name)) {
        showFieldError('client-name', 'El nombre solo puede contener letras');
        isValid = false;
    }
    
    // Validar apellido
    if (!data.lastname || data.lastname.length < 2) {
        showFieldError('client-lastname', 'El apellido debe tener al menos 2 caracteres');
        isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(data.lastname)) {
        showFieldError('client-lastname', 'El apellido solo puede contener letras');
        isValid = false;
    }
    
    // Validar teléfono
    if (!data.phone) {
        showFieldError('client-phone', 'El teléfono es requerido');
        isValid = false;
    } else {
        if (!validarTelefono(data.phone)) {
            const phoneError = obtenerErrorTelefono(data.phone);
            showFieldError('client-phone', phoneError || 'Número de teléfono inválido');
            isValid = false;
        }
    }
    
    // Validar contraseña si se proporciona
    if (data.password) {
        const passwordErrors = validarSeguridadPassword(data.password);
        if (passwordErrors.length > 0) {
            showFieldError('client-password', passwordErrors[0]);
            isValid = false;
        }
        
        // Validar confirmación de contraseña
        if (data.password !== data.confirmPassword) {
            showFieldError('client-confirm-password', 'Las contraseñas no coinciden');
            isValid = false;
        }
    } else if (data.confirmPassword) {
        showFieldError('client-confirm-password', 'Debes ingresar la contraseña principal primero');
        isValid = false;
    }
    
    return isValid;
}

// Configurar validación en tiempo real
function setupRealtimeValidation(fieldId, validationFunction) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.addEventListener('input', function() {
            if (isEditMode) {
                validationFunction(this);
            }
        });
    }
}

// Funciones de validación específicas
function validateName(field) {
    const value = field.value.trim();
    if (value.length === 0) {
        clearFieldError(field);
    } else if (value.length < 2) {
        showFieldError(field, 'Debe tener al menos 2 caracteres');
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        showFieldError(field, 'Solo puede contener letras');
    } else {
        markFieldValid(field);
    }
}

function validateLastname(field) {
    validateName(field); // Misma validación que nombre
}

function validatePhone(field) {
    const value = field.value.trim();
    if (value.length === 0) {
        clearFieldError(field);
    } else {
        if (!validarTelefono(value)) {
            const error = obtenerErrorTelefono(value);
            showFieldError(field, error || 'Número de teléfono inválido');
        } else {
            markFieldValid(field);
        }
    }
}

function validatePasswordOptional(field) {
    const value = field.value;
    if (value.length === 0) {
        clearFieldError(field);
        // Limpiar también confirmación si está vacía la principal
        const confirmField = document.getElementById('client-confirm-password');
        if (confirmField.value.length === 0) {
            clearFieldError(confirmField);
        }
    } else {
        const errores = validarSeguridadPassword(value);
        if (errores.length > 0) {
            showFieldError(field, errores[0]);
        } else {
            markFieldValid(field);
            // Revalidar confirmación
            validateConfirmPassword(document.getElementById('client-confirm-password'));
        }
    }
}

function validateConfirmPassword(field) {
    const value = field.value;
    const passwordValue = document.getElementById('client-password').value;
    
    if (value.length === 0 && passwordValue.length === 0) {
        clearFieldError(field);
    } else if (passwordValue.length === 0 && value.length > 0) {
        showFieldError(field, 'Debes ingresar la contraseña principal primero');
    } else if (value !== passwordValue) {
        showFieldError(field, 'Las contraseñas no coinciden');
    } else {
        markFieldValid(field);
    }
}

// Utilidades para validación de campos
function showFieldError(fieldId, message) {
    const field = typeof fieldId === 'string' ? document.getElementById(fieldId) : fieldId;
    clearFieldError(field);
    field.classList.add('is-invalid');
    
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    field.parentNode.appendChild(feedback);
}

function clearFieldError(field) {
    field.classList.remove('is-invalid', 'is-valid');
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.remove();
    }
}

function markFieldValid(field) {
    clearFieldError(field);
    field.classList.add('is-valid');
}

function clearAllFieldErrors() {
    const fields = document.querySelectorAll('.form-control');
    fields.forEach(field => clearFieldError(field));
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
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// Función para mostrar mensaje de "Próximamente"
function showComingSoon(feature) {
    showAlert(`La funcionalidad "${feature}" estará disponible próximamente`, 'info');
}
