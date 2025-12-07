// ============================================
// TOAST NOTIFICATIONS - CINÉ TN
// ============================================

class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type: success, error, info, warning
     * @param {number} duration - Duration in ms (default: 3000)
     */
    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = this.getIcon(type);

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Fermer">×</button>
        `;

        // Add to container
        this.container.appendChild(toast);

        // Close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hide(toast));

        // Show animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto hide
        if (duration > 0) {
            setTimeout(() => this.hide(toast), duration);
        }

        return toast;
    }

    /**
     * Hide a toast
     * @param {HTMLElement} toast - Toast element to hide
     */
    hide(toast) {
        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    /**
     * Get icon for toast type
     * @param {string} type - Toast type
     * @returns {string} Icon HTML
     */
    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Convenience methods
     */
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }

    /**
     * Clear all toasts
     */
    clearAll() {
        const toasts = this.container.querySelectorAll('.toast');
        toasts.forEach(toast => this.hide(toast));
    }
}

// Global instance
const toast = new ToastManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ToastManager, toast };
}
