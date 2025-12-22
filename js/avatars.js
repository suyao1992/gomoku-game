/**
 * avatars.js - 头像系统
 * 预设头像库和头像选择功能
 */

const AvatarSystem = {
    STORAGE_KEY: 'gomoku_player_avatar',

    // 预设头像列表 (使用emoji，无需额外图片资源)
    presets: [
        { id: 1, emoji: '🦊', name: '狐狸' },
        { id: 2, emoji: '🐼', name: '熊猫' },
        { id: 3, emoji: '🦁', name: '狮子' },
        { id: 4, emoji: '🐯', name: '老虎' },
        { id: 5, emoji: '🐲', name: '龙' },
        { id: 6, emoji: '🦅', name: '雄鹰' },
        { id: 7, emoji: '🐺', name: '狼' },
        { id: 8, emoji: '🦄', name: '独角兽' },
        { id: 9, emoji: '🐱', name: '猫咪' },
        { id: 10, emoji: '🐶', name: '狗狗' },
        { id: 11, emoji: '🦋', name: '蝴蝶' },
        { id: 12, emoji: '🌸', name: '樱花' }
    ],

    // 获取当前头像
    getCurrent() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            const avatar = this.presets.find(a => a.id === parseInt(saved));
            if (avatar) return avatar;
        }
        // 默认返回第一个
        return this.presets[0];
    },

    // 保存头像选择
    save(avatarId) {
        localStorage.setItem(this.STORAGE_KEY, avatarId.toString());
    },

    // 根据ID获取头像
    getById(id) {
        return this.presets.find(a => a.id === parseInt(id)) || this.presets[0];
    },

    // 获取所有头像
    getAll() {
        return this.presets;
    },

    // 渲染头像选择器
    renderSelector(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const current = this.getCurrent();

        container.innerHTML = this.presets.map(avatar => `
            <div class="avatar-option ${avatar.id === current.id ? 'selected' : ''}" 
                 data-avatar-id="${avatar.id}"
                 title="${avatar.name}">
                <span class="avatar-emoji">${avatar.emoji}</span>
            </div>
        `).join('');

        // 绑定点击事件
        container.querySelectorAll('.avatar-option').forEach(option => {
            option.addEventListener('click', () => {
                const avatarId = parseInt(option.dataset.avatarId);
                this.save(avatarId);

                // 更新选中状态
                container.querySelectorAll('.avatar-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                option.classList.add('selected');

                // 更新预览
                this.updatePreview();
            });
        });
    },

    // 更新头像预览
    updatePreview() {
        const preview = document.getElementById('avatar-preview');
        if (preview) {
            const current = this.getCurrent();
            preview.textContent = current.emoji;
        }
    },

    // 初始化
    init() {
        // 渲染头像选择器
        this.renderSelector('avatar-selector');
        this.updatePreview();
    }
};

// 导出为全局变量
window.AvatarSystem = AvatarSystem;
