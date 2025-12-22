/**
 * 棋友圈 API 客户端
 * 封装与 Cloudflare Worker 的通信
 */

const CommunityAPI = (function () {
    // API 基础地址
    const API_BASE = 'https://gomoku-community-api.suyao1992.workers.dev';

    /**
     * 获取当前用户信息
     */
    function getCurrentUser() {
        const name = window.Onboarding?.getPlayerName?.() || localStorage.getItem('gomoku_player_name') || '匿名用户';
        const avatar = window.AvatarSystem?.getCurrent?.()?.emoji || localStorage.getItem('gomoku_player_avatar') || '🎮';
        // 优先使用 gomoku_user_id (游戏主 ID)，然后尝试 gomoku_player_id，最后生成新的
        const id = localStorage.getItem('gomoku_user_id') || localStorage.getItem('gomoku_player_id') || generateUserId();
        const elo = window.PlayerStats?.data?.competitive?.elo || 1000;

        return { id, name, avatar, elo };
    }

    /**
     * 生成用户ID
     */
    function generateUserId() {
        // 使用 gomoku_user_id 作为主 key，与游戏其他模块保持一致
        let id = localStorage.getItem('gomoku_user_id');
        if (!id) {
            id = Math.floor(100000 + Math.random() * 900000).toString();
            localStorage.setItem('gomoku_user_id', id);
        }
        return id;
    }

    /**
     * 发送 API 请求
     */
    async function request(endpoint, options = {}) {
        const user = getCurrentUser();

        const headers = {
            'Content-Type': 'application/json',
            'X-User-Id': user.id,
            'X-User-Name': encodeURIComponent(user.name),
            'X-User-Avatar': encodeURIComponent(user.avatar),
            ...options.headers
        };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '请求失败');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    /**
     * 上传文件
     */
    async function uploadFile(file) {
        const user = getCurrentUser();
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: {
                'X-User-Id': user.id,
                'X-User-Name': encodeURIComponent(user.name),
                'X-User-Avatar': encodeURIComponent(user.avatar)
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || '上传失败');
        }
        return data;
    }

    // ==================== 公开 API ====================

    return {
        // 用户
        syncUser: () => request('/api/users/sync', {
            method: 'POST',
            body: JSON.stringify(getCurrentUser())
        }),

        getUser: (id) => request(`/api/users/${id}`),

        // 帖子
        getPosts: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return request(`/api/posts?${query}`);
        },

        getPost: (id) => request(`/api/posts/${id}`),

        createPost: (data) => request('/api/posts', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

        deletePost: (id) => request(`/api/posts/${id}`, {
            method: 'DELETE'
        }),

        // 评论
        getComments: (postId) => request(`/api/posts/${postId}/comments`),

        createComment: (postId, data) => request(`/api/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify(data)
        }),

        deleteComment: (id) => request(`/api/comments/${id}`, {
            method: 'DELETE'
        }),

        // 互动
        toggleLike: (targetType, targetId) => request('/api/likes', {
            method: 'POST',
            body: JSON.stringify({ targetType, targetId })
        }),

        report: (targetType, targetId, reason, details) => request('/api/reports', {
            method: 'POST',
            body: JSON.stringify({ targetType, targetId, reason, details })
        }),

        // 图片
        uploadImage: uploadFile,

        // 工具
        getCurrentUser,
        getImageUrl: (path) => `${API_BASE}${path}`,

        // 约战相关
        acceptBattle: (postId) => request(`/api/battle/accept/${postId}`, {
            method: 'POST'
        }),

        // 通知
        getNotifications: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return request(`/api/notifications?${query}`);
        },

        getUnreadCount: () => request('/api/notifications/unread-count'),

        markNotificationRead: (id) => request(`/api/notifications/read/${id}`, {
            method: 'POST'
        }),

        markAllNotificationsRead: () => request('/api/notifications/read-all', {
            method: 'POST'
        }),

        // 搜索
        searchPosts: (query) => request(`/api/posts/search?q=${encodeURIComponent(query)}`),

        // 用户搜索 (用于 @)
        searchUsers: (query) => request(`/api/users/search?q=${encodeURIComponent(query)}`)
    };
})();

// 导出到全局
window.CommunityAPI = CommunityAPI;
