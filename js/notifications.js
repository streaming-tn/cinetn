// ============================================
// NOTIFICATIONS.JS - NEW CONTENT NOTIFICATIONS
// ============================================

// Get new content count (last 7 days)
async function getNewContentCount() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
            .from('series')
            .select('id')
            .gte('created_at', sevenDaysAgo.toISOString());

        if (error) throw error;
        return data.length;
    } catch (error) {
        console.error('Error getting new content count:', error);
        return 0;
    }
}

// Get new content list
async function getNewContent() {
    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data, error } = await supabase
            .from('series')
            .select('*')
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error getting new content:', error);
        return [];
    }
}

// Initialize notifications bell
async function initNotifications() {
    const headerContent = document.querySelector('.header-content');
    if (!headerContent) return;

    // Create notification bell
    const bellContainer = document.createElement('div');
    bellContainer.style.cssText = 'position: relative; cursor: pointer;';
    bellContainer.innerHTML = `
        <div id="notif-bell" style="font-size: 24px; position: relative;">
            🔔
            <span id="notif-badge" style="
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff6b6b;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 11px;
                display: none;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            "></span>
        </div>
        <div id="notif-dropdown" style="
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            margin-top: 10px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius-lg);
            min-width: 300px;
            max-width: 400px;
            max-height: 400px;
            overflow-y: auto;
            box-shadow: var(--shadow-xl);
            z-index: 1000;
        ">
            <div style="padding: var(--spacing-md); border-bottom: 1px solid var(--border-color);">
                <h3 style="margin: 0;">🔔 Nouveautés</h3>
            </div>
            <div id="notif-list" style="padding: var(--spacing-sm);"></div>
        </div>
    `;

    // Insert before search container
    const searchContainer = headerContent.querySelector('.search-container');
    if (searchContainer) {
        headerContent.insertBefore(bellContainer, searchContainer);
    } else {
        headerContent.appendChild(bellContainer);
    }

    // Load notification count
    const count = await getNewContentCount();
    const badge = document.getElementById('notif-badge');

    if (count > 0) {
        badge.textContent = count > 9 ? '9+' : count;
        badge.style.display = 'flex';
    }

    // Toggle dropdown
    const bell = document.getElementById('notif-bell');
    const dropdown = document.getElementById('notif-dropdown');

    bell.addEventListener('click', async (e) => {
        e.stopPropagation();

        if (dropdown.style.display === 'none') {
            // Load and show notifications
            const newContent = await getNewContent();
            renderNotifications(newContent);
            dropdown.style.display = 'block';

            // Clear badge after opening
            badge.style.display = 'none';
            badge.textContent = '0';
        } else {
            dropdown.style.display = 'none';
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!bellContainer.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// Render notifications
function renderNotifications(content) {
    const list = document.getElementById('notif-list');
    if (!list) return;

    if (content.length === 0) {
        list.innerHTML = `
            <div style="padding: var(--spacing-md); text-align: center; color: var(--text-secondary);">
                Aucune nouveauté cette semaine
            </div>
        `;
        return;
    }

    list.innerHTML = content.map(item => {
        const date = new Date(item.created_at);
        const timeAgo = getTimeAgo(date.toISOString());

        return `
            <div style="
                padding: var(--spacing-sm);
                border-bottom: 1px solid var(--border-color);
                cursor: pointer;
                transition: background var(--transition-base);
            " onclick="window.location.href='details.html?id=${item.id}'" onmouseover="this.style.background='var(--bg-tertiary)'" onmouseout="this.style.background='transparent'">
                <div style="font-weight: 600; margin-bottom: 4px;">${item.title}</div>
                <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                    ${item.type.toUpperCase()} • ${timeAgo}
                </div>
            </div>
        `;
    }).join('');
}

// Get time ago string
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'À l\'instant';
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;

    return date.toLocaleDateString('fr-FR');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initNotifications();
});
