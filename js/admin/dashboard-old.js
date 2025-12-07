// ============================================
// DASHBOARD.JS - ADMIN STATISTICS DASHBOARD
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        await Promise.all([
            loadTotalStats(),
            loadTypeChart(),
            loadTopContent()
        ]);
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadTotalStats() {
    try {
        // Total content
        const { data: allContent, error: contentError } = await supabase
            .from('series')
            .select('id, type');

        if (contentError) throw contentError;

        document.getElementById('total-content').textContent = allContent.length;

        // Total views
        const { data: views, error: viewsError } = await supabase
            .from('content_views')
            .select('view_count');

        if (viewsError) throw viewsError;

        const totalViews = views.reduce((sum, item) => sum + (item.view_count || 0), 0);
        document.getElementById('total-views').textContent = totalViews.toLocaleString();

        // Popular content (>100 views)
        const popularCount = views.filter(v => v.view_count > 100).length;
        document.getElementById('popular-count').textContent = popularCount;

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

    } catch (error) {
        console.error('Error loading total stats:', error);
    }
}

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
                            }
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error loading type chart:', error);
    }
}

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
                    year
                )
            `)
            .order('view_count', { ascending: false })
            .limit(10);

        if (viewsError) throw viewsError;

        const tbody = document.getElementById('top-content-body');

        if (!views || views.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">Aucune donnée disponible</td></tr>';
            return;
        }

        tbody.innerHTML = views.map((item, index) => `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td>${item.series?.title || 'N/A'}</td>
                <td>${item.series?.type?.toUpperCase() || 'N/A'}</td>
                <td>${item.series?.year || 'N/A'}</td>
                <td><strong>${item.view_count.toLocaleString()}</strong></td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error loading top content:', error);
        document.getElementById('top-content-body').innerHTML =
            '<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">Erreur lors du chargement</td></tr>';
    }
}
