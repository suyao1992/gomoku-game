/**
 * 棋友圈管理后台 JavaScript
 */

const AdminApp = (function () {
    // API 基址
    const API_BASE = 'https://gomoku-community-api.suyao1992.workers.dev';

    let adminToken = null;
    let currentView = 'dashboard';
    let postsPage = 1;

    /**
     * 初始化
     */
    function init() {
        // 检查本地存储的 token
        adminToken = localStorage.getItem('admin_token');
        if (adminToken) {
            showAdminView();
            loadDashboard();
        }

        // 绑定导航事件
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const view = item.dataset.view;
                switchView(view);
            });
        });

        // 绑定回车登录
        document.getElementById('admin-password').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }

    /**
     * 登录
     */
    async function login() {
        const password = document.getElementById('admin-password').value;
        if (!password) {
            showError('请输入管理密钥');
            return;
        }

        // 测试 token 是否有效
        try {
            const response = await fetch(`${API_BASE}/api/admin/stats`, {
                headers: {
                    'Authorization': `Bearer ${password}`
                }
            });

            if (response.ok) {
                adminToken = password;
                localStorage.setItem('admin_token', adminToken);
                showAdminView();
                loadDashboard();
            } else {
                showError('密钥错误');
            }
        } catch (error) {
            showError('连接失败: ' + error.message);
        }
    }

    /**
     * 退出登录
     */
    function logout() {
        adminToken = null;
        localStorage.removeItem('admin_token');
        document.getElementById('login-view').classList.remove('hidden');
        document.getElementById('admin-view').classList.add('hidden');
        document.getElementById('admin-password').value = '';
    }

    /**
     * 显示管理界面
     */
    function showAdminView() {
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('admin-view').classList.remove('hidden');
    }

    /**
     * 切换视图
     */
    function switchView(view) {
        currentView = view;

        // 更新导航样式
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // 切换视图
        document.querySelectorAll('.view-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(`view-${view}`).classList.remove('hidden');

        // 加载对应数据
        switch (view) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'posts':
                loadPosts();
                break;
            case 'reports':
                loadReports();
                break;
            case 'words':
                loadSensitiveWords();
                break;
            case 'analytics':
                loadGameAnalytics();
                break;
        }
    }

    /**
     * API 请求
     */
    async function request(endpoint, options = {}) {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`,
                ...options.headers
            }
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || '请求失败');
        }
        return data;
    }

    /**
     * 加载仪表盘
     */
    async function loadDashboard() {
        try {
            const result = await request('/api/admin/stats');
            if (result.success) {
                const stats = result.data;

                // 概览统计
                document.getElementById('stat-total-views').textContent = formatNumber(stats.total_views || 0);
                document.getElementById('stat-total-posts').textContent = stats.total_posts || 0;
                document.getElementById('stat-total-comments').textContent = stats.total_comments || 0;
                document.getElementById('stat-total-likes').textContent = stats.total_likes || 0;
                document.getElementById('stat-total-users').textContent = stats.total_users || 0;

                // 今日统计
                document.getElementById('stat-today-posts').textContent = stats.today_posts || 0;
                document.getElementById('stat-today-comments').textContent = stats.today_comments || 0;
                document.getElementById('stat-today-active-users').textContent = stats.today_active_users || 0;
                document.getElementById('stat-pending-reports').textContent = stats.pending_reports || 0;
                document.getElementById('stat-pending-posts').textContent = stats.pending_posts || 0;

                // 渲染趋势图
                renderTrendChart(stats.daily_trend || []);
            }
        } catch (error) {
            console.error('Load dashboard error:', error);
        }
    }

    /**
     * 渲染趋势图 (简易柱状图)
     */
    function renderTrendChart(data) {
        const container = document.getElementById('trend-chart');
        if (!container) return;

        if (data.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.4); padding: 30px;">暂无数据</div>';
            return;
        }

        const maxCount = Math.max(...data.map(d => d.count), 1);

        const bars = data.map(d => {
            const height = Math.max((d.count / maxCount) * 100, 5);
            const date = d.date.substring(5); // 取 MM-DD
            return `
                <div class="trend-bar-wrapper">
                    <div class="trend-bar" style="height: ${height}%;" title="${d.date}: ${d.count}帖">
                        <span class="trend-value">${d.count}</span>
                    </div>
                    <div class="trend-label">${date}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = `<div class="trend-bars">${bars}</div>`;
    }

    /**
     * 格式化数字 (大数字缩写)
     */
    function formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    /**
     * 加载帖子列表
     */
    async function loadPosts(page = 1) {
        postsPage = page;
        const status = document.getElementById('filter-status').value;
        const type = document.getElementById('filter-type').value;
        const search = document.getElementById('filter-search').value;

        try {
            let url = `/api/admin/posts?page=${page}`;
            if (status !== 'all') url += `&status=${status}`;
            if (type) url += `&type=${type}`;
            if (search) url += `&search=${encodeURIComponent(search)}`;

            const result = await request(url);
            if (result.success) {
                renderPostsTable(result.data);
                renderPagination(result.pagination, 'posts-pagination', loadPosts);
            }
        } catch (error) {
            console.error('Load posts error:', error);
        }
    }

    /**
     * 渲染帖子表格
     */
    function renderPostsTable(posts) {
        const tbody = document.getElementById('posts-table-body');

        if (posts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: rgba(255,255,255,0.5);">暂无数据</td></tr>';
            return;
        }

        const typeIcons = {
            discussion: '💬',
            battle: '⚔️',
            replay: '📋',
            announcement: '📢'
        };

        tbody.innerHTML = posts.map(post => `
            <tr>
                <td>${post.id.substring(0, 8)}...</td>
                <td>${typeIcons[post.type] || '💬'} ${post.type}</td>
                <td>${escapeHtml(post.title)}</td>
                <td>${escapeHtml(post.user_name || '未知')}</td>
                <td><span class="status-badge status-${post.status}">${post.status}</span></td>
                <td>${formatTime(post.created_at)}</td>
                <td class="actions">
                    <button class="btn-view" onclick="AdminApp.viewPost('${post.id}')">查看</button>
                    ${post.status === 'active' ? `
                        <button class="btn-pin" onclick="AdminApp.togglePin('${post.id}', ${!post.is_pinned})">${post.is_pinned ? '取消置顶' : '置顶'}</button>
                        <button class="btn-hide" onclick="AdminApp.updatePostStatus('${post.id}', 'hidden')">隐藏</button>
                    ` : ''}
                    ${post.status === 'hidden' ? `
                        <button class="btn-approve" onclick="AdminApp.updatePostStatus('${post.id}', 'active')">恢复</button>
                    ` : ''}
                    <button class="btn-delete" onclick="AdminApp.updatePostStatus('${post.id}', 'deleted')">删除</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * 更新帖子状态
     */
    async function updatePostStatus(id, status) {
        if (!confirm(`确定要${status === 'deleted' ? '删除' : status === 'hidden' ? '隐藏' : '恢复'}这篇帖子吗？`)) return;

        try {
            await request(`/api/admin/posts/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status })
            });
            loadPosts(postsPage);
            loadDashboard();
        } catch (error) {
            alert('操作失败: ' + error.message);
        }
    }

    /**
     * 切换置顶
     */
    async function togglePin(id, isPinned) {
        try {
            await request(`/api/admin/posts/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ is_pinned: isPinned })
            });
            loadPosts(postsPage);
        } catch (error) {
            alert('操作失败: ' + error.message);
        }
    }

    /**
     * 加载举报列表
     */
    async function loadReports() {
        const status = document.getElementById('report-status-filter').value;

        try {
            const result = await request(`/api/admin/reports?status=${status}`);
            if (result.success) {
                renderReportsTable(result.data);
            }
        } catch (error) {
            console.error('Load reports error:', error);
        }
    }

    /**
     * 渲染举报表格
     */
    function renderReportsTable(reports) {
        const tbody = document.getElementById('reports-table-body');

        if (reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: rgba(255,255,255,0.5);">暂无举报</td></tr>';
            return;
        }

        tbody.innerHTML = reports.map(report => `
            <tr>
                <td>${report.id.substring(0, 8)}...</td>
                <td>${report.target_type}</td>
                <td>${escapeHtml(report.reason)}</td>
                <td>${escapeHtml(report.reporter_name || '未知')}</td>
                <td>${formatTime(report.created_at)}</td>
                <td class="actions">
                    <button class="btn-view" onclick="AdminApp.viewReport('${report.id}')">查看</button>
                    <button class="btn-approve" onclick="AdminApp.handleReport('${report.id}', 'dismissed')">驳回</button>
                    <button class="btn-delete" onclick="AdminApp.handleReport('${report.id}', 'actioned', 'hide')">隐藏内容</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * 处理举报
     */
    async function handleReport(id, status, action = null) {
        try {
            await request(`/api/admin/reports/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ status, action })
            });
            loadReports();
            loadDashboard();
        } catch (error) {
            alert('处理失败: ' + error.message);
        }
    }

    /**
     * 加载游戏分析数据
     */
    async function loadGameAnalytics() {
        try {
            // 获取概览数据
            const overviewResult = await request('/api/admin/analytics/overview');
            if (overviewResult.success) {
                const { traffic, games, trends } = overviewResult.data;

                // 流量统计
                document.getElementById('ga-total-pv').textContent = formatNumber(traffic.total_pv || 0);
                document.getElementById('ga-total-uv').textContent = formatNumber(traffic.total_uv || 0);
                document.getElementById('ga-today-pv').textContent = traffic.today_pv || 0;
                document.getElementById('ga-today-uv').textContent = traffic.today_uv || 0;
                document.getElementById('ga-today-new').textContent = traffic.today_new || 0;

                // 对局统计
                document.getElementById('ga-total-games').textContent = formatNumber(games.total_games || 0);
                document.getElementById('ga-today-games').textContent = games.today_games || 0;
                document.getElementById('ga-avg-duration').textContent = formatDuration(games.avg_duration || 0);

                // 胜率
                const totalResults = (games.wins || 0) + (games.losses || 0) + (games.draws || 0);
                const winRate = totalResults > 0 ? Math.round((games.wins / totalResults) * 100) : 0;
                document.getElementById('ga-win-rate').textContent = winRate + '%';

                // 模式分布
                document.getElementById('ga-games-pve').textContent = games.games_pve || 0;
                document.getElementById('ga-games-pvp').textContent = games.games_pvp || 0;
                document.getElementById('ga-games-online').textContent = games.games_online || 0;
                document.getElementById('ga-games-quick').textContent = games.games_quick || 0;

                // 渲染趋势图 (使用访问趋势)
                renderAnalyticsTrendChart(trends.visits || [], trends.games || []);
            }

            // 获取设备数据
            const deviceResult = await request('/api/admin/analytics/devices');
            if (deviceResult.success) {
                renderDeviceStats(deviceResult.data);
            }
        } catch (error) {
            console.error('Load game analytics error:', error);
        }
    }

    /**
     * 渲染分析趋势图
     */
    function renderAnalyticsTrendChart(visits, games) {
        const container = document.getElementById('ga-trend-chart');
        if (!container) return;

        if (visits.length === 0 && games.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: rgba(255,255,255,0.4); padding: 30px;">暂无数据</div>';
            return;
        }

        const maxPv = Math.max(...visits.map(d => d.pv || 0), 1);
        const maxGames = Math.max(...games.map(d => d.count || 0), 1);
        const maxValue = Math.max(maxPv, maxGames);

        // 合并日期
        const allDates = [...new Set([...visits.map(d => d.date), ...games.map(d => d.date)])].sort();

        const bars = allDates.map(date => {
            const visitData = visits.find(v => v.date === date) || { pv: 0, uv: 0 };
            const gameData = games.find(g => g.date === date) || { count: 0 };
            const pvHeight = Math.max((visitData.pv / maxValue) * 100, 5);
            const gameHeight = Math.max((gameData.count / maxValue) * 100, 5);
            const dateStr = date.substring(5);

            return `
                <div class="trend-bar-wrapper" style="flex-direction: column; gap: 5px;">
                    <div style="display: flex; align-items: flex-end; gap: 2px; height: 100px;">
                        <div class="trend-bar" style="height: ${pvHeight}%; background: linear-gradient(180deg, #00d4ff, #0090b3);" title="访问: ${visitData.pv}">
                            <span class="trend-value">${visitData.pv}</span>
                        </div>
                        <div class="trend-bar" style="height: ${gameHeight}%; background: linear-gradient(180deg, #00ff88, #00b35c);" title="对局: ${gameData.count}">
                            <span class="trend-value">${gameData.count}</span>
                        </div>
                    </div>
                    <div class="trend-label">${dateStr}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div style="display: flex; gap: 10px; margin-bottom: 10px; font-size: 0.85em; color: rgba(255,255,255,0.6);">
                <span>🔵 访问</span>
                <span>🟢 对局</span>
            </div>
            <div class="trend-bars" style="height: 130px;">${bars}</div>
        `;
    }

    /**
     * 渲染设备统计
     */
    function renderDeviceStats(data) {
        const container = document.getElementById('ga-device-stats');
        if (!container) return;

        const { deviceTypes, browsers, os } = data;

        const renderList = (items, title) => {
            if (!items || items.length === 0) return '';
            const total = items.reduce((sum, i) => sum + i.count, 0);
            return `
                <div class="device-stat-section">
                    <h4 style="color: rgba(255,255,255,0.7); margin-bottom: 10px;">${title}</h4>
                    <div class="stat-bars">
                        ${items.map(item => {
                const pct = Math.round((item.count / total) * 100);
                return `
                                <div class="stat-bar-item">
                                    <span class="stat-bar-label">${item[Object.keys(item)[0]] || 'unknown'}</span>
                                    <div class="stat-bar-track">
                                        <div class="stat-bar-fill" style="width: ${pct}%;"></div>
                                    </div>
                                    <span class="stat-bar-value">${pct}%</span>
                                </div>
                            `;
            }).join('')}
                    </div>
                </div>
            `;
        };

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                ${renderList(deviceTypes, '📱 设备类型')}
                ${renderList(browsers, '🌐 浏览器')}
                ${renderList(os, '💻 操作系统')}
            </div>
        `;
    }

    /**
     * 格式化时长 (秒 -> 分:秒)
     */
    function formatDuration(seconds) {
        if (seconds < 60) return seconds + '秒';
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return minutes + '分' + (secs > 0 ? secs + '秒' : '');
    }

    /**
     * 加载敏感词
     */
    async function loadSensitiveWords() {
        try {
            const result = await request('/api/admin/sensitive-words');
            if (result.success) {
                renderWordsList(result.data);
            }
        } catch (error) {
            console.error('Load words error:', error);
        }
    }

    /**
     * 渲染敏感词列表
     */
    function renderWordsList(words) {
        const container = document.getElementById('words-list');

        if (words.length === 0) {
            container.innerHTML = '<p style="color: rgba(255,255,255,0.5);">暂无敏感词</p>';
            return;
        }

        container.innerHTML = words.map(word => `
            <div class="word-tag ${word.level}">
                <span>${escapeHtml(word.word)}</span>
                <span style="opacity: 0.5; font-size: 0.8em;">${word.level}</span>
                <button class="remove" onclick="AdminApp.removeWord(${word.id})">✕</button>
            </div>
        `).join('');
    }

    /**
     * 添加敏感词
     */
    async function addSensitiveWord() {
        const word = document.getElementById('new-word').value.trim();
        const level = document.getElementById('word-level').value;
        const replacement = document.getElementById('word-replacement').value.trim();

        if (!word) {
            alert('请输入敏感词');
            return;
        }

        try {
            await request('/api/admin/sensitive-words', {
                method: 'POST',
                body: JSON.stringify({ word, level, replacement: replacement || null })
            });
            document.getElementById('new-word').value = '';
            document.getElementById('word-replacement').value = '';
            loadSensitiveWords();
        } catch (error) {
            alert('添加失败: ' + error.message);
        }
    }

    /**
     * 发布公告
     */
    async function publishAnnouncement() {
        const title = document.getElementById('announcement-title').value.trim();
        const content = document.getElementById('announcement-content').value.trim();
        const isPinned = document.getElementById('announcement-pinned').checked;

        if (!title || !content) {
            alert('请填写标题和内容');
            return;
        }

        try {
            await request('/api/admin/announcements', {
                method: 'POST',
                body: JSON.stringify({ title, content, is_pinned: isPinned })
            });
            alert('发布成功！');
            document.getElementById('announcement-title').value = '';
            document.getElementById('announcement-content').value = '';
            document.getElementById('announcement-pinned').checked = false;
            loadDashboard();
        } catch (error) {
            alert('发布失败: ' + error.message);
        }
    }

    /**
     * 查看帖子详情
     */
    async function viewPost(id) {
        try {
            // 使用公开 API 获取帖子详情
            const response = await fetch(`${API_BASE}/api/posts/${id}`, {
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });
            const result = await response.json();

            if (result.success) {
                const post = result.data;
                const typeIcons = {
                    discussion: '💬 讨论',
                    battle: '⚔️ 约战',
                    replay: '📋 棋谱',
                    announcement: '📢 公告'
                };

                const imagesHtml = post.images && post.images.length > 0
                    ? `<div class="modal-images" style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 15px;">
                        ${post.images.map(img => `<img src="${API_BASE}${img}" style="max-width: 150px; border-radius: 8px;" />`).join('')}
                       </div>`
                    : '';

                const content = `
                    <div class="post-detail-modal">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                            <span style="font-size: 2em;">${escapeHtml(post.author.avatar)}</span>
                            <div>
                                <div style="font-weight: bold; color: #fff;">${escapeHtml(post.author.name)}</div>
                                <div style="font-size: 0.85em; color: rgba(255,255,255,0.5);">ELO: ${post.author.elo || 1000}</div>
                            </div>
                            <span class="status-badge" style="margin-left: auto;">${typeIcons[post.type] || post.type}</span>
                        </div>
                        <h3 style="color: #fff; margin-bottom: 10px;">${escapeHtml(post.title)}</h3>
                        <div style="color: rgba(255,255,255,0.8); line-height: 1.6; white-space: pre-wrap; margin-bottom: 15px;">${escapeHtml(post.content)}</div>
                        ${imagesHtml}
                        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); font-size: 0.85em;">
                            <div>发布时间: ${formatTime(post.createdAt)}</div>
                            <div>浏览: ${post.viewsCount} | 点赞: ${post.likesCount} | 评论: ${post.commentsCount}</div>
                            <div style="margin-top: 8px; font-size: 0.8em;">ID: ${post.id}</div>
                        </div>
                    </div>
                `;
                openModal('📄 帖子详情', content);
            } else {
                alert('获取帖子详情失败');
            }
        } catch (error) {
            console.error('View post error:', error);
            alert('获取帖子详情失败: ' + error.message);
        }
    }

    /**
     * 查看举报详情
     */
    async function viewReport(id) {
        try {
            const result = await request(`/api/admin/reports?id=${id}`);
            if (result.success && result.data.length > 0) {
                const report = result.data[0];
                const content = `
                    <div class="report-detail-modal">
                        <div style="margin-bottom: 15px;">
                            <div style="color: rgba(255,255,255,0.5); font-size: 0.85em;">举报类型</div>
                            <div style="color: #fff; font-size: 1.1em;">${report.target_type === 'post' ? '📝 帖子' : '💬 评论'}</div>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <div style="color: rgba(255,255,255,0.5); font-size: 0.85em;">举报原因</div>
                            <div style="color: #fff;">${escapeHtml(report.reason)}</div>
                        </div>
                        ${report.details ? `
                        <div style="margin-bottom: 15px;">
                            <div style="color: rgba(255,255,255,0.5); font-size: 0.85em;">详细说明</div>
                            <div style="color: rgba(255,255,255,0.8);">${escapeHtml(report.details)}</div>
                        </div>
                        ` : ''}
                        <div style="margin-bottom: 15px;">
                            <div style="color: rgba(255,255,255,0.5); font-size: 0.85em;">举报人</div>
                            <div style="color: #fff;">${escapeHtml(report.reporter_name || '匿名')}</div>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <div style="color: rgba(255,255,255,0.5); font-size: 0.85em;">举报时间</div>
                            <div style="color: #fff;">${formatTime(report.created_at)}</div>
                        </div>
                        <div style="margin-top: 20px; display: flex; gap: 10px;">
                            <button class="btn-view" onclick="AdminApp.viewPost('${report.target_id}'); AdminApp.closeModal();" style="flex: 1;">
                                查看被举报内容
                            </button>
                        </div>
                    </div>
                `;
                openModal('🚩 举报详情', content);
            } else {
                alert('获取举报详情失败');
            }
        } catch (error) {
            console.error('View report error:', error);
            alert('获取举报详情失败: ' + error.message);
        }
    }

    /**
     * 打开弹窗
     */
    function openModal(title, content) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal-container').classList.remove('hidden');
    }

    /**
     * 关闭弹窗
     */
    function closeModal() {
        document.getElementById('modal-container').classList.add('hidden');
    }

    /**
     * 显示错误
     */
    function showError(message) {
        const errorEl = document.getElementById('login-error');
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    /**
     * 渲染分页
     */
    function renderPagination(pagination, containerId, loadFn) {
        const container = document.getElementById(containerId);
        if (!pagination || pagination.totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        const { page, totalPages } = pagination;
        let html = '';

        html += `<button ${page <= 1 ? 'disabled' : ''} onclick="${loadFn.name}(${page - 1})">上一页</button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
                html += `<button class="${i === page ? 'active' : ''}" onclick="${loadFn.name}(${i})">${i}</button>`;
            } else if (i === page - 3 || i === page + 3) {
                html += '<span>...</span>';
            }
        }

        html += `<button ${page >= totalPages ? 'disabled' : ''} onclick="${loadFn.name}(${page + 1})">下一页</button>`;

        container.innerHTML = html;
    }

    // ==================== 工具函数 ====================

    function formatTime(timestamp) {
        return new Date(timestamp).toLocaleString('zh-CN');
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ==================== 公开 API ====================

    return {
        init,
        login,
        logout,
        loadPosts,
        loadReports,
        updatePostStatus,
        togglePin,
        viewPost,
        viewReport,
        handleReport,
        addSensitiveWord,
        publishAnnouncement,
        closeModal
    };
})();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', AdminApp.init);
