// Gestión del perfil de administrador
let isEditMode = false;
let originalUserData = {};

// Verificar autenticación y cargar datos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuthentication();
    loadAdminData();
    setupFormValidations();
    loadUserStats();
});

// Verificar que el usuario sea administrador y esté autenticado
function checkAdminAuthentication() {
    const isLoggedIn = localStorage.getItem('login') === 'true';
    const userRole = localStorage.getItem('role');
    
    if (!isLoggedIn) {
        window.location.href = '../login.html';
        return;
    }
    
    if (userRole !== 'admin') {
        window.location.href = '../noauth.html';
        return;
    }
}

// Cargar datos del administrador desde localStorage
function loadAdminData() {
    try {
        // Cargar datos individuales del usuario actual
        const userData = {
            name: localStorage.getItem('name') || '',
            lastname: localStorage.getItem('lastname') || '',
            email: localStorage.getItem('email') || '',
            phone: localStorage.getItem('phone') || '',
            role: localStorage.getItem('role') || 'admin'
        };
        
        // Guardar datos originales para cancelar edición
        originalUserData = { ...userData };
        
        // Llenar formulario con datos actuales
        document.getElementById('admin-name').value = userData.name;
        document.getElementById('admin-lastname').value = userData.lastname;
        document.getElementById('admin-email').value = userData.email;
        document.getElementById('admin-phone').value = userData.phone;
        document.getElementById('role-display').value = 'Administrador';
        
        console.log('Datos del administrador cargados:', userData);
        
    } catch (error) {
        console.error('Error al cargar datos del administrador:', error);
        showNotification('Error al cargar los datos del perfil', 'error');
    }
}

// Cargar estadísticas de usuarios
function loadUserStats() {
    try {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const totalUsersElement = document.getElementById('total-users');
        if (totalUsersElement) {
            totalUsersElement.textContent = users.length;
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

// Alternar entre modo edición y modo lectura
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const fields = ['admin-name', 'admin-lastname', 'admin-email', 'admin-phone'];
    const editBtn = document.getElementById('edit-toggle-btn');
    const editBtnText = document.getElementById('edit-btn-text');
    const passwordSection = document.getElementById('password-section');
    const actionButtons = document.getElementById('action-buttons');
    
    if (isEditMode) {
        // Activar modo edición
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            field.readOnly = false;
            field.classList.add('editable');
        });
        
        editBtn.className = 'btn btn-secondary btn-sm';
        editBtn.innerHTML = '<i class="fas fa-times me-1"></i><span id="edit-btn-text">Cancelar</span>';
        passwordSection.style.display = 'block';
        actionButtons.style.display = 'block';
        
        // Limpiar campos de contraseña
        document.getElementById('admin-password').value = '';
        document.getElementById('admin-confirm-password').value = '';
        
    } else {
        // Cancelar edición y volver a modo lectura
        cancelEdit();
    }
}

// Cancelar edición y restaurar datos originales
function cancelEdit() {
    isEditMode = false;
    
    const fields = ['admin-name', 'admin-lastname', 'admin-email', 'admin-phone'];
    const editBtn = document.getElementById('edit-toggle-btn');
    const passwordSection = document.getElementById('password-section');
    const actionButtons = document.getElementById('action-buttons');
    
    // Desactivar modo edición
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.readOnly = true;
        field.classList.remove('editable', 'is-invalid');
    });
    
    // Restaurar datos originales
    document.getElementById('admin-name').value = originalUserData.name;
    document.getElementById('admin-lastname').value = originalUserData.lastname;
    document.getElementById('admin-email').value = originalUserData.email;
    document.getElementById('admin-phone').value = originalUserData.phone;
    
    // Limpiar campos de contraseña
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-confirm-password').value = '';
    
    // Limpiar errores de validación
    clearValidationErrors();
    
    editBtn.className = 'btn btn-light btn-sm';
    editBtn.innerHTML = '<i class="fas fa-edit me-1"></i><span id="edit-btn-text">Editar Perfil</span>';
    passwordSection.style.display = 'none';
    actionButtons.style.display = 'none';
}

// Configurar validaciones del formulario
function setupFormValidations() {
    const form = document.getElementById('admin-profile-form');
    
    // Validación en tiempo real
    document.getElementById('admin-name').addEventListener('input', validateName);
    document.getElementById('admin-lastname').addEventListener('input', validateLastname);
    document.getElementById('admin-email').addEventListener('input', validateEmail);
    document.getElementById('admin-phone').addEventListener('input', validatePhone);
    document.getElementById('admin-password').addEventListener('input', validatePassword);
    document.getElementById('admin-confirm-password').addEventListener('input', validateConfirmPassword);
    
    // Manejar envío del formulario
    form.addEventListener('submit', handleFormSubmit);
}

// Validaciones individuales
function validateName() {
    const nameField = document.getElementById('admin-name');
    const errorDiv = document.getElementById('name-error');
    const name = nameField.value.trim();
    
    if (name.length < 2) {
        showFieldError(nameField, errorDiv, 'El nombre debe tener al menos 2 caracteres');
        return false;
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
        showFieldError(nameField, errorDiv, 'El nombre solo puede contener letras');
        return false;
    }
    
    hideFieldError(nameField, errorDiv);
    return true;
}

function validateLastname() {
    const lastnameField = document.getElementById('admin-lastname');
    const errorDiv = document.getElementById('lastname-error');
    const lastname = lastnameField.value.trim();
    
    if (lastname.length < 2) {
        showFieldError(lastnameField, errorDiv, 'El apellido debe tener al menos 2 caracteres');
        return false;
    }
    
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastname)) {
        showFieldError(lastnameField, errorDiv, 'El apellido solo puede contener letras');
        return false;
    }
    
    hideFieldError(lastnameField, errorDiv);
    return true;
}

function validateEmail() {
    const emailField = document.getElementById('admin-email');
    const errorDiv = document.getElementById('email-error');
    const email = emailField.value.trim();
    
    if (!email) {
        showFieldError(emailField, errorDiv, 'El correo electrónico es obligatorio');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showFieldError(emailField, errorDiv, 'Ingrese un correo electrónico válido');
        return false;
    }
    
    // Verificar si el email ya existe (excluyendo el usuario actual)
    const currentEmail = localStorage.getItem('email');
    if (email !== currentEmail && isEmailTaken(email)) {
        showFieldError(emailField, errorDiv, 'Este correo electrónico ya está registrado');
        return false;
    }
    
    hideFieldError(emailField, errorDiv);
    return true;
}

function validatePhone() {
    const phoneField = document.getElementById('admin-phone');
    const errorDiv = document.getElementById('phone-error');
    const phone = phoneField.value.trim();
    
    if (!phone) {
        showFieldError(phoneField, errorDiv, 'El teléfono es obligatorio');
        return false;
    }
    
    if (!validarTelefono(phone)) {
        const errorMessage = obtenerErrorTelefono(phone);
        showFieldError(phoneField, errorDiv, errorMessage || 'Ingrese un número de teléfono válido (ej: +56912345678)');
        return false;
    }
    
    hideFieldError(phoneField, errorDiv);
    return true;
}

function validatePassword() {
    const passwordField = document.getElementById('admin-password');
    const errorDiv = document.getElementById('password-error');
    const password = passwordField.value;
    
    // Si el campo está vacío, no validar (es opcional)
    if (!password) {
        hideFieldError(passwordField, errorDiv);
        return true;
    }
    
    if (password.length < 6) {
        showFieldError(passwordField, errorDiv, 'La contraseña debe tener al menos 6 caracteres');
        return false;
    }
    
    hideFieldError(passwordField, errorDiv);
    return true;
}

function validateConfirmPassword() {
    const passwordField = document.getElementById('admin-password');
    const confirmField = document.getElementById('admin-confirm-password');
    const errorDiv = document.getElementById('confirm-password-error');
    
    const password = passwordField.value;
    const confirmPassword = confirmField.value;
    
    // Si no hay contraseña nueva, no validar confirmación
    if (!password && !confirmPassword) {
        hideFieldError(confirmField, errorDiv);
        return true;
    }
    
    if (password !== confirmPassword) {
        showFieldError(confirmField, errorDiv, 'Las contraseñas no coinciden');
        return false;
    }
    
    hideFieldError(confirmField, errorDiv);
    return true;
}

// Funciones auxiliares para mostrar/ocultar errores
function showFieldError(field, errorDiv, message) {
    field.classList.add('is-invalid');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideFieldError(field, errorDiv) {
    field.classList.remove('is-invalid');
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
}

function clearValidationErrors() {
    const fields = ['admin-name', 'admin-lastname', 'admin-email', 'admin-phone', 'admin-password', 'admin-confirm-password'];
    const errors = ['name-error', 'lastname-error', 'email-error', 'phone-error', 'password-error', 'confirm-password-error'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) field.classList.remove('is-invalid');
    });
    
    errors.forEach(errorId => {
        const errorDiv = document.getElementById(errorId);
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    });
}

// Verificar si un email ya está en uso
function isEmailTaken(email) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentEmail = localStorage.getItem('email');
    
    return users.some(user => user.email === email && user.email !== currentEmail);
}

// Manejar envío del formulario
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!isEditMode) return;
    
    // Validar todos los campos
    const isNameValid = validateName();
    const isLastnameValid = validateLastname();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    
    if (!isNameValid || !isLastnameValid || !isEmailValid || !isPhoneValid || !isPasswordValid || !isConfirmPasswordValid) {
        showNotification('Por favor, corrija los errores en el formulario', 'error');
        return;
    }
    
    // Recopilar datos del formulario
    const formData = {
        name: document.getElementById('admin-name').value.trim(),
        lastname: document.getElementById('admin-lastname').value.trim(),
        email: document.getElementById('admin-email').value.trim(),
        phone: document.getElementById('admin-phone').value.trim(),
        role: 'admin'
    };
    
    const newPassword = document.getElementById('admin-password').value;
    
    try {
        // Actualizar localStorage individual
        localStorage.setItem('name', formData.name);
        localStorage.setItem('lastname', formData.lastname);
        localStorage.setItem('email', formData.email);
        localStorage.setItem('phone', formData.phone);
        
        if (newPassword) {
            localStorage.setItem('password', newPassword);
        }
        
        // Actualizar en la lista de usuarios
        updateUserInUsersList(formData, newPassword);
        
        // Actualizar datos originales
        originalUserData = { ...formData };
        
        // Salir del modo edición
        toggleEditMode();
        
        showNotification('Perfil actualizado correctamente', 'success');
        
        console.log('Perfil de administrador actualizado:', formData);
        
    } catch (error) {
        console.error('Error al actualizar perfil:', error);
        showNotification('Error al actualizar el perfil', 'error');
    }
}

// Actualizar usuario en la lista de usuarios
function updateUserInUsersList(userData, newPassword = null) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const currentEmail = originalUserData.email;
    
    const userIndex = users.findIndex(user => user.email === currentEmail);
    
    if (userIndex !== -1) {
        // Actualizar usuario existente
        users[userIndex] = {
            ...users[userIndex],
            ...userData
        };
        
        if (newPassword) {
            users[userIndex].password = newPassword;
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Usuario actualizado en lista de usuarios');
    }
}

// Función para alternar visibilidad de contraseña
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = document.getElementById(fieldId + '-icon');
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        field.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear el elemento de notificación
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Agregar al body
    document.body.appendChild(notification);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Función para mostrar mensaje de "Próximamente"
function showComingSoon(feature) {
    showNotification(`La funcionalidad "${feature}" estará disponible próximamente`, 'info');
}
