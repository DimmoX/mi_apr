// Gestión de usuarios para administradores
let usuarios = [];
let usuariosFiltrados = [];

// Verificar autenticación de administrador al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuthentication();
    loadUserData();
    setupFormValidations();
});

// Se verifica que el usuario sea administrador
function checkAdminAuthentication() {
    const isLoggedIn = localStorage.getItem('login') === 'true';
    const userRole = localStorage.getItem('role');
    
    if (!isLoggedIn || userRole !== 'admin') {
        // Redirigir a página de no autorización
        window.location.href = 'noauth.html';
        return;
    }
    
}

// Cargar datos de usuarios
function loadUserData() {
    try {
        const usersData = localStorage.getItem('users');
        console.log('Raw usersData from localStorage:', usersData);
        
        if (usersData && usersData !== 'null' && usersData !== 'undefined') {
            const parsedData = JSON.parse(usersData);
            console.log('Parsed data:', parsedData);
            console.log('Type of parsed data:', typeof parsedData);
            console.log('Is array?', Array.isArray(parsedData));
            
            // Los datos están directamente como array en localStorage
            if (Array.isArray(parsedData)) {
                console.log('Data is direct array');
                usuarios = parsedData;
            } else if (parsedData && typeof parsedData === 'object' && parsedData.users && Array.isArray(parsedData.users)) {
                console.log('Data has users property with array');
                usuarios = parsedData.users;
            } else {
                console.log('Data structure not recognized, expected array:', parsedData);
                usuarios = [];
            }
            
            console.log('Final usuarios array:', usuarios);
            console.log('Number of usuarios:', usuarios.length);
        } else {
            console.log('No valid users data found in localStorage');
            // Verificar si hay usuarios en el archivo de configuración default
            initializeDefaultUsers();
            return; // Salir aquí para que initializeDefaultUsers() maneje la carga
        }
        
        usuariosFiltrados = [...usuarios];
        console.log('usuariosFiltrados:', usuariosFiltrados);
        console.log('Calling displayUsers...');
        displayUsers();
        console.log('Calling updateStatistics...');
        updateStatistics();
        
    } catch (error) {
        console.error('Error al cargar usuarios:', error);
        showAlert('Error al cargar los datos de usuarios', 'danger');
        // En caso de error, inicializar con array vacío
        usuarios = [];
        usuariosFiltrados = [];
        displayUsers();
        updateStatistics();
    }
}

// Mostrar usuarios en la tabla
function displayUsers() {
    console.log('displayUsers called with usuariosFiltrados:', usuariosFiltrados);
    const tableBody = document.getElementById('tabla-usuarios');
    const noDataMessage = document.getElementById('no-data-message');
    
    console.log('tableBody element:', tableBody);
    console.log('noDataMessage element:', noDataMessage);
    
    if (usuariosFiltrados.length === 0) {
        console.log('No usuarios to display, showing no data message');
        tableBody.innerHTML = '';
        if (noDataMessage) {
            noDataMessage.style.display = 'block';
        }
        return;
    }
    
    console.log('Displaying', usuariosFiltrados.length, 'usuarios');
    if (noDataMessage) {
        noDataMessage.style.display = 'none';
    }
    
    tableBody.innerHTML = usuariosFiltrados.map((usuario, index) => {
        const roleBadge = getRoleBadge(usuario.role);
        const maskedPassword = '*'.repeat(usuario.password.length);
        const originalIndex = usuarios.findIndex(u => u.email === usuario.email);
        
        return `
            <tr>
                <td><span class="badge bg-secondary">${index + 1}</span></td>
                <td><strong>${usuario.name} ${usuario.lastname}</strong></td>
                <td>
                    <a href="mailto:${usuario.email}" class="text-decoration-none">
                        ${usuario.email}
                    </a>
                </td>
                <td>
                    <a href="tel:${usuario.phone}" class="text-decoration-none">
                        ${usuario.phone || 'N/A'}
                    </a>
                </td>
                <td>${roleBadge}</td>
                <td>
                    <div class="password-cell position-relative">
                        <span class="password-text" id="password-${originalIndex}">${maskedPassword}</span>
                        <button class="btn btn-sm btn-outline-secondary password-toggle" 
                                onclick="togglePassword(${originalIndex}, '${usuario.password}')"
                                title="Mostrar/Ocultar contraseña">
                            <span class="eye-icon" id="eye-${originalIndex}">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                                    <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                                    <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
                                </svg>
                            </span>
                        </button>
                    </div>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-warning" 
                                onclick="editarUsuario(${originalIndex})"
                                title="Editar usuario">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="eliminarUsuario(${originalIndex})"
                                title="Eliminar usuario">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Obtener badge según el rol
function getRoleBadge(role) {
    const badges = {
        admin: '<span class="badge bg-danger">Admin</span>',
        funcionario: '<span class="badge bg-warning text-dark">Funcionario</span>',
        tecnico: '<span class="badge bg-info">Técnico</span>',
        cliente: '<span class="badge bg-success">Cliente</span>'
    };
    return badges[role] || '<span class="badge bg-secondary">Desconocido</span>';
}

// Toggle visibilidad de contraseña
function togglePassword(index, realPassword) {
    const passwordElement = document.getElementById(`password-${index}`);
    const eyeElement = document.getElementById(`eye-${index}`);
    
    if (passwordElement.textContent.includes('*')) {
        // Mostrar contraseña real
        passwordElement.textContent = realPassword;
        eyeElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash-fill" viewBox="0 0 16 16">
                <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z"/>
                <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z"/>
            </svg>
        `;
    } else {
        // Ocultar contraseña
        passwordElement.textContent = '*'.repeat(realPassword.length);
        eyeElement.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-fill" viewBox="0 0 16 16">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"/>
            </svg>
        `;
    }
}

// Actualizar estadísticas
function updateStatistics() {
    document.getElementById('total-usuarios').textContent = usuarios.length;
    document.getElementById('total-admins').textContent = usuarios.filter(u => u.role === 'admin').length;
    document.getElementById('total-funcionarios').textContent = usuarios.filter(u => u.role === 'funcionario').length;
    document.getElementById('total-clientes').textContent = usuarios.filter(u => u.role === 'cliente').length;
}

// Filtrar usuarios por rol
function filtrarUsuarios() {
    const rolSeleccionado = document.getElementById('filtro-rol').value;
    const busqueda = document.getElementById('buscar-usuario').value.toLowerCase();
    
    usuariosFiltrados = usuarios.filter(usuario => {
        const coincideRol = !rolSeleccionado || usuario.role === rolSeleccionado;
        const coincideBusqueda = !busqueda || 
            usuario.name.toLowerCase().includes(busqueda) ||
            usuario.lastname.toLowerCase().includes(busqueda) ||
            usuario.email.toLowerCase().includes(busqueda);
        
        return coincideRol && coincideBusqueda;
    });
    
    displayUsers();
}

// Buscar usuarios
function buscarUsuarios() {
    filtrarUsuarios(); // Reutiliza la lógica de filtrado
}

// Mostrar modal para nuevo usuario
function mostrarModalNuevoUsuario() {
    const modal = new bootstrap.Modal(document.getElementById('modalNuevoUsuario'));
    document.getElementById('form-nuevo-usuario').reset();
    limpiarErroresFormulario('form-nuevo-usuario');
    modal.show();
}

// Guardar nuevo usuario
function guardarNuevoUsuario() {
    const form = document.getElementById('form-nuevo-usuario');
    const formData = new FormData(form);
    
    // Generar ID único para el nuevo usuario
    const newId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id || 0)) + 1 : 1;
    
    const nuevoUsuario = {
        id: newId,
        name: document.getElementById('nuevo-nombre').value.trim(),
        lastname: document.getElementById('nuevo-apellido').value.trim(),
        email: document.getElementById('nuevo-email').value.trim(),
        phone: document.getElementById('nuevo-telefono').value.trim(),
        role: document.getElementById('nuevo-rol').value,
        password: document.getElementById('nuevo-password').value
    };
    
    // Validar formulario
    console.log('Validando nuevo usuario:', nuevoUsuario);
    if (!validarFormularioUsuario(nuevoUsuario, 'nuevo')) {
        console.log('Validación falló, no se agregará el usuario');
        return;
    }
    console.log('Validación exitosa, procediendo a agregar usuario');
    
    // Verificar si el email ya existe
    if (usuarios.some(u => u.email === nuevoUsuario.email)) {
        showAlert('El email ya está registrado en el sistema', 'danger');
        return;
    }
    
    // Agregar usuario a la lista
    console.log('Nuevo usuario a agregar:', nuevoUsuario);
    console.log('Lista de usuarios antes de agregar:', usuarios);
    usuarios.push(nuevoUsuario);
    console.log('Lista de usuarios después de agregar:', usuarios);
    
    // Guardar en localStorage como array directo
    localStorage.setItem('users', JSON.stringify(usuarios));
    console.log('Datos guardados en localStorage:', localStorage.getItem('users'));
    
    // Debug para verificar persistencia
    debugLocalStorage();
    
    // Actualizar vista
    usuariosFiltrados = [...usuarios];
    displayUsers();
    updateStatistics();
    
    // Cerrar modal y mostrar mensaje
    bootstrap.Modal.getInstance(document.getElementById('modalNuevoUsuario')).hide();
    showAlert(`Usuario ${nuevoUsuario.name} ${nuevoUsuario.lastname} creado exitosamente`, 'success');
}

// Editar usuario
function editarUsuario(index) {
    const usuario = usuarios[index];
    
    document.getElementById('editar-index').value = index;
    document.getElementById('editar-nombre').value = usuario.name;
    document.getElementById('editar-apellido').value = usuario.lastname;
    document.getElementById('editar-email').value = usuario.email;
    document.getElementById('editar-telefono').value = usuario.phone || '';
    document.getElementById('editar-rol').value = usuario.role;
    document.getElementById('editar-password').value = '';
    
    limpiarErroresFormulario('form-editar-usuario');
    
    const modal = new bootstrap.Modal(document.getElementById('modalEditarUsuario'));
    modal.show();
}

// Actualizar usuario
function actualizarUsuario() {
    const index = parseInt(document.getElementById('editar-index').value);
    const nuevaPassword = document.getElementById('editar-password').value;
    
    const usuarioActualizado = {
        id: usuarios[index].id,
        name: document.getElementById('editar-nombre').value.trim(),
        lastname: document.getElementById('editar-apellido').value.trim(),
        email: document.getElementById('editar-email').value.trim(),
        phone: document.getElementById('editar-telefono').value.trim(),
        role: document.getElementById('editar-rol').value,
        password: nuevaPassword || usuarios[index].password
    };
    
    // Validar formulario
    if (!validarFormularioUsuario(usuarioActualizado, 'editar')) {
        return;
    }
    
    // Verificar si el email ya existe (excluyendo el usuario actual)
    if (usuarios.some((u, i) => i !== index && u.email === usuarioActualizado.email)) {
        showAlert('El email ya está registrado por otro usuario', 'danger');
        return;
    }
    
    // Actualizar usuario
    usuarios[index] = usuarioActualizado;
    
    // Guardar en localStorage como array directo
    localStorage.setItem('users', JSON.stringify(usuarios));
    
    // Debug para verificar persistencia
    debugLocalStorage();
    
    // Actualizar vista
    filtrarUsuarios();
    updateStatistics();
    
    // Cerrar modal y mostrar mensaje
    bootstrap.Modal.getInstance(document.getElementById('modalEditarUsuario')).hide();
    showAlert(`Usuario ${usuarioActualizado.name} ${usuarioActualizado.lastname} actualizado exitosamente`, 'success');
}

// Eliminar usuario
function eliminarUsuario(index) {
    const usuario = usuarios[index];
    
    if (confirm(`¿Estás seguro de que deseas eliminar al usuario "${usuario.name} ${usuario.lastname}"?\n\nEsta acción no se puede deshacer.`)) {
        usuarios.splice(index, 1);
        
        // Guardar en localStorage como array directo
        localStorage.setItem('users', JSON.stringify(usuarios));
        
        // Debug para verificar persistencia
        debugLocalStorage();
        
        // Actualizar vista
        filtrarUsuarios();
        updateStatistics();
        
        showAlert(`Usuario ${usuario.name} ${usuario.lastname} eliminado exitosamente`, 'success');
    }
}

// Validar formulario de usuario
function validarFormularioUsuario(usuario, tipo) {
    let isValid = true;
    const prefix = tipo === 'nuevo' ? 'nuevo-' : 'editar-';
    
    // Limpiar errores previos
    limpiarErroresFormulario(`form-${tipo}-usuario`);
    
    // Validar nombre
    if (!usuario.name || usuario.name.length < 2) {
        mostrarErrorCampo(`${prefix}nombre`, 'El nombre debe tener al menos 2 caracteres');
        isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(usuario.name)) {
        mostrarErrorCampo(`${prefix}nombre`, 'El nombre solo puede contener letras');
        isValid = false;
    }
    
    // Validar apellido
    if (!usuario.lastname || usuario.lastname.length < 2) {
        mostrarErrorCampo(`${prefix}apellido`, 'El apellido debe tener al menos 2 caracteres');
        isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(usuario.lastname)) {
        mostrarErrorCampo(`${prefix}apellido`, 'El apellido solo puede contener letras');
        isValid = false;
    }
    
    // Validar email
    if (!usuario.email) {
        mostrarErrorCampo(`${prefix}email`, 'El email es requerido');
        isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.email)) {
        mostrarErrorCampo(`${prefix}email`, 'Ingresa un email válido');
        isValid = false;
    }
    
    // Validar teléfono
    if (!usuario.phone) {
        console.log('Teléfono no proporcionado');
        mostrarErrorCampo(`${prefix}telefono`, 'El teléfono es requerido');
        isValid = false;
    } else {
        console.log('Validando teléfono:', usuario.phone);
        try {
            if (!validarTelefono(usuario.phone)) {
                const errorTelefono = obtenerErrorTelefono(usuario.phone);
                console.log('Teléfono inválido:', errorTelefono);
                mostrarErrorCampo(`${prefix}telefono`, errorTelefono || 'Número de teléfono inválido');
                isValid = false;
            } else {
                console.log('Teléfono válido');
            }
        } catch (error) {
            console.error('Error en validación de teléfono:', error);
            mostrarErrorCampo(`${prefix}telefono`, 'Error en validación de teléfono');
            isValid = false;
        }
    }
    
    // Validar rol
    if (!usuario.role) {
        mostrarErrorCampo(`${prefix}rol`, 'Selecciona un rol');
        isValid = false;
    }
    
    // Validar contraseña (solo para nuevos usuarios o si se especifica nueva contraseña)
    if (tipo === 'nuevo' || (tipo === 'editar' && usuario.password !== usuarios[parseInt(document.getElementById('editar-index').value)].password)) {
        console.log('Validando contraseña:', usuario.password);
        try {
            const erroresPassword = validarSeguridadPassword(usuario.password);
            if (erroresPassword.length > 0) {
                console.log('Errores en contraseña:', erroresPassword);
                mostrarErrorCampo(`${prefix}password`, erroresPassword[0]);
                isValid = false;
            } else {
                console.log('Contraseña válida');
            }
        } catch (error) {
            console.error('Error en validación de contraseña:', error);
            mostrarErrorCampo(`${prefix}password`, 'Error en validación de contraseña');
            isValid = false;
        }
    }
    
    console.log('Resultado final de validación:', isValid);
    return isValid;
}

// Mostrar error en campo específico
function mostrarErrorCampo(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('is-invalid');
    
    const feedback = document.createElement('div');
    feedback.className = 'invalid-feedback';
    feedback.textContent = message;
    
    field.parentNode.appendChild(feedback);
}

// Limpiar errores de formulario
function limpiarErroresFormulario(formId) {
    const form = document.getElementById(formId);
    const fields = form.querySelectorAll('.form-control, .form-select');
    
    fields.forEach(field => {
        field.classList.remove('is-invalid');
        const feedback = field.parentNode.querySelector('.invalid-feedback');
        if (feedback) {
            feedback.remove();
        }
    });
}

// Inicializar usuarios por defecto si no existen
function initializeDefaultUsers() {
    try {
        fetch('./config/users.json')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('No se pudo cargar users.json');
            })
            .then(data => {
                console.log('Loading default users from config/users.json:', data);
                // Guardar solo el array de usuarios, no la estructura completa
                localStorage.setItem('users', JSON.stringify(data.users || []));
                usuarios = data.users || [];
                usuariosFiltrados = [...usuarios];
                displayUsers();
                updateStatistics();
            })
            .catch(error => {
                console.log('No se encontró archivo de configuración de usuarios:', error);
                // Crear array vacío
                localStorage.setItem('users', JSON.stringify([]));
            });
    } catch (error) {
        console.error('Error al inicializar usuarios por defecto:', error);
    }
}

// Exportar usuarios a JSON
function exportarUsuarios() {
    const dataToExport = {
        exported_at: new Date().toISOString(),
        total_users: usuarios.length,
        users: usuarios.map(user => ({
            ...user,
            password: '***HIDDEN***' // No exportar contraseñas reales
        }))
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `usuarios_sistema_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('Datos de usuarios exportados exitosamente', 'success');
}

// Configurar validaciones de formularios
function setupFormValidations() {
    // Validaciones en tiempo real para formulario nuevo usuario
    setupRealtimeValidation('nuevo-nombre', validateName);
    setupRealtimeValidation('nuevo-apellido', validateLastname);
    setupRealtimeValidation('nuevo-email', validateEmail);
    setupRealtimeValidation('nuevo-telefono', validatePhone);
    setupRealtimeValidation('nuevo-password', validatePassword);
    
    // Validaciones en tiempo real para formulario editar usuario
    setupRealtimeValidation('editar-nombre', validateName);
    setupRealtimeValidation('editar-apellido', validateLastname);
    setupRealtimeValidation('editar-email', validateEmail);
    setupRealtimeValidation('editar-telefono', validatePhone);
    setupRealtimeValidation('editar-password', validatePasswordOptional);
}

// Configurar validación en tiempo real
function setupRealtimeValidation(fieldId, validationFunction) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.addEventListener('input', function() {
            validationFunction(this);
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

function validateEmail(field) {
    const value = field.value.trim();
    if (value.length === 0) {
        clearFieldError(field);
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        showFieldError(field, 'Ingresa un email válido');
    } else {
        markFieldValid(field);
    }
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

function validatePassword(field) {
    const value = field.value;
    if (value.length === 0) {
        clearFieldError(field);
    } else {
        const errores = validarSeguridadPassword(value);
        if (errores.length > 0) {
            showFieldError(field, errores[0]);
        } else {
            markFieldValid(field);
        }
    }
}

function validatePasswordOptional(field) {
    const value = field.value;
    if (value.length === 0) {
        clearFieldError(field);
    } else {
        validatePassword(field);
    }
}

// Utilidades para validación de campos
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

function markFieldValid(field) {
    clearFieldError(field);
    field.classList.add('is-valid');
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

// Función de debug para verificar localStorage
function debugLocalStorage() {
    const usersData = localStorage.getItem('users');
    console.log('=== DEBUG LOCALSTORAGE ===');
    console.log('Raw data:', usersData);
    if (usersData) {
        const parsed = JSON.parse(usersData);
        console.log('Parsed data:', parsed);
        console.log('Number of users:', parsed.length);
        console.log('Users list:', parsed);
    }
    console.log('=== END DEBUG ===');
}
