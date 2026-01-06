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

// 深色主题 CSS 变量
export const DARK_THEME = {
    '--bg-primary': '#1e1f22',
    '--bg-secondary': '#2b2d30',
    '--bg-tertiary': '#3d3f43',
    '--bg-elevated': '#1e1f22',
    '--bg-hover': '#4a4c50',
    '--bg-gradient': 'linear-gradient(135deg, rgba(30, 31, 34, 0.92) 0%, rgba(30, 31, 34, 0.85) 100%), linear-gradient(to bottom right, rgba(139, 92, 246, 0.15) 0%, rgba(30, 31, 34, 0.9) 50%, rgba(6, 182, 212, 0.15) 100%)',

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
    '--bg-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.8) 100%), linear-gradient(to bottom right, rgba(251, 146, 60, 0.35) 0%, rgba(255, 255, 255, 0.85) 35%, rgba(134, 239, 172, 0.3) 65%, rgba(125, 211, 252, 0.35) 100%)',

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
