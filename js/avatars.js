// avatars.js - 头像系统预设
// ==========================================

const AvatarSystem = {
    presets: [
        { id: 1, emoji: '🦊', name: Localization.get('avatar.fox') },
        { id: 2, emoji: '🐼', name: Localization.get('avatar.panda') },
        { id: 3, emoji: '🦁', name: Localization.get('avatar.lion') },
        { id: 4, emoji: '🐯', name: Localization.get('avatar.tiger') },
        { id: 5, emoji: '🐲', name: Localization.get('avatar.dragon') },
        { id: 6, emoji: '🦅', name: Localization.get('avatar.eagle') },
        { id: 7, emoji: '🐺', name: Localization.get('avatar.wolf') },
        { id: 8, emoji: '🦄', name: Localization.get('avatar.unicorn') },
        { id: 9, emoji: '🐱', name: Localization.get('avatar.cat') },
        { id: 10, emoji: '🐶', name: Localization.get('avatar.dog') },
        { id: 11, emoji: '🦋', name: Localization.get('avatar.butterfly') },
        { id: 12, emoji: '🌸', name: Localization.get('avatar.sakura') }
    ],

    STORAGE_KEY: 'gomoku_user_avatar_id',

    // 获取当前头像
    getCurrent() {
        const id = parseInt(localStorage.getItem(this.STORAGE_KEY)) || 1;
        return this.presets.find(a => a.id === id) || this.presets[0];
    },

    // 保存头像
    save(id) {
        localStorage.setItem(this.STORAGE_KEY, id);
        // 如果联网，可以在这里同步到 Firebase
        if (window.Network && Network.myPlayerId) {
            // Network.updateMyInfo({ avatar: this.presets.find(a => a.id === id).emoji });
        }
    },

    // 初始化头像选择器 (用于注册界面)
    init() {
        const previewEl = document.getElementById('avatar-preview');
        const selectorEl = document.getElementById('avatar-selector');

        if (!previewEl || !selectorEl) {
            console.warn('[AvatarSystem] Preview or selector element not found');
            return;
        }

        // 获取当前头像
        const current = this.getCurrent();

        // 更新预览
        previewEl.textContent = current.emoji;

        // 渲染头像网格
        selectorEl.innerHTML = this.presets.map(avatar => `
            <div class="avatar-option ${avatar.id === current.id ? 'selected' : ''}" 
                 data-avatar-id="${avatar.id}"
                 title="${avatar.name}">
                ${avatar.emoji}
            </div>
        `).join('');

        // 绑定点击事件
        selectorEl.addEventListener('click', (e) => {
            const option = e.target.closest('.avatar-option');
            if (!option) return;

            const avatarId = parseInt(option.dataset.avatarId);
            const selected = this.presets.find(a => a.id === avatarId);

            if (selected) {
                // 更新预览
                previewEl.textContent = selected.emoji;

                // 更新选中状态
                selectorEl.querySelectorAll('.avatar-option').forEach(el => {
                    el.classList.remove('selected');
                });
                option.classList.add('selected');

                // 保存选择
                this.save(avatarId);
            }
        });
    }
};

window.AvatarSystem = AvatarSystem;
