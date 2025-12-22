// storyAiTempo.js
// ===============================
// 故事模式专用：AI 落子节奏配置
// ===============================

/**
 * 关卡 ID：1~7
 * 1: 书房
 * 2: 雨夜天台
 * 3: 古代遗迹
 * 4: 海底神殿
 * 5: 数据核心
 * 6: 火山口
 * 7: 雪山之巅
 */

/**
 * 每一关在【早期 / 中期 / 后期】的基础思考时间区间（单位：秒）
 * 只考虑"正常局面"的节奏，强制手/关键手再用后面的修正。
 */
const STORY_AI_TEMPO = {
  /** 第一关：书房——温柔稳定，新手局 */
  1: {
    // 对局刚开始：AI 像在"熟悉你"
    early: { min: 0.8, max: 1.1 },
    // 中盘：略微认真一点
    mid:   { min: 0.9, max: 1.2 },
    // 后期：稍微多思考一点，但仍然不会拖
    late:  { min: 1.0, max: 1.4 },
  },

  /** 第二关：雨夜天台——略快，有时间压迫感 */
  2: {
    early: { min: 0.7, max: 1.2 },
    mid:   { min: 0.8, max: 1.5 },
    late:  { min: 0.9, max: 1.6 },
  },

  /** 第三关：古代遗迹——有时很熟（快），有时不熟（慢） */
  3: {
    early: { min: 1.0, max: 1.6 },
    mid:   { min: 1.2, max: 2.0 },
    late:  { min: 1.0, max: 1.8 }, // 收官时干脆利落一点
  },

  /** 第四关：海底神殿——整体偏慢，允许长考 */
  4: {
    early: { min: 1.3, max: 2.0 },
    mid:   { min: 1.8, max: 3.0 }, // 中期是"最闷"的阶段
    late:  { min: 1.5, max: 2.5 },
  },

  /** 第五关：数据核心——快慢交替，有信息过载感 */
  5: {
    early: { min: 0.9, max: 1.8 },
    mid:   { min: 1.2, max: 2.5 },
    late:  { min: 1.0, max: 2.2 },
  },

  /** 第六关：火山口——平时偏快，关键时刻拉长 */
  6: {
    early: { min: 0.8, max: 1.5 },
    mid:   { min: 0.8, max: 1.8 },
    late:  { min: 1.0, max: 2.2 }, // 临近终局时会多想一点
  },

  /** 第七关：雪山之巅——稳定、干净，像认真对局 */
  7: {
    early: { min: 1.0, max: 1.8 },
    mid:   { min: 1.2, max: 2.1 },
    late:  { min: 1.0, max: 2.0 },
  },
};

/** 小工具函数们 **/
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function randInRange(min, max) {
  return min + Math.random() * (max - min);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * 根据手数估算棋局阶段：早 / 中 / 晚
 * 这里简单按总手数分段：<=12：开局；<=32：中盘；之后：后期
 */
function getPhase(moveNumber) {
  if (moveNumber <= 12) return 'early';
  if (moveNumber <= 32) return 'mid';
  return 'late';
}

/**
 * 故事模式：计算 AI 这一手要"思考多久"（秒）
 * 只负责时间，不负责选点。
 * 内部包含：
 * - 每关的基础节奏（来自 STORY_AI_TEMPO）
 * - 难度微调（难度高时略微偏慢，显得更慎重）
 * - 特殊场景修正：强制手 / 关键时刻 / 玩家时间不多 / 特定关卡个性
 *
 * @param {Object} ctx
 * @param {number} ctx.levelId - 第几关 1~7
 * @param {number} ctx.moveNumber - 当前是整局第几手（含玩家+AI）
 * @param {number} ctx.difficulty - AI 难度等级（1~5 或类似）
 * @param {boolean} [ctx.isForcedDefence] - 是否"非堵不可"的那种防守手
 * @param {boolean} [ctx.isKillingMove] - 是否一眼看出是致命/巨大打击的一手
 * @param {boolean} [ctx.isCriticalMoment] - 是否接近终局、胜负将定
 * @param {boolean} [ctx.playerTimeLow] - 玩家时间是否快用完（主要给第2关用）
 * @returns {number} seconds
 */
function getStoryAiThinkTime(ctx) {
  const {
    levelId,
    moveNumber,
    difficulty = 3,
    isForcedDefence = false,
    isKillingMove = false,
    isCriticalMoment = false,
    playerTimeLow = false,
  } = ctx;

  const levelCfg = STORY_AI_TEMPO[levelId] || STORY_AI_TEMPO[1];
  const phase = getPhase(moveNumber);
  const baseRange = levelCfg[phase] || levelCfg.mid;

  let min = baseRange.min;
  let max = baseRange.max;

  // ==============================
  // ① 难度影响：难度越高略微偏慢一点（看起来更慎重）
  // ==============================
  // 假设 difficulty 取值大约在 1~5，3 是中性
  const diffOffset = clamp((difficulty - 3) * 0.12, -0.25, 0.35);
  min += diffOffset;
  max += diffOffset;

  // ==============================
  // ② 关卡特性微调
  // ==============================
  switch (levelId) {
    case 1:
      // 第一关：尽量稳定一些，不要极端快/极端慢
      min = lerp(min, 1.0, 0.3);
      max = lerp(max, 1.2, 0.3);
      break;
    case 2:
      // 第二关：如果玩家时间不多，AI 稍微快一点，让紧张感集中在玩家身上
      if (playerTimeLow) {
        min -= 0.2;
        max -= 0.3;
      }
      break;
    case 3:
      // 第三关：中盘时，有小概率"秒出熟谱手"
      if (phase === 'mid' && Math.random() < 0.25) {
        // 25% 概率直接偏向下界，模拟"背过这一段"
        max = lerp(min, max, 0.4);
      }
      break;
    case 4:
      // 第四关：中盘允许出现更长的"闷局思考"
      if (phase === 'mid' && Math.random() < 0.3) {
        max += 0.5; // 偶尔长考一点
      }
      break;
    case 5:
      // 第五关：信息过载——快慢波动更明显
      if (Math.random() < 0.2) {
        // 20% 快速决断
        max = lerp(min, max, 0.5);
      } else if (Math.random() < 0.2) {
        // 另外 20% 拉长思考
        max += 0.6;
      }
      break;
    case 6:
      // 第六关：整体偏快，但遇到关键局面时再拉长（下面处理）
      // 这里先略微压缩区间
      max = lerp(min, max, 0.8);
      break;
    case 7:
      // 第七关：稳定、干净，不搞太极端
      min = lerp(min, 1.4, 0.2);
      max = lerp(max, 1.8, 0.2);
      break;
    default:
      break;
  }

  // ==============================
  // ③ 局面标签修正：强制手 / 致命手 / 关键时刻
  // ==============================

  // 强制防守手：倾向快一点（AI 一看就知道必须堵）
  if (isForcedDefence) {
    // 区间整体压向下界
    max = lerp(min, max, levelId === 4 ? 0.6 : 0.5); // 海底那关允许略慢点
  }

  // 致命进攻手：多数关卡下，略微偏慢一点（显得慎重）
  if (isKillingMove) {
    if (levelId === 2 || levelId === 6) {
      // 雨夜天台 & 火山口：这里的杀棋可以更干脆一点
      min -= 0.1;
      max = lerp(min, max, 0.7);
    } else {
      // 其他关：慎重一些
      max += 0.4;
    }
  }

  // 关键时刻（临近收官，胜负将定）——再统一拉长一点
  if (isCriticalMoment) {
    max += (levelId === 6 ? 0.6 : 0.4); // 火山关可以更紧张一点
  }

  // ==============================
  // ④ 生成随机思考时间
  // ==============================
  let t = randInRange(min, max);

  // 全局安全范围裁剪：不要太短也不要太长
  t = clamp(t, 0.6, 3.5);

  return t;
}

// 导出到全局
window.STORY_AI_TEMPO = STORY_AI_TEMPO;
window.getStoryAiThinkTime = getStoryAiThinkTime;
