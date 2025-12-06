// ============================================
// COMMENTS.JS - COMMENTS SYSTEM
// ============================================

// Load comments for a content
async function loadComments(contentId) {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .eq('content_id', contentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error loading comments:', error);
        return [];
    }
}

// Add a comment
async function addComment(contentId, authorName, commentText, parentId = null) {
    if (!authorName.trim() || !commentText.trim()) {
        return { success: false, message: 'Nom et commentaire requis' };
    }

    try {
        const { error } = await supabase
            .from('comments')
            .insert([{
                content_id: contentId,
                parent_id: parentId,
                author_name: authorName.trim(),
                comment_text: commentText.trim()
            }]);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error adding comment:', error);
        return { success: false, message: 'Erreur lors de l\'ajout du commentaire' };
    }
}

// Delete a comment (admin only in practice, but open for now)
async function deleteComment(commentId) {
    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', commentId);

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting comment:', error);
        return { success: false, message: 'Erreur lors de la suppression' };
    }
}

// Render comments with replies
function renderComments(comments, contentId) {
    const container = document.getElementById('comments-list');
    if (!container) return;

    // Separate parent comments and replies
    const parentComments = comments.filter(c => !c.parent_id);
    const replies = comments.filter(c => c.parent_id);

    if (parentComments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-xl); color: var(--text-secondary);">
                💬 Aucun commentaire pour le moment. Soyez le premier à commenter !
            </div>
        `;
        return;
    }

    container.innerHTML = parentComments.map(comment => {
        const commentReplies = replies.filter(r => r.parent_id === comment.id);
        const timeAgo = getTimeAgo(comment.created_at);

        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <span class="comment-author">👤 ${escapeHtml(comment.author_name)}</span>
                    <span class="comment-time">${timeAgo}</span>
                </div>
                <div class="comment-text">${escapeHtml(comment.comment_text)}</div>
                <div class="comment-actions">
                    <button class="comment-action-btn" onclick="showReplyForm('${comment.id}')">
                        💬 Répondre
                    </button>
                </div>
                
                <!-- Reply form (hidden by default) -->
                <div id="reply-form-${comment.id}" class="reply-form" style="display: none;">
                    <input type="text" class="reply-name-input" placeholder="Votre nom" maxlength="50">
                    <textarea class="reply-text-input" placeholder="Votre réponse..." rows="3" maxlength="500"></textarea>
                    <div style="display: flex; gap: var(--spacing-sm); margin-top: var(--spacing-sm);">
                        <button class="btn btn-primary btn-sm" onclick="submitReply('${comment.id}', '${contentId}')">
                            Envoyer
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="hideReplyForm('${comment.id}')">
                            Annuler
                        </button>
                    </div>
                </div>

                <!-- Replies -->
                ${commentReplies.length > 0 ? `
                    <div class="comment-replies">
                        ${commentReplies.map(reply => `
                            <div class="comment-item comment-reply" data-comment-id="${reply.id}">
                                <div class="comment-header">
                                    <span class="comment-author">👤 ${escapeHtml(reply.author_name)}</span>
                                    <span class="comment-time">${getTimeAgo(reply.created_at)}</span>
                                </div>
                                <div class="comment-text">${escapeHtml(reply.comment_text)}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Show reply form
function showReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form) form.style.display = 'block';
}

// Hide reply form
function hideReplyForm(commentId) {
    const form = document.getElementById(`reply-form-${commentId}`);
    if (form) {
        form.style.display = 'none';
        form.querySelector('.reply-name-input').value = '';
        form.querySelector('.reply-text-input').value = '';
    }
}

// Submit reply
async function submitReply(parentId, contentId) {
    const form = document.getElementById(`reply-form-${parentId}`);
    const name = form.querySelector('.reply-name-input').value;
    const text = form.querySelector('.reply-text-input').value;

    const result = await addComment(contentId, name, text, parentId);

    if (result.success) {
        hideReplyForm(parentId);
        await refreshComments(contentId);
    } else {
        alert(result.message);
    }
}

// Handle delete comment
async function handleDeleteComment(commentId, contentId) {
    if (!confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;

    const result = await deleteComment(commentId);

    if (result.success) {
        await refreshComments(contentId);
    } else {
        alert(result.message);
    }
}

// Refresh comments
async function refreshComments(contentId) {
    const comments = await loadComments(contentId);
    renderComments(comments, contentId);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
