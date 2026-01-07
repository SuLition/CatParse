/**
 * 主题相关常量
 */

// 主题模式
export const THEME_MODES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system'
}

// 主题选项（用于设置页下拉选择）
export const THEME_OPTIONS = [
    {value: 'light', label: '浅色'},
    {value: 'dark', label: '深色'},
    {value: 'system', label: '跟随系统'}
]

// 主题色预设
export const ACCENT_COLORS = {
    blue: {
        name: '天空蓝',
        color: '#4a9eff',
        hover: '#3d8fe8',
        light: 'rgba(74, 158, 255, 0.15)',
        border: 'rgba(74, 158, 255, 0.3)'
    },
    green: {
        name: '翡翠绿',
        color: '#2ecc71',
        hover: '#27ae60',
        light: 'rgba(46, 204, 113, 0.15)',
        border: 'rgba(46, 204, 113, 0.3)'
    },
    purple: {
        name: '薰衣紫',
        color: '#a855f7',
        hover: '#9333ea',
        light: 'rgba(168, 85, 247, 0.15)',
        border: 'rgba(168, 85, 247, 0.3)'
    },
    orange: {
        name: '琥珀橙',
        color: '#f59e0b',
        hover: '#d97706',
        light: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.3)'
    },
    pink: {
        name: '玫瑰粉',
        color: '#ec4899',
        hover: '#db2777',
        light: 'rgba(236, 72, 153, 0.15)',
        border: 'rgba(236, 72, 153, 0.3)'
    },
    cyan: {
        name: '青绿色',
        color: '#06b6d4',
        hover: '#0891b2',
        light: 'rgba(6, 182, 212, 0.15)',
        border: 'rgba(6, 182, 212, 0.3)'
    },
    red: {
        name: '珊瑩红',
        color: '#ef4444',
        hover: '#dc2626',
        light: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.3)'
    }
}

// 主题色选项（用于设置页选择）
export const ACCENT_COLOR_OPTIONS = Object.entries(ACCENT_COLORS).map(([key, value]) => ({
    value: key,
    label: value.name,
    color: value.color
}))

// 深色主题 CSS 变量
export const DARK_THEME = {
    '--bg-primary': '#1e1f22',
    '--bg-secondary': '#2b2d30',
    '--bg-tertiary': '#3d3f43',
    '--bg-elevated': '#1e1f22',
    '--bg-hover': '#4a4c50',
    '--bg-gradient': '#1e1f22',

    '--text-primary': '#ffffff',
    '--text-secondary': '#afb1b3',
    '--text-tertiary': '#6c6e73',
    '--text-placeholder': '#6c6e73',

    '--border-primary': '#3d3f43',
    '--border-secondary': '#4a4c50',

    '--accent-color': '#4a9eff',
    '--accent-hover': '#3d8fe8',
    '--accent-light': 'rgba(74, 158, 255, 0.15)',
    '--accent-border': 'rgba(74, 158, 255, 0.3)',

    '--success-color': '#2ecc71',
    '--warning-color': '#f39c12',
    '--error-color': '#e74c3c',

    '--scrollbar-thumb': '#3d3f43',
    '--scrollbar-hover': '#4a9eff'
}

// 浅色主题 CSS 变量
export const LIGHT_THEME = {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f5f5f7',
    '--bg-tertiary': '#e8e8ed',
    '--bg-elevated': '#ffffff',
    '--bg-hover': '#e0e0e5',
    '--bg-gradient': '#f9f9f9',

    '--text-primary': '#1d1d1f',
    '--text-secondary': '#6e6e73',
    '--text-tertiary': '#86868b',
    '--text-placeholder': '#86868b',

    '--border-primary': '#d2d2d7',
    '--border-secondary': '#e8e8ed',

    '--accent-color': '#0071e3',
    '--accent-hover': '#0077ed',
    '--accent-light': 'rgba(0, 113, 227, 0.1)',
    '--accent-border': 'rgba(0, 113, 227, 0.25)',

    '--success-color': '#34c759',
    '--warning-color': '#ff9500',
    '--error-color': '#ff3b30',

    '--scrollbar-thumb': '#c7c7cc',
    '--scrollbar-hover': '#0071e3'
}
