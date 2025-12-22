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
    }
};

window.AvatarSystem = AvatarSystem;
