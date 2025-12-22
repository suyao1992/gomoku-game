// ========== 多语言系统 (Localization) ==========

const Localization = {
    currentLang: 'zh', // Default

    // 字典 (Dictionary)
    translations: {
        zh: {
            "app.title": "五子棋遇！",
            "menu.quick_match": "快速匹配",
            "menu.create_room": "创建房间",
            "menu.join_room": "加入房间",
            "menu.pve": "人机对弈",
            "menu.story": "故事模式",
            "menu.spectate": "观战对局",
            "menu.history": "历史",
            "menu.leaderboard": "排行榜",
            "menu.feedback": "留言",
            "menu.community": "棋友圈",
            "menu.settings": "设置",

            "menu.quick_match_desc": "实时真人PK / 极速开局",
            "menu.create_room_title": "创建房间",
            "menu.create_room_desc": "邀请好友一起玩",
            "menu.join_room_title": "加入房间",
            "menu.join_room_desc": "输入房间码加入",
            "menu.status_online": "在线中",
            "menu.status_playing": "对战中",
            "menu.story_playing_suffix": "人在玩",
            "menu.contact_optional": "联系方式 (选填)",
            "menu.feedback_placeholder": "请写下您的建议或遇到的Bug...",

            "settings.title": "游戏设置",
            "settings.audio": "音频",
            "settings.music": "背景音乐",
            "settings.sound": "音效",
            "settings.language": "语言 / Language",
            "settings.about": "关于游戏",

            "leaderboard.title": "世界排行榜",
            "leaderboard.tab.all": "总榜",
            "leaderboard.tab.daily": "今日",
            "leaderboard.tab.hourly": "1小时",

            "rank.unranked": "尚未定级",
            "rank.bronze": "倔强青铜",
            "rank.silver": "秩序白银",
            "rank.gold": "荣耀黄金",
            "rank.platinum": "尊贵铂金",
            "rank.diamond": "永恒钻石",
            "rank.master": "至尊星耀",
            "rank.challenger": "最强王者"
        },
        en: {
            "app.title": "Gomoku Zero",
            "menu.quick_match": "Quick Match",
            "menu.create_room": "Create Room",
            "menu.join_room": "Join Room",
            "menu.pve": "Vs AI",
            "menu.story": "Story Mode",
            "menu.spectate": "Spectate",
            "menu.history": "History",
            "menu.leaderboard": "Rankings",
            "menu.feedback": "Feedback",
            "menu.community": "Community",
            "menu.settings": "Settings",

            "menu.quick_match_desc": "Real-time PK / Fast Start",
            "menu.create_room_title": "Create Room",
            "menu.create_room_desc": "Invite Friends",
            "menu.join_room_title": "Join Room",
            "menu.join_room_desc": "Enter Room Code",
            "menu.status_online": "Online",
            "menu.status_playing": "Playing",
            "menu.story_playing_suffix": "Playing",
            "menu.contact_optional": "Contact (Optional)",
            "menu.feedback_placeholder": "Write your suggestions or bugs...",

            "settings.title": "Settings",
            "settings.audio": "Audio",
            "settings.music": "Music",
            "settings.sound": "Sound FX",
            "settings.language": "Language",
            "settings.about": "About",

            "leaderboard.title": "Leaderboard",
            "leaderboard.tab.all": "All Time",
            "leaderboard.tab.daily": "Daily",
            "leaderboard.tab.hourly": "Hourly",

            "rank.unranked": "Unranked",
            "rank.bronze": "Bronze",
            "rank.silver": "Silver",
            "rank.gold": "Gold",
            "rank.platinum": "Platinum",
            "rank.diamond": "Diamond",
            "rank.master": "Master",
            "rank.challenger": "Challenger"
        },
        ja: {
            "app.title": "五目並べ",
            "menu.quick_match": "クイックマッチ",
            "menu.create_room": "部屋を作成",
            "menu.join_room": "部屋に参加",
            "menu.pve": "AI対戦",
            "menu.story": "ストーリー",
            "menu.spectate": "観戦",
            "menu.history": "履歴",
            "menu.leaderboard": "ランキング",
            "menu.feedback": "FB",
            "menu.community": "コミュニティ",
            "menu.settings": "設定",

            "menu.quick_match_desc": "リアルタイム対戦 / 即開始",
            "menu.create_room_title": "部屋を作成",
            "menu.create_room_desc": "友達を招待",
            "menu.join_room_title": "部屋に参加",
            "menu.join_room_desc": "ルームコード入力",
            "menu.status_online": "オンライン",
            "menu.status_playing": "対戦中",
            "menu.story_playing_suffix": "人がプレイ中",
            "menu.contact_optional": "連絡先 (任意)",
            "menu.feedback_placeholder": "提案やバグを書いてください...",

            "settings.title": "設定",
            "settings.audio": "オーディオ",
            "settings.music": "音楽",
            "settings.sound": "効果音",
            "settings.language": "言語 (Language)",
            "settings.about": "ゲームについて",

            "leaderboard.title": "ランキング",
            "leaderboard.tab.all": "総合",
            "leaderboard.tab.daily": "今日",
            "leaderboard.tab.hourly": "1時間",

            "rank.unranked": "未ランク",
            "rank.bronze": "ブロンズ",
            "rank.silver": "シルバー",
            "rank.gold": "ゴールド",
            "rank.platinum": "プラチナ",
            "rank.diamond": "ダイヤモンド",
            "rank.master": "マスター",
            "rank.challenger": "チャレンジャー"
        },
        ko: {
            "app.title": "오목",
            "menu.quick_match": "빠른 매치",
            "menu.create_room": "방 만들기",
            "menu.join_room": "방 참가",
            "menu.pve": "AI 대전",
            "menu.story": "스토리",
            "menu.spectate": "관전",
            "menu.history": "기록",
            "menu.leaderboard": "랭킹",
            "menu.feedback": "피드백",
            "menu.community": "커뮤니티",
            "menu.settings": "설정",

            "menu.quick_match_desc": "실시간 대전 / 빠른 시작",
            "menu.create_room_title": "방 만들기",
            "menu.create_room_desc": "친구 초대",
            "menu.join_room_title": "방 참가",
            "menu.join_room_desc": "방 코드 입력",
            "menu.status_online": "접속",
            "menu.status_playing": "대국",
            "menu.story_playing_suffix": "명 플레이 중",
            "menu.contact_optional": "연락처 (선택)",
            "menu.feedback_placeholder": "제안이나 버그를 적어주세요...",

            "settings.title": "설정",
            "settings.audio": "오디오",
            "settings.music": "배경음",
            "settings.sound": "효과음",
            "settings.language": "언어 (Language)",
            "settings.about": "게임 정보",

            "leaderboard.title": "랭킹",
            "leaderboard.tab.all": "전체",
            "leaderboard.tab.daily": "오늘",
            "leaderboard.tab.hourly": "1시간",

            "rank.unranked": "미배치",
            "rank.bronze": "브론즈",
            "rank.silver": "실버",
            "rank.gold": "골드",
            "rank.platinum": "플래티넘",
            "rank.diamond": "다이아몬드",
            "rank.master": "마스터",
            "rank.challenger": "챌린저"
        }
    },

    init() {
        // Load saved language or detect
        const saved = localStorage.getItem('gomoku_language');
        if (saved && this.translations[saved]) {
            this.currentLang = saved;
        } else {
            // Detect
            const browserLang = navigator.language.slice(0, 2);
            if (this.translations[browserLang]) {
                this.currentLang = browserLang;
            }
        }

        console.log(`[Localization] Initialized with ${this.currentLang}`);
        this.updatePage();
        this.updateSelector();
    },

    setLanguage(lang) {
        if (!this.translations[lang]) return;
        this.currentLang = lang;
        localStorage.setItem('gomoku_language', lang);
        this.updatePage();
        this.updateSelector(); // Sync UI if changed via code

        // Dispatch event for other components (like Rank Display)
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    },

    // Translate helper
    t(key) {
        return this.translations[this.currentLang][key] || key;
    },

    // Update all distinct elements
    updatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const text = this.t(key);

            // Handle placeholders if needed (simple replacement for now)
            // If element has children check if we should replace text content only or innerHTML
            // For safety, let's use textContent by default unless we mark it safe.
            // But some buttons have icons.

            // Special handling for buttons with icons/structure
            if (el.children.length > 0) {
                // If it has a specific child for text, target that.
                // Or if it's a mix... logic needed.
                // Assuming simple text replacement for now, or use dedicated span.

                // Try to find a span or div inside? 
                // Let's assume most data-i18n are on the specific text node container.
                // If the element IS the container, replace text.

                // Check if the element has specific structure we know
                // e.g. .dock-label
                const label = el.querySelector('.dock-label') || el.querySelector('.hero-title') || el.querySelector('.card-title') || el.querySelector('.btn-title');
                if (label) {
                    label.textContent = text;
                } else {
                    // Fallback: If it has children but no known label class, try to find the text node?
                    // This is risky. 
                    // Better approach: Modify HTML to put data-i18n on the specific SPAN/DIV containing text.
                    // For now, assume data-i18n is placed correctly on the text container.
                    el.textContent = text;
                }
            } else {
                el.textContent = text;
            }
        });

        // Update Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // Update Title
        document.title = this.t('app.title');
    },

    updateSelector() {
        const selector = document.getElementById('setting-language-select');
        if (selector) {
            selector.value = this.currentLang;
        }
    }
};

window.Localization = Localization;

document.addEventListener('DOMContentLoaded', () => {
    Localization.init();
});
