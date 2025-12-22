// ========== 主菜单手风琴交互 ==========

/**
 * 切换菜单区域的展开/折叠状态
 * @param {string} sectionName - 区域名称 ('story', 'free', 'more')
 */
function toggleSection(sectionName) {
    const section = document.querySelector(`.mode-section[data-section="${sectionName}"]`);
    if (!section) return;

    const wasCollapsed = section.classList.contains('collapsed');

    // 关闭其他所有区域（手风琴效果）
    document.querySelectorAll('.mode-section').forEach(s => {
        s.classList.add('collapsed');
    });

    // 切换当前区域
    if (wasCollapsed) {
        section.classList.remove('collapsed');
        // 播放展开音效
        if (window.game && window.game.audio) {
            window.game.audio.playHover();
        }
    }
}

/**
 * 初始化菜单交互
 */
function initMenuAccordion() {
    // 添加区域标题的悬停音效
    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('mouseenter', () => {
            if (window.game && window.game.audio) {
                // 轻微的悬停反馈
            }
        });
    });
}

// 页面加载后初始化
document.addEventListener('DOMContentLoaded', initMenuAccordion);

// 导出给全局使用
window.toggleSection = toggleSection;
