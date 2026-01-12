/**
 * Motion Vue 动画配置
 * 供任务队列和历史记录卡片共用
 */

// 卡片列表动画预设
export const cardAnimations = {
    // 淡入淡出 - 简洁的透明度过渡
    fade: {
        initial: {opacity: 0},
        animate: {opacity: 1},
        exit: {opacity: 0},
        transition: {duration: 0.3, ease: [0.16, 1, 0.3, 1]}  // easeOutExpo
    },
    // 左滑 - 从右侧滑入，向左侧滑出
    'slide-left': {
        initial: {opacity: 0, x: 60},
        animate: {opacity: 1, x: 0},
        exit: {opacity: 0, x: 60},
        transition: {duration: 0.3, ease: [0.34, 1.56, 0.64, 1]}  // easeOutBack
    },
    // 右滑 - 从左侧滑入，向右侧滑出
    'slide-right': {
        initial: {opacity: 0, x: -60},
        animate: {opacity: 1, x: 0},
        exit: {opacity: 0, x: -60},
        transition: {duration: 0.3, ease: [0.34, 1.56, 0.64, 1]}  // easeOutBack
    },
    // 上滑 - 从下方滑入，向上方滑出
    'slide-up': {
        initial: {opacity: 0, y: 60},
        animate: {opacity: 1, y: 0},
        exit: {opacity: 0, y: 60},
        transition: {duration: 0.3, ease: [0.34, 1.56, 0.64, 1]}  // easeOutBack
    },
    // 缩放 - 从小放大进入，缩小退出
    zoom: {
        initial: {opacity: 0, scale: 0.85},
        animate: {opacity: 1, scale: 1},
        exit: {opacity: 0, scale: 0.85},
        transition: {duration: 0.3, ease: [0.394, 1.816, 0.516, 0.923]}  // 自定义弹性曲线
    },
    // 无动画
    none: null
}

/**
 * 获取卡片动画配置
 * @param {string} animationType - 动画类型
 * @returns {object|null} 动画配置对象
 */
export function getCardAnimation(animationType) {
    return cardAnimations[animationType] || cardAnimations.fade
}
