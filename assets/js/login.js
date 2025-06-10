// Gestión del formulario de login
document.addEventListener('DOMContentLoaded', function() {
    setupLoginForm();
});

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    
    if (!form) {
        console.error('Formulario de login no encontrado');
        return;
    }
    
    // Manejar envío del formulario
    form.addEventListener('submit', handleLoginSubmit);
    
    // Configurar validaciones en tiempo real
    setupLoginValidations();
}

function setupLoginValidations() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    if (emailField) {
        emailField.addEventListener('input', function() {
            clearFieldError(this);
        });
    }
    
    if (passwordField) {
        passwordField.addEventListener('input', function() {
            clearFieldError(this);
        });
    }
}

function handleLoginSubmit(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validaciones básicas
    if (!email || !password) {
        showAlert('Por favor, complete todos los campos', 'error');
        return;
    }
    
    // Intentar autenticar usuario
    authenticateUser(email, password);
}

function authenticateUser(email, password) {
    try {
        // Obtener lista de usuarios del localStorage
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
        
        // Buscar usuario por email y contraseña
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Usuario encontrado - Iniciar sesión
            loginUser(user);
        } else {
            // Credenciales incorrectas
            showAlert('Credenciales incorrectas. Verifique su email y contraseña.', 'error');
            
            // Mostrar errores en los campos
            showFieldError(document.getElementById('email'), 'Credenciales incorrectas');
            showFieldError(document.getElementById('password'), 'Credenciales incorrectas');
        }
        
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        showAlert('Error al iniciar sesión. Inténtelo de nuevo.', 'error');
    }
}

function loginUser(user) {
    try {
        // Guardar información del usuario en localStorage
        localStorage.setItem('login', 'true');
        localStorage.setItem('name', user.name);
        localStorage.setItem('lastname', user.lastname);
        localStorage.setItem('email', user.email);
        localStorage.setItem('phone', user.phone || '');
        localStorage.setItem('role', user.role);
        localStorage.setItem('password', user.password);
        
        // Mostrar mensaje de éxito
        showAlert(`¡Bienvenido/a ${user.name}! Redirigiendo...`, 'success');
        
        // Redirigir según el rol del usuario
        setTimeout(() => {
            redirectUserByRole(user.role);
        }, 1500);
        
        console.log('Usuario autenticado exitosamente:', {
            name: user.name,
            email: user.email,
            role: user.role
        });
        
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        showAlert('Error al iniciar sesión. Inténtelo de nuevo.', 'error');
    }
}

function redirectUserByRole(role) {
    const rolePages = {
        'admin': 'perfiles/admin.html',
        'cliente': 'perfiles/cliente.html',
        'funcionario': 'perfiles/funcionario.html',
        'tecnico': 'perfiles/tecnico.html'
    };
    
    const targetPage = rolePages[role];
    
    if (targetPage) {
        window.location.href = targetPage;
    } else {
        // Rol desconocido, redirigir a página por defecto
        console.warn('Rol desconocido:', role);
        window.location.href = 'index.html';
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
    
    // Auto-remover después de tiempo apropiado
    const autoRemoveTime = type === 'success' ? 2000 : 5000;
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, autoRemoveTime);
}
