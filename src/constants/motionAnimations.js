/**
 * Motion Vue 动画配置
 * 供项目各组件共用
 *
 * duration 会根据设置中的动画速率动态计算
 */

import {ANIMATION_SPEED_MODES} from './animation'

// 基础动画时长配置（秒）
const BASE_DURATION = {
    card: 0.6,      // 卡片动画
}

/**
 * 根据速率模式计算实际 duration
 * @param {number} baseDuration - 基础时长（秒）
 * @param {string} speedMode - 速率模式: disabled, fast, normal, elegant
 * @returns {number} 实际时长（秒）
 */
function calcDuration(baseDuration, speedMode) {
    const multiplier = ANIMATION_SPEED_MODES[speedMode]?.value || 0.5
    // 禁用时返回极小值（让动画瞬间完成）
    if (multiplier === 0) return 0
    return baseDuration * multiplier
}

// 卡片动画基础配置（不含 duration）
const cardAnimationBase = {
    fade: {
        initial: {opacity: 0},
        animate: {opacity: 1},
        exit: {opacity: 0},
        ease: [0.16, 1, 0.3, 1]  // easeOutExpo
    },
    'slide-left': {
        initial: {opacity: 0, x: 60},
        animate: {opacity: 1, x: 0},
        exit: {opacity: 0, x: 60},
        ease: [0.34, 1.56, 0.64, 1]  // easeOutBack
    },
    'slide-right': {
        initial: {opacity: 0, x: -60},
        animate: {opacity: 1, x: 0},
        exit: {opacity: 0, x: -60},
        ease: [0.34, 1.56, 0.64, 1]  // easeOutBack
    },
    'slide-up': {
        initial: {opacity: 0, y: 60},
        animate: {opacity: 1, y: 0},
        exit: {opacity: 0, y: 60},
        ease: [0.34, 1.56, 0.64, 1]  // easeOutBack
    },
    zoom: {
        initial: {opacity: 0, scale: 0.85},
        animate: {opacity: 1, scale: 1},
        exit: {opacity: 0, scale: 0.85},
        ease: [0.394, 1.816, 0.516, 0.923]  // 自定义弹性曲线
    },
    none: null
}

/**
 * 获取卡片动画配置
 * @param {string} animationType - 动画类型
 * @param {string} speedMode - 速率模式
 * @returns {object|null} 动画配置对象
 */
export function getCardAnimation(animationType, speedMode = 'normal') {
    const base = cardAnimationBase[animationType] || cardAnimationBase.fade
    if (!base) return null

    const duration = calcDuration(BASE_DURATION.card, speedMode)
    return {
        initial: base.initial,
        animate: base.animate,
        exit: base.exit,
        transition: {duration, ease: base.ease}
    }
}

/**
 * 检查是否有卡片动画
 * @param {string} animationType - 动画类型
 * @returns {boolean}
 */
export function hasCardAnimation(animationType) {
    return animationType !== 'none' && cardAnimationBase[animationType] != null
}
