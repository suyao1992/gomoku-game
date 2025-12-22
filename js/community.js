/**
 * 棋友圈社区模块
 * 管理社区弹窗的显示、帖子列表、发帖、评论等功能
 */

const Community = (function () {
    // 状态
    let currentTab = 'all';
    let currentPage = 1;
    let currentPost = null;
    let isLoading = false;
    let hasMore = true;

    // 类型映射
    const TYPE_MAP = {
        all: { label: '全部', icon: '💬' },
        discussion: { label: '讨论', icon: '💬' },
        battle: { label: '约战', icon: '⚔️' },
        replay: { label: '棋谱', icon: '📋' },
        announcement: { label: '公告', icon: '📢' }
    };

    /**
     * 初始化
     */
    function init() {
        // 绑定标签切换事件
        document.querySelectorAll('.community-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const type = tab.dataset.type;
                switchTab(type);
            });
        });

        // 绑定加载更多
        const loadMoreBtn = document.getElementById('community-load-more');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMore);
        }

        // 绑定发帖按钮
        const createBtn = document.getElementById('community-create-btn');
        if (createBtn) {
            createBtn.addEventListener('click', showCreateForm);
        }

        // 绑定关闭按钮
        const closeBtn = document.getElementById('community-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', hide);
        }

        // === 通知功能 ===
        const notifBtn = document.getElementById('community-notif-btn');
        if (notifBtn) {
            notifBtn.addEventListener('click', toggleNotifPanel);
        }

        const notifReadAllBtn = document.getElementById('community-notif-readall');
        if (notifReadAllBtn) {
            notifReadAllBtn.addEventListener('click', markAllNotificationsRead);
        }

        // === 搜索功能 ===
        const searchBtn = document.getElementById('community-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', toggleSearchBox);
        }

        const searchInput = document.getElementById('community-search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                clearTimeout(searchTimeout);

                // 显示/隐藏清除按钮
                document.getElementById('community-search-clear')?.classList.toggle('hidden', !query);

                if (query.length >= 2) {
                    searchTimeout = setTimeout(() => searchPosts(query), 300);
                } else if (query.length === 0) {
                    loadPosts(true); // 恢复正常列表
                }
            });

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = e.target.value.trim();
                    if (query.length >= 2) {
                        searchPosts(query);
                    }
                }
            });
        }

        const searchClearBtn = document.getElementById('community-search-clear');
        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                const input = document.getElementById('community-search-input');
                if (input) {
                    input.value = '';
                    searchClearBtn.classList.add('hidden');
                    loadPosts(true);
                }
            });
        }

        // 点击其他区域关闭通知面板
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('community-notif-panel');
            const btn = document.getElementById('community-notif-btn');
            if (panel && !panel.classList.contains('hidden') &&
                !panel.contains(e.target) && !btn?.contains(e.target)) {
                panel.classList.add('hidden');
            }
        });

        // 同步用户
        CommunityAPI.syncUser().catch(console.error);
    }

    /**
     * 显示社区弹窗
     */
    function show() {
        const modal = document.getElementById('community-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // 加载帖子
            loadPosts(true);
        }
    }

    /**
     * 隐藏社区弹窗
     */
    function hide() {
        const modal = document.getElementById('community-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        // 返回列表视图
        showListView();
    }

    /**
     * 切换标签
     */
    function switchTab(type) {
        currentTab = type;
        currentPage = 1;
        hasMore = true;

        // 更新标签样式
        document.querySelectorAll('.community-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });

        // 重新加载帖子
        loadPosts(true);
    }

    /**
     * 加载帖子列表
     */
    async function loadPosts(reset = false) {
        if (isLoading) return;

        if (reset) {
            currentPage = 1;
            hasMore = true;
            document.getElementById('community-posts-list').innerHTML = '';
        }

        if (!hasMore) return;

        isLoading = true;
        showLoading(true);

        try {
            const params = {
                page: currentPage,
                pageSize: 10
            };
            if (currentTab !== 'all') {
                params.type = currentTab;
            }

            const result = await CommunityAPI.getPosts(params);

            if (result.success) {
                renderPosts(result.data, reset);
                hasMore = result.pagination.hasMore;
                currentPage++;

                // 更新加载更多按钮
                const loadMoreBtn = document.getElementById('community-load-more');
                if (loadMoreBtn) {
                    loadMoreBtn.style.display = hasMore ? 'block' : 'none';
                }
            }
        } catch (error) {
            console.error('Load posts error:', error);
            showToast('加载失败: ' + error.message, 'error');
        } finally {
            isLoading = false;
            showLoading(false);
        }
    }

    /**
     * 加载更多
     */
    function loadMore() {
        loadPosts(false);
    }

    /**
     * 渲染帖子列表
     */
    function renderPosts(posts, reset) {
        const container = document.getElementById('community-posts-list');
        if (!container) return;

        if (reset && posts.length === 0) {
            container.innerHTML = `
                <div class="community-empty">
                    <div class="empty-icon">📭</div>
                    <div class="empty-text">暂无帖子</div>
                    <div class="empty-hint">来发布第一条吧！</div>
                </div>
            `;
            return;
        }

        const html = posts.map(post => renderPostCard(post)).join('');

        if (reset) {
            container.innerHTML = html;
        } else {
            container.insertAdjacentHTML('beforeend', html);
        }

        // 绑定点击事件
        container.querySelectorAll('.post-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // 忽略按钮点击
                if (e.target.closest('.post-action-btn')) return;
                const postId = card.dataset.id;
                openPost(postId);
            });
        });

        // 绑定点赞事件
        container.querySelectorAll('.post-like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = btn.closest('.post-card').dataset.id;
                toggleLike('post', postId, btn);
            });
        });

        // 绑定接受约战事件
        container.querySelectorAll('.post-accept-battle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const postId = btn.closest('.post-card').dataset.id;
                acceptBattle(postId);
            });
        });
    }

    /**
     * 渲染单个帖子卡片
     */
    function renderPostCard(post) {
        const typeInfo = TYPE_MAP[post.type] || TYPE_MAP.discussion;
        const timeAgo = getRelativeTime(post.createdAt);
        const images = post.images || [];

        let battleSection = '';
        if (post.type === 'battle' && post.battleStatus === 'open') {
            battleSection = `
                <button class="post-accept-battle-btn">🎮 接受挑战</button>
            `;
        } else if (post.type === 'battle' && post.battleStatus === 'matched') {
            battleSection = `<span class="battle-status matched">对战中</span>`;
        } else if (post.type === 'battle' && post.battleStatus === 'finished') {
            battleSection = `<span class="battle-status finished">已结束</span>`;
        }

        return `
            <div class="post-card ${post.isPinned ? 'pinned' : ''}" data-id="${post.id}">
                ${post.isPinned ? '<div class="post-pinned-badge">📌 置顶</div>' : ''}
                <div class="post-header">
                    <div class="post-author">
                        <span class="author-avatar">${escapeHtml(post.author.avatar)}</span>
                        <span class="author-name">${escapeHtml(post.author.name)}</span>
                        <span class="author-elo">${post.author.elo}</span>
                    </div>
                    <div class="post-meta">
                        <span class="post-type-badge ${post.type}">${typeInfo.icon}</span>
                        <span class="post-time">${timeAgo}</span>
                    </div>
                </div>
                <div class="post-title">${escapeHtml(post.title)}</div>
                <div class="post-content">${escapeHtml(post.content)}</div>
                ${images.length > 0 ? `
                    <div class="post-images">
                        ${images.slice(0, 3).map(img => `
                            <img src="${CommunityAPI.getImageUrl(img)}" alt="图片" class="post-image" />
                        `).join('')}
                    </div>
                ` : ''}
                ${battleSection}
                <div class="post-actions">
                    <button class="post-action-btn post-like-btn ${post.isLiked ? 'liked' : ''}">
                        <span class="action-icon">${post.isLiked ? '❤️' : '🤍'}</span>
                        <span class="action-count">${post.likesCount}</span>
                    </button>
                    <button class="post-action-btn">
                        <span class="action-icon">💬</span>
                        <span class="action-count">${post.commentsCount}</span>
                    </button>
                    <button class="post-action-btn">
                        <span class="action-icon">👁</span>
                        <span class="action-count">${post.viewsCount}</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 打开帖子详情
     */
    async function openPost(postId) {
        showLoading(true);

        try {
            const result = await CommunityAPI.getPost(postId);
            if (result.success) {
                currentPost = result.data;
                renderPostDetail(result.data);
                showDetailView();
                loadComments(postId);
            }
        } catch (error) {
            console.error('Open post error:', error);
            showToast('加载失败', 'error');
        } finally {
            showLoading(false);
        }
    }

    /**
     * 渲染帖子详情
     */
    function renderPostDetail(post) {
        const container = document.getElementById('community-post-detail');
        if (!container) return;

        const typeInfo = TYPE_MAP[post.type] || TYPE_MAP.discussion;
        const user = CommunityAPI.getCurrentUser();
        const isOwner = post.author.id === user.id;

        container.innerHTML = `
            <div class="post-detail-header">
                <button class="back-btn" onclick="Community.showListView()">← 返回</button>
                ${isOwner ? `
                    <button class="delete-btn" onclick="Community.deletePost('${post.id}')">🗑️ 删除</button>
                ` : `
                    <button class="report-btn" onclick="Community.showReportForm('post', '${post.id}')">🚩 举报</button>
                `}
            </div>
            <div class="post-detail-content">
                <div class="post-author-large">
                    <span class="author-avatar large">${escapeHtml(post.author.avatar)}</span>
                    <div class="author-info">
                        <span class="author-name">${escapeHtml(post.author.name)}</span>
                        <span class="author-elo">ELO ${post.author.elo}</span>
                    </div>
                    <span class="post-type-badge ${post.type}">${typeInfo.icon} ${typeInfo.label}</span>
                </div>
                <h2 class="post-title-large">${escapeHtml(post.title)}</h2>
                <div class="post-content-full">${escapeHtml(post.content)}</div>
                ${post.images && post.images.length > 0 ? `
                    <div class="post-images-large">
                        ${post.images.map(img => `
                            <img src="${CommunityAPI.getImageUrl(img)}" alt="图片" class="post-image-large" onclick="Community.showImageViewer(this.src)" />
                        `).join('')}
                    </div>
                ` : ''}
                <div class="post-meta-footer">
                    <span>${getRelativeTime(post.createdAt)}</span>
                    <span>·</span>
                    <span>${post.viewsCount} 次浏览</span>
                </div>
                <div class="post-actions-large">
                    <button class="action-btn-large ${post.isLiked ? 'liked' : ''}" onclick="Community.toggleLike('post', '${post.id}', this)">
                        ${post.isLiked ? '❤️' : '🤍'} ${post.likesCount}
                    </button>
                </div>
            </div>
            <div class="comments-section">
                <h3 class="comments-title">💬 评论 (${post.commentsCount})</h3>
                <div id="comments-list" class="comments-list">
                    <div class="comments-loading">加载中...</div>
                </div>
                <div class="comment-input-section">
                    <textarea id="comment-input" class="comment-input" placeholder="写下你的评论..." maxlength="500"></textarea>
                    <button class="comment-submit-btn" onclick="Community.submitComment()">发送</button>
                </div>
            </div>
        `;
    }

    /**
     * 加载评论
     */
    async function loadComments(postId) {
        const container = document.getElementById('comments-list');
        try {
            const result = await CommunityAPI.getComments(postId);
            if (result.success) {
                const html = renderComments(result.data.comments);
                if (container) {
                    container.innerHTML = html;
                }
            }
        } catch (error) {
            console.error('Load comments error:', error);
            if (container) {
                container.innerHTML = '<div class="no-comments">加载评论失败</div>';
            }
        }
    }

    /**
     * 渲染评论 (支持嵌套)
     */
    function renderComments(comments, depth = 0) {
        if (!comments || comments.length === 0) {
            return '<div class="no-comments">暂无评论，快来抢沙发！</div>';
        }

        return comments.map(comment => {
            const repliesHtml = comment.replies && comment.replies.length > 0
                ? `<div class="comment-replies">${renderComments(comment.replies, depth + 1)}</div>`
                : '';

            const replyToHtml = comment.replyTo
                ? `<span class="reply-to">回复 @${escapeHtml(comment.replyTo.name)}</span>`
                : '';

            return `
                <div class="comment-item" data-id="${comment.id}" data-depth="${depth}">
                    <div class="comment-header">
                        <span class="comment-avatar">${escapeHtml(comment.author.avatar)}</span>
                        <span class="comment-author">${escapeHtml(comment.author.name)}</span>
                        ${replyToHtml}
                        <span class="comment-time">${getRelativeTime(comment.createdAt)}</span>
                    </div>
                    <div class="comment-content">${escapeHtml(comment.content)}</div>
                    <div class="comment-actions">
                        <button class="comment-action-btn ${comment.isLiked ? 'liked' : ''}" 
                                onclick="Community.toggleLike('comment', '${comment.id}', this)">
                            ${comment.isLiked ? '❤️' : '🤍'} ${comment.likesCount}
                        </button>
                        <button class="comment-action-btn" 
                                onclick="Community.replyToComment('${comment.id}', '${escapeHtml(comment.author.name)}')">
                            💬 回复
                        </button>
                    </div>
                    ${repliesHtml}
                </div>
            `;
        }).join('');
    }

    /**
     * 显示发帖表单
     */
    function showCreateForm() {
        const createView = document.getElementById('community-create-view');
        const listView = document.getElementById('community-list-view');
        const detailView = document.getElementById('community-detail-view');

        if (listView) listView.classList.add('hidden');
        if (detailView) detailView.classList.add('hidden');
        if (createView) createView.classList.remove('hidden');

        // 重置表单
        document.getElementById('create-post-type').value = 'discussion';
        document.getElementById('create-post-title').value = '';
        document.getElementById('create-post-content').value = '';
        document.getElementById('create-post-images').innerHTML = '';
    }

    /**
     * 隐藏发帖表单，显示列表
     */
    function showListView() {
        const createView = document.getElementById('community-create-view');
        const listView = document.getElementById('community-list-view');
        const detailView = document.getElementById('community-detail-view');

        if (createView) createView.classList.add('hidden');
        if (detailView) detailView.classList.add('hidden');
        if (listView) listView.classList.remove('hidden');
    }

    /**
     * 显示帖子详情视图
     */
    function showDetailView() {
        const createView = document.getElementById('community-create-view');
        const listView = document.getElementById('community-list-view');
        const detailView = document.getElementById('community-detail-view');

        if (createView) createView.classList.add('hidden');
        if (listView) listView.classList.add('hidden');
        if (detailView) detailView.classList.remove('hidden');
    }

    /**
     * 提交帖子
     */
    async function submitPost() {
        const type = document.getElementById('create-post-type').value;
        const title = document.getElementById('create-post-title').value.trim();
        const content = document.getElementById('create-post-content').value.trim();

        if (!title) {
            showToast('请输入标题', 'warning');
            return;
        }
        if (!content) {
            showToast('请输入内容', 'warning');
            return;
        }

        const submitBtn = document.getElementById('create-post-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = '发布中...';

        try {
            // 收集已上传的图片
            const images = [];
            document.querySelectorAll('#create-post-images .uploaded-image').forEach(img => {
                images.push(img.dataset.url);
            });

            const data = { type, title, content };
            if (images.length > 0) {
                data.images = images;
            }

            const result = await CommunityAPI.createPost(data);
            if (result.success) {
                showToast('发布成功！', 'success');
                showListView();
                loadPosts(true);
            }
        } catch (error) {
            console.error('Create post error:', error);
            showToast(error.message || '发布失败', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '发布';
        }
    }

    /**
     * 提交评论
     */
    async function submitComment() {
        if (!currentPost) return;

        const input = document.getElementById('comment-input');
        const content = input.value.trim();

        if (!content) {
            showToast('请输入评论内容', 'warning');
            return;
        }

        try {
            const data = { content };

            // 检查是否是回复
            if (input.dataset.parentId) {
                data.parentId = input.dataset.parentId;
                data.replyToUserId = input.dataset.replyToUserId;
                data.replyToUserName = input.dataset.replyToUserName;
            }

            const result = await CommunityAPI.createComment(currentPost.id, data);
            if (result.success) {
                input.value = '';
                delete input.dataset.parentId;
                delete input.dataset.replyToUserId;
                delete input.dataset.replyToUserName;
                input.placeholder = '写下你的评论...';

                // 重新加载评论
                loadComments(currentPost.id);
                showToast('评论成功', 'success');
            }
        } catch (error) {
            console.error('Submit comment error:', error);
            showToast(error.message || '评论失败', 'error');
        }
    }

    /**
     * 回复评论
     */
    function replyToComment(commentId, authorName) {
        const input = document.getElementById('comment-input');
        if (input) {
            input.dataset.parentId = commentId;
            input.dataset.replyToUserName = authorName;
            input.placeholder = `回复 @${authorName}...`;
            input.focus();
        }
    }

    /**
     * 点赞/取消点赞
     */
    async function toggleLike(targetType, targetId, btn) {
        try {
            const result = await CommunityAPI.toggleLike(targetType, targetId);
            if (result.success) {
                const isLiked = result.data.liked;
                btn.classList.toggle('liked', isLiked);

                // 更新显示
                const countEl = btn.querySelector('.action-count') || btn;
                let count = parseInt(countEl.textContent.match(/\d+/)?.[0] || 0);
                count = isLiked ? count + 1 : count - 1;

                if (countEl.classList.contains('action-count')) {
                    countEl.textContent = count;
                    const iconEl = btn.querySelector('.action-icon');
                    if (iconEl) iconEl.textContent = isLiked ? '❤️' : '🤍';
                } else {
                    countEl.textContent = `${isLiked ? '❤️' : '🤍'} ${count}`;
                }
            }
        } catch (error) {
            console.error('Toggle like error:', error);
            showToast('操作失败', 'error');
        }
    }

    /**
     * 删除帖子
     */
    async function deletePost(postId) {
        if (!confirm('确定要删除这篇帖子吗？')) return;

        try {
            const result = await CommunityAPI.deletePost(postId);
            if (result.success) {
                showToast('删除成功', 'success');
                showListView();
                loadPosts(true);
            }
        } catch (error) {
            console.error('Delete post error:', error);
            showToast(error.message || '删除失败', 'error');
        }
    }

    /**
     * 接受约战
     */
    async function acceptBattle(postId) {
        try {
            // 这里需要与游戏的房间创建逻辑集成
            showToast('正在创建对战房间...', 'info');

            // TODO: 调用游戏的创建房间逻辑
            // const roomCode = await game.createOnlineRoom();
            // await CommunityAPI.acceptBattle(postId);

            showToast('功能开发中...', 'warning');
        } catch (error) {
            console.error('Accept battle error:', error);
            showToast('创建房间失败', 'error');
        }
    }

    /**
     * 上传图片
     */
    async function uploadImage(file) {
        try {
            const result = await CommunityAPI.uploadImage(file);
            if (result.success) {
                return result.data.url;
            }
        } catch (error) {
            console.error('Upload image error:', error);
            showToast('上传失败: ' + error.message, 'error');
        }
        return null;
    }

    // ==================== 工具函数 ====================

    function getRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;

        return new Date(timestamp).toLocaleDateString('zh-CN');
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showLoading(show) {
        const loading = document.getElementById('community-loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    function showToast(message, type = 'info') {
        if (window.game && window.game.ui && window.game.ui.showToast) {
            window.game.ui.showToast(message, type);
        } else {
            console.log(`[${type}] ${message}`);
        }
    }

    // ==================== 通知功能 ====================

    /**
     * 切换通知面板
     */
    function toggleNotifPanel(e) {
        e.stopPropagation();
        const panel = document.getElementById('community-notif-panel');
        if (panel) {
            const isHidden = panel.classList.toggle('hidden');
            if (!isHidden) {
                loadNotifications();
            }
        }
    }

    /**
     * 加载通知列表
     */
    async function loadNotifications() {
        const list = document.getElementById('community-notif-list');
        if (!list) return;

        list.innerHTML = '<div class="notif-empty">加载中...</div>';

        try {
            const result = await CommunityAPI.getNotifications({ limit: 20 });
            if (result.success) {
                renderNotifications(result.data, list);
            }
        } catch (err) {
            console.error('Load notifications error:', err);
            list.innerHTML = '<div class="notif-empty">加载失败</div>';
        }
    }

    /**
     * 渲染通知列表
     */
    function renderNotifications(notifications, container) {
        if (!notifications || notifications.length === 0) {
            container.innerHTML = '<div class="notif-empty">暂无新消息</div>';
            return;
        }

        container.innerHTML = notifications.map(n => {
            const time = getRelativeTime(n.created_at);
            return `
                <div class="notif-item ${n.is_read ? '' : 'unread'}" 
                     data-id="${n.id}" 
                     data-post-id="${n.post_id || ''}"
                     onclick="Community.handleNotificationClick('${n.id}', '${n.post_id || ''}')">
                    <div class="notif-item-header">
                        <span class="notif-item-title">${escapeHtml(n.title)}</span>
                        <span class="notif-item-time">${time}</span>
                    </div>
                    ${n.content ? `<div class="notif-item-content">${escapeHtml(n.content)}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * 处理通知点击
     */
    async function handleNotificationClick(notifId, postId) {
        // 标记已读
        try {
            await CommunityAPI.markNotificationRead(notifId);
            document.querySelector(`.notif-item[data-id="${notifId}"]`)?.classList.remove('unread');
            updateUnreadBadge();
        } catch (e) { }

        // 关闭面板
        document.getElementById('community-notif-panel')?.classList.add('hidden');

        // 跳转到帖子
        if (postId) {
            openPost(postId);
        }
    }

    /**
     * 标记所有通知已读
     */
    async function markAllNotificationsRead() {
        try {
            await CommunityAPI.markAllNotificationsRead();
            document.querySelectorAll('.notif-item.unread').forEach(el => el.classList.remove('unread'));
            updateUnreadBadge();
            showToast('已全部标记为已读');
        } catch (err) {
            console.error('Mark all read error:', err);
        }
    }

    /**
     * 更新未读角标
     */
    async function updateUnreadBadge() {
        try {
            const result = await CommunityAPI.getUnreadCount();
            const badge = document.getElementById('community-notif-badge');
            if (badge && result.success) {
                const count = result.data.count || 0;
                badge.textContent = count > 99 ? '99+' : count;
                badge.classList.toggle('hidden', count === 0);
            }
        } catch (e) { }
    }

    // ==================== 搜索功能 ====================

    /**
     * 切换搜索框
     */
    function toggleSearchBox() {
        const box = document.getElementById('community-search-box');
        if (box) {
            box.classList.toggle('hidden');
            if (!box.classList.contains('hidden')) {
                document.getElementById('community-search-input')?.focus();
            }
        }
    }

    /**
     * 搜索帖子
     */
    let currentSearchQuery = '';
    async function searchPosts(query) {
        if (query.length < 2) return;

        currentSearchQuery = query;
        showLoading(true);

        try {
            const result = await CommunityAPI.searchPosts(query);
            if (result.success) {
                const list = document.getElementById('community-posts-list');
                if (list) {
                    if (result.data.length === 0) {
                        list.innerHTML = `<div class="no-posts">未找到相关帖子</div>`;
                    } else {
                        // 高亮搜索词
                        const highlightedPosts = result.data.map(p => ({
                            ...p,
                            title: highlightText(p.title, query),
                            content: highlightText(p.content, query)
                        }));
                        list.innerHTML = highlightedPosts.map(p => renderSearchResultCard(p)).join('');
                    }
                }
            }
        } catch (err) {
            console.error('Search error:', err);
            showToast('搜索失败', 'error');
        } finally {
            showLoading(false);
        }
    }

    /**
     * 高亮文本
     */
    function highlightText(text, keyword) {
        if (!text || !keyword) return text;
        const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    /**
     * 渲染搜索结果卡片
     */
    function renderSearchResultCard(post) {
        const time = getRelativeTime(post.createdAt);
        const typeInfo = TYPE_MAP[post.type] || { label: post.type, icon: '📝' };

        return `
            <div class="post-card" onclick="Community.openPost('${post.id}')">
                <div class="post-card-header">
                    <span class="post-type-badge">${typeInfo.icon}</span>
                    <span class="post-author">${escapeHtml(post.author?.name || '匿名')}</span>
                    <span class="post-time">${time}</span>
                </div>
                <div class="post-card-title">${post.title}</div>
                <div class="post-card-content">${post.content || ''}</div>
                <div class="post-card-footer">
                    <span>❤️ ${post.likesCount || 0}</span>
                    <span>💬 ${post.commentsCount || 0}</span>
                    <span>👁️ ${post.viewsCount || 0}</span>
                </div>
            </div>
        `;
    }

    // ==================== 公开 API ====================

    return {
        init,
        show,
        hide,
        showListView,
        showCreateForm,
        submitPost,
        submitComment,
        replyToComment,
        toggleLike,
        deletePost,
        acceptBattle,
        uploadImage,
        openPost,
        handleNotificationClick,
        showReportForm: (type, id) => {
            // TODO: 实现举报表单
            showToast('举报功能开发中', 'info');
        },
        showImageViewer: (src) => {
            // TODO: 实现图片查看器
            window.open(src, '_blank');
        }
    };
})();

// 导出到全局
window.Community = Community;

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，等待 DOM 完全加载
    setTimeout(() => {
        Community.init();
    }, 100);
});

/**
 * 处理图片上传 (全局函数，供 HTML onclick 调用)
 */
async function handleImageUpload(input) {
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const container = document.getElementById('create-post-images');

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        return;
    }

    // 检查文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过 5MB');
        return;
    }

    // 检查已上传数量
    if (container.querySelectorAll('.uploaded-image-wrapper').length >= 3) {
        alert('最多上传 3 张图片');
        return;
    }

    // 显示加载状态
    const loadingEl = document.createElement('div');
    loadingEl.className = 'image-uploading';
    loadingEl.innerHTML = '⏳ 上传中...';
    container.appendChild(loadingEl);

    try {
        const result = await CommunityAPI.uploadImage(file);
        if (result.success) {
            // 创建预览元素
            const wrapper = document.createElement('div');
            wrapper.className = 'uploaded-image-wrapper';
            wrapper.innerHTML = `
                <img src="${CommunityAPI.getImageUrl(result.data.url)}" 
                     alt="预览" 
                     class="uploaded-image" 
                     data-url="${result.data.url}" />
                <button type="button" class="remove-image-btn" onclick="removeUploadedImage(this)">✕</button>
            `;
            container.appendChild(wrapper);
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('上传失败: ' + error.message);
    } finally {
        loadingEl.remove();
        // 重置 input 以便可以再次选择同一文件
        input.value = '';
    }
}

/**
 * 移除已上传的图片
 */
function removeUploadedImage(btn) {
    btn.closest('.uploaded-image-wrapper').remove();
}
