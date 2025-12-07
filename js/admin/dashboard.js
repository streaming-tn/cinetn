// ============================================
// DASHBOARD-V1.JS - ENHANCED ADMIN DASHBOARD
// ============================================

let currentTab = 'recent';

document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        await Promise.all([
            loadEnhancedStats(),
            loadTypeChart(),
            loadGenresChart(),
            loadTopContent(),
            loadRecentActivity()
        ]);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ============================================
// ENHANCED STATISTICS
// ============================================

async function loadEnhancedStats() {
    try {
        // Total content
        const { data: allContent, error: contentError } = await supabase
            .from('series')
            .select('id, type, genres');

        if (contentError) throw contentError;

        document.getElementById('total-content').textContent = allContent.length;

        // Total episodes
        const { data: episodes, error: episodesError } = await supabase
            .from('episodes')
            .select('id');

        if (episodesError) throw episodesError;

        document.getElementById('total-episodes').textContent = episodes.length;

        // Total views
        const { data: views, error: viewsError } = await supabase
            .from('content_views')
            .select('view_count');

        if (viewsError) throw viewsError;

        const totalViews = views.reduce((sum, item) => sum + (item.view_count || 0), 0);
        document.getElementById('total-views').textContent = totalViews.toLocaleString();

        // Total comments
        const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select('id');

        if (commentsError) throw commentsError;

        document.getElementById('total-comments').textContent = comments.length;

        // Active users (unique user IDs in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: activities, error: activitiesError } = await supabase
            .from('user_activity')
            .select('user_id')
            .gte('last_watched', thirtyDaysAgo.toISOString());

        if (activitiesError) throw activitiesError;

        const uniqueUsers = new Set(activities.map(a => a.user_id));
        document.getElementById('active-users').textContent = uniqueUsers.size;

        // Total unique genres
        const allGenres = new Set();
        allContent.forEach(content => {
            if (content.genres && Array.isArray(content.genres)) {
                content.genres.forEach(genre => allGenres.add(genre));
            }
        });

        document.getElementById('total-genres').textContent = allGenres.size;

    } catch (error) {
        console.error('Error loading enhanced stats:', error);
    }
}

// ============================================
// TYPE CHART (Doughnut)
// ============================================

async function loadTypeChart() {
    try {
        const { data: allContent, error } = await supabase
            .from('series')
            .select('type');

        if (error) throw error;

        // Count by type
        const typeCounts = allContent.reduce((acc, item) => {
            const type = item.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        // Create chart
        const ctx = document.getElementById('type-chart');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(typeCounts).map(t => t.toUpperCase()),
                datasets: [{
                    data: Object.values(typeCounts),
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(237, 100, 166, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(75, 192, 192, 0.8)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(237, 100, 166, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(75, 192, 192, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#fff',
                            font: {
                                size: 14
                            },
                            padding: 15
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error loading type chart:', error);
    }
}

// ============================================
// GENRES CHART (Bar)
// ============================================

async function loadGenresChart() {
    try {
        const { data: allContent, error } = await supabase
            .from('series')
            .select('genres');

        if (error) throw error;

        // Count genres
        const genreCounts = {};
        allContent.forEach(content => {
            if (content.genres && Array.isArray(content.genres)) {
                content.genres.forEach(genre => {
                    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                });
            }
        });

        // Get top 5 genres
        const sortedGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const ctx = document.getElementById('genres-chart');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedGenres.map(([genre]) => genre),
                datasets: [{
                    label: 'Nombre de contenus',
                    data: sortedGenres.map(([, count]) => count),
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#fff',
                            stepSize: 1
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#fff'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error loading genres chart:', error);
    }
}

// ============================================
// TOP CONTENT TABLE
// ============================================

async function loadTopContent() {
    try {
        // Get content views with series data
        const { data: views, error: viewsError } = await supabase
            .from('content_views')
            .select(`
                content_id,
                view_count,
                series:content_id (
                    title,
                    type,
                    year,
                    rating
                )
            `)
            .order('view_count', { ascending: false })
            .limit(10);

        if (viewsError) throw viewsError;

        const tbody = document.getElementById('top-content-body');

        if (!views || views.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">Aucune donnée disponible</td></tr>';
            return;
        }

        tbody.innerHTML = views.map((item, index) => {
            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'rank-other';
            const rating = item.series?.rating ? `⭐ ${item.series.rating}` : 'N/A';

            return `
                <tr>
                    <td><span class="rank-badge ${rankClass}">${index + 1}</span></td>
                    <td><strong>${item.series?.title || 'N/A'}</strong></td>
                    <td>${item.series?.type?.toUpperCase() || 'N/A'}</td>
                    <td>${item.series?.year || 'N/A'}</td>
                    <td>${rating}</td>
                    <td><strong>${item.view_count.toLocaleString()}</strong></td>
                </tr>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading top content:', error);
        document.getElementById('top-content-body').innerHTML =
            '<tr><td colspan="6" style="text-align: center; color: var(--text-secondary);">Erreur lors du chargement</td></tr>';
    }
}

// ============================================
// RECENT ACTIVITY
// ============================================

async function loadRecentActivity() {
    try {
        const { data: recentContent, error } = await supabase
            .from('series')
            .select('title, type, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        displayRecentContent(recentContent);

    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

function displayRecentContent(content) {
    const container = document.getElementById('activity-content');

    if (!content || content.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aucune activité récente</p>';
        return;
    }

    container.innerHTML = content.map(item => {
        const icon = item.type === 'anime' ? '📺' : item.type === 'serie' ? '🎬' : '🎥';
        const timeAgo = getTimeAgo(new Date(item.created_at));

        return `
            <div class="activity-item">
                <div class="activity-icon">${icon}</div>
                <div class="activity-details">
                    <div class="activity-title">${item.title}</div>
                    <div class="activity-time">${item.type.toUpperCase()} • ${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');
}

async function loadRecentComments() {
    try {
        const { data: comments, error } = await supabase
            .from('comments')
            .select(`
                id,
                comment,
                created_at,
                user_id,
                series:content_id (
                    title
                )
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        displayRecentComments(comments);

    } catch (error) {
        console.error('Error loading recent comments:', error);
    }
}

function displayRecentComments(comments) {
    const container = document.getElementById('activity-content');

    if (!comments || comments.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Aucun commentaire récent</p>';
        return;
    }

    container.innerHTML = comments.map(item => {
        const timeAgo = getTimeAgo(new Date(item.created_at));
        const commentPreview = item.comment.length > 100 ? item.comment.substring(0, 100) + '...' : item.comment;

        return `
            <div class="activity-item">
                <div class="activity-icon">💬</div>
                <div class="activity-details">
                    <div class="activity-title">${item.series?.title || 'Contenu supprimé'}</div>
                    <div class="activity-time">${commentPreview}</div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================
// TAB SWITCHING
// ============================================

function switchTab(tab) {
    currentTab = tab;

    // Update active tab
    document.querySelectorAll('.activity-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Load content
    if (tab === 'recent') {
        loadRecentActivity();
    } else if (tab === 'comments') {
        loadRecentComments();
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' an' + (Math.floor(interval) > 1 ? 's' : '');

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' mois';

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' jour' + (Math.floor(interval) > 1 ? 's' : '');

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' heure' + (Math.floor(interval) > 1 ? 's' : '');

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minute' + (Math.floor(interval) > 1 ? 's' : '');

    return Math.floor(seconds) + ' seconde' + (Math.floor(seconds) > 1 ? 's' : '');
}
