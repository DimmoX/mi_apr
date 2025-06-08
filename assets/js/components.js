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
        navbar: `${basePath}assets/components/navbar.html`,
        header: `${basePath}assets/components/header.html`,
        footer: `${basePath}assets/components/footer.html`,
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

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initializeComponents);