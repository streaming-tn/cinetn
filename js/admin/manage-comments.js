// ============================================
// MANAGE-COMMENTS.JS - ADMIN COMMENTS MANAGEMENT
// ============================================

let allComments = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    await loadComments();
});

async function loadComments() {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                series:content_id (
                    title
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        allComments = data || [];
        updateCounts();
        renderComments();

    } catch (error) {
        console.error('Error loading comments:', error);
        document.getElementById('comments-tbody').innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-secondary);">
                    ❌ Erreur lors du chargement
                </td>
            </tr>
        `;
    }
}

function updateCounts() {
    const parentCount = allComments.filter(c => !c.parent_id).length;
    const replyCount = allComments.filter(c => c.parent_id).length;

    document.getElementById('count-all').textContent = allComments.length;
    document.getElementById('count-parent').textContent = parentCount;
    document.getElementById('count-reply').textContent = replyCount;
}

function filterComments(filter) {
    currentFilter = filter;
    renderComments();
}

function renderComments() {
    const tbody = document.getElementById('comments-tbody');

    let filtered = allComments;
    if (currentFilter === 'parent') {
        filtered = allComments.filter(c => !c.parent_id);
    } else if (currentFilter === 'reply') {
        filtered = allComments.filter(c => c.parent_id);
    }

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: var(--spacing-xl);">
                    Aucun commentaire
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(comment => {
        const date = new Date(comment.created_at);
        const formattedDate = date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR');
        const isReply = comment.parent_id ? true : false;

        return `
            <tr>
                <td><strong>${escapeHtml(comment.author_name)}</strong></td>
                <td>
                    <div class="comment-preview" title="${escapeHtml(comment.comment_text)}">
                        ${escapeHtml(comment.comment_text)}
                    </div>
                </td>
                <td>${comment.series?.title || 'N/A'}</td>
                <td style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                    ${formattedDate}
                </td>
                <td>
                    ${isReply ? '<span class="reply-badge">RÉPONSE</span>' : '<span style="color: var(--text-secondary);">Commentaire</span>'}
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="deleteComment('${comment.id}')">
                        🗑️ Supprimer
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

async function deleteComment(commentId) {
    if (!confirm('Voulez-vous vraiment supprimer ce commentaire et ses réponses ?')) return;

    try {
        // Delete the comment (CASCADE will delete replies automatically)
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) {
            console.error('Delete error:', error);
            throw error;
        }

        console.log('Comment deleted successfully');

        // Reload the page to refresh the list
        window.location.reload();

    } catch (error) {
        console.error('Error deleting comment:', error);
        alert('❌ Erreur: ' + (error.message || 'Erreur lors de la suppression'));
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
