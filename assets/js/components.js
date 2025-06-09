// Función para cargar componentes HTML
async function loadComponent(elementId, componentPath) {
    try {
        const response = await fetch(componentPath);
        const html = await response.text();
        document.getElementById(elementId).innerHTML = html;
        
        // Disparar evento personalizado para indicar que el componente se cargó
        const event = new CustomEvent('componentLoaded', {
            detail: { elementId: elementId }
        });
        document.dispatchEvent(event);
        
    } catch (error) {
        console.error('Error loading component:', elementId, error);
    }
}



// Función para detectar la ruta base correcta
function getBasePath() {
    const currentPath = window.location.pathname;
    const isInSubfolder = currentPath.includes('/perfiles/');
    return isInSubfolder ? '../' : '';
}

// Función para inicializar todos los componentes
function initializeComponents() {
    const basePath = getBasePath();
    
    const COMPONENT = {
        navbar2: `${basePath}assets/components/navbar2.html`,
        navbar: `${basePath}assets/components/navbar.html`,
        header: `${basePath}assets/components/header.html`,
        footer: `${basePath}assets/components/footer.html`
       
    }

    console.log('Base path detected:', basePath);
    console.log('Components to load:', COMPONENT);

    for (const [key, value] of Object.entries(COMPONENT)) {
        // Cargar cada componente si existe el elemento
        const element = document.getElementById(key);
        if (element) {
            loadComponent(key, value);
        }
    }
}


// lógica para NavBar

// Función para configurar las rutas del navbar según la ubicación actual
function setupNavbarPaths() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const isInSubfolder = currentPath.includes('/perfiles/');
    const isLoginPage = currentPage === 'login.html';
    
    // Determinar el prefijo de ruta
    const baseUrl = isInSubfolder ? '../' : '';
    
    // Configurar logo
    const logoImg = document.querySelector('#logo');
    if (logoImg) {
        const logoSrc = baseUrl + 'assets/img/logo.png';
        logoImg.src = logoSrc;
    }
    
    // Configurar brand link
    const brandLink = document.querySelector('.navbar-brand');
    if (brandLink) {
        const brandHref = baseUrl + 'index.html';
        brandLink.href = brandHref;
    }
    
    // Configurar enlaces de navegación
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link[data-page]');
    navLinks.forEach(link => {
        const page = link.getAttribute('data-page');
        if (page) {
            const fullUrl = baseUrl + page;
            link.href = fullUrl;
        }
    });

    // Gestionar botón de logout y visibilidad de "Iniciar Sesión" basado en estado de login
    addLogoutButton();
}

// Función para añadir funcionalidad de dropdown de usuario
function addLogoutButton() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const isInProfilePage = currentPath.includes('/perfiles/');
    const isLoginPage = currentPage === 'login.html';
    const isLoggedIn = localStorage.getItem('login') === 'true';
    
    // Obtener elementos del DOM
    const loginNavItem = document.getElementById('login-nav-item');
    const userDropdownNav = document.getElementById('user-dropdown-nav');
    const userNameSpan = document.getElementById('user-name');
    const userFullNameSpan = document.getElementById('user-full-name');
    
    if (isLoggedIn && !isLoginPage) {
        // Usuario logueado: mostrar dropdown, ocultar "Iniciar Sesión"
        if (loginNavItem) {
            loginNavItem.classList.add('completely-hidden');
            loginNavItem.style.display = 'none';
        }
        if (userDropdownNav) {
            userDropdownNav.classList.remove('completely-hidden');
            userDropdownNav.style.display = 'block';
            userDropdownNav.style.visibility = 'visible';
            userDropdownNav.style.position = 'static';
            userDropdownNav.style.left = 'auto';
        }
        
        // Obtener datos del usuario desde localStorage
        const fullNameUser = localStorage.getItem('name') + ' ' + localStorage.getItem('lastname');
        const userData = fullNameUser;
        console.log('User data:', userData);
        const userName = userData || 'Usuario';
        // const userFullName = `${userData.nombre || ''} ${userData.apellido || ''}`.trim() || 'Usuario';
        
        // Actualizar textos del dropdown
        if (userNameSpan) userNameSpan.textContent = userName;
        // if (userFullNameSpan) userFullNameSpan.textContent = userFullName;
        
        // Configurar enlaces del dropdown
        setupDropdownLinks(isInProfilePage);
        
    } else {
        // Usuario NO logueado: mostrar "Iniciar Sesión", ocultar dropdown
        if (loginNavItem) {
            loginNavItem.classList.remove('completely-hidden');
            loginNavItem.style.display = 'block';
            loginNavItem.style.visibility = 'visible';
            loginNavItem.style.position = 'static';
            loginNavItem.style.left = 'auto';
        }
        if (userDropdownNav) {
            userDropdownNav.classList.add('completely-hidden');
            userDropdownNav.style.display = 'none';
        }
    }
}

// Función para configurar los enlaces del dropdown
function setupDropdownLinks(isInProfilePage) {
    const baseUrl = isInProfilePage ? '../' : '';
    
    // Mi Cuenta - redirige a la página de perfil correspondiente
    const miCuentaLink = document.getElementById('mi-cuenta-link');
    if (miCuentaLink) {
        miCuentaLink.addEventListener('click', function(e) {
            e.preventDefault();
            const userRole = localStorage.getItem('role');
            window.location.href = `${baseUrl}perfiles/${userRole}.html`;
        });
    }
    
    // Modificar Perfil
    const modificarPerfilLink = document.getElementById('modificar-perfil-link');
    if (modificarPerfilLink) {
        modificarPerfilLink.addEventListener('click', function(e) {
            e.preventDefault();
            // TODO: Implementar página de modificación de perfil
            alert('Funcionalidad de modificar perfil en desarrollo');
        });
    }
    
    // Información de mi Servicio
    const infoServicioLink = document.getElementById('info-servicio-link');
    if (infoServicioLink) {
        infoServicioLink.addEventListener('click', function(e) {
            e.preventDefault();
            // TODO: Implementar página de información del servicio
            alert('Funcionalidad de información del servicio en desarrollo');
        });
    }
    
    // Lecturas de Medidores
    const lecturasLink = document.getElementById('lecturas-link');
    if (lecturasLink) {
        lecturasLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = `${baseUrl}lecturas.html`;
        });
    }
    
    // Cerrar Sesión
    const cerrarSesionLink = document.getElementById('cerrar-sesion-link');
    if (cerrarSesionLink) {
        // Remover event listeners previos para evitar duplicados
        const newCerrarSesionLink = cerrarSesionLink.cloneNode(true);
        cerrarSesionLink.parentNode.replaceChild(newCerrarSesionLink, cerrarSesionLink);
        
        newCerrarSesionLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                // Limpiar datos de sesión
                sessionStorage.clear();
                localStorage.removeItem('user');
                localStorage.removeItem('login');
                
                // Redirigir al inicio
                const redirectUrl = isInProfilePage ? '../index.html' : 'index.html';
                window.location.href = redirectUrl;
            }
        });
    }
}

// Event listener para detectar cambios en el estado de login
window.addEventListener('storage', function(e) {
    if (e.key === 'login') {
        // Re-ejecutar la configuración del navbar cuando cambie el estado de login
        addLogoutButton();
    }
});

// También escuchar cambios directos en la página actual
document.addEventListener('DOMContentLoaded', function() {
    initializeComponents();
    // Verificar estado de login cuando se carga cualquier página
    addLogoutButton();
});








// Ejecutar cuando el DOM esté listo
// document.addEventListener('DOMContentLoaded', initializeComponents);