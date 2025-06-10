// Script para gestión de lecturas de medidores de agua
// Funcionalidad basada en roles: admin/funcionario ven todo, cliente solo sus lecturas

let lecturasData = [];
let usuariosData = [];
let currentUser = null;
let filteredLecturas = [];

// Cargar datos cuando se inicia la página
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    try {
        // Verificar autenticación de usuario
        if (!checkAuthentication()) {
            return;
        }

        // Cargar datos
        await loadData();
        
        // Configurar interfaz según rol
        setupUserInterface();
        
        // Mostrar lecturas
        displayLecturas();
        
        // Configurar filtros
        setupFilters();
        
        // Actualizar estadísticas
        updateStatistics();
        
    } catch (error) {
        console.error('Error al inicializar la página:', error);
        showAlert('Error al cargar los datos. Por favor, recarga la página.', 'danger');
    }
}

function checkAuthentication() {
    const isLoggedIn = localStorage.getItem('login') === 'true';
    const userName = localStorage.getItem('name');
    const userRole = localStorage.getItem('role');
    const userEmail = localStorage.getItem('email');
    
    if (!isLoggedIn || !userName || !userRole) {
        showAlert('Debes iniciar sesión para acceder a esta página.', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return false;
    }
    
    // Crear objeto usuario con los datos del localStorage
    currentUser = {
        name: localStorage.getItem('name'),
        lastname: localStorage.getItem('lastname'),
        phone: localStorage.getItem('phone'),
        email: localStorage.getItem('email'),
        role: localStorage.getItem('role'),
        // Mantener compatibilidad con nombres alternativos
        nombre: localStorage.getItem('name'),
        apellido: localStorage.getItem('lastname'),
        tipo: localStorage.getItem('role')
    };
    
    return true;
}

async function loadData() {
    try {
        // Cargar lecturas
        const lecturasResponse = await fetch('config/lecturas.json');

        console.log('Lecturas response:', lecturasResponse);

        if (!lecturasResponse.ok) {
            throw new Error('No se pudieron cargar las lecturas');
        }
        const lecturasJson = await lecturasResponse.json();
        lecturasData = lecturasJson.lecturas || [];

        console.log('Lecturas cargadas:', lecturasData);
        
        // Cargar usuarios
        const usuariosResponse = await fetch('config/users.json');
        if (usuariosResponse.status != 200) {
            throw new Error('No se pudieron cargar los usuarios');
        }
        const usuariosJson = await usuariosResponse.json();
        usuariosData = usuariosJson.users || [];
        
        // Obtener el ID del usuario actual basado en su email
        const userFromData = usuariosData.find(user => user.email === currentUser.email);
        if (userFromData) {
            currentUser.id = userFromData.id;
        }
        
    } catch (error) {
        console.error('Error al cargar datos:', error);
        throw error;
    }
}

function setupUserInterface() {
    // Mostrar información del usuario
    const userDisplay = document.getElementById('user-display');
    const roleDisplay = document.getElementById('role-display');
    const accessDisplay = document.getElementById('access-display');
    
    if (userDisplay) userDisplay.textContent = `${currentUser.nombre || currentUser.name} ${currentUser.apellido || currentUser.lastname}`;
    if (roleDisplay) roleDisplay.textContent = currentUser.tipo || currentUser.role;
    
    const isAdminOrFuncionario = ['admin', 'funcionario'].includes(currentUser.tipo || currentUser.role);
    
    if (accessDisplay) {
        accessDisplay.textContent = isAdminOrFuncionario ? 
            'Todas las lecturas del sistema' : 
            'Solo tus lecturas personales';
    }
    
    // Mostrar/ocultar elementos según el rol
    const btnNuevaLectura = document.getElementById('btn-nueva-lectura');
    const filtroUsuarioContainer = document.getElementById('filtro-usuario-container');
    const thUsuario = document.getElementById('th-usuario');
    
    if (isAdminOrFuncionario) {
        if (btnNuevaLectura) btnNuevaLectura.style.display = 'inline-block';
        if (filtroUsuarioContainer) filtroUsuarioContainer.style.display = 'block';
        if (thUsuario) thUsuario.style.display = 'table-cell';
        setupUsuarioFilter();
    }
}

function setupUsuarioFilter() {
    const filtroUsuario = document.getElementById('filtro-usuario');
    if (!filtroUsuario) return;
    
    // Limpiar opciones existentes (excepto la primera)
    filtroUsuario.innerHTML = '<option value="">Todos los usuarios</option>';
    
    // Agregar usuarios
    usuariosData.forEach(usuario => {
        const option = document.createElement('option');
        option.value = usuario.id;
        option.textContent = `${usuario.name} ${usuario.lastname} (${usuario.role})`;
        filtroUsuario.appendChild(option);
    });
}

function getFilteredLecturas() {
    let lecturas = [...lecturasData];
    
    // Filtrar por usuario si no es admin/funcionario
    const isAdminOrFuncionario = ['admin', 'funcionario'].includes(currentUser.tipo || currentUser.role);
    if (!isAdminOrFuncionario) {
        lecturas = lecturas.filter(lectura => lectura.idUsuario === currentUser.id);
    }
    
    // Aplicar filtros adicionales
    const filtroFecha = document.getElementById('filtro-fecha')?.value;
    const filtroUsuario = document.getElementById('filtro-usuario')?.value;
    
    if (filtroFecha) {
        lecturas = lecturas.filter(lectura => {
            const fechaLectura = new Date(lectura.fechaLectura);
            const filtroDate = new Date(filtroFecha + '-01');
            return fechaLectura.getFullYear() === filtroDate.getFullYear() && 
                   fechaLectura.getMonth() === filtroDate.getMonth();
        });
    }
    
    if (filtroUsuario) {
        lecturas = lecturas.filter(lectura => lectura.idUsuario === parseInt(filtroUsuario));
    }
    
    // Ordenar por fecha más reciente primero
    lecturas.sort((a, b) => new Date(b.fechaLectura) - new Date(a.fechaLectura));
    
    return lecturas;
}

function displayLecturas() {
    filteredLecturas = getFilteredLecturas();
    const tbody = document.getElementById('tabla-lecturas');
    const noDataMessage = document.getElementById('no-data-message');
    
    if (!tbody) return;
    
    if (filteredLecturas.length === 0) {
        tbody.innerHTML = '';
        if (noDataMessage) noDataMessage.style.display = 'block';
        return;
    }
    
    if (noDataMessage) noDataMessage.style.display = 'none';
    
    const isAdminOrFuncionario = ['admin', 'funcionario'].includes(currentUser.tipo || currentUser.role);
    
    tbody.innerHTML = filteredLecturas.map(lectura => {
        const usuario = usuariosData.find(u => u.id === lectura.idUsuario);
        const nombreUsuario = usuario ? `${usuario.name} ${usuario.lastname}` : 'Usuario no encontrado';
        
        const estadoBadge = getEstadoBadge(lectura.estado);
        const consumoColor = getConsumoColor(lectura.consumo);
        
        return `
            <tr>
                <td><span class="badge bg-secondary">${lectura.id}</span></td>
                <td><strong>${lectura.idMedidor}</strong></td>
                ${isAdminOrFuncionario ? `<td>${nombreUsuario}</td>` : ''}
                <td>${formatDate(lectura.fechaLectura)}</td>
                <td>${lectura.horaLectura}</td>
                <td><span class="text-muted">${lectura.lecturaAnterior.toFixed(2)} m³</span></td>
                <td><strong>${lectura.lecturaActual.toFixed(2)} m³</strong></td>
                <td><span class="badge ${consumoColor}">${lectura.consumo.toFixed(2)} m³</span></td>
                <td>
                    <small class="text-muted">
                        ${lectura.observaciones || 'Sin observaciones'}
                    </small>
                </td>
                <td>${estadoBadge}</td>
            </tr>
        `;
    }).join('');
}

function getEstadoBadge(estado) {
    const badges = {
        'completada': '<span class="badge bg-success">✅ Completada</span>',
        'pendiente': '<span class="badge bg-warning">⏳ Pendiente</span>',
        'revisión': '<span class="badge bg-info">🔍 En Revisión</span>',
        'error': '<span class="badge bg-danger">❌ Error</span>'
    };
    return badges[estado] || '<span class="badge bg-secondary">❓ Desconocido</span>';
}

function getConsumoColor(consumo) {
    if (consumo <= 20) return 'bg-success';
    if (consumo <= 25) return 'bg-warning';
    return 'bg-danger';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function setupFilters() {
    // Configurar fecha por defecto al mes actual
    const filtroFecha = document.getElementById('filtro-fecha');
    if (filtroFecha) {
        const now = new Date();
        const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        filtroFecha.value = yearMonth;
    }
}

function filtrarLecturas() {
    displayLecturas();
    updateStatistics();
}

function updateStatistics() {
    const totalLecturas = document.getElementById('total-lecturas');
    const consumoPromedio = document.getElementById('consumo-promedio');
    const ultimoConsumo = document.getElementById('ultimo-consumo');
    const ultimaFecha = document.getElementById('ultima-fecha');
    
    if (filteredLecturas.length === 0) {
        if (totalLecturas) totalLecturas.textContent = '0';
        if (consumoPromedio) consumoPromedio.textContent = '0 m³';
        if (ultimoConsumo) ultimoConsumo.textContent = '0 m³';
        if (ultimaFecha) ultimaFecha.textContent = '-';
        return;
    }
    
    // Total lecturas
    if (totalLecturas) totalLecturas.textContent = filteredLecturas.length;
    
    // Consumo promedio
    const promedioConsumo = filteredLecturas.reduce((sum, lectura) => sum + lectura.consumo, 0) / filteredLecturas.length;
    if (consumoPromedio) consumoPromedio.textContent = `${promedioConsumo.toFixed(2)} m³`;
    
    // Último consumo y fecha
    const ultimaLectura = filteredLecturas[0]; // Ya está ordenado por fecha más reciente
    if (ultimoConsumo) ultimoConsumo.textContent = `${ultimaLectura.consumo.toFixed(2)} m³`;
    if (ultimaFecha) ultimaFecha.textContent = formatDate(ultimaLectura.fechaLectura);
}

function exportarDatos() {
    alert ('Funcionalidad de exportación en desarrollo.');
}

function nuevaLectura() {
    const modal = new bootstrap.Modal(document.getElementById('modalNuevaLectura'));
    
    // Cargar usuarios en el select
    const selectUsuario = document.getElementById('nuevo-usuario');
    if (selectUsuario) {
        selectUsuario.innerHTML = '<option value="">Seleccionar usuario...</option>';
        usuariosData.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = `${usuario.name} ${usuario.lastname}`;
            selectUsuario.appendChild(option);
        });
    }
    
    // Configurar fecha y hora por defecto
    const fechaInput = document.getElementById('nueva-fecha');
    const horaInput = document.getElementById('nueva-hora');
    
    if (fechaInput) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }
    
    if (horaInput) {
        const now = new Date();
        const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        horaInput.value = timeString;
    }
    
    modal.show();
}

function guardarNuevaLectura() {
    const form = document.getElementById('form-nueva-lectura');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const lecturaAnterior = parseFloat(document.getElementById('nueva-lectura-anterior').value);
    const lecturaActual = parseFloat(document.getElementById('nueva-lectura-actual').value);
    
    if (lecturaActual <= lecturaAnterior) {
        showAlert('La lectura actual debe ser mayor que la lectura anterior.', 'danger');
        return;
    }
    
    const consumo = lecturaActual - lecturaAnterior;
    
    const nuevaLectura = {
        id: Math.max(...lecturasData.map(l => l.id)) + 1,
        idUsuario: parseInt(document.getElementById('nuevo-usuario').value),
        idMedidor: document.getElementById('nuevo-medidor').value,
        fechaLectura: document.getElementById('nueva-fecha').value,
        horaLectura: document.getElementById('nueva-hora').value,
        lecturaAnterior: lecturaAnterior,
        lecturaActual: lecturaActual,
        consumo: consumo,
        observaciones: document.getElementById('nuevas-observaciones').value,
        estado: 'completada'
    };

    console.log('Nueva lectura a guardar:', nuevaLectura);
    
    // Simular guardado (en un entorno real, esto se enviaría al servidor)
    lecturasData.unshift(nuevaLectura);
    
    // Cerrar modal y actualizar vista
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalNuevaLectura'));
    modal.hide();
    
    // Limpiar formulario
    form.reset();
    
    // Actualizar vista
    displayLecturas();
    updateStatistics();
    
    showAlert('Nueva lectura guardada exitosamente.', 'success');
}

function showAlert(message, type = 'info') {
    // Crear y mostrar alerta temporal
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
