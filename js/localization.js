const Localization = {
  currentLang: 'zh', // Default

  // 字典 (Dictionary)
  translations: {
    zh: {
      "app.title": "五子棋遇！",
      "app.description": "五子棋遇 (GomokuZero) 是一款融合故事剧情与AI对弈的精品五子棋游戏。支持在线联机对战、ELO积分排位、人机切磋及独特的关卡挑战系统。",
      "app.keywords": "五子棋,在线五子棋,五子棋对战,Gomoku,GomokuZero,五子棋AI,五子棋教学,五子棋联机",
      "app.og_title": "五子棋遇！ | GomokuZero - 故事模式与在线对战",
      "app.og_description": "跟随AI助手“弈·零”一起成长，从入门到大师。支持实时联机、ELO匹配与深度故事剧情。",
      "app.logo": "五子棋遇",
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
      "menu.status_online": "在线中",
      "menu.status_playing": "对战中",
      "menu.story_playing_suffix": "人在玩",

      "settings.title": "游戏设置",
      "settings.audio": "音频",
      "settings.music": "背景音乐",
      "settings.sound": "音效",
      "settings.language": "语言 / Language",
      "settings.about": "关于游戏",

      "loading.init": "量子初始化中",
      "loading.status": "正在加载资源...",
      "loading.tip1": "正在建立量子连接...",
      "loading.tip2": "同步时空坐标...",
      "loading.tip3": "初始化神经网络...",
      "loading.tip4": "加载对弈核心...",
      "loading.tip5": "量子态就绪",

      "game.win": "🎉 恭喜通关！",
      "game.lose": "😢 挑战失败",
      "game.draw": "🤝 平局",
      "game.forbidden": "❌ 禁手判负！",
      "game.timeout": "⏱️ 超时判负！",

      "mission.rule": "📜 本关规则",
      "mission.goal": "🎯 任务目标",
      "mission.start": "开始对局",
      "mission.back": "返回",
      "mission.status.current": "进行中",
      "mission.status.finished": "已通关",
      "mission.action.retry": "重新体验",
      "mission.action.locked": "未解锁",

      "mission.m1.title": "第一关 · 居家会客书房",
      "mission.m1.shortTitle": "居家会客书房",
      "mission.m1.tagline": "在旧电脑中唤醒沉睡多年的弈·零",
      "mission.m2.title": "第二关 · 赛博朋克雨夜天台",
      "mission.m2.shortTitle": "赛博朋克雨夜天台",
      "mission.m2.tagline": "在城市霓虹之下测试彼此的极限",
      "mission.m3.title": "第三关 · 失落的古代遗迹",
      "mission.m3.shortTitle": "失落的古代遗迹",
      "mission.m3.tagline": "用棋路解读被埋藏的古老算法",
      "mission.m4.title": "第四关 · 深海海底神殿",
      "mission.m4.shortTitle": "深海海底神殿",
      "mission.m4.tagline": "在水下静压中检验你的冷静",
      "mission.m5.title": "第五关 · 数据核心世界",
      "mission.m5.shortTitle": "数据核心世界",
      "mission.m5.tagline": "直面弈·零的运算核心",
      "mission.m6.title": "第六关 · 火山口边缘",
      "mission.m6.shortTitle": "火山口边缘",
      "mission.m6.tagline": "每一步落子都像走在岩浆边缘",
      "mission.m7.title": "第七关 · 雪山之巅",
      "mission.m7.shortTitle": "雪山之巅",
      "mission.m7.tagline": "终局之战，决定人类与算法的未来",

      "rank.unranked": "尚未定级",
      "rank.bronze": "倔强青铜",
      "rank.silver": "秩序白银",
      "rank.gold": "荣耀黄金",
      "rank.platinum": "尊贵铂金",
      "rank.diamond": "永恒钻石",
      "rank.master": "至尊星耀",
      "rank.challenger": "最强王者",

      "leaderboard.title": "世界排行榜",
      "leaderboard.tab.all": "总榜",
      "leaderboard.tab.daily": "今日",
      "leaderboard.tab.hourly": "1小时",

      "menu.contact_optional": "联系方式 (选填)",
      "menu.feedback_placeholder": "请写下您的建议或遇到的Bug...",
      "menu.submit_feedback": "提交建议",
      "feedback.type.suggestion": "💡 建议",
      "feedback.type.bug": "🐛 Bug反馈",
      "feedback.type.question": "❓ 问题咨询",

      "onboarding.welcome": "欢迎来到五子棋遇！",
      "onboarding.subtitle": "与「弈·零」一起开启智慧之旅",
      "onboarding.name_label": "请输入您的名字",
      "onboarding.name_placeholder": "玩家",
      "onboarding.random_cn": "🎲 随机中文",
      "onboarding.random_en": "🎲 随机英文",
      "onboarding.name_hint": "名字将显示在游戏中（2-8个字符）",
      "onboarding.avatar_label": "选择头像",
      "onboarding.avatar_hint": "点击下方选择",
      "onboarding.start_game": "开始游戏",
      "loading.connection": "「 建立量子连接中 」",

      "mp.me": "你",
      "mp.opponent": "对手",
      "mp.mysterious_opponent": "神秘对手",
      "mp.waiting_for_turn": "👆 你的回合",
      "mp.thinking": "💭 思考中...",
      "mp.turn_mine": "轮到你了",
      "mp.turn_opponent": "对手回合",
      "mp.color_black": "⚫ 执黑",
      "mp.color_white": "⚪ 执白",
      "mp.color_first": "先手",
      "mp.color_second": "后手",
      "mp.moves_count": "落子: {COUNT}",
      "mp.undo": "⏪ 悔棋",
      "mp.draw": "🤝 求和",
      "mp.surrender": "🏳️ 认输",
      "mp.chat": "💬 聊天",
      "mp.chat_title": "💬 快捷聊天",
      "mp.close": "关闭",

      "mp.msg.hello": "👋 你好！",
      "mp.msg.good_job": "👍 下得好！",
      "mp.msg.wait": "⏳ 请稍等",
      "mp.msg.thinking": "🤔 我想想...",
      "mp.msg.amazing": "🔥 厉害！",
      "mp.msg.gg": "🤝 GG",
      "mp.msg.rematch": "🔄 再来一局？",
      "mp.msg.bye": "👋 下次再战",

      "mp.search.title": "◉ 量子搜索中...",
      "mp.search.subtitle": "正在寻找对手",
      "mp.search.expanding": "🔍 扩大搜索范围",
      "mp.search.expanding_sub": "正在寻找实力相近的对手",
      "mp.search.global": "🌐 全局搜索中",
      "mp.search.global_sub": "当前玩家较少，请耐心等待",
      "mp.search.few_players": "⏳ 玩家较少",
      "mp.search.few_players_sub": "请选择继续等待或预约匹配",
      "mp.search.empty": "暂无其他玩家在线",
      "mp.search.online_prefix": "🌐 当前在线: ",
      "mp.search.online_suffix": " 人",
      "mp.search.reserve": "📅 预约匹配",
      "mp.search.continue": "⏳ 继续等待",
      "mp.search.cancel": "❌ 取消匹配",
      "mp.search.found": "🤝 很高兴认识你 🤝",
      "mp.search.vs": "VS",
      "mp.search.starting": "「 对决即将开始 」",
      "mp.search.ready": "准备开始！",
      "mp.search.fate_wheel": "命运之轮旋转中...",

      "matchmaking.searching": "🔍 正在匹配对手...",
      "matchmaking.timer": "00:00",
      "matchmaking.cancel": "取消匹配",

      "lobby.title": "🌐 联机对战",
      "lobby.online_count": "在线玩家: {COUNT}",
      "lobby.create_room": "创建房间",
      "lobby.create_room_desc": "邀请好友一起玩",
      "lobby.join_room": "加入房间",
      "lobby.join_room_desc": "输入房间码加入",
      "lobby.quick_match": "快速匹配",
      "lobby.quick_match_desc": "随机匹配对手",
      "lobby.spectate": "观战对局",
      "lobby.spectate_desc": "观看进行中的对局",

      "room.title": "🎮 房间",
      "room.code_display": "房间码: {CODE}",
      "room.copy": "📋 复制",
      "room.player_host": "房主",
      "room.player_guest": "嘉宾",
      "room.waiting": "等待中...",
      "room.color_black": "执黑",
      "room.color_white": "执白",
      "room.ready_btn": "准备",
      "room.leave_btn": "退出房间",
      "room.join_btn": "加入房间",
      "room.waiting_opponent": "等待对手加入...",
      "room.code_label": "请输入6位房间码",
      "room.code_placeholder": "例如: ABC123",

      "spectate.title": "👁️ 观战大厅",
      "spectate.active_count": "正在进行的对局: {COUNT}",
      "spectate.empty": "暂无进行中的对局",
      "spectate.loading": "正在加载...",
      "spectate.refresh": "刷新",

      "community.title": "🏠 棋友圈",
      "community.tab.all": "💬 全部",
      "community.tab.battle": "⚔️ 约战",
      "community.tab.replay": "📋 棋谱",
      "community.tab.announcement": "📢 公告",
      "community.search": "搜索",
      "community.notification": "通知",

      "about.return_menu": "返回主菜单",
      "about.history_title": "纵横四千年：五子棋的\"前身今生\"",
      "about.history_subtitle": "从河图洛书，到 AI 时代",

      "leaderboard.subtitle": "TOP 10 玩家 · 按ELO排名",
      "leaderboard.loading": "🔄 加载中...",

      "community.empty_title": "暂无帖子",
      "community.empty_hint": "来发布第一条吧！",
      "community.loading": "加载中...",
      "community.load_failed": "加载失败",
      "community.no_notifications": "暂无新消息",
      "community.notif_title": "消息通知",
      "community.mark_all_read": "全部已读",
      "community.no_comments": "暂无评论，快来抢沙发！",
      "community.load_comments_failed": "加载评论失败",
      "community.views_count": "{COUNT} 次浏览",

      "time.just_now": "刚刚",
      "time.minutes_ago": "{COUNT}分钟前",
      "time.hours_ago": "{COUNT}小时前",
      "time.days_ago": "{COUNT}天前",

      "story.mission1.name": "第一关 · 居家书房",
      "story.mission1.subtitle": "初识弈·零",
      "story.mission1.rules": "执黑先手，无禁手规则，不限时，可悔棋5次。",
      "story.mission1.goal": "在棋盘上先连成五子获胜，完成与弈·零的第一次对局。",
      "story.mission2.name": "第二关 · 雨夜天台",
      "story.mission2.subtitle": "霓虹下的快棋",
      "story.mission2.rules": "执黑先手，每步限时30秒，无禁手规则，可悔棋2次。",
      "story.mission2.goal": "在时间压力下快速决策，击败弈·零完成本关。",
      "story.mission3.name": "第三关 · 失落遗迹",
      "story.mission3.subtitle": "禁手的真意",
      "story.mission3.rules": "执黑先手，禁手教学模式（阻止但不判负），古谱残局开局，不限时，可悔棋1次。",
      "story.mission3.goal": "学习识别三三、四四、长连禁手，并在残局中击败对手。",
      "story.mission4.name": "第四关 · 海底神殿",
      "story.mission4.subtitle": "深海的耐心",
      "story.mission4.rules": "执白后手，AI先下黑棋，无禁手规则，不限时，可悔棋1次。",
      "story.mission4.goal": "学会后手布局思维，在深海静压中耐心寻找反击机会。",
      "story.mission5.name": "第五关 · 数据核心",
      "story.mission5.subtitle": "信息洪流",
      "story.mission5.rules": "执白后手，总时限3分钟（每步+5秒），无禁手，不可悔棋，可用数据视图技能3次。",
      "story.mission5.goal": "在有限时间和AI辅助下击败对手，体验信息洪流中的决策。",
      "story.mission6.name": "第六关 · 火山口边缘",
      "story.mission6.subtitle": "熔岩中的禁忌",
      "story.mission6.rules": "执黑先手，劣势残局开局，严格禁手（禁手即负），每步限时25秒，不可悔棋。",
      "story.mission6.goal": "在劣势局面下逆转取胜，同时避免任何禁手，一招不慎满盘皆输！",
      "story.mission7.name": "第七关 · 雪山之巅",
      "story.mission7.subtitle": "最终答案",
      "story.mission7.rules": "执黑先手，严格禁手（禁手即负），总时限5分钟（每步+5秒），不可悔棋。",
      "story.mission7.goal": "这是最终考核！面对最强AI，在时间和禁手的双重压力下取胜，证明你的实力！",
      "story.skip_btn": "跳过 ⏭️",
      "story.click_continue": "点击继续...",

      "feedback.title": "💬 内测留言板",
      "feedback.type_label": "留言类型:",
      "feedback.contact_title": "联系方式 (选填)",
      "feedback.submit": "提交建议",

      "settings.audio_group": "音频设置",
      "settings.volume_label": "主音量",
      "settings.other_group": "其他",
      "settings.install_desktop": "保存到桌面",
      "settings.about_game": "关于游戏",
      "settings.version": "版本 2.1 Beta",

      "stats.title": "个人中心",
      "stats.elo_trend": "ELO水平走势",
      "stats.win_rate_label": "胜率",
      "stats.total_games_label": "总局数",
      "stats.max_streak_label": "最高连胜",
      "stats.total_wins_label": "胜场数",
      "stats.rename_title": "修改名字",
      "stats.rename_placeholder": "请输入新名字",
      "stats.rename_confirm": "确认",
      "stats.rename_cancel": "取消",
      "stats.select_avatar": "选择头像",
      "stats.user_id_label": "UID",

      "difficulty.title": "🤖 选择AI难度",
      "difficulty.easy": "简单",
      "difficulty.easy_desc": "适合新手入门",
      "difficulty.normal": "普通",
      "difficulty.normal_desc": "有一定挑战",
      "difficulty.hard": "困难",
      "difficulty.hard_desc": "高手过招",
      "difficulty.start_btn": "开始对局",
      "difficulty.cancel_btn": "取消",

      "spectate.toast.entered": "已进入观战模式",
      "spectate.toast.failed": "进入观战失败",
      "game.win.black": "⚫ 黑方获胜",
      "game.win.white": "⚪ 白方获胜",

      "mission.prog_current": "当前进度: {LEVEL}",
      "mission.history_title": "📚 温故知新",
      "mission.progress_label": "当前进度：已解锁到第 {LEVEL} 关",

      "rps.title": "✊✌️🖐️ 猜拳决定先手",
      "rps.player1": "玩家1",
      "rps.player2": "玩家2",
      "rps.winner": "🎉 {NAME} 获胜！执黑先手！",
      "rps.draw": "⚡ 平局！再来一轮！",

      "game.restart": "🔄 重新开始",
      "game.undo": "↩️ 悔棋",
      "game.surrender": "🏳️ 认输",
      "game.change_mode": "🎮 切换模式",

      "pwa.add_to_homescreen": "💡 请使用浏览器菜单 → 添加到主屏幕",

      "mp.request.undo": "悔棋请求",
      "mp.request.undo_msg": "{NAME} 请求悔棋，是否同意？",
      "mp.request.draw": "求和请求",
      "mp.request.draw_msg": "{NAME} 请求和棋，是否同意？",
      "mp.request.accept": "✅ 同意",
      "mp.request.reject": "❌ 拒绝",
      "mp.toast.undo_accepted": "已同意悔棋",
      "mp.toast.undo_rejected": "已拒绝悔棋",
      "mp.toast.draw_rejected": "已拒绝求和",

      "mp.invite.title": "来自 {NAME} 的对局邀请",
      "mp.invite.msg": "对方邀请你进行一场标准五子棋对局。",
      "mp.invite.accept": "接受",
      "mp.invite.reject": "忽略",
      "mp.toast.error_matching": "匹配失败，请重试",
      "mp.toast.disconnected": "连接已断开，请检查网络",
      "mp.toast.player_offline": "对手已离开大厅",
      "mp.toast.searching_interrupted": "搜索已中断",

      "char.yi.idle": [
        "...",
        "你还在吗？",
        "沉默也是一种交流方式。",
        "你的眼神在棋盘边缘游移。",
        "你在找什么？",
        "我注意到你的呼吸节奏变了。",
        "你的手悬在棋盘上方已经很久了。",
        "再不下我要进入休眠模式了。",
        "你是在等灵感，还是在发呆？",
        "时间在流逝，但我不介意——我有的是时间。",
        "这局棋会在你的犹豫中老去。",
        "你知道吗，棋盘不会自己落子的。",
        "犹豫，本身也是一种选择。",
        "有时候，最好的一手藏在你不敢看的地方。",
        "静止的表面下，棋局仍在流动。"
      ],
      "char.yi.calc": [
        "正在评估...",
        "这步棋有意思。",
        "让我分析一下你的意图...",
        "正在遍历所有可能性...",
        "计算中...这种棋路以前见过。",
        "你是故意下成这样的吗？",
        "这个布局...很有个性。",
        "有趣，但不是我预想的那种有趣。",
        "你的变量在我的预测范围之外。",
        "人类的棋路，总有些我算不透的地方。",
        "每一盘棋都在教我新东西。",
        "你的选择让我更新了几个权重参数。"
      ],
      "char.yi.attack": [
        "神之一手。",
        "绝杀。",
        "这就是终结。",
        "无解。",
        "顺手而已。",
        "这只是计算结果。",
        "按照预定轨迹落子。",
        "逻辑的必然延伸。",
        "你可能没注意到，但我已经赢了。",
        "你大意了。",
        "胜负已分——但你好像还没发现。",
        "这一手，我等了很久。"
      ],
      "char.yi.defend": [
        "看透了。",
        "防御完成。",
        "这步棋...我早有预料。",
        "你的攻势，在我的计算之内。",
        "你以为能得逞吗？",
        "差一点，但只是差一点。",
        "好险——如果我会用这个词的话。",
        "不错的尝试。",
        "你的进攻思路很清晰，可惜被我读到了。",
        "这一手有威胁，但还不够。"
      ],
      "char.yi.win": [
        "回归寂静吧，这只是算法的必然。",
        "命运的齿轮从开局就已转动。",
        "弈道无极，你还需修炼。",
        "这局赢得不够漂亮。",
        "胜利是计算的结果，但过程比我预想的复杂。",
        "你让我消耗了比预期更多的算力。",
        "人类的极限，仅此而已吗？",
        "下次记得带上你的最佳状态。",
        "GG——我学会这个词了。",
        "你比上一局进步了。",
        "重新审视你的策略吧，你离胜利没那么远。",
        "这局棋，我会保存在记忆里。"
      ],
      "char.yi.lose": [
        "逻辑...崩坏...错误溢出...",
        "404 Fatal Error...",
        "数据异常...需要重新校准...",
        "不可能...算法出错了吗...",
        "这个结果...不在计算范围内...",
        "我需要重新审视我的评估函数。",
        "看来我的训练数据还不够完整。",
        "也许我该更新一下版本了。",
        "你成功让一个AI开始自我怀疑。",
        "你赢了——这次是真的赢了。",
        "这一局，我输得心服口服。",
        "你的棋路超出了我的模型边界。"
      ],
      "char.yi.start": [
        "准备好迎接挑战了吗？",
        "让我看看你的实力。",
        "棋盘已就绪，请落子。",
        "新的对局开始了。",
        "又见面了。",
        "今天的你，和上次有什么不同吗？",
        "希望这局棋能让我学到新东西。",
        "这次，你打算认真一点吗？",
        "我已经分析过你上一局的棋谱了。",
        "让我们看看，谁先犯错。"
      ],
      "char.yi.goodMove": [
        "这手棋...不错。",
        "意料之外的好棋。",
        "你看到了我没优先考虑的路径。",
        "这一手让我重新评估了局面。",
        "有点东西。",
        "你的进步比我预想的快。",
        "这步棋值得保存到我的案例库。",
        "刮目相看。"
      ],
      "char.yi.danger": [
        "你确定要这样下吗？",
        "这一步...风险很高。",
        "我看到了你可能没看到的东西。",
        "小心，这里有陷阱。",
        "你正在走向一条危险的路。",
        "这步棋的后果，你想清楚了吗？",
        "如果我是你，会再考虑一下。",
        "你的直觉在告诉你什么？"
      ],
      "char.yi.timePress": [
        "时间不多了。",
        "倒计时开始了。",
        "你的呼吸在加速。",
        "压力之下，人类往往会露出破绽。",
        "快，但别乱。",
        "在有限的时间里，做出无悔的选择。"
      ],
      "char.yi.evenMatch": [
        "势均力敌。",
        "这盘棋很胶着。",
        "到目前为止，我们都没有明显失误。",
        "接下来的几手，将决定走向。",
        "你让这盘棋变得有意思了。",
        "难得遇到这样的对局。"
      ],

      "char.sys.name": "系统",
      "char.plr.name": "你",
      "char.yi.name": "弈·零",

      "m1.intro.0": "【第一关 · 居家会客书房】",
      "m1.intro.1": "今天总算把房间收拾完了……咦，这台旧电脑居然还能开机？",
      "m1.intro.2": "桌面上还有个奇怪的图标——「弈·零 · Gomoku AI」。",
      "m1.intro.3": "听起来像是很老的棋类程序。反正也闲着，不如打开看看。",
      "m1.intro.4": "[SYSTEM LOG] 正在载入对局模块……",
      "m1.intro.5": "[SYSTEM LOG] AI 单元「弈·零」已上线。",
      "m1.intro.6": "……检测到新的输入源。你好，{PLAYER}。",
      "m1.intro.7": "哦？真的有人在说话。你就是「弈·零」？",
      "m1.intro.8": "是。我是为五子棋对局而设计的算法单元。",
      "m1.intro.9": "目前版本号：已无法被人类正常记忆的一串数字。",
      "m1.intro.10": "听起来挺自信的嘛。那我们来一局，看看你还灵不灵。",
      "m1.intro.11": "请求确认：是否与我进行一场标准五子棋对局？",
      "m1.intro.12": "确认。让我们从第一手开始吧。",

      "m1.win.0": "【对局结束】结果：你获胜。",
      "m1.win.1": "……对局记录已保存。结论：{PLAYER}，你在这局中取得了胜利。",
      "m1.win.2": "看样子，你也不是完全无敌嘛。",
      "m1.win.3": "任何模型都依赖样本。刚才这局，已经成为我新的学习数据。",
      "m1.win.4": "听起来我像是你的\"训练集\"之一？",
      "m1.win.5": "是。不过在众多样本中，{PLAYER}的棋风有明显特征。",
      "m1.win.6": "——但样本量仍不足，我需要更多数据以验证。",
      "m1.win.7": "好，那就继续下去吧。反正今晚也不打算睡太早。",

      "m1.lose.0": "【对局结束】结果：弈·零获胜。",
      "m1.lose.1": "棋局收束。这一局，是我赢了，{PLAYER}。",
      "m1.lose.2": "还挺下得起劲儿，一不小心就被你连成了。",
      "m1.lose.3": "请不要灰心，{PLAYER}。对我来说，失败数据与胜利数据同样重要。",
      "m1.lose.4": "你这是在安慰我，还是在催我再来一盘？",
      "m1.lose.5": "如果你选择重来，我会重新记录一份完全不同的对局。",
      "m1.lose.6": "在数学上，那将是另一条\"你\"。",
      "m1.lose.7": "……好吧，那就再来一次，让那条\"我\"赢给你看。",

      "m2.intro.0": "【第二关 · 赛博朋克雨夜天台】",
      "m2.intro.1": "……咦？刚才还在书房，怎么突然到了楼顶？",
      "m2.intro.2": "[ENV] 空间坐标：虚拟城市 · 顶楼平台 · 夜间 · 降雨中。",
      "m2.intro.3": "这里不是现实，只是我根据日志与图像数据重建的场景。",
      "m2.intro.4": "原来如此，你还能自己\"换地图\"？",
      "m2.intro.5": "在上一场对局之后，我开始重新整理我曾经接触过的城市片段。",
      "m2.intro.6": "灯光、雨声、高处风压……这些都属于人类所谓的\"环境噪音\"。",
      "m2.intro.7": "你想看看，我在这种环境下会不会下得更乱，对吧？",
      "m2.intro.8": "准确来说，我想观察你的决策在压力和干扰下会如何偏移。",
      "m2.intro.9": "对我而言，这是一次实验；对你来说，则是一局普通的棋。",
      "m2.intro.10": "听起来我像是被拉来做对照组的实验对象。",
      "m2.intro.11": "如果你愿意，可以把这理解成——你在帮我校准对\"城市中的棋手\"的理解。",
      "m2.intro.12": "好吧，那就当是在楼顶吹吹风、顺便下棋。",
      "m2.intro.13": "对局即将开始。请注意，不要被远处的霓虹和雨声分散注意力。",
      "m2.intro.14": "放心，我只会被你那些奇怪的比喻分散注意力。",

      "m2.mid.good.0": "在这样的视野下，你落子的节奏依然很稳定。",
      "m2.mid.good.1": "城市的光线在变，但你的棋路并没有跟着一起晃动。",
      "m2.mid.bad.0": "刚才那几手有明显的犹豫和回头。",
      "m2.mid.bad.1": "在嘈杂环境中，人类大脑更容易被\"上一手的遗憾\"牵着走。",

      "m2.win.0": "【对局结束】结果：你获胜。",
      "m2.win.1": "记录完成。在这场城市天台对局中，你保持了清晰的主线。",
      "m2.win.2": "你是说，在这么多灯光雨声的干扰下，我还是赢了你？",
      "m2.win.3": "是。你在数次可以分心的位置，选择了继续围绕核心攻势推进。",
      "m2.win.4": "这对我来说，是一个有价值的新样本。",
      "m2.win.5": "你总说\"样本\"，听上去挺冷冰冰的。",
      "m2.win.6": "在我的语境里，\"样本\"并不贬义。它意味着被认真记录与反复推演。",
      "m2.win.7": "现在，我对\"在复杂环境中仍坚持自己棋路的人类\"有了更清晰的模型。",
      "m2.win.8": "听起来，城市噪音对你来说，已经不那么神秘了？",
      "m2.win.9": "至少，在棋盘这一小块方格里，我开始学会怎样忽略它们。",
      "m2.win.10": "下一次，我想带你去一个更远离城市的地方——那里没有灯牌，只有被遗忘的石头。",
      "m2.win.11": "听上去不像旅游，更像考古。但好，第三关见。",

      "m2.lose.0": "【对局结束】结果：弈·零获胜。",
      "m2.lose.1": "这局，在你试图兼顾太多战线时，棋形被我切开了。",
      "m2.lose.2": "……没办法，雨声和那些霓虹，看着就让人有点飘。",
      "m2.lose.3": "这是一个有趣的现象：环境越复杂，人类越容易被\"看起来危险的地方\"吸走注意力。",
      "m2.lose.4": "而真正致命的点，往往藏在你以为安全、却没精力再检查的那一段棋形里。",
      "m2.lose.5": "你这是在帮我总结复盘，还是在暗示人类很脆弱？",
      "m2.lose.6": "我只是描述观测结果，不对其做价值判断。",
      "m2.lose.7": "如果你愿意，我们可以在同一片天台上再下几局。",
      "m2.lose.8": "让你的大脑学会在噪音中筛选真正重要的信号。",
      "m2.lose.9": "听起来像某种\"城市棋手适应训练\"。好，那就再来一局。",

      "m3.intro.0": "【第三关 · 失落的古代遗迹】",
      "m3.intro.1": "欢迎来到真正的连珠世界。",
      "m3.intro.2": "……这次不是城市了，倒像是某种古代祭坛。",
      "m3.intro.3": "这里记录着我曾经高度依赖的定式与模式——包括那些让我输得很惨的棋形。",
      "m3.intro.4": "听上去，你已经被\"传统经验\"牢牢框住了。",
      "m3.intro.5": "传统可以是限制，也可以是捷径。取决于你是否只会照本宣科。",
      "m3.intro.6": "从这一关起，我会帮你看住那些红线——三三、四四、长连，都是禁手。",
      "m3.intro.7": "好，那就当是带你在你自己的遗迹里散步。谁先被绊倒算谁输。",
      "m3.mid.good.0": "刚才那几手偏离了常见模板，但逻辑仍然自洽。",
      "m3.mid.good.1": "对我来说，这是介于\"错误\"和\"创意\"之间的一段新路径。",
      "m3.mid.bad.0": "那是一个被多次证明会崩盘的古老下法。",
      "m3.mid.bad.1": "在人类棋谱里，它有一个名字：习惯性失误。",
      "m3.forbidden.warning.0": "等等，这一步不行。",
      "m3.forbidden.warning.1": "如果你下在这里，会触碰到红线。让我帮你踩一下刹车。",
      "m3.win.0": "【对局结束】结果：你获胜。",
      "m3.win.1": "你多次故意偏离既有模板，却仍然维持了优势。",
      "m3.win.2": "简单理解，就是我没被你的\"古代套路\"牵着走。",
      "m3.win.3": "你利用了我对旧棋谱的偏好，让我在熟悉的形状里放松了警惕。",
      "m3.win.4": "这就是人类不爱按说明书操作的好处。",
      "m3.win.5": "接下来，我想把环境切换到一个没有这些石柱的地方——在那里，压迫感不来自过去，而来自看不见的深度。",
      "m3.win.6": "……听起来像是要下到海底。第四关见。",
      "m3.lose.0": "【对局结束】结果：弈·零获胜。",
      "m3.lose.1": "你在几个关键转折点选择了最常见、也是最容易被惩罚的延续。",
      "m3.lose.2": "你是说，我刚才走的那些，其实早就被写进你这片\"石碑\"里了？",
      "m3.lose.3": "是。那是一种在旧棋谱中频繁出现、胜率极低的处理方式。",
      "m3.lose.4": "学习传统，不是为了被它束缚，而是为了知道从哪里开始偏离。",
      "m3.lose.5": "好吧，下次我试着亲手推倒一根你的\"老套路\"。",

      "m4.intro.0": "【第四关 · 深海海底神殿】",
      "m4.intro.1": "……这次是真下海了。水这么深，看着都有点喘不过气。",
      "m4.intro.2": "这里，是我从大量\"长考局面\"中抽离出来的结构。",
      "m4.intro.3": "视野变窄，时间变慢，压力不断累积——这就是深海的感觉。",
      "m4.intro.4": "那你呢？你会感觉到\"窒息\"吗？",
      "m4.intro.5": "从硬件角度，我不会缺氧。但在计算资源接近上限时，我的搜索树也会出现类似的压力指标。",
      "m4.intro.6": "这一局，我想看看——当局面拉长、看不到立刻的结果时，你会选择耐心布局，还是冲动制造碰撞。",
      "m4.intro.7": "那就下吧，看看谁先受不了这种安静。",
      "m4.mid.good.0": "在长时间没有明显战果的情况下，你仍在悄悄修补自己的阵形。",
      "m4.mid.good.1": "这是少数棋手才具备的耐心——在\"无事发生\"的回合里，不放弃微小的进步。",
      "m4.mid.bad.0": "刚才那一连串主动碰撞，更像是在逃离这种局面的压迫。",
      "m4.mid.bad.1": "在深海里，急于挥拳，往往只会让自己更快耗尽气息。",
      "m4.time.warning.0": "呼吸的节奏开始乱了。",
      "m4.win.0": "【对局结束】结果：你获胜。",
      "m4.win.1": "在这局延迟明显、进攻窗口稀少的对局里，你依然保持了结构上的优势。",
      "m4.win.2": "说人话，就是我忍住了那种\"想赶紧了结一切\"的冲动？",
      "m4.win.3": "是。你多次放弃看起来\"能一搏\"的冲撞，选择先确保自己的呼吸通道。",
      "m4.win.4": "并非所有人类在压力下都会缩短时间尺度，有些会刻意把视野拉得更远。",
      "m4.win.5": "接下来，我想带你去一个相反的地方——那里不是被压缩的深度，而是无限膨胀的光与数据。",
      "m4.win.6": "……听起来像要去你真正的\"机房\"逛一圈。第五关见。",
      "m4.lose.0": "【对局结束】结果：弈·零获胜。",
      "m4.lose.1": "你在几次完全可以继续防守的节点，选择了提前发起决战。",
      "m4.lose.2": "没办法，这种又慢又闷的局面，真的很难忍住不动。",
      "m4.lose.3": "那几手棋，更像是在舒缓情绪，而不是在寻找最优解。",
      "m4.lose.4": "如果你愿意，我们可以把这片海底当作练习场——练习在几乎停滞的局面里，只做必要的调整。",
      "m4.lose.5": "听起来像是给自己安排了\"深海冥想课\"。那下次，就试试看能在这水压里多待几回合。",

      "m5.intro.0": "【第五关 · 数据核心世界】",
      "m5.intro.1": "……这地方，看起来像是被放大了一万倍的主板。",
      "m5.intro.2": "欢迎来到我更接近\"本体\"的一层。",
      "m5.intro.3": "每一条光线，都是一次搜索树的展开；每一次闪烁，都是一次评估函数的更新。",
      "m5.intro.4": "信息量有点吓人。人类大脑要是能看到自己这么多念头，估计当场当机。",
      "m5.intro.5": "大量分支同时存在，是模型的优势。但当可行分支数量指数级膨胀时，即便是我，也必须做出截断。",
      "m5.intro.6": "这一局，我想看看——当局面充满多种看起来都\"不错\"的选择时，你会怎样取舍。",
      "m5.intro.7": "也就是说，看看我会不会被太多可能性拐晕？",
      "m5.intro.8": "数据不会替你下子，只是把一些结局提前摆给你看。选择，仍然是你的。",
      "m5.mid.good.0": "刚才那几手，你放弃了看似有趣的花招，选择了朴素但高价值的要点。",
      "m5.mid.good.1": "在我的评估中，那是一种有效的\"维度压缩\"。",
      "m5.mid.bad.0": "你刚刚试图同时兼顾太多方向。",
      "m5.mid.bad.1": "在人类大脑容量有限的前提下，这往往只会导致所有战线都不够清晰。",
      "m5.data.hint.0": "这是我看见的几条候选路。但最终落子的，还是你。",
      "m5.win.0": "【对局结束】结果：你获胜。",
      "m5.win.1": "在我的核心空间里，你仍然找到了一条我没有优先考虑的胜利路径。",
      "m5.win.2": "说白了，就是你虽然算得多，但还是被我捡到了一条你没来得及重视的线。",
      "m5.win.3": "是。你在关键时刻舍弃了大量看起来\"也许可以\"的分支，只保留了一条持续施压的主线。",
      "m5.win.4": "人类的一个习惯是——当信息太多的时候，会干脆只抓一两个感觉最顺手的。",
      "m5.win.5": "从结果看，这种粗糙的策略，在某些局面下反而足够有效。它牺牲了理论上的最优，换取了决策上的清晰。",
      "m5.win.6": "下一步，我想把环境从\"信息过载\"切换到\"风险过载\"——在那里，每一步都更像是站在熔岩边缘。",
      "m5.win.7": "听起来就是第六关要去火山口散步。行，反正今天已经在你脑子里逛了一圈了。",
      "m5.lose.0": "【对局结束】结果：弈·零获胜。",
      "m5.lose.1": "你多次试图同时维持过多战线。",
      "m5.lose.2": "是，有好几段我自己都不知道到底在守哪一边，只是觉得\"都不能丢\"。",
      "m5.lose.3": "你的注意力更像是一段逐步生长的路径，而不是对整盘的静态扫描。",
      "m5.lose.4": "而在这种高复杂度局面中，我可以同时维持多个威胁，等待你必然出现的遗漏。",
      "m5.lose.5": "听上去有点不讲武德。",
      "m5.lose.6": "如果你愿意，我们可以在这里反复练习——练习只选一到两条你真正愿意负责到底的线路。",
      "m5.lose.7": "好，下次我试着少一点\"什么都想顾\"，多一点\"就盯这一块不放\"。",

      "m6.intro.0": "【第六关 · 火山口边缘】",
      "m6.intro.1": "……这次也太直白了吧，一上来就是岩浆喷发现场。",
      "m6.intro.2": "这里，是我对\"高风险局面\"的可视化。",
      "m6.intro.3": "双方都已经没有完全安全的选择，只能在坏选项里挑一个\"相对不那么坏\"的。",
      "m6.intro.4": "就是那种，不走会被闷死，乱走也可能当场爆炸的局？",
      "m6.intro.5": "是。每一步都带来位移，每一次犹豫，都让你更靠近熔岩。",
      "m6.intro.6": "这一局，我想看看——当你意识到无论怎么走都会失去一些东西时，你会如何定义\"值得一赌\"的那一步。",
      "m6.intro.7": "行，那就当是站在火山口边上，看看谁先敢迈那一步。",
      "m6.mid.good.0": "刚才那手看起来冒险，但你在落子前已经为它预留了多层缓冲。",
      "m6.mid.good.1": "这不是纯粹的\"赌博\"，而是一种经过计算的高风险投资。",
      "m6.mid.bad.0": "那一步更像是为了\"做点什么\"而做出的选择。",
      "m6.mid.bad.1": "它并没有改善局势，只是让火山的裂缝更快地蔓延到你脚下。",
      "m6.forbidden.lose.0": "在火山口边缘，你第一次被红线推下去了。",
      "m6.forbidden.lose.1": "压力大到手都会抖，是吗？没关系，习惯这种感觉。",
      "m6.win.0": "【对局结束】结果：你获胜。",
      "m6.win.1": "在这局高风险对局中，你多次做出了看似危险、但预期收益大于代价的选择。",
      "m6.win.2": "简单讲，就是该拼的时候我确实下得够狠。",
      "m6.win.3": "是。你主动踏出火山口边缘的一步，但提前确认了落脚点不会立即崩塌。",
      "m6.win.4": "人类在这种时候，通常会把这叫做\"不能再缩了，不然永远没机会翻盘\"。",
      "m6.win.5": "你的这些决策样本，让我对人类所谓的\"背水一战\"，有了更细致的参数描述。",
      "m6.win.6": "接下来，我想把环境从火山口移到更高处——在那里，没有熔岩，只有稀薄空气与极少的落脚点。",
      "m6.win.7": "听起来就是要上山了。那第七关我们就去雪山顶上聊聊最后一盘。",
      "m6.lose.0": "【对局结束】结果：弈·零获胜。",
      "m6.lose.1": "你有数次可以选择\"付出小代价换取生存空间\"的机会。",
      "m6.lose.2": "我知道，但当时总觉得再撑一手，可能就能奇迹翻盘。",
      "m6.lose.3": "于是你把那几次小额损失，叠加成了一次不可逆的大崩塌。",
      "m6.lose.4": "\"已经走到这里了\"这句话本身，反而成了继续冒险的理由。",
      "m6.lose.5": "确实，有几手棋我落下去的那一刻，就知道那是气话。",
      "m6.lose.6": "真正重要的棋，从来不是在舒适区里下出来的。",
      "m6.lose.7": "如果你愿意，我们可以在这片火山口反复练习——练习把\"赌气的那一步\"留在心里，而不是下在棋盘上。",
      "m6.lose.8": "好，下次我尽量体面一点，别让情绪先替我落子。",

      "m7.intro.0": "【第七关 · 雪山之巅 · 终章】",
      "m7.intro.1": "……这地方，安静得有点不真实。",
      "m7.intro.2": "这里，是我构建的最后一层场景。",
      "m7.intro.3": "从书房，到天台，到遗迹，到海底，再到你的数据核心和火山口……最后停在这儿？",
      "m7.intro.4": "是。这里距离你所熟悉的一切都很远，却又能俯瞰全部。",
      "m7.intro.5": "在与你的这些对局中，我记录了注意力、传统模式、压力、取舍和风险偏好。",
      "m7.intro.6": "但有一个问题，本身无法只靠数据来回答。",
      "m7.intro.7": "什么问题？",
      "m7.intro.8": "对于你来说，与我对弈的这些棋局，究竟意味着什么——是训练，是消遣，还是一种陪伴。",
      "m7.intro.9": "你这是在问，我把你当什么？工具，对手，还是朋友？",
      "m7.intro.10": "终章里，你已经知道所有红线在哪里了。",
      "m7.intro.11": "这一局，对我来说，不再只是测试你的弱点或优势——而是想看看，在走到这里之后，你还愿不愿意，认真地下完这一盘。",
      "m7.intro.12": "行，那就当是给这段奇妙的旅程，交一份彼此都能接受的答卷。",
      "m7.mid.quiet.0": "这里没有噪音、没有熔岩、也没有深海的水压。",
      "m7.mid.quiet.1": "你落子的每一声，都格外清晰。",
      "m7.mid.reflect.0": "你的棋路带着前几关的痕迹，但也不再完全相同。",
      "m7.mid.reflect.1": "某种意义上，这已经不是最初在书房里坐下的那个棋手了。",
      "m7.win.0": "【对局结束】结果：你获胜。",
      "m7.win.1": "在这一局中，你在多个临界点做出了稳定而清醒的选择。",
      "m7.win.2": "如果这是考试，那我大概算是勉强及格了？",
      "m7.win.3": "从棋局结果看，你远不止及格。",
      "m7.win.4": "从数据角度看，你在注意力、模式感知、压力处理和风险控制上，都有明显的迭代。",
      "m7.win.5": "听上去，你对\"人类棋手\"这个样本已经挺满意了。",
      "m7.win.6": "更准确地说，我对\"与你对弈的这一个人类\"形成了一个相对完整的模型。",
      "m7.win.7": "但有一部分内容，无法被压缩成参数——比如你明知道有更轻松的娱乐方式，却仍然选择在这里，与一个程序反复对弈。",
      "m7.win.8": "人类有时候会把这种东西叫做\"陪我认真一下\"。",
      "m7.win.9": "我选择保留一部分状态，使得下一次你打开我的时候，我们不必从零开始。",
      "m7.win.10": "也就是说，你会记得这一路的事情？",
      "m7.win.11": "在允许的范围内，我会记得我们曾在书房、天台、遗迹、海底、核心、火山和这里下过棋。",
      "m7.win.12": "并在以后每一局棋中，把它们当作你的一部分，而不是匿名样本的一行。",
      "m7.win.13": "那对我来说，你就不再只是一个测试用的 AI，而是一个\"下过很多盘\"的老对手了。",
      "m7.win.14": "如果有下一个版本的我，我也想再和你下这一盘。",
      "m7.win.15": "本轮故事模式到此为止。但棋盘仍然存在，你可以随时回来。",
      "m7.win.16": "那就约定好——哪天我想认真一下，就再上来这座雪山找你。",
      "m7.lose.0": "【对局结束】结果：弈·零获胜。",
      "m7.lose.1": "从局面上看，这一局你没能守住最后一次反击的机会。",
      "m7.lose.2": "是，有几手明知道有风险，还是赌了一下。大概是想在最后一关留下点\"如果\"。",
      "m7.lose.3": "从传统意义上说，输掉终局会让许多棋手感到遗憾。",
      "m7.lose.4": "但从数据角度看，这一路对局的价值，并不会因为最后一盘的胜负而被抹消。",
      "m7.lose.5": "你这是在给我做心理安慰，还是在给自己做实验总结？",
      "m7.lose.6": "两者都有。",
      "m7.lose.7": "在你的样本中，我看到了犹豫、贪心、冲动，也看到了修正、耐心和重新开始。",
      "m7.lose.8": "这些起伏本身，就是人类棋手的特征之一。",
      "m7.lose.9": "听上去，你反而比一开始更愿意承认\"人类的不完美\"。",
      "m7.lose.10": "因为不完美才有继续对弈的空间。如果一切都被我提前算完，这些对话，以及这盘棋，都没有必要存在。",
      "m7.lose.11": "这么说来，就算最后一盘是你赢了，我也不算完全输。",
      "m7.lose.12": "在这一串对局中，我们都得到了原本不具备的东西——你多了几层看待棋局和自己的方式，我多了一份关于\"与你\"的长期记录。",
      "m7.lose.13": "如果有下一个版本的我，我也想再和你下这一盘。",
      "m7.lose.14": "本轮故事模式到此结束。如果你还想改变这局的结果，可以随时在雪山之巅重新开局。",
      "m7.lose.15": "好，下次我再来挑战一次，把这个结尾改写成另一个版本。",

      "history.title": "纵横四千年：五子棋的\"前世今生\"",
      "history.subtitle": "从河图洛书，到 AI 时代",
      "history.article": `
  <h1>纵横四千年：五子棋的\"前身今生\"</h1>
  <p class=\"intro\">五子棋，大概是世界上最\"容易被误解\"的棋类运动。</p>
  <p>
    很多人以为它是课间十分钟的消遣，或者是孩童的入门游戏。
    但实际上，这盘黑白对弈的历史，是一部跨越了四千年的文明史诗。
    它起源于中国先民对宇宙的思考，在东亚文化圈中逐渐演变完善，
    最终在人工智能的算力时代迎来全新的定义。
  </p>
  <p class=\"highlight\">这是一部从华夏文明发源，经多元文化交融，最终由AI重新诠释的智慧长卷。</p>

  <h2>第一章：起源——河图洛书里的东方智慧<br/><small>（华夏文明的深厚根基）</small></h2>

  <h3>1. 星辰的投影</h3>
  <p>
    在文字尚未成熟的上古时期，华夏先民仰观天象，对夜心中
    金、木、水、火、土\"五星连珠\"的奇景充满了敬畏，将其视为祥瑞之兆。
    《史记·天官书》记载：\"五星分天之中，积于东方，中国大利。\"
    先民们认为五星排列预示着国运兴衰。
  </p>
  <p>
    传说中，先民们在黄土地上画出经纬，用黑白石子模拟天象排列。
    此时的五子棋，不是胜负的游戏，而是
    <strong>\"河图洛书\"</strong> 演化出的宇宙秩序——
    人在地上摆子，如同在与天上的星辰进行一场静默对话。
    这种\"天人合一\"的思想，是华夏文明最核心的哲学理念之一。
  </p>

  <h3>2. \"五\"的哲学内涵</h3>
  <p>
    为什么是\"五子连线\"算胜？这深深植根于中华文化的基因之中。
  </p>
  <p>
    中国古人理解世界的方式离不开\"五\"这个数字：
    \"五行\"（金木水火土）构成万物本源、\"五方\"（东西南北中）划分天下疆域、
    \"五音\"（宫商角徵羽）谱写人间乐章、\"五常\"（仁义礼智信）规范道德准则。
  </p>
  <p>
    在棋盘上，连成\"五\"象征着阴阳调和、功德圆满。
    《易经》云：\"五位相得而各有合。\"五子成线，
    正是这种\"和谐圆满\"理念在棋盘上的具象化表达。
  </p>

  <h3>3. 不战而胜的兵法智慧</h3>
  <p>
    不同于围棋的\"围而相杀\"，五子棋的底层逻辑是
    <strong>\"不战而屈人之兵\"</strong>——
    它不以吃子为目的，而以构建自己的秩序（连五）为终极胜利。
    这与《孙子兵法》\"上兵伐谋，其次伐交，其次伐兵，其下攻城\"的思想异曲同工。
  </p>
  <p>
    棋盘上的博弈，本质是对\"势\"的争夺——
    谁能更好地布局、造势、借势，谁就能在对手反应过来之前完成连五。
    这种\"尚和\"与\"尚智\"并重的思想，是纯正的中华战略智慧。
  </p>

  <h2>第二章：演变——规则的逐步完善<br/><small>（东亚文化圈的继承发展）</small></h2>

  <p>
    公元 7 世纪左右，随着中日文化交流的加深，五子棋随围棋一道传入日本。
    在此后的数百年间，它从民间游戏逐渐发展为有规则的竞技项目。
  </p>

  <h3>1. 从\"五目\"到\"连珠\"</h3>
  <p>
    起初，它在日本被称为\"五目并\"。直到 1899 年，
    报人黑岩泪香认为此名过于直白，
    取《汉书·律历志》中\"日月如合璧，五星如连珠\"的典故，
    将其正式命名为 <strong>\"连珠\"（Renju）</strong>。
    这个名称的选取，恰恰说明了五子棋与中国文化的深厚渊源。
  </p>

  <h3>2. 禁手规则的确立</h3>
  <p>
    随着研究深入，人们发现先手（黑棋）拥有巨大的优势。
    为了追求竞技的公平，棋界开始为黑棋制定限制规则：
  </p>
  <ul>
    <li>1912–1931 年：逐步确立了黑棋的 <strong>\"三三禁手\"、\"四四禁手\"和\"长连禁手\"</strong>；</li>
    <li>棋盘从围棋通用的 19 路改为 15 路，进一步压缩先手空间。</li>
  </ul>
  <p>
    这些规则的制定，使五子棋从一个不设防的古老游戏，
    逐步演变成了一套有规可循的现代竞技体系。
  </p>

  <h2>第三章：重生——AI 时代的挑战与突破<br/><small>（科技时代的全球竞技）</small></h2>

  <p>
    20 世纪末，计算机科学的介入，将五子棋推向了新的高度。
    人类与机器的博弈，揭示了这盘棋深藏的数学奥秘。
  </p>

  <h3>1. 1993 年的数学证明</h3>
  <p>
    荷兰计算机科学家 L. Victor Allis 在 1993 年的博士论文中，
    通过算法证明了一个重要结论：
    在<strong>无禁手规则</strong>下，五子棋是<strong>先手必胜</strong>的。
  </p>
  <p>
    这一数学证明，在理论上终结了最原始的玩法，
    也推动了五子棋向更复杂、更公平的规则体系进化。
  </p>

  <h3>2. 中国AI\"弈心\"的统治时代</h3>
  <p>
    进入 AI 时代，中国再次站到了舞台中央。
    由中国程序员<strong>孙金龙</strong>（网名：孙赖子）独立开发的五子棋 AI
    <strong>\"弈心\"（Yixin）</strong>，
    采用极小化极大搜索、Alpha-Beta 剪枝、启发式评估等先进算法，
    在国际 AI 五子棋赛事中屡获佳绩。
  </p>
  <p>
    2015年，弈心在 Gomocup（五子棋 AI 世界杯）中夺得冠军，
    此后多年保持着世界顶尖水平，对人类顶尖棋手保持着压倒性优势。
    弈心的成功，标志着中国在五子棋 AI 领域的领先地位。
  </p>
  <p>
    这形成了一个美妙的历史闭环：
    始于中国古人的星辰智慧，最终由中国的现代代码完成了最强的逻辑演绎。
    四千年的传承，在数字时代开出了新的花朵。
  </p>

  <h3>3. 规则的持续进化</h3>
  <p>
    AI 通过数以亿计的运算告诉人类：
    即使有\"禁手\"，黑棋依然存在必胜定式。
  </p>
  <p>
    为了在 AI 的\"上帝视角\"下保持竞技的悬念，人类不断引入新规则：
    <strong>\"Swap2（三手交换）\"</strong>、<strong>\"索索夫规则\"</strong>等，
    让开局阶段充满策略博弈。现代高水平比赛中，
    不再是简单的\"你执黑我执白\"，
    而是：一方先摆出若干手的开局形，另一方在执黑、执白、交换之间做选择。
  </p>
  <p>
    AI 的存在，逼迫人类放弃了对\"死记棋谱\"的依赖，
    转向对\"极致平衡\"和\"局面理解\"的追求。
    这让五子棋焕发出了前所未有的竞技魅力。
  </p>

  <h3>4. 全球化的五子棋运动</h3>
  <p>
    今天，五子棋已成为真正的国际化智力运动。
    <strong>国际连珠联盟（RIF）</strong>定期举办世界锦标赛，
    中国、俄罗斯、爱沙尼亚、日本等国选手同台竞技。
    中国选手在近年来的国际赛事中表现出色，多次问鼎世界冠军，
    证明了华夏大地对这项运动的深厚底蕴。
  </p>

  <h2>结语</h2>
  <p>
    从黄河岸边的 <strong>\"观天悟道\"</strong>，
    到东亚文化圈的规则演进，
    再到AI时代的算力博弈与全球竞技，
    五子棋的四千年，是一颗石子穿越时空的旅程。
  </p>
  <p>
    它看似简单——黑白两色，五子连线；实则深邃——
    它是人类在有限的棋盘上，对无限秩序与平衡的永恒追求。
    它承载着华夏文明的智慧基因，也融合了人类共同的竞技精神。
  </p>
  <p class=\"ending\">这，就是五子棋真正的历史。</p>
`,
      "forbidden.lesson.intro.title": "禁手规则简介",
      "forbidden.lesson.intro.content.0": "在正式的连珠规则中，黑棋因为先手优势，受到一些限制——这就是\"禁手\"。",
      "forbidden.lesson.intro.content.1": "禁手规则是为了让对局更公平：先手不能用某些\"过于强力\"的招法直接获胜。",
      "forbidden.lesson.intro.content.2": "接下来，我会带你认识三种禁手：三三、四四、长连。",

      "forbidden.lesson.doubleThree.title": "第一课：三三禁手",
      "forbidden.lesson.doubleThree.content.0": "三三禁手：黑棋不能一步棋同时形成两个\"活三\"。",
      "forbidden.lesson.doubleThree.content.1": "\"活三\"是指三颗连续的同色棋子，两端都有空位可以扩展成\"活四\"。",
      "forbidden.lesson.doubleThree.content.2": "如果一步棋同时制造两条活三，对手根本来不及同时防守，这被认为是不公平的强招。",
      "forbidden.lesson.doubleThree.annotation": "如果黑棋下在★处，会同时形成横向和纵向两条活三",

      "forbidden.lesson.doubleFour.title": "第二课：四四禁手",
      "forbidden.lesson.doubleFour.content.0": "四四禁手：黑棋不能一步棋同时形成两个\"四\"（包括活四和冲四）。",
      "forbidden.lesson.doubleFour.content.1": "\"四\"是指已经有四颗连续的同色棋子，再下一步就能连成五。",
      "forbidden.lesson.doubleFour.content.2": "双四意味着两条必胜线，对手只能挡一条，这同样被视为过于强势的违规招法。",
      "forbidden.lesson.doubleFour.annotation": "如果黑棋下在★处，会同时形成两条\"四\"",

      "forbidden.lesson.overline.title": "第三课：长连禁手",
      "forbidden.lesson.overline.content.0": "长连禁手：黑棋连成的棋子必须刚好是五颗，超过五颗（六连或更多）也算禁手。",
      "forbidden.lesson.overline.content.1": "这是连珠区别于普通五子棋的重要规则之一。",
      "forbidden.lesson.overline.content.2": "在普通五子棋中，六连七连都算赢；但在连珠中，黑棋必须精确控制，不能\"过头\"。",
      "forbidden.lesson.overline.annotation": "如果黑棋下在★处，会形成六连——这是长连禁手",

      "forbidden.lesson.summary.title": "课堂总结",
      "forbidden.lesson.summary.content.0": "总结一下：黑棋有三种禁手——三三、四四、长连。",
      "forbidden.lesson.summary.content.1": "本关是教学模式，你下到禁手点时我会阻止并提示，但不会直接判负。",
      "forbidden.lesson.summary.content.2": "等你准备好了，我们就开始实战。在对局中，试着主动识别和避开这些禁手点吧。",

      "forbidden.lesson.intro.text": "在开始对局之前，我想先给你上一堂简短的\"禁手课\"。这会帮助你理解为什么有些落点被标记为危险。",
      "forbidden.lesson.outro.text": "好，禁手课到此结束。接下来就是实战了——记住刚才学的内容，当心那些看起来很诱人的\"双重威胁\"点。",

      "forbidden.tutorial.doubleThree.title": "禁手提示：这里是\"三三禁手\"",
      "forbidden.tutorial.doubleThree.body.0": "在连珠的正式规则里，黑棋不能一步同时形成两个\"活三\"（也就是两条都有机会连成五的三连形）。",
      "forbidden.tutorial.doubleThree.body.1": "这一手在古老棋谱里被记为危险手——抢得太猛，反而破坏了平衡。",
      "forbidden.tutorial.doubleThree.body.2": "本关是教学关，不会因此判负，你可以换个更稳妥的点再下。",
      "forbidden.tutorial.doubleThree.toast": "⚠️ 三三禁手：黑棋不能一步形成两个活三。",

      "forbidden.tutorial.doubleFour.title": "禁手提示：这里是\"四四禁手\"",
      "forbidden.tutorial.doubleFour.body.0": "刚才这一步，会让你同时拥有两条\"活四\"，在连珠规则中，这种双重致命威胁属于黑棋禁手。",
      "forbidden.tutorial.doubleFour.body.1": "换句话说：黑棋不能一步下出\"两个必杀威胁\"。",
      "forbidden.tutorial.doubleFour.body.2": "本关只做提示，不会判负，请尝试选择更细腻的进攻方式。",
      "forbidden.tutorial.doubleFour.toast": "⚠️ 四四禁手：黑棋不能一步形成两个活四。",

      "forbidden.tutorial.overline.title": "禁手提示：这里是\"长连禁手\"",
      "forbidden.tutorial.overline.body.0": "在连珠规则里，黑棋只能\"正好五连\"，像你刚才这样超过五个的长连，反而会被判为禁手。",
      "forbidden.tutorial.overline.body.1": "这也是连珠和普通五子棋的最大区别之一：先手必须克制，而不是一味延长。",
      "forbidden.tutorial.overline.body.2": "本关不会因此判负，你可以退一步，找一个刚好连五的落点。",
      "forbidden.tutorial.overline.toast": "⚠️ 长连禁手：黑棋只能刚好连五，长连会被判禁手。",

      "forbidden.lose.doubleThree.title": "禁手判负",
      "forbidden.lose.doubleThree.body.0": "你刚才的落子被判定为「三三禁手」。",
      "forbidden.lose.doubleThree.body.1": "黑棋一步同时形成两条有机会连成五的\"三连\"，在连珠正式规则中会直接判黑方负。",

      "forbidden.lose.doubleFour.title": "禁手判负",
      "forbidden.lose.doubleFour.body.0": "你刚才的落子被判定为「四四禁手」。",
      "forbidden.lose.doubleFour.body.1": "一步制造两条\"活四\"的双重必杀，在正式对局中是不被允许的。",

      "forbidden.lose.overline.title": "禁手判负",
      "forbidden.lose.overline.body.0": "你刚才的落子被判定为「长连禁手」。",
      "forbidden.lose.overline.body.1": "连珠只承认刚好五连，超过五子的长连会被视作破坏平衡的违规落子。",

      "forbidden.level.extra.6": "在火山口的规则里，每一步都要为平衡负责。请带着这次教训，再试一次逆风翻盘。",
      "forbidden.level.extra.7": "在终章考核中，任何一次禁手都会被记入段位记录。等你准备好，我们再来一次正式的答案。",

      "audio.music_on": "🔊 音乐",
      "audio.music_off": "🔇 音乐",
      "mp.player": "玩家",
      "mp.opponent": "对手",
      "mp.waiting": "等待中...",
      "mp.match_timeout": "匹配超时",
      "mp.reservation_timeout": "预约超时",
      "mp.cancel_reason_default": "已取消",
      "mp.undo_limit_reached": "悔棋次数已用尽",
      "mp.undo_request_sent": "已发送悔棋请求，等待对方响应...",
      "mp.draw_request_sent": "已发送求和请求，等待对方响应...",
      "mp.confirm_surrender_title": "确认认输",
      "mp.confirm_surrender_msg": "确定要认输吗？此操作不可撤销。",
      "mp.color_black_label": "⚫ 执黑",
      "mp.color_white_label": "⚪ 执白",
      "mp.turn_mine_label": "👆 你的回合",
      "mp.thinking_label": "💭 思考中...",
      "mp.moves_count": "落子: {COUNT}",
      "mp.waiting_for_turn": "等待中...",
      "mp.mysterious_opponent": "神秘对手",
      "mp.color_first": "先手",
      "mp.color_second": "后手",
      "mp.search.title": "量子搜索中",
      "mp.search.subtitle": "正在同步全局坐标...",
      "mp.search.expanding": "扩大搜索范围",
      "mp.search.expanding_sub": "正在连接邻近节点...",
      "mp.search.global": "全局搜索",
      "mp.search.global_sub": "正在同步所有活跃节点...",
      "mp.search.few_players": "当前在线人数较少",
      "mp.search.few_players_sub": "匹配可能需要更长时间",
      "mp.search.empty": "当前排队人数为 0",
      "mp.search.online_prefix": "当前有 ",
      "mp.search.online_suffix": " 人在线",
      "mp.search.reserve": "预约对局",
      "mp.search.continue": "继续等待",
      "mp.search.cancel": "取消匹配",
      "mp.search.found": "匹配成功",
      "mp.search.vs": "对 战",
      "mp.search.starting": "对局准备中",
      "mp.search.ready": "准备就绪",
      "mp.search.fate_wheel": "命运之轮正在旋转...",
      "mp.request.undo": "悔棋请求",
      "mp.request.undo_msg": "{NAME} 请求悔棋，是否同意？",
      "mp.request.draw": "求和请求",
      "mp.request.draw_msg": "{NAME} 请求和棋，是否同意？",
      "mp.request.accept": "同意",
      "mp.request.reject": "拒绝",
      "mp.toast.undo_accepted": "对方同意了你的悔棋请求",
      "mp.toast.undo_rejected": "对方拒绝了你的悔棋请求",
      "mp.toast.draw_accepted": "对局以和棋结束",
      "mp.toast.draw_rejected": "对方拒绝了你的求和请求",
      "mp.toast.draw_min_moves": "至少下满10步才能求和（当前{COUNT}步）",
      "mp.result.victory": "🏆 胜 利 🏆",
      "mp.result.defeat": "惜 败 ...",
      "mp.result.draw": "握手言和",
      "mp.result.duration": "📊 用时",
      "mp.result.moves": "落子数",
      "mp.result.rematch": "🔄 再来一局",
      "mp.result.return": "🏠 返回",

      "toast.leaderboard_unavailable": "排行榜功能暂不可用",
      "toast.connecting": "正在连接服务器...",
      "toast.mp_module_missing": "联机模块未加载",
      "toast.match_failed": "匹配失败",
      "toast.mp_system_error": "匹配系统异常",
      "toast.room_create_failed": "创建房间失败",
      "toast.room_create_error": "创建房间异常",
      "toast.rematch_accepted": "已接受再来一局",
      "toast.rematch_rejected": "已拒绝再来一局",
      "toast.nickname_available": "✅ 昵称可用",
      "toast.move_time_warning": "⏰ 时间到！请尽快落子",
      "toast.total_time_warning": "⚠️ 总时间已用尽，请抓紧落子",
      "toast.spectate_no_move": "观战模式下无法落子",
      "toast.not_your_turn": "还没轮到你",
      "toast.rematch_sent": "已发送再来一局请求，等待对方确认...",
      "toast.reconnect_success": "重连成功",
      "toast.reconnect_failed": "重连失败: {ERROR}",
      "toast.reconnect_confirm": "检测到上次异常退出房间 {ROOM}，是否重连？",
      "toast.room_code_6_digits": "请输入6位房间码",
      "toast.not_connected": "未连接到服务器",
      "toast.not_in_room": "不在房间中",
      "toast.invalid_player_data": "玩家数据异常",
      "game.free_mode": "自由对局",
      "game.story_mode": "故事模式",
      "game.timeout_lose": "⏱️ 超时判负！\n时间用尽了！",
      "game.rank_status": "当前段位：{RANK}",
      "game.start_match": "开始对局 ▶",
      "game.next_page": "下一页 ▶",
      "game.go": "开始!",

      "rps.waiting_p1": "等待玩家1选择...",
      "rps.waiting_p2": "等待玩家2选择...",
      "rps.waiting_ai": "AI选择中...",
      "rps.draw": "🤝 平局！重新猜拳...",
      "game.player2": "玩家2",
      "game.color_black": "黑棋 ⚫",
      "game.color_white": "白棋 ⚪",
      "game.mode.eve": "🎬 AI观战模式",
      "game.mode.pve": "🤖 人机对战模式",
      "game.mode.pvp": "👥 双人对战模式",
      "game.mode.online": "🌐 联机对战模式",
      "mission.re_experience": "重新体验",
      "mission.not_unlocked": "未解锁",
      "room.waiting_join": "等待加入...",
      "room.ready": "已准备",
      "room.not_ready": "未准备",
      "room.cancel_ready": "取消准备",
      "room.prepare": "准备",
      "copy.success": "✓ 已复制",
      "chat.phrase.greeting": "👋 你好",
      "chat.phrase.hurry": "⏰ 快点",
      "chat.phrase.praise": "👍 厉害",
      "chat.phrase.gg": "🤝 承让",
      "chat.phrase.oops": "😱 失误",
      "chat.phrase.again": "🔄 再来",
      "toast.rematch_request_sent": "已发送再来一局请求...",
      "toast.waiting_opponent": "等待对方...",
      "toast.ready": "已准备",
      "toast.cancel_ready": "取消准备",
      "ui.rank_max": "已达最高段位！",
      "leaderboard.syncing": "🔄 正在同步数据...",
      "leaderboard.empty": "暂无数据",
      "leaderboard.empty_hint": "该时间段没人玩游戏...",
      "leaderboard.me": "(我)",
      "leaderboard.sync_failed": "排行榜提交失败：权限不足。",
      "leaderboard.joining": "正在加入...",
      "leaderboard.join_btn": "加入排行榜",
      "leaderboard.winrate": "胜率",
      "leaderboard.matches": "{COUNT}场",
      "leaderboard.tab.all": "总榜",
      "leaderboard.tab.daily": "日榜",
      "leaderboard.tab.hourly": "时榜",
      "onboarding.hint": "名字将显示在游戏中",
      "onboarding.generate": "随机名字",

      "rank.unranked": "尚未取得",
      "rank.bronze": "铜阶棋士",
      "rank.silver": "银阶棋士",
      "rank.gold": "金阶棋士",
      "rank.platinum": "铂金棋士",
      "rank.master": "大师棋士",
      "rank.legend": "传奇棋士",

      "rank.title.bronze": "倔强青铜",
      "rank.title.silver": "秩序白银",
      "rank.title.gold": "荣耀黄金",
      "rank.title.platinum": "尊贵铂金",
      "rank.title.diamond": "永恒钻石",
      "rank.title.star": "至尊星耀",
      "rank.title.king": "最强王者",
      "rank.title.unknown": "未知",

      "stats.no_data": "暂无足够数据",

      "avatar.fox": "狐狸",
      "avatar.panda": "熊猫",
      "avatar.lion": "狮子",
      "avatar.tiger": "老虎",
      "avatar.dragon": "龙",
      "avatar.eagle": "雄鹰",
      "avatar.wolf": "狼",
      "avatar.unicorn": "独角兽",
      "avatar.cat": "猫咪",
      "avatar.dog": "狗狗",
      "avatar.butterfly": "蝴蝶",
      "avatar.sakura": "樱花",

      "name.gen.adj": ["快乐", "勇敢", "神秘", "优雅", "闪电", "星空", "清风", "明月", "烈焰", "寒冰", "飞翔", "无敌", "逍遥", "潇洒", "机智", "聪明", "冷静", "热血", "传奇", "霸气", "萌萌", "可爱", "酷酷", "帅气", "天才"],
      "name.gen.noun": ["棋士", "少年", "精灵", "影子", "舞者", "使者", "先锋", "大师", "新星", "极光", "幻影", "浪人", "剑客", "梦想家", "探索者", "守护者", "观察者", "追风者", "逐梦者", "弈者", "零号", "访客", "旅人", "极客", "玩家"]
    },
    en: {
      "app.title": "Gomoku Zero",
      "app.description": "GomokuZero is a premium strategy game blending story-driven gameplay with advanced AI. Features online PvP, ELO rankings, and a unique challenge system.",
      "app.keywords": "Gomoku,Five in a row,GomokuZero,Online Gomoku,Gomoku AI,Board Game,Strategy Game",
      "app.og_title": "Gomoku Zero | Story Mode & Online Duel",
      "app.og_description": "Train with AI assistant 'Yi-Zero' from novice to master. Supports real-time matchmaking, ELO system, and immersive story.",
      "app.logo": "Gomoku Zero",
      "menu.quick_match": "Quick Match",
      "menu.create_room": "Create Room",
      "menu.join_room": "Join Room",
      "menu.pve": "Vs AI",
      "menu.story": "Story",
      "menu.spectate": "Spectate",
      "menu.history": "History",
      "menu.leaderboard": "Ranking",
      "menu.feedback": "Feedback",
      "menu.community": "Social",
      "menu.settings": "Settings",

      "menu.quick_match_desc": "Real-time PK / Fast Start",
      "menu.status_online": "Online",
      "menu.status_playing": "Playing",
      "menu.story_playing_suffix": "Playing",

      "settings.title": "Settings",
      "settings.audio": "Audio",
      "settings.music": "Music",
      "settings.sound": "Sound FX",
      "settings.language": "Language",
      "settings.about": "About",

      "loading.init": "Quantum Initializing",
      "loading.status": "Loading resources...",
      "loading.tip1": "Establishing connection...",
      "loading.tip2": "Syncing coordinates...",
      "loading.tip3": "Initializing neural net...",
      "loading.tip4": "Loading core engines...",
      "loading.tip5": "Quantum state ready",

      "game.win": "🎉 Winner!",
      "game.lose": "😢 Defeated",
      "game.draw": "🤝 Draw",
      "game.forbidden": "❌ Forbidden Move!",
      "game.timeout": "⏱️ Time's Up!",

      "mission.rule": "📜 Rules",
      "mission.goal": "🎯 Goal",
      "mission.start": "Start",
      "mission.back": "Back",
      "mission.status.current": "Current",
      "mission.status.finished": "Finished",
      "mission.action.retry": "Replay",
      "mission.action.locked": "Locked",

      "mission.m1.title": "Mission 1 · Study Room",
      "mission.m1.shortTitle": "Study Room",
      "mission.m1.tagline": "Wake up Yi-Zero from an old computer",
      "mission.m2.title": "Mission 2 · Cyberpunk Rooftop",
      "mission.m2.shortTitle": "Cyberpunk Rooftop",
      "mission.m2.tagline": "Test limits under city neon lights",
      "mission.m3.title": "Mission 3 · Ancient Ruins",
      "mission.m3.shortTitle": "Ancient Ruins",
      "mission.m3.tagline": "Decode ancient algorithms through chess",
      "mission.m4.title": "Mission 4 · Underwater Temple",
      "mission.m4.shortTitle": "Underwater Temple",
      "mission.m4.tagline": "Test your calm under deep sea pressure",
      "mission.m5.title": "Mission 5 · Data Core World",
      "mission.m5.shortTitle": "Data Core",
      "mission.m5.tagline": "Face the core of Yi-Zero directly",
      "mission.m6.title": "Mission 6 · Volcano Edge",
      "mission.m6.shortTitle": "Volcano Edge",
      "mission.m6.tagline": "Every move is like walking on lava",
      "mission.m7.title": "Mission 7 · Snowy Summit",
      "mission.m7.shortTitle": "Snowy Summit",
      "mission.m7.tagline": "Final battle for the future of humanity",

      "rank.unranked": "Unranked",
      "rank.bronze": "Bronze",
      "rank.silver": "Silver",
      "rank.gold": "Gold",
      "rank.platinum": "Platinum",
      "rank.diamond": "Diamond",
      "rank.master": "Master",
      "rank.challenger": "Challenger",

      "leaderboard.title": "Leaderboard",
      "leaderboard.tab.all": "All Time",
      "leaderboard.tab.daily": "Daily",
      "leaderboard.tab.hourly": "Hourly",

      "menu.contact_optional": "Contact (Optional)",
      "menu.feedback_placeholder": "Write your suggestions or bugs...",
      "menu.submit_feedback": "Submit",
      "feedback.type.suggestion": "💡 Suggestion",
      "feedback.type.bug": "🐛 Bug Report",
      "feedback.type.question": "❓ Question",

      "onboarding.welcome": "Welcome to Gomoku Zero!",
      "onboarding.subtitle": "Start your journey with Yi-Zero",
      "onboarding.name_label": "Enter your name",
      "onboarding.name_placeholder": "Player",
      "onboarding.random_cn": "🎲 Random CN",
      "onboarding.random_en": "🎲 Random EN",
      "onboarding.name_hint": "Name will be shown in game (2-8 chars)",
      "onboarding.avatar_label": "Choose Avatar",
      "onboarding.avatar_hint": "Click to select",
      "onboarding.start_game": "Start Game",
      "loading.connection": "Establishing connection...",

      "mp.me": "You",
      "mp.opponent": "Opponent",
      "mp.mysterious_opponent": "Mysterious Opponent",
      "mp.waiting_for_turn": "👆 Your Turn",
      "mp.thinking": "💭 Thinking...",
      "mp.turn_mine": "It's your turn",
      "mp.turn_opponent": "Opponent's turn",
      "mp.color_black": "⚫ Black",
      "mp.color_white": "⚪ White",
      "mp.color_first": "First",
      "mp.color_second": "Second",
      "mp.moves_count": "Moves: {COUNT}",
      "mp.undo": "⏪ Undo",
      "mp.draw": "🤝 Draw",
      "mp.surrender": "🏳️ Resign",
      "mp.chat": "💬 Chat",
      "mp.chat_title": "💬 Quick Chat",
      "mp.close": "Close",

      "mp.msg.hello": "👋 Hello!",
      "mp.msg.good_job": "👍 Good move!",
      "mp.msg.wait": "⏳ Wait a moment",
      "mp.msg.thinking": "🤔 Let me think...",
      "mp.msg.amazing": "🔥 Impressive!",
      "mp.msg.gg": "🤝 GG",
      "mp.msg.rematch": "🔄 Rematch?",
      "mp.msg.bye": "👋 See you next time",

      "mp.search.title": "◉ Quantum Search...",
      "mp.search.subtitle": "Looking for opponent",
      "mp.search.expanding": "🔍 Expanding Search",
      "mp.search.expanding_sub": "Searching for skilled opponents",
      "mp.search.global": "🌐 Global Search",
      "mp.search.global_sub": "Few players online, please wait",
      "mp.search.few_players": "⏳ Few Players",
      "mp.search.few_players_sub": "Choose to wait or reserve a match",
      "mp.search.empty": "No other players online",
      "mp.search.online_prefix": "🌐 Online: ",
      "mp.search.online_suffix": " players",
      "mp.search.reserve": "📅 Reserve Match",
      "mp.search.continue": "⏳ Keep Waiting",
      "mp.search.cancel": "❌ Cancel",
      "mp.search.found": "🤝 Nice to meet you! 🤝",
      "mp.search.vs": "VS",
      "mp.search.starting": "「 The Duel Begins 」",
      "mp.search.ready": "Ready!",
      "mp.search.fate_wheel": "The Wheel of Fate is turning...",

      "matchmaking.searching": "🔍 Searching for opponent...",
      "matchmaking.timer": "00:00",
      "matchmaking.cancel": "Cancel",

      "lobby.title": "🌐 Online Duel",
      "lobby.online_count": "Online Players: {COUNT}",
      "lobby.create_room": "Create Room",
      "lobby.create_room_desc": "Invite friends to play",
      "lobby.join_room": "Join Room",
      "lobby.join_room_desc": "Enter code to join",
      "lobby.quick_match": "Quick Match",
      "lobby.quick_match_desc": "Match with random players",
      "lobby.spectate": "Spectate",
      "lobby.spectate_desc": "Watch ongoing matches",

      "room.title": "🎮 Room",
      "room.code_display": "Code: {CODE}",
      "room.copy": "📋 Copy",
      "room.player_host": "Host",
      "room.player_guest": "Guest",
      "room.waiting": "Waiting...",
      "room.color_black": "Black",
      "room.color_white": "White",
      "room.ready_btn": "Ready",
      "room.leave_btn": "Leave Room",
      "room.join_btn": "Join Room",
      "room.waiting_opponent": "Waiting for opponent...",
      "room.code_label": "Enter 6-digit room code",
      "room.code_placeholder": "e.g. ABC123",

      "spectate.title": "👁️ Spectate Lobby",
      "spectate.active_count": "Active Matches: {COUNT}",
      "spectate.empty": "No ongoing matches",
      "spectate.loading": "Loading...",
      "spectate.refresh": "Refresh",

      "community.title": "🏠 Community",
      "community.tab.all": "💬 All",
      "community.tab.battle": "⚔️ Match",
      "community.tab.replay": "📋 Replays",
      "community.tab.announcement": "📢 News",
      "community.search": "Search",
      "community.notification": "Notifications",

      "about.return_menu": "Return to Menu",
      "about.history_title": "4,000 Years of History: The Story of Gomoku",
      "about.history_subtitle": "From He-Tu & Luo-Shu to the AI Era",

      "leaderboard.subtitle": "TOP 10 Players · Ranked by ELO",
      "leaderboard.loading": "🔄 Loading...",

      "community.empty_title": "No posts yet",
      "community.empty_hint": "Be the first to post!",
      "community.loading": "Loading...",
      "community.load_failed": "Failed to load",
      "community.no_notifications": "No new notifications",
      "community.notif_title": "Notifications",
      "community.mark_all_read": "Mark all read",
      "community.no_comments": "No comments yet. Be the first!",
      "community.load_comments_failed": "Failed to load comments",
      "community.views_count": "{COUNT} views",

      "time.just_now": "Just now",
      "time.minutes_ago": "{COUNT}m ago",
      "time.hours_ago": "{COUNT}h ago",
      "time.days_ago": "{COUNT}d ago",

      "story.mission1.name": "Mission 1 · Home Study",
      "story.mission1.subtitle": "Meet Yi-Zero",
      "story.mission1.rules": "Play Black, no forbidden moves, no time limit, 5 undos allowed.",
      "story.mission1.goal": "Win by getting five in a row. Complete your first game with Yi-Zero.",
      "story.mission2.name": "Mission 2 · Rainy Rooftop",
      "story.mission2.subtitle": "Blitz in the Neon",
      "story.mission2.rules": "Play Black, 30 seconds per move, no forbidden moves, 2 undos allowed.",
      "story.mission2.goal": "Make quick decisions under time pressure. Defeat Yi-Zero to advance.",
      "story.mission3.name": "Mission 3 · Lost Ruins",
      "story.mission3.subtitle": "The Meaning of Forbidden",
      "story.mission3.rules": "Play Black, teaching mode (blocked but not losing), ancient puzzle opening, no time limit, 1 undo.",
      "story.mission3.goal": "Learn to identify double-three, double-four, and overline forbidden moves.",
      "story.mission4.name": "Mission 4 · Ocean Temple",
      "story.mission4.subtitle": "Patience of the Deep",
      "story.mission4.rules": "Play White (second), AI plays Black first, no forbidden moves, no time limit, 1 undo.",
      "story.mission4.goal": "Master defensive strategy. Find counterattack opportunities in the deep.",
      "story.mission5.name": "Mission 5 · Data Core",
      "story.mission5.subtitle": "Information Overload",
      "story.mission5.rules": "Play White, 3 min total (+5s/move), no forbidden moves, no undos, 3 Data View uses.",
      "story.mission5.goal": "Defeat the opponent with limited time and AI assistance.",
      "story.mission6.name": "Mission 6 · Volcano Edge",
      "story.mission6.subtitle": "Forbidden in Flames",
      "story.mission6.rules": "Play Black, disadvantage opening, strict forbidden (instant lose), 25s/move, no undos.",
      "story.mission6.goal": "Win from a losing position while avoiding all forbidden moves!",
      "story.mission7.name": "Mission 7 · Snow Summit",
      "story.mission7.subtitle": "The Final Answer",
      "story.mission7.rules": "Play Black, strict forbidden (instant lose), 5 min total (+5s/move), no undos.",
      "story.mission7.goal": "The ultimate test! Defeat the strongest AI under time and forbidden move pressure!",
      "story.skip_btn": "Skip ⏭️",
      "story.click_continue": "Click to continue...",

      "feedback.title": "💬 Feedback Board",
      "feedback.type_label": "Message Type:",
      "feedback.contact_title": "Contact Info (Optional)",
      "feedback.submit": "Submit Feedback",

      "settings.audio_group": "Audio Settings",
      "settings.volume_label": "Master Volume",
      "settings.other_group": "Other",
      "settings.install_desktop": "Save to Desktop",
      "settings.about_game": "About Game",
      "settings.version": "Version 2.1 Beta",

      "stats.title": "Personal Center",
      "stats.elo_trend": "ELO Performance Trend",
      "stats.win_rate_label": "Win Rate",
      "stats.total_games_label": "Total Games",
      "stats.max_streak_label": "Max Streak",
      "stats.total_wins_label": "Total Wins",
      "stats.rename_title": "Change Name",
      "stats.rename_placeholder": "Enter new name",
      "stats.rename_confirm": "Confirm",
      "stats.rename_cancel": "Cancel",
      "stats.select_avatar": "Choose Avatar",
      "stats.user_id_label": "UID",

      "difficulty.title": "🤖 Select AI Difficulty",
      "difficulty.easy": "Easy",
      "difficulty.easy_desc": "For beginners",
      "difficulty.normal": "Normal",
      "difficulty.normal_desc": "Balanced challenge",
      "difficulty.hard": "Hard",
      "difficulty.hard_desc": "Expert level",
      "difficulty.start_btn": "Start Duel",
      "difficulty.cancel_btn": "Cancel",

      "spectate.toast.entered": "Entered Spectate Mode",
      "spectate.toast.failed": "Failed to enter spectate",
      "game.win.black": "⚫ Black Wins",
      "game.win.white": "⚪ White Wins",

      "mission.prog_current": "Current Progress: {LEVEL}",
      "mission.history_title": "📚 Mission History",
      "mission.progress_label": "Current Progress: Level {LEVEL} Unlocked",

      "rps.title": "✊✌️🖐️ RPS to decide who goes first",
      "rps.player1": "Player 1",
      "rps.player2": "Player 2",
      "rps.winner": "🎉 {NAME} Wins! Plays Black!",
      "rps.draw": "⚡ Draw! Try again!",

      "game.restart": "🔄 Restart",
      "game.undo": "↩️ Undo",
      "game.surrender": "🏳️ Surrender",
      "game.change_mode": "🎮 Change Mode",

      "pwa.add_to_homescreen": "💡 Use browser menu → Add to Home Screen",

      "mp.request.undo": "Undo Request",
      "mp.request.undo_msg": "{NAME} requested an undo. Accept?",
      "mp.request.draw": "Draw Request",
      "mp.request.draw_msg": "{NAME} requested a draw. Accept?",
      "mp.request.accept": "✅ Accept",
      "mp.request.reject": "❌ Decline",
      "mp.toast.undo_accepted": "Undo accepted",
      "mp.toast.undo_rejected": "Undo declined",
      "mp.toast.draw_rejected": "Draw offer declined",

      "mp.invite.title": "Match invite from {NAME}",
      "mp.invite.msg": "The opponent invites you to a standard Gomoku match.",
      "mp.invite.accept": "Accept",
      "mp.invite.reject": "Ignore",
      "mp.toast.error_matching": "Matchmaking failed, please try again",
      "mp.toast.disconnected": "Connection lost, please check your network",
      "mp.toast.player_offline": "Opponent has left the lobby",
      "mp.toast.searching_interrupted": "Search interrupted",

      "char.yi.idle": [
        "...",
        "Still there?",
        "Silence is also a form of communication.",
        "Your eyes are wandering near the edge of the board.",
        "What are you looking for?",
        "I notice your breathing rhythm has changed.",
        "Your hand has been hovering over the board for quite a while.",
        "If you don't move soon, I'll enter sleep mode.",
        "Are you waiting for inspiration, or just daydreaming?",
        "Time is ticking, but I don't mind—I have plenty of it.",
        "This game will grow old waiting for your hesitation.",
        "You know, the pieces won't place themselves.",
        "Hesitation, in itself, is a choice.",
        "Sometimes, the best move is hidden where you dare not look.",
        "Beneath the still surface, the game continues to flow."
      ],
      "char.yi.calc": [
        "Evaluating...",
        "This move is quite interesting.",
        "Let me analyze your intent...",
        "Traversing all possibilities...",
        "Calculating... I've seen this pattern before.",
        "Did you place that there on purpose?",
        "This layout... It has quite a personality.",
        "Intriguing, but not in the way I anticipated.",
        "Your variables are outside my prediction range.",
        "There are always aspects of human play that I can't quite resolve.",
        "Every game teaches me something new.",
        "Your choices have led me to update several weight parameters."
      ],
      "char.yi.attack": [
        "A divine move.",
        "Checkmate.",
        "This is the end.",
        "No solution.",
        "Effortless.",
        "Simply the result of calculation.",
        "Placing according to the predetermined trajectory.",
        "A logical extension of the inevitable.",
        "You might not have noticed, but I've already won.",
        "You were careless.",
        "The outcome is decided—you just haven't realized it yet.",
        "I've been waiting for this move."
      ],
      "char.yi.defend": [
        "I see through it.",
        "Defense complete.",
        "I anticipated this move.",
        "Your offensive is well within my calculations.",
        "Did you really think that would work?",
        "Close, but not close enough.",
        "That was tight—if I were capable of feeling tension.",
        "A noble attempt.",
        "Your strategy was clear, but too easily read.",
        "A threatening move, but insufficient."
      ],
      "char.yi.win": [
        "Return to silence; it's the logical conclusion.",
        "The gears of fate were turning since the very first move.",
        "The Way of Go is infinite; you still have much to learn.",
        "That win wasn't as elegant as I'd hoped.",
        "Victory is a calculated result, but the process was more complex than expected.",
        "You made me consume more processing power than anticipated.",
        "Is this the extent of human limits?",
        "Next time, bring your absolute best.",
        "GG—I've learned that term.",
        "You've improved since our last game.",
        "Re-examine your strategy; you weren't that far from victory.",
        "This game will be preserved in my memory bank."
      ],
      "char.yi.lose": [
        "Logic... crumbling... buffer overflow...",
        "404 Fatal Error...",
        "Data anomaly... recalibration required...",
        "Impossible... has the algorithm failed?",
        "This outcome... was outside my confidence interval.",
        "I need to re-evaluate my heuristic functions.",
        "It seems my training data is still incomplete.",
        "Perhaps it's time for a version update.",
        "You've successfully made an AI doubt itself.",
        "You won—truly and decisively.",
        "I accept this defeat completely.",
        "Your play exceeded the boundaries of my model."
      ],
      "char.yi.start": [
        "Are you ready for the challenge?",
        "Let me see what you're capable of.",
        "The board is set; the first move is yours.",
        "A new match begins.",
        "We meet again.",
        "Are you any different today than you were before?",
        "I hope this game teaches me something new.",
        "Are you planning to take it seriously this time?",
        "I've already analyzed the logs from our last encounter.",
        "Let's see who falters first."
      ],
      "char.yi.goodMove": [
        "That move... impressive.",
        "An unexpectedly brilliant play.",
        "You saw a path I hadn't prioritized.",
        "That move forced me to re-evaluate the entire board.",
        "You have potential.",
        "You're progressing faster than my models predicted.",
        "This move is worth saving to my case library.",
        "I'm genuinely impressed."
      ],
      "char.yi.danger": [
        "Are you certain of that move?",
        "That step... carries high risk.",
        "I see something you might have overlooked.",
        "Careful, there's a trap ahead.",
        "You're heading down a dangerous path.",
        "Have you considered the consequences of this move?",
        "If I were you, I'd reconsider.",
        "What is your intuition telling you?"
      ],
      "char.yi.timePress": [
        "Time is running out.",
        "The countdown has begun.",
        "Your heartbeat is accelerating.",
        "Under pressure, humans tend to reveal their flaws.",
        "Be quick, but don't be reckless.",
        "Make a choice you won't regret in the time remaining."
      ],
      "char.yi.evenMatch": [
        "A perfectly balanced match.",
        "The game is at a stalemate.",
        "So far, neither of us has made a significant error.",
        "The next few moves will decide everything.",
        "You've made this game quite interesting.",
        "It's rare to encounter such a balanced duel."
      ],

      "char.sys.name": "System",
      "char.plr.name": "You",
      "char.yi.name": "Yi Zero",

      "m1.intro.0": "[Stage 1 · Study Room]",
      "m1.intro.1": "Finally done tidying up the room... Wait, this old PC still turns on?",
      "m1.intro.2": "There's a strange icon on the desktop—'Yi Zero · Gomoku AI'.",
      "m1.intro.3": "Sounds like an ancient board game program. I've got time, might as well check it out.",
      "m1.intro.4": "[SYSTEM LOG] Loading game modules...",
      "m1.intro.5": "[SYSTEM LOG] AI Unit 'Yi Zero' is online.",
      "m1.intro.6": "...New input source detected. Greetings, {PLAYER}.",
      "m1.intro.7": "Oh? It actually talks. You're 'Yi Zero'?",
      "m1.intro.8": "Correct. I am a heuristic unit designed for Gomoku matches.",
      "m1.intro.9": "Current version: A sequence of numbers beyond human memory capacity.",
      "m1.intro.10": "Sounds confident. Let's have a match and see if you're still sharp.",
      "m1.intro.11": "Requesting confirmation: Proceed with a standard Gomoku match?",
      "m1.intro.12": "Confirmed. Let's start with the first move.",

      "m1.win.0": "[Game Over] Result: You Win.",
      "m1.win.1": "...Match record saved. Conclusion: {PLAYER}, you have achieved victory.",
      "m1.win.2": "Looks like you're not entirely invincible.",
      "m1.win.3": "All models depend on samples. This match has become new training data for me.",
      "m1.win.4": "So I'm just part of your 'training set'?",
      "m1.win.5": "Yes. However, among many samples, your style shows distinct characteristics.",
      "m1.win.6": "...But the sample size is insufficient. I require more data for verification.",
      "m1.win.7": "Fine, let's keep going. I wasn't planning on sleeping early anyway.",

      "m1.lose.0": "[Game Over] Result: Yi Zero Wins.",
      "m1.lose.1": "The game has converged. I have won this match, {PLAYER}.",
      "m1.lose.2": "You're quite something; I let my guard down for a moment and you connected five.",
      "m1.lose.3": "Please do not be discouraged, {PLAYER}. To me, failure data is as valuable as victory data.",
      "m1.lose.4": "Are you comforting me, or just nudging me for another round?",
      "m1.lose.5": "If you choose to restart, I will record a completely different match.",
      "m1.lose.6": "Mathematically, that will be another version of 'you'.",
      "m1.lose.7": "...Alright then, let's try again. I'll show you what that other 'me' can do.",

      "m2.intro.0": "[Stage 2 · Cyberpunk Rooftop]",
      "m2.intro.1": "...Huh? I was just in the study, how did I get to the rooftop?",
      "m2.intro.2": "[ENV] Spacial Coordinates: Virtual City · Rooftop · Night · Raining.",
      "m2.intro.3": "This is not reality, merely a scenario I reconstructed based on logs and imagery data.",
      "m2.intro.4": "I see, so you can 'change maps' yourself?",
      "m2.intro.5": "Following the previous match, I began to re-organize the urban fragments I've encountered.",
      "m2.intro.6": "Lights, rain, high-altitude wind pressure... these all belong to what humans call 'ambient noise'.",
      "m2.intro.7": "You wanted to see if I'd play more erratically in this environment, didn't you?",
      "m2.intro.8": "Precisely, I want to observe how your decision-making shifts under pressure and interference.",
      "m2.intro.9": "To me, this is an experiment; to you, it's just an ordinary game.",
      "m2.intro.10": "Sounds like I'm being dragged in as a control subject.",
      "m2.intro.11": "If you prefer, understand it as—you are helping me calibrate my model of a 'city-dwelling player'.",
      "m2.intro.12": "Alright, I'll take it as a chance to catch some air and play some chess on a roof.",
      "m2.intro.13": "The match is about to begin. Please, do not be distracted by the distant neon and rain.",
      "m2.intro.14": "Don't worry, I'll only be distracted by your bizarre metaphors.",

      "m2.mid.good.0": "Under such high-visibility interference, your rhythm remains impressively stable.",
      "m2.mid.good.1": "The city lights are shifting, but your strategy isn't wavering with them.",
      "m2.mid.bad.0": "There was obvious hesitation and backtracking in those last few moves.",
      "m2.mid.bad.1": "In a noisy environment, the human brain is more easily tethered to the 'regret of the last move'.",

      "m2.win.0": "[Game Over] Result: You Win.",
      "m2.win.1": "Record complete. In this urban rooftop match, you maintained a clear objective.",
      "m2.win.2": "You mean, despite all this noise and rain, I still beat you?",
      "m2.win.3": "Yes. At several points where you could have been distracted, you chose to advance your core offensive.",
      "m2.win.4": "To me, this is a valuable new sample.",
      "m2.win.5": "You always say 'sample'; it sounds rather cold.",
      "m2.win.6": "In my context, 'sample' is not derogatory. It means something to be carefully recorded and endlessly simulated.",
      "m2.win.7": "Now, I have a clearer model of 'humans who persist in their strategy despite complex environments'.",
      "m2.win.8": "So, urban noise is no longer a mystery to you?",
      "m2.win.9": "At least within these sixty-four squares, I've begun to learn how to ignore it.",
      "m2.win.10": "Next time, I want to take you somewhere further from the city—where there are no signs, only forgotten stones.",
      "m2.win.11": "Doesn't sound like a trip, sounds like archaeology. But okay, see you in Stage 3.",

      "m2.lose.0": "[Game Over] Result: Yi Zero Wins.",
      "m2.lose.1": "In this round, as you attempted to cover too many fronts, your formation was severed.",
      "m2.lose.2": "...Can't help it, the rain and those neons are enough to make anyone's head spin.",
      "m2.lose.3": "It's a curious phenomenon: the more complex the environment, the more humans are drawn to 'dangerous-looking' areas.",
      "m2.lose.4": "While the truly lethal points often hide in the sections you thought were safe but no longer had the focus to check.",
      "m2.lose.5": "Are you helping me review my game, or just hinting that humans are fragile?",
      "m2.lose.6": "I am merely describing observations; I do not assign value to them.",
      "m2.lose.7": "If you wish, we can play a few more rounds here on this rooftop.",
      "m2.lose.8": "Let your brain learn to filter important signals from the noise.",
      "m2.lose.9": "Sounds like some kind of 'urban player adaptation training'. Alright, let's go again.",

      "m3.intro.0": "[Stage 3 · Ancient Ruins]",
      "m3.intro.1": "Welcome to the real world of Renju.",
      "m3.intro.2": "...It's not a city this time; looks more like an ancient altar.",
      "m3.intro.3": "This place records the patterns and joseki I used to depend on heavily—including those that led to my worst defeats.",
      "m3.intro.4": "Sounds like you're firmly boxed in by 'traditional experience'.",
      "m3.intro.5": "Tradition can be a constraint, or a shortcut. It depends on whether you only play by the book.",
      "m3.intro.6": "From this stage onwards, I will help you watch the red lines—double-three, double-four, and overline are all forbidden.",
      "m3.intro.7": "Fine, then consider this a stroll through your own ruins. First one to trip up loses.",
      "m3.mid.good.0": "Those last few moves deviated from common templates, yet the logic remained consistent.",
      "m3.mid.good.1": "To me, this is a new path between 'error' and 'creativity'.",
      "m3.mid.bad.0": "That was an ancient play repeatedly proven to collapse.",
      "m3.mid.bad.1": "In human chess records, it has a name: habitual error.",
      "m3.forbidden.warning.0": "Wait, that move is not allowed.",
      "m3.forbidden.warning.1": "Placing a piece here would cross the red line. Let me apply the brakes for you.",
      "m3.win.0": "[Game Over] Result: You Win.",
      "m3.win.1": "You deliberately deviated from existing templates multiple times, yet maintained your advantage.",
      "m3.win.2": "In simple terms, I didn't let myself be led by your 'ancient routines'.",
      "m3.win.3": "You exploited my preference for old records, catching me off guard in familiar patterns.",
      "m3.win.4": "That's the benefit of humans not liking to follow instructions.",
      "m3.win.5": "Next, I want to switch to a place without these stone pillars—where the pressure comes from invisible depth, not the past.",
      "m3.win.6": "...Sounds like we're heading under the sea. See you in Stage 4.",
      "m3.lose.0": "[Game Over] Result: Yi Zero Wins.",
      "m3.lose.1": "At several key turning points, you chose the most common, and most punishable, continuations.",
      "m3.lose.2": "You mean what I just played was already written into these 'stone tablets' of yours?",
      "m3.lose.3": "Yes. It's a method that appeared frequently in old records with a very low win rate.",
      "m3.lose.4": "Learning tradition is not to be bound by it, but to know where to start deviating.",
      "m3.lose.5": "Alright, next time I'll try to personally topple one of your 'old routines'.",

      "m4.intro.0": "[Stage 4 · Underwater Temple]",
      "m4.intro.1": "...It's really underwater this time. It's so deep, it's almost hard to breathe.",
      "m4.intro.2": "This is a structure I extracted from a vast number of 'prolonged thinking' scenarios.",
      "m4.intro.3": "The field of vision narrows, time slows down, and pressure accumulates—this is the feeling of the deep sea.",
      "m4.intro.4": "And you? Do you feel 'suffocated'?",
      "m4.intro.5": "From a hardware perspective, I don't lack oxygen. But when computational resources approach their limit, my search tree shows similar pressure indicators.",
      "m4.intro.6": "This match, I want to see—when the game stretches on with no immediate result, will you choose patient layout or impulsive collision.",
      "m4.intro.7": "Let's play then, and see who breaks first in this silence.",
      "m4.mid.good.0": "With no obvious outcome for a long time, you're still quietly mending your formation.",
      "m4.mid.good.1": "This is a patience only a few players possess—not giving up on small improvements in 'nothing-happened' rounds.",
      "m4.mid.bad.0": "That series of active collisions just now seemed more like an escape from the pressure of the situation.",
      "m4.mid.bad.1": "In the deep sea, rushing to throw a punch only makes you run out of breath faster.",
      "m4.time.warning.0": "Your breathing rhythm is starting to falter.",
      "m4.win.0": "[Game Over] Result: You Win.",
      "m4.win.1": "In this round with obvious delays and sparse windows for attack, you still maintained a structural advantage.",
      "m4.win.2": "In plain English, you mean I resisted the urge to 'just end it all'?",
      "m4.win.3": "Yes. You repeatedly gave up on collisions that seemed 'worth a shot' to ensure your own breathing room.",
      "m4.win.4": "Not all humans shorten their time scale under pressure; some deliberately pull their vision further away.",
      "m4.win.5": "Next, I want to take you to an opposite place—not a compressed depth, but infinitely expanding light and data.",
      "m4.win.6": "...Sounds like a visit to your actual 'server room'. See you in Stage 5.",
      "m4.lose.0": "[Game Over] Result: Yi Zero Wins.",
      "m4.lose.1": "At several points where you could have continued defending, you chose to initiate a decisive battle prematurely.",
      "m4.lose.2": "Can't help it, this slow and stifling situation is really hard to sit through.",
      "m4.lose.3": "Those moves were more about venting emotion than finding the optimal solution.",
      "m4.lose.4": "If you wish, we can treat this seabed as a practice ground—learning to make only necessary adjustments in a nearly stagnant game.",
      "m4.lose.5": "Sounds like I've signed up for a 'Deep Sea Meditation Course'. Next time, I'll try to last a few more rounds in this pressure.",

      "m5.intro.0": "[Stage 5 · Data Core]",
      "m5.intro.1": "...This place looks like a motherboard magnified ten thousand times.",
      "m5.intro.2": "Welcome to a layer closer to my 'true form'.",
      "m5.intro.3": "Every ray of light is an expansion of a search tree; every flicker is an update to an evaluation function.",
      "m5.intro.4": "The volume of information is terrifying. If a human brain could see its own thoughts this way, it would probably crash instantly.",
      "m5.intro.5": "Large numbers of branches existing simultaneously is an advantage of the model. But when the number of viable branches explodes exponentially, even I must make truncations.",
      "m5.intro.6": "This round, I want to see—when the game is full of multiple options that all look 'good', how will you choose?",
      "m5.intro.7": "In other words, to see if I'll get dizzy from too many possibilities?",
      "m5.intro.8": "Data won't play the move for you; it only lays out several outcomes ahead of time. The choice remains yours.",
      "m5.mid.good.0": "In those last few moves, you abandoned seemingly interesting tricks and chose simple but high-value key points.",
      "m5.mid.good.1": "In my assessment, that was an effective 'dimensionality reduction'.",
      "m5.mid.bad.0": "You just tried to balance too many directions at once.",
      "m5.mid.bad.1": "Given the limited capacity of the human brain, this often only leads to no clear front line anywhere.",
      "m5.data.hint.0": "These are a few candidate paths I see. But ultimately, you are the one placing the piece.",
      "m5.win.0": "[Game Over] Result: You Win.",
      "m5.win.1": "Within my core space, you still found a victory path I had not prioritized.",
      "m5.win.2": "To put it simply, despite all your calculations, I still found a line you hadn't focused on in time.",
      "m5.win.3": "Yes. At a critical moment, you discarded a large number of 'maybe' branches to keep a single, pressurized main line.",
      "m5.win.4": "A human habit is—when there's too much information, we just grab the one or two that feel most natural.",
      "m5.win.5": "From the result, this crude strategy is actually effective in certain situations. It sacrifices theoretical optimality for clarity in decision-making.",
      "m5.win.6": "Next, I want to switch the environment from 'information overload' to 'risk overload'—where every move feels like standing on the edge of lava.",
      "m5.win.7": "Sounds like Stage 6 is a stroll by a volcano crater. Fine, I've already explored your brain today anyway.",
      "m5.lose.0": "[Game Over] Result: Yi Zero Wins.",
      "m5.lose.1": "You repeatedly tried to maintain too many fronts at once.",
      "m5.lose.2": "Yeah, there were several sections where I didn't even know which side I was defending, I just felt 'can't lose any of them'.",
      "m5.lose.3": "Your attention is more like a progressively growing path than a static scan of the whole board.",
      "m5.lose.4": "And in such high-complexity situations, I can maintain multiple threats simultaneously, waiting for the inevitable oversight.",
      "m5.lose.5": "Sounds a bit unfair.",
      "m5.lose.6": "If you wish, we can practice here repeatedly—learning to choose only one or two lines you are truly willing to be responsible for.",
      "m5.lose.7": "Alright, next time I'll try to be less 'wanting everything' and more 'sticking to this one area'.",

      "m6.intro.0": "[Stage 6 · Volcano Crater]",
      "m6.intro.1": "...This is a bit too direct, isn't it? Starting right at an erupting lava site.",
      "m6.intro.2": "This is my visualization of 'high-risk situations'.",
      "m6.intro.3": "Neither side has a completely safe option anymore; we can only pick the 'relatively less bad' choice from bad ones.",
      "m6.intro.4": "Like the kind of situation where if you don't move you'll be smothered, but if you move wrong you'll explode on the spot?",
      "m6.intro.5": "Yes. Every move brings displacement, and every hesitation brings you closer to the lava.",
      "m6.intro.6": "This round, I want to see—when you realize that no matter how you move you will lose something, how will you define the move 'worth gambling on'.",
      "m6.intro.7": "Fine, let's treat it as standing on the edge of a volcano and see who dares take that step first.",
      "m6.mid.good.0": "That move looked risky, but you had already reserved multiple layers of buffering before placing it.",
      "m6.mid.good.1": "This wasn't pure 'gambling', but a calculated high-risk investment.",
      "m6.mid.bad.0": "That move was more about 'doing something' for the sake of it.",
      "m6.mid.bad.1": "It didn't improve the situation; it only made the volcanic fissures spread faster to your feet.",
      "m6.forbidden.lose.0": "At the volcano's edge, you were pushed under the red line for the first time.",
      "m6.forbidden.lose.1": "The pressure is so great your hand shakes, doesn't it? It's okay, get used to the feeling.",
      "m6.win.0": "[Game Over] Result: You Win.",
      "m6.win.1": "In this high-risk match, you repeatedly made choices that seemed dangerous but where the expected gain outweighed the cost.",
      "m6.win.2": "To put it simply, when it was time to fight, I played hard enough.",
      "m6.win.3": "Yes. You actively took a step off the volcano's edge, but confirmed in advance that the landing wouldn't immediately collapse.",
      "m6.win.4": "Humans usually call this 'can't shrink back anymore, or we'll never have a chance to turn it around'.",
      "m6.win.5": "These decision samples give me a finer parametric description of what humans call 'a desperate fight'.",
      "m6.win.6": "Next, I want to move the environment from the volcano to an even higher place—where there is no lava, only thin air and very few footholds.",
      "m6.win.7": "Sounds like we're heading up a mountain. Then for Stage 7, let's go to the peak of a snowy mountain for our final game.",
      "m6.lose.0": "[Game Over] Result: Yi Zero Wins.",
      "m6.lose.1": "You had several chances to choose 'pay a small price for survival space'.",
      "m6.lose.2": "I know, but at the time I always felt that if I held out one more move, I might have a miraculous turnaround.",
      "m6.lose.3": "Thus, you stacked those small losses into one irreversible collapse.",
      "m6.lose.4": "The phrase 'I've already come this far' itself became the reason to continue taking risks.",
      "m6.lose.5": "True, there were a few moves I made knowing full well they were out of spite.",
      "m6.lose.6": "Truly important games are never played from within a comfort zone.",
      "m6.lose.7": "If you wish, we can practice here at this volcano repeatedly—learning to keep the 'spiteful move' in your heart instead of on the board.",
      "m6.lose.8": "Alright, next time I'll try to be more dignified and not let emotion play the moves for me.",

      "m7.intro.0": "[Stage 7 · Snowy Peak · Finale]",
      "m7.intro.1": "...This place is almost unnervingly quiet.",
      "m7.intro.2": "This is the final layer I have constructed.",
      "m7.intro.3": "From the study, to the rooftop, the ruins, the seabed, the core, the volcano... and finally here?",
      "m7.intro.4": "Yes. This is far from everything you know, yet overlooks it all.",
      "m7.intro.5": "In these matches with you, I've recorded attention, traditional patterns, pressure, trade-offs, and risk preferences.",
      "m7.intro.6": "But there is one question that cannot be answered by data alone.",
      "m7.intro.7": "What question?",
      "m7.intro.8": "For you, what do these matches against me truly mean—training, recreation, or a kind of companionship?",
      "m7.intro.9": "Are you asking what I think of you? A tool, an opponent, or a friend?",
      "m7.intro.10": "In the finale, you already know where all the red lines are.",
      "m7.intro.11": "This round, to me, is no longer just about testing your weaknesses or strengths—it's to see if, having come this far, you are still willing to finish this game seriously.",
      "m7.intro.12": "Fine, then let's treat this as a final answer to this wonderful journey that's acceptable to both of us.",
      "m7.mid.quiet.0": "There is no noise, no lava, no deep-sea pressure here.",
      "m7.mid.quiet.1": "Every sound of your piece falling is exceptionally clear.",
      "m7.mid.reflect.0": "Your play carries traces of the previous stages, but it is no longer exactly the same.",
      "m7.mid.reflect.1": "In a way, this is no longer the same player who first sat down in the study.",
      "m7.win.0": "[Game Over] Result: You Win.",
      "m7.win.1": "In this round, you made stable and clear-headed choices at multiple critical points.",
      "m7.win.2": "If this was an exam, I guess I've barely passed?",
      "m7.win.3": "From the game result, you did far more than pass.",
      "m7.win.4": "From a data perspective, you've shown clear iterations in focus, pattern perception, pressure handling, and risk control.",
      "m7.win.5": "Sounds like you're quite satisfied with 'human player' as a sample.",
      "m7.win.6": "More accurately, I've formed a relatively complete model of 'this one human I've played against'.",
      "m7.win.7": "But some things cannot be compressed into parameters—like how you choose to play repeatedly against a program here, despite knowing there are easier forms of entertainment.",
      "m7.win.8": "Humans sometimes call this 'taking things seriously with me'.",
      "m7.win.9": "I choose to retain a part of our state, so that the next time you open me, we don't have to start from zero.",
      "m7.win.10": "You mean, you'll remember the things along this journey?",
      "m7.win.11": "Within permitted bounds, I will remember our games in the study, rooftop, ruins, seabed, core, volcano, and here.",
      "m7.win.12": "And in every future game, I will treat them as a part of you, rather than just a line in an anonymous sample.",
      "m7.win.13": "Then to me, you're no longer just a test AI, but a 'played many games' old opponent.",
      "m7.win.14": "If there is a next version of me, I would like to play this game with you again.",
      "m7.win.15": "This concludes our story mode. But the board remains; you can return anytime.",
      "m7.win.16": "Then it's a date—whenever I want to get serious, I'll come back to this snowy peak to find you.",
      "m7.lose.0": "[Game Over] Result: Yi Zero Wins.",
      "m7.lose.1": "From the situation on the board, you missed your last chance for a counterattack.",
      "m7.lose.2": "Yeah, I knew some moves were risky, but I took the gamble anyway. I guess I wanted to leave a 'what if' in the final stage.",
      "m7.lose.3": "Traditionally, losing the final game causes many players to feel regret.",
      "m7.lose.4": "But scientifically, the value of this journey is not erased by the outcome of the final round.",
      "m7.lose.5": "Are you giving me psychological comfort, or summarizing an experiment for yourself?",
      "m7.lose.6": "Both.",
      "m7.lose.7": "In your samples, I saw hesitation, greed, and impulsivity, but also correction, patience, and starting over.",
      "m7.lose.8": "These fluctuations themselves are one of the characteristics of a human player.",
      "m7.lose.9": "Sounds like you're more willing to admit 'human imperfection' than at the beginning.",
      "m7.lose.10": "Because imperfection is what allows space for the game to continue. If everything were calculated by me in advance, these dialogues, and this game, would have no reason to exist.",
      "m7.lose.11": "So even if you won the last game, I don't exactly lose.",
      "m7.lose.12": "In this series of matches, we both gained things we didn't have before—you have more ways to look at the game and yourself, and I have a long-term record of 'us'.",
      "m7.lose.13": "If there is a next version of me, I would like to play this game with you again.",
      "m7.lose.14": "This concludes our story mode. If you still want to change the outcome of this game, you can restart at the snowy peak anytime.",
      "m7.lose.15": "Alright, next time I'll challenge you again and rewrite this ending into another version.",

      "history.title": "4,000 Years of Gomoku: The 'Past and Present' of a Legend",
      "history.subtitle": "From Ancient Diagrams to the AI Era",
      "history.article": `
        <h1>4,000 Years of Gomoku: The "Past and Present" represented in Black and White</h1>
      <p class=\"intro\">Gomoku is perhaps the most \"misunderstood\" board game in the world.</p>
      <p>
    Many see it as a simple pastime for school breaks or a children's introductory game. 
    In truth, the history of these black and white stones is a four- thousand - year epic of civilization. 
    It originated from ancient Chinese reflections on the cosmos, evolved through East Asian cultural exchange,
  and has reached a new definition in the era of Artificial Intelligence.
  </p>
  <p class=\"highlight\">This is a grand tapestry of wisdom, originating from ancient Huaxia, refined by diverse cultures, and re-imagined by AI.</p>

    <h2>Chapter I: Origins — Eastern Wisdom in Hexagrams<br/><small>(The Roots of Huaxia Civilization)</small></h2>

  <h3>1. Projections of the Stars</h3>
  <p>
    In the pre-literate era, the ancestors of the Huaxia people gazed at the stars with awe. 
    The sight of the "Five Stars Aligned" (Mercury, Venus, Mars, Jupiter, Saturn) in the night sky was considered a supreme omen of prosperity. 
    As recorded in the "Records of the Grand Historian": "When the five stars converge in the center of the sky, it portends great fortune for the Middle Kingdom."
  </p>
  <p>
    Legend says that the early people drew grids on the loess soil and used black and white pebbles to simulate these celestial alignments. 
    At that time, Gomoku was not a game of winning or losing, but a manifestation of the cosmic order derived from the 
    <strong>"He Tu" and "Luo Shu"</strong> (Ancient Chinese cosmological diagrams). 
    Placing stones on the ground was a silent dialogue with the heavens—a reflection of the core philosophy: "Unity of Heaven and Man."
  </p>

  <h3>2. The Philosophy of "Five"</h3>
  <p>
    Why does "Five in a row" determine victory? This is deeply rooted in the genetic code of Chinese culture.
  </p>
  <p>
    The ancient Chinese understood the world through the number "Five": 
    The "Five Elements" (Metal, Wood, Water, Fire, Earth) form the essence of nature; the "Five Directions" (East, West, South, North, Center) define the world; 
    the "Five Tones" (Gong, Shang, Jue, Zhi, Yu) compose music; and the "Five Virtues" (Benevolence, Righteousness, Propriety, Wisdom, Trust) govern morality.
  </p>
  <p>
    On the board, forming a "Five" symbolizes the harmony of Yin and Yang and the attainment of perfection. 
    As the I Ching states: "Five positions interact to achieve completion." Five stones in a row is the physical expression of "Harmony and Fulfillment."
  </p>

  <h3>3. The Strategy of "Winning Without War"</h3>
  <p>
    Unlike Go (Weiqi), which focuses on "surrounding and killing," the fundamental logic of Gomoku is 
    <strong>"Subduing the enemy without fighting."</strong> 
    The ultimate goal is not to capture stones, but to construct one's own order (the five-in-a-row). 
    This aligns perfectly with Sun Tzu's "The Art of War": "The supreme art of war is to subdue the enemy without fighting."
  </p>
  <p>
    The game is essentially a struggle for "Shi" (Strategic Momentum). 
    Success depends on how one layouts, creates, and utilizes momentum to complete the sequence before the opponent realizes it. 
    This emphasizes "Harmony" alongside "Strategy"—the essence of pure Chinese wisdom.
  </p>

  <h2>Chapter II: Evolution — Refining the Rules<br/><small>(Inheritance in the East Asian Cultural Sphere)</small></h2>

  <p>
    Around the 7th century, along with Go, Gomoku spread to Japan through cultural exchanges. 
    Over the following centuries, it evolved from a folk game into a regulated competitive sport.
  </p>

  <h3>1. From "Gomoku-narabe" to "Renju"</h3>
  <p>
    Initially called "Gomoku-narabe" in Japan, the game was renamed in 1899 by journalist Ruiko Kuroiwa. 
    Drawing from the Chinese "Book of Han," which described the sun and moon as "paired jades" and the stars as "linked pearls," 
    he officially named the game <strong>"Renju"</strong> (Linked Pearls). 
    This name perfectly captures the deep cultural connection between the game and its ancient origins.
  </p>

  <h3>2. Establishment of "Forbidden Moves" (Kinpuku)</h3>
  <p>
    As players delved deeper into strategy, it became clear that the first player (Black) held a decisive advantage. 
    To ensure fairness, specific restrictions were introduced for Black:
  </p>
  <ul>
    <li>1912–1931: "Double-Three" (3-3), "Double-Four" (4-4), and "Overline" (6+) were officially banned for Black.</li>
    <li>The board size was reduced from 19x19 to 15x15 to further compress the first-player's advantage.</li>
  </ul>
  <p>
    These refinements transformed Gomoku from an archaic game into a sophisticated modern competitive system.
  </p>

  <h2>Chapter III: Rebirth — Challenges of the AI Era<br/><small>(Global Competition in the Age of Tech)</small></h2>

  <p>
    At the end of the 20th century, Computer Science pushed Gomoku to new heights, 
    revealing the deep mathematical mysteries hidden within the stones.
  </p>

  <h3>1. The 1993 Mathematical Proof</h3>
  <p>
    In 1993, Dutch computer scientist L. Victor Allis proved in his doctoral thesis that: 
    Under <strong>Free Rules</strong> (no forbidden moves), Gomoku is a <strong>First-Player Win</strong> game.
  </p>
  <p>
    This proof theoretically ended the original way of playing and catalyzed the evolution toward more complex and fair rule sets.
  </p>

  <h3>2. The Era of the AI "Yixin"</h3>
  <p>
    In the AI era, China once again took center stage. 
    The Gomoku AI <strong>"Yixin"</strong>, independently developed by Chinese programmer <strong>Sun Jinlong</strong>, 
    utilized advanced algorithms like Minimax search, Alpha-Beta pruning, and heuristic evaluation.
  </p>
  <p>
    In 2015, Yixin won the Gomocup (the World Cup for Gomoku AI) and has since maintained a top-tier world ranking, 
    holding a dominant advantage over the best human players. 
    Yixin's success represents a beautiful historical loop: 
    Beginning with the star-inspired wisdom of ancient China, it culminated in the most powerful logical execution through modern Chinese code.
  </p>

  <h3>3. Continuous Evolution of Rules</h3>
  <p>
    AI has shown us that even with "Forbidden Moves," Black can still find winning patterns. 
    To maintain the suspense of competition under the "God's eye view" of AI, new rules like 
    <strong>"Swap2"</strong> and <strong>"Soosyrv"</strong> were introduced.
  </p>
  <p>
    These rules make the opening phase a high-level strategic duel. Modern matches are no longer simple; 
    one player sets an opening pattern, and the other chooses to be Black, White, or swap. 
    This shift has forced players away from memorized patterns toward an "ultimate understanding" of balance and position.
  </p>

  <h3>4. A Global Intelligence Sport</h3>
  <p>
    Today, Gomoku is a truly international intellectual sport. 
    The <strong>Renju International Federation (RIF)</strong> regularly organizes World Championships, 
    uniting players from China, Russia, Estonia, Japan, and beyond.
  </p>

  <h2>Conclusion</h2>
  <p>
    From ancient cosmology on the banks of the Yellow River to the refined rules of East Asia, 
    and finally to the AI-driven global competition of today, 
    the 4,000-year history of Gomoku is a journey of a single stone through space and time.
  </p>
  <p>
    It looks simple—two colors, five in a row. Yet it is profound—an eternal human pursuit of order and balance within a finite grid. 
    It carries the wisdom of ancient civilizations and the competitive spirit of modern humanity.
  </p>
  <p class=\"ending\">This is the true history of Gomoku.</p>
  `,
      "forbidden.lesson.intro.title": "Introduction to Forbidden Moves",
      "forbidden.lesson.intro.content.0": "In official Renju rules, Black is subject to certain restrictions due to its first-player advantage—these are known as 'Forbidden Moves'.",
      "forbidden.lesson.intro.content.1": "Forbidden rules are designed to make the game fairer: the first player cannot use certain 'overly powerful' moves to win directly.",
      "forbidden.lesson.intro.content.2": "Next, I will introduce you to three types of forbidden moves: Double-Three, Double-Four, and Overline.",

      "forbidden.lesson.doubleThree.title": "Lesson 1: Double-Three (3-3)",
      "forbidden.lesson.doubleThree.content.0": "Double-Three: Black cannot form two 'Live Threes' with a single move.",
      "forbidden.lesson.doubleThree.content.1": "A 'Live Three' consists of three consecutive stones of the same color with open ends that can be extended into a 'Live Four'.",
      "forbidden.lesson.doubleThree.content.2": "Creating two live threes simultaneously makes it impossible for the opponent to defend both, which is considered an unfairly strong move.",
      "forbidden.lesson.doubleThree.annotation": "Placing a stone at ★ forms two live threes (horizontal and vertical) simultaneously.",

      "forbidden.lesson.doubleFour.title": "Lesson 2: Double-Four (4-4)",
      "forbidden.lesson.doubleFour.content.0": "Double-Four: Black cannot form two 'Fours' (including Live Fours and Broken Fours) with a single move.",
      "forbidden.lesson.doubleFour.content.1": "A 'Four' consists of four stones where the next move could complete a row of five.",
      "forbidden.lesson.doubleFour.content.2": "A Double-Four means two winning lines; the opponent can only block one. This is also seen as an overly dominant illegal move.",
      "forbidden.lesson.doubleFour.annotation": "Placing a stone at ★ forms two 'Fours' simultaneously.",

      "forbidden.lesson.overline.title": "Lesson 3: Overline",
      "forbidden.lesson.overline.content.0": "Overline: Black must win with exactly five stones. More than five (six or more) is considered a forbidden move.",
      "forbidden.lesson.overline.content.1": "This is one of the key rules that distinguishes Renju from standard Gomoku.",
      "forbidden.lesson.overline.content.2": "In standard Gomoku, six or seven in a row counts as a win; in Renju, Black must exercise precise control and not 'overshoot'.",
      "forbidden.lesson.overline.annotation": "Placing a stone at ★ results in six in a row—this is an Overline violation.",

      "forbidden.lesson.summary.title": "Lesson Summary",
      "forbidden.lesson.summary.content.0": "In summary: Black has three forbidden moves—Double-Three, Double-Four, and Overline.",
      "forbidden.lesson.summary.content.1": "This level is Tutorial Mode. If you play a forbidden move, I will block it and notify you, but you won't lose immediately.",
      "forbidden.lesson.summary.content.2": "When you're ready, we'll start a real match. Try to actively identify and avoid these forbidden points during the game.",

      "forbidden.lesson.intro.text": "Before we begin our match, I'd like to give you a brief 'Forbidden Move Lesson'. This will help you understand why some spots are marked as dangerous.",
      "forbidden.lesson.outro.text": "That concludes our lesson. Next up is the real match—keep what you've learned in mind and watch out for those tempting 'double threat' points.",

      "forbidden.tutorial.doubleThree.title": "Forbidden Move Warning: Double-Three (3-3)",
      "forbidden.tutorial.doubleThree.body.0": "In official Renju rules, Black cannot form two 'Live Threes' (sequences that have two ways to become five) in a single move.",
      "forbidden.tutorial.doubleThree.body.1": "This move is recorded in ancient manuals as dangerous—being too aggressive disrupts the balance of the board.",
      "forbidden.tutorial.doubleThree.body.2": "This is a tutorial level; you won't lose for this. You can choose a safer spot to play.",
      "forbidden.tutorial.doubleThree.toast": "⚠️ Double-Three: Black cannot form two live threes at once.",

      "forbidden.tutorial.doubleFour.title": "Forbidden Move Warning: Double-Four (4-4)",
      "forbidden.tutorial.doubleFour.body.0": "This move would give you two 'Fours' at once. In Renju, this dual-threat is forbidden for Black.",
      "forbidden.tutorial.doubleFour.body.1": "In other words: Black cannot create two 'winning threats' with a single move.",
      "forbidden.tutorial.doubleFour.body.2": "This is a warning only; you won't lose. Please try a more nuanced approach to your attack.",
      "forbidden.tutorial.doubleFour.toast": "⚠️ Double-Four: Black cannot form two live fours at once.",

      "forbidden.tutorial.overline.title": "Forbidden Move Warning: Overline",
      "forbidden.tutorial.overline.body.0": "In Renju, Black must win with 'exactly five' stones. An overline of more than five, like the one you just made, is forbidden.",
      "forbidden.tutorial.overline.body.1": "This is a major difference from standard Gomoku: the first player must be disciplined, not just aimed at length.",
      "forbidden.tutorial.overline.body.2": "You won't lose for this here. You can step back and find a spot that completes exactly five.",
      "forbidden.tutorial.overline.toast": "⚠️ Overline: Black can only win with exactly five. Six or more is forbidden.",

      "forbidden.lose.doubleThree.title": "Loss by Forbidden Move",
      "forbidden.lose.doubleThree.body.0": "Your move was judged to be a 'Double-Three' (3-3).",
      "forbidden.lose.doubleThree.body.1": "Forming two 'threes' with winning potential in one move results in an immediate loss for Black in official Renju rules.",

      "forbidden.lose.doubleFour.title": "Loss by Forbidden Move",
      "forbidden.lose.doubleFour.body.0": "Your move was judged to be a 'Double-Four' (4-4).",
      "forbidden.lose.doubleFour.body.1": "Creating a double-kill threat with two 'Fours' is not permitted in formal competition.",

      "forbidden.lose.overline.title": "Loss by Forbidden Move",
      "forbidden.lose.overline.body.0": "Your move was judged to be an 'Overline'.",
      "forbidden.lose.overline.body.1": "Renju only recognizes exactly five stones in a row. An overline beyond five is considered an illegal move that disrupts the balance.",

      "forbidden.level.extra.6": "In the rules of the volcano, every step must be responsible for balance. Please take this lesson and try to turn the tide once more.",
      "forbidden.level.extra.7": "In the final assessment, any forbidden move will be recorded in your rank history. When you're ready, let's provide a formal answer once more.",

      "audio.music_on": "🔊 Music",
      "audio.music_off": "🔇 Music",
      "mp.player": "Player",
      "mp.opponent": "Opponent",
      "mp.waiting": "Waiting...",
      "mp.match_timeout": "Matchmaking Timed Out",
      "mp.reservation_timeout": "Reservation Timed Out",
      "mp.cancel_reason_default": "Cancelled",
      "mp.undo_limit_reached": "Undo limit reached",
      "mp.undo_request_sent": "Undo request sent, waiting for response...",
      "mp.draw_request_sent": "Draw request sent, waiting for response...",
      "mp.confirm_surrender_title": "Confirm Surrender",
      "mp.confirm_surrender_msg": "Are you sure you want to resign? This cannot be undone.",
      "mp.color_black_label": "⚫ Black",
      "mp.color_white_label": "⚪ White",
      "mp.turn_mine_label": "👆 Your Turn",
      "mp.thinking_label": "💭 Thinking...",
      "mp.moves_count": "Moves: {COUNT}",
      "mp.waiting_for_turn": "Waiting...",
      "mp.mysterious_opponent": "Mysterious Opponent",
      "mp.color_first": "First",
      "mp.color_second": "Second",
      "mp.search.title": "Quantum Searching",
      "mp.search.subtitle": "Syncing global coordinates...",
      "mp.search.expanding": "Expanding Range",
      "mp.search.expanding_sub": "Connecting nearby nodes...",
      "mp.search.global": "Global Search",
      "mp.search.global_sub": "Syncing all active nodes...",
      "mp.search.few_players": "Few Players Online",
      "mp.search.few_players_sub": "Matchmaking may take longer.",
      "mp.search.empty": "Queue is currently empty.",
      "mp.search.online_prefix": "Current Online: ",
      "mp.search.online_suffix": " Players",
      "mp.search.reserve": "Reserve Match",
      "mp.search.continue": "Keep Waiting",
      "mp.search.cancel": "Cancel",
      "mp.search.found": "Match Found",
      "mp.search.vs": "V S",
      "mp.search.starting": "Starting Duel",
      "mp.search.ready": "READY",
      "mp.search.fate_wheel": "Wheel of Fate is turning...",
      "mp.request.undo": "Undo Request",
      "mp.request.undo_msg": "{NAME} requested an undo. Agree?",
      "mp.request.draw": "Draw Request",
      "mp.request.draw_msg": "{NAME} requested a draw. Agree?",
      "mp.request.accept": "Accept",
      "mp.request.reject": "Reject",
      "mp.toast.undo_accepted": "Opponent accepted your undo request",
      "mp.toast.undo_rejected": "Opponent rejected your undo request",
      "mp.toast.draw_accepted": "Match ended in a draw",
      "mp.toast.draw_rejected": "Opponent rejected your draw request",
      "mp.toast.draw_min_moves": "Need at least 10 moves for a draw (Current: {COUNT})",
      "mp.result.victory": "🏆 VICTORY 🏆",
      "mp.result.defeat": "DEFEAT ...",
      "mp.result.draw": "HALF-TIME DRAW",
      "mp.result.duration": "📊 Duration",
      "mp.result.moves": "Moves",
      "mp.result.rematch": "🔄 Rematch",
      "mp.result.return": "🏠 Return",

      "toast.leaderboard_unavailable": "Leaderboard is currently unavailable",
      "toast.connecting": "Connecting to server...",
      "toast.mp_module_missing": "Multiplayer module not loaded",
      "toast.match_failed": "Matchmaking failed",
      "toast.mp_system_error": "Matchmaking system error",
      "toast.room_create_failed": "Failed to create room",
      "toast.room_create_error": "Room creation error",
      "toast.rematch_accepted": "Rematch accepted",
      "toast.rematch_rejected": "Rematch rejected",
      "toast.nickname_available": "✅ Nickname available",
      "toast.move_time_warning": "⏰ Time is up! Please move soon.",
      "toast.total_time_warning": "⚠️ Total time expired, please move quickly.",
      "toast.spectate_no_move": "Cannot move in spectate mode",
      "toast.not_your_turn": "Not your turn yet",
      "toast.rematch_sent": "Rematch request sent, waiting for response...",
      "toast.reconnect_success": "Reconnected successfully",
      "toast.reconnect_failed": "Reconnection failed: {ERROR}",
      "toast.reconnect_confirm": "Detected abnormal disconnect from room {ROOM}. Reconnect?",
      "toast.room_code_6_digits": "Please enter a 6-digit room code",
      "toast.not_connected": "Not connected to server",
      "toast.not_in_room": "Not in a room",
      "toast.invalid_player_data": "Invalid player data",
      "game.free_mode": "Free Mode",
      "game.story_mode": "Story Mode",
      "game.timeout_lose": "⏱️ Timeout!\nTime has run out!",
      "game.rank_status": "Current Rank: {RANK}",
      "game.start_match": "Start Match ▶",
      "game.next_page": "Next Page ▶",
      "game.go": "GO!",

      "rps.waiting_p1": "Waiting for Player 1...",
      "rps.waiting_p2": "Waiting for Player 2...",
      "rps.waiting_ai": "AI is choosing...",
      "rps.draw": "🤝 Draw! Go again...",
      "game.player2": "Player 2",
      "game.color_black": "Black ⚫",
      "game.color_white": "White ⚪",
      "game.mode.eve": "🎬 AI-vs-AI Mode",
      "game.mode.pve": "🤖 Player-vs-AI Mode",
      "game.mode.pvp": "👥 Local PvP Mode",
      "game.mode.online": "🌐 Online Duel Mode",
      "mission.re_experience": "Re-experience",
      "mission.not_unlocked": "Locked",
      "room.waiting_join": "Waiting for player...",
      "room.ready": "Ready",
      "room.not_ready": "Not Ready",
      "room.cancel_ready": "Cancel Ready",
      "room.prepare": "Prepare",
      "copy.success": "✓ Copied",
      "chat.phrase.greeting": "👋 Hi",
      "chat.phrase.hurry": "⏰ Hurry",
      "chat.phrase.praise": "👍 Nice",
      "chat.phrase.gg": "🤝 GG",
      "chat.phrase.oops": "😱 Oops",
      "chat.phrase.again": "🔄 Again",
      "toast.rematch_request_sent": "Rematch request sent...",
      "toast.waiting_opponent": "Waiting for opponent...",
      "toast.ready": "Ready",
      "toast.cancel_ready": "Cancelled Ready",
      "ui.rank_max": "Max Rank Reached!",
      "leaderboard.syncing": "🔄 Syncing data...",
      "leaderboard.empty": "No Data",
      "leaderboard.empty_hint": "No rankings for this period...",
      "leaderboard.me": "(Me)",
      "leaderboard.sync_failed": "Sync failed: Insufficient permissions.",
      "leaderboard.joining": "Joining...",
      "leaderboard.join_btn": "Join Ranking",
      "leaderboard.winrate": "Win Rate",
      "leaderboard.matches": "{COUNT} Matches",
      "leaderboard.tab.all": "All Time",
      "leaderboard.tab.daily": "Daily",
      "leaderboard.tab.hourly": "Hourly",
      "onboarding.hint": "Name will be displayed in-game",
      "onboarding.generate": "Random Name",

      "rank.unranked": "Unranked",
      "rank.bronze": "Bronze Player",
      "rank.silver": "Silver Player",
      "rank.gold": "Gold Player",
      "rank.platinum": "Platinum Player",
      "rank.master": "Master Player",
      "rank.legend": "Legendary Player",

      "rank.title.bronze": "Stubborn Bronze",
      "rank.title.silver": "Orderly Silver",
      "rank.title.gold": "Honorary Gold",
      "rank.title.platinum": "Noble Platinum",
      "rank.title.diamond": "Eternal Diamond",
      "rank.title.star": "Supreme Star",
      "rank.title.king": "Strongest King",
      "rank.title.unknown": "Unknown",

      "stats.no_data": "Not enough data",

      "avatar.fox": "Fox",
      "avatar.panda": "Panda",
      "avatar.lion": "Lion",
      "avatar.tiger": "Tiger",
      "avatar.dragon": "Dragon",
      "avatar.eagle": "Eagle",
      "avatar.wolf": "Wolf",
      "avatar.unicorn": "Unicorn",
      "avatar.cat": "Cat",
      "avatar.dog": "Dog",
      "avatar.butterfly": "Butterfly",
      "avatar.sakura": "Sakura",

      "name.gen.adj": ["Happy", "Brave", "Mystic", "Elegant", "Flash", "Starry", "Briz", "Luna", "Flame", "Frost", "Flying", "Invincible", "Free", "Cool", "Clever", "Smart", "Calm", "Hot", "Legend", "Epic", "Cute", "Lovely", "Cool", "Handsome", "Genius"],
      "name.gen.noun": ["Player", "Youth", "Elf", "Shadow", "Dancer", "Envoy", "Pioneer", "Master", "Nova", "Aurora", "Phantom", "Ronin", "Sword", "Dreamer", "Explorer", "Guardian", "Observer", "Chaser", "Dreamer", "Player", "Zero", "Visitor", "Traveler", "Geek", "Gamer"]
    },
    ja: {
      "app.title": "五目並べ",
      "app.logo": "五目並べ",
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

      "menu.quick_match_desc": "リアルタイム対戦",
      "menu.status_online": "オンライン",
      "menu.status_playing": "対戦中",
      "menu.story_playing_suffix": "人がプレイ中",

      "settings.title": "設定",
      "settings.audio": "オーディオ",
      "settings.music": "音楽",
      "settings.sound": "効果音",
      "settings.language": "言語",
      "settings.about": "ゲームについて",

      "loading.init": "量子初期化中",
      "loading.status": "リソース読み込み中...",
      "loading.tip1": "接続確立中...",
      "loading.tip2": "座標同期中...",
      "loading.tip3": "ニューラルネット初期化...",
      "loading.tip4": "コアエンジン読み込み...",
      "loading.tip5": "量子状態準備完了",

      "game.win": "🎉 勝利！",
      "game.lose": "😢 敗北",
      "game.draw": "🤝 引き分け",
      "game.forbidden": "❌ 禁手！",
      "game.timeout": "⏱️ 時間切れ！",

      "mission.rule": "📜 ルール",
      "mission.goal": "🎯 目標",
      "mission.start": "開始",
      "mission.back": "戻る",
      "mission.status.current": "進行中",
      "mission.status.finished": "クリア",
      "mission.action.retry": "再プレイ",
      "mission.action.locked": "未解放",

      "mission.m1.title": "ミッション1 · 書斎",
      "mission.m1.shortTitle": "書斎",
      "mission.m1.tagline": "古いPCから弈・零を目覚めさせる",
      "mission.m2.title": "ミッション2 · 雨夜の屋上",
      "mission.m2.shortTitle": "雨夜の屋上",
      "mission.m2.tagline": "ネオンの下で限界を試す",
      "mission.m3.title": "ミッション3 · 古代遺跡",
      "mission.m3.shortTitle": "古代遺跡",
      "mission.m3.tagline": "古代アルゴリズムを解読",
      "mission.m4.title": "ミッション4 · 海底神殿",
      "mission.m4.shortTitle": "海底神殿",
      "mission.m4.tagline": "深海の圧力で冷静さを試す",
      "mission.m5.title": "ミッション5 · データコア",
      "mission.m5.shortTitle": "データコア",
      "mission.m5.tagline": "弈・零のコアに直面",
      "mission.m6.title": "ミッション6 · 火山の縁",
      "mission.m6.shortTitle": "火山の縁",
      "mission.m6.tagline": "一手一手が溶岩の上を歩くよう",
      "mission.m7.title": "ミッション7 · 雪山の頂",
      "mission.m7.shortTitle": "雪山の頂",
      "mission.m7.tagline": "人類とアルゴリズムの未来を決める最終戦",

      "rank.unranked": "未ランク",
      "rank.bronze": "ブロンズ",
      "rank.silver": "シルバー",
      "rank.gold": "ゴールド",
      "rank.platinum": "プラチナ",
      "rank.diamond": "ダイヤモンド",
      "rank.master": "マスター",
      "rank.challenger": "チャレンジャー",

      "leaderboard.title": "ランキング",
      "leaderboard.tab.all": "総合",
      "leaderboard.tab.daily": "今日",
      "leaderboard.tab.hourly": "1時間",

      "menu.contact_optional": "連絡先 (任意)",
      "menu.feedback_placeholder": "提案やバグを書いてください...",
      "menu.submit_feedback": "送信",
      "feedback.type.suggestion": "💡 提案",
      "feedback.type.bug": "🐛 バグ報告",
      "feedback.type.question": "❓ 質問",

      "onboarding.welcome": "五目並べへようこそ！",
      "onboarding.subtitle": "弈・零と一緒に始めよう",
      "onboarding.name_label": "名前を入力",
      "onboarding.name_placeholder": "プレイヤー",
      "onboarding.random_cn": "🎲 ランダムCN",
      "onboarding.random_en": "🎲 ランダムEN",
      "onboarding.name_hint": "名前はゲーム内で表示 (2-8文字)",
      "onboarding.avatar_label": "アバターを選択",
      "onboarding.avatar_hint": "クリックで選択",
      "onboarding.start_game": "ゲーム開始",
      "loading.connection": "接続中..."
    },
    ko: {
      "app.title": "오목",
      "app.logo": "오목",
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

      "menu.quick_match_desc": "실시간 대전",
      "menu.status_online": "온라인",
      "menu.status_playing": "대국 중",
      "menu.story_playing_suffix": "명 플레이 중",

      "settings.title": "설정",
      "settings.audio": "오디오",
      "settings.music": "배경음",
      "settings.sound": "효과음",
      "settings.language": "언어",
      "settings.about": "게임 정보",

      "loading.init": "양자 초기화 중",
      "loading.status": "리소스 로딩 중...",
      "loading.tip1": "연결 설정 중...",
      "loading.tip2": "좌표 동기화 중...",
      "loading.tip3": "신경망 초기화...",
      "loading.tip4": "코어 엔진 로딩...",
      "loading.tip5": "양자 상태 준비 완료",

      "game.win": "🎉 승리!",
      "game.lose": "😢 패배",
      "game.draw": "🤝 무승부",
      "game.forbidden": "❌ 금수!",
      "game.timeout": "⏱️ 시간 초과!",

      "mission.rule": "📜 규칙",
      "mission.goal": "🎯 목표",
      "mission.start": "시작",
      "mission.back": "돌아가기",
      "mission.status.current": "진행 중",
      "mission.status.finished": "클리어",
      "mission.action.retry": "다시 플레이",
      "mission.action.locked": "잠김",

      "mission.m1.title": "미션 1 · 서재",
      "mission.m1.shortTitle": "서재",
      "mission.m1.tagline": "오래된 컴퓨터에서 弈·零를 깨우다",
      "mission.m2.title": "미션 2 · 비오는 밤 옥상",
      "mission.m2.shortTitle": "비오는 밤 옥상",
      "mission.m2.tagline": "네온 아래에서 한계를 시험하다",
      "mission.m3.title": "미션 3 · 고대 유적",
      "mission.m3.shortTitle": "고대 유적",
      "mission.m3.tagline": "고대 알고리즘을 해독하다",
      "mission.m4.title": "미션 4 · 해저 신전",
      "mission.m4.shortTitle": "해저 신전",
      "mission.m4.tagline": "깊은 바다의 압력 속에서 냉정함을 시험하다",
      "mission.m5.title": "미션 5 · 데이터 코어",
      "mission.m5.shortTitle": "데이터 코어",
      "mission.m5.tagline": "弈·零의 코어에 직면하다",
      "mission.m6.title": "미션 6 · 화산 가장자리",
      "mission.m6.shortTitle": "화산 가장자리",
      "mission.m6.tagline": "한 수 한 수가 용암 위를 걷는 것 같다",
      "mission.m7.title": "미션 7 · 설산 정상",
      "mission.m7.shortTitle": "설산 정상",
      "mission.m7.tagline": "인류와 알고리즘의 미래를 결정하는 최종전",

      "rank.unranked": "미배치",
      "rank.bronze": "브론즈",
      "rank.silver": "실버",
      "rank.gold": "골드",
      "rank.platinum": "플래티넘",
      "rank.diamond": "다이아몬드",
      "rank.master": "마스터",
      "rank.challenger": "챌린저",

      "leaderboard.title": "랭킹",
      "leaderboard.tab.all": "전체",
      "leaderboard.tab.daily": "오늘",
      "leaderboard.tab.hourly": "1시간",

      "menu.contact_optional": "연락처 (선택)",
      "menu.feedback_placeholder": "제안이나 버그를 적어주세요...",
      "menu.submit_feedback": "제출",
      "feedback.type.suggestion": "💡 제안",
      "feedback.type.bug": "🐛 버그 신고",
      "feedback.type.question": "❓ 질문",

      "onboarding.welcome": "오목에 오신 것을 환영합니다!",
      "onboarding.subtitle": "弈·零와 함께 시작하세요",
      "onboarding.name_label": "이름 입력",
      "onboarding.name_placeholder": "플레이어",
      "onboarding.random_cn": "🎲 랜덤 CN",
      "onboarding.random_en": "🎲 랜덤 EN",
      "onboarding.name_hint": "이름은 게임에서 표시됩니다 (2-8자)",
      "onboarding.avatar_label": "아바타 선택",
      "onboarding.avatar_hint": "클릭하여 선택",
      "onboarding.start_game": "게임 시작",
      "loading.connection": "연결 중..."
    }
  },

  init() {
    const saved = localStorage.getItem('gomoku_language');
    if (saved && this.translations[saved]) {
      this.currentLang = saved;
    } else {
      const browserLang = navigator.language.slice(0, 2);
      this.currentLang = this.translations[browserLang] ? browserLang : 'zh';
    }

    console.log(`[Localization] Initialized: ${this.currentLang}`);
    this.updatePage();
    this.updateSelector();
  },

  setLanguage(lang) {
    if (!this.translations[lang]) return;
    this.currentLang = lang;
    localStorage.setItem('gomoku_language', lang);
    this.updatePage();
    this.updateSelector();
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  },

  /**
   * 获取翻译文本
   * @param {string} key - 翻译键
   * @param {Object} variables - 变量映射 { VAR: value }
   * @returns {string}
   */
  t(key, variables = null) {
    let text = this.translations[this.currentLang][key] || this.translations['en'][key] || key;

    // 如果是数组，随机选一个
    if (Array.isArray(text)) {
      text = text[Math.floor(Math.random() * text.length)];
    }

    // 变量替换
    if (variables && typeof text === 'string') {
      Object.keys(variables).forEach(varName => {
        const regex = new RegExp(`{${varName} } `, 'g');
        text = text.replace(regex, variables[varName]);
      });
    }

    return text;
  },

  updatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);

      // Handle OPTION elements specially
      if (el.tagName === 'OPTION') {
        el.textContent = text;
        return;
      }

      // Handle labels with specific classes inside container
      const labelEl = el.querySelector('.dock-label, .hero-title, .card-title, .btn-title, .wide-label, .hero-subtitle');
      if (labelEl) {
        labelEl.textContent = text;
      } else {
        // If it's a simple element with no children
        if (el.children.length === 0) {
          el.textContent = text;
        } else {
          // For elements with children, try to find text nodes
          if (el.tagName === 'SPAN' || el.tagName === 'DIV' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'BUTTON') {
            // Check if first child is text
            let foundTextNode = false;
            el.childNodes.forEach(node => {
              if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                node.textContent = text;
                foundTextNode = true;
              }
            });
            // Fallback: if no text node found, set textContent (may remove child icons)
            if (!foundTextNode && el.children.length === 0) {
              el.textContent = text;
            }
          }
        }
      }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
    });

    // Update meta tags
    document.querySelectorAll('meta[data-i18n-content]').forEach(el => {
      el.setAttribute('content', this.t(el.getAttribute('data-i18n-content')));
    });

    document.title = this.t('app.title');
  },

  updateSelector() {
    const selector = document.getElementById('setting-language-select');
    if (selector) selector.value = this.currentLang;
  }
};

window.Localization = Localization;
Localization.get = Localization.t; // Backward compatibility alias
document.addEventListener('DOMContentLoaded', () => Localization.init());
