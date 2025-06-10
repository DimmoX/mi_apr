// Función para marcar el link activo según la página actual
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link[data-page]');
    
    navLinks.forEach(link => {
        // Remover clase active de todos los links
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        
        // Obtener la página del atributo data-page
        const linkPage = link.getAttribute('data-page');
        
        // Verificar si coincide con la página actual
        if (linkPage === currentPage || 
            (currentPage === 'index.html' && linkPage === 'index.html') ||
            (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });
}

// Escuchar cuando se carga el navbar para activar la detección de página activa
document.addEventListener('componentLoaded', function(event) {
    if (event.detail.elementId === 'navbar') {
        // Usar requestAnimationFrame para asegurar que el DOM esté completamente renderizado
        requestAnimationFrame(() => {
            // Configurar todas las rutas del navbar
            setupNavbarPaths();
            // Luego establecer el enlace activo
            setActiveNavLink();
        });
    }
});

// Fallback para cuando no se use el sistema de componentes
window.addEventListener('load', () => {
    // Solo ejecutar si no se han cargado componentes dinámicamente
    setTimeout(() => {
        const existingActiveLinks = document.querySelectorAll('.navbar-nav .nav-link.active');
        if (existingActiveLinks.length === 0) {
            setActiveNavLink();
        }
    }, 100);
});

// Manejar enlaces que aún no tienen funcionalidad
document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar todos los enlaces que usan javascript:void(0)
    const placeholderLinks = document.querySelectorAll('a[href="javascript:void(0)"]');
    
    placeholderLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // console.log('Enlace clickeado:', link.textContent.trim());
        });
    });
});

document.addEventListener('DOMContentLoaded', async function() {
    let currentPath = window.location.pathname;
    let currentPage = currentPath.split('/').pop() || 'index.html';
    let currentDirectory = currentPath.split('/');
    let isInPerfilesDirectory = currentDirectory.includes('perfiles');

    let pagePerfil = currentPath.split('/')[2];
    console.log('pagePerfil:', pagePerfil);

    // Cargar usuarios desde el JSON si no existen en localStorage
    if (!localStorage.getItem('users')) {
        try {
            let basePath = isInPerfilesDirectory ? '../' : './';
            let usersList = await fetch(`${basePath}config/users.json`);
            let usersJson = await usersList.json();
            // Guardar solo el array de usuarios, no la estructura completa
            localStorage.setItem('users', JSON.stringify(usersJson.users || []));
            console.log('Usuarios cargados en localStorage');
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    }

    let isLogin = localStorage.getItem('login');
    let userRole = localStorage.getItem('role');

    // Verificar autenticación en páginas de perfiles
    if (isInPerfilesDirectory && !isLogin) {
        // Redirigir a la página de login si no está autenticado
        window.location.href = '../login.html';
    } else if (isLogin && isInPerfilesDirectory && pagePerfil && pagePerfil.split('.')[0] !== userRole) {
        window.location.href = '../noauth.html';
    }

    // Verificar acceso a páginas de administración
    if (currentPage === 'admin-users.html' && (!isLogin || userRole !== 'admin')) {
        window.location.href = 'noauth.html';
    }
});

    // let currentPath = window.location.pathname;
    // let currentPage = currentPath.split('/')[1];

    // console.log('currentPage sin function:', currentPage);