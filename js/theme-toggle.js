// ============================================
// THEME-TOGGLE.JS - DARK/LIGHT MODE TOGGLE
// ============================================

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    createThemeToggle();
});

function initTheme() {
    // Get saved theme or default to dark
    const savedTheme = localStorage.getItem('cinetn_theme') || 'dark';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.classList.add('light-mode');
    } else {
        document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('cinetn_theme', theme);
}

function toggleTheme() {
    const isLight = document.documentElement.classList.contains('light-mode');
    applyTheme(isLight ? 'dark' : 'light');
}

function createThemeToggle() {
    // Find header content div
    const headerContent = document.querySelector('.header-content');
    if (!headerContent) return;

    // Create toggle button
    const toggleBtn = document.createElement('div');
    toggleBtn.className = 'theme-toggle';
    toggleBtn.onclick = toggleTheme;
    toggleBtn.title = 'Changer le thème';

    toggleBtn.innerHTML = `
        <div class="theme-toggle-slider">
            <span class="theme-toggle-icon">🌙</span>
        </div>
    `;

    // Insert before search container
    const searchContainer = headerContent.querySelector('.search-container');
    if (searchContainer) {
        headerContent.insertBefore(toggleBtn, searchContainer);
    } else {
        headerContent.appendChild(toggleBtn);
    }

    // Update icon based on current theme
    updateToggleIcon();
}

function updateToggleIcon() {
    const icon = document.querySelector('.theme-toggle-icon');
    if (!icon) return;

    const isLight = document.documentElement.classList.contains('light-mode');
    icon.textContent = isLight ? '☀️' : '🌙';
}

// Update icon when theme changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
            updateToggleIcon();
        }
    });
});

observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
});
