/**
 * 任务中心状态管理
 * 管理所有异步任务（解析、下载、识别等）
 */
import { reactive, computed } from 'vue'

// 任务类型
export const TaskType = {
  PARSE: 'parse',       // 解析视频
  DOWNLOAD: 'download', // 下载视频/音频
  EXTRACT: 'extract',   // 提取文案（语音识别）
  REWRITE: 'rewrite'    // AI改写
}

// 任务状态
export const TaskStatus = {
  PENDING: 'pending',     // 等待中
  RUNNING: 'running',     // 进行中
  SUCCESS: 'success',     // 成功
  ERROR: 'error',         // 失败
  CANCELLED: 'cancelled'  // 已取消
}

// 任务类型对应的图标和颜色
export const TaskMeta = {
  [TaskType.PARSE]: { icon: '🔍', label: '解析', color: '#3b82f6' },
  [TaskType.DOWNLOAD]: { icon: '⬇️', label: '下载', color: '#10b981' },
  [TaskType.EXTRACT]: { icon: '🎤', label: '识别', color: '#8b5cf6' },
  [TaskType.REWRITE]: { icon: '✍️', label: '改写', color: '#f59e0b' }
}

// 任务列表
const state = reactive({
  tasks: [],           // 任务列表
  isMinimized: false,  // 面板是否最小化
  showPanel: false     // 是否显示面板
})

// 生成唯一ID
let taskIdCounter = 0
const generateId = () => `task_${Date.now()}_${++taskIdCounter}`

/**
 * 添加任务
 */
export function addTask(type, title, options = {}) {
  const task = {
    id: generateId(),
    type,
    title,
    status: TaskStatus.RUNNING,
    progress: 0,
    statusText: options.statusText || '准备中...',
    createdAt: Date.now(),
    error: null
  }
  
  state.tasks.unshift(task)
  state.showPanel = true
  state.isMinimized = false
  
  return task.id
}

/**
 * 更新任务进度
 */
export function updateTask(taskId, updates) {
  const task = state.tasks.find(t => t.id === taskId)
  if (task) {
    if (updates.progress !== undefined) task.progress = updates.progress
    if (updates.statusText !== undefined) task.statusText = updates.statusText
    if (updates.status !== undefined) task.status = updates.status
    if (updates.error !== undefined) task.error = updates.error
  }
}

/**
 * 完成任务
 */
export function completeTask(taskId, success = true, error = null) {
  const task = state.tasks.find(t => t.id === taskId)
  if (task) {
    task.status = success ? TaskStatus.SUCCESS : TaskStatus.ERROR
    task.progress = success ? 100 : task.progress
    task.statusText = success ? '完成' : (error || '失败')
    task.error = error
    
    // 成功的任务3秒后自动移除
    if (success) {
      setTimeout(() => {
        removeTask(taskId)
      }, 3000)
    }
  }
}

/**
 * 移除任务
 */
export function removeTask(taskId) {
  const index = state.tasks.findIndex(t => t.id === taskId)
  if (index !== -1) {
    state.tasks.splice(index, 1)
  }
  
  // 没有任务时隐藏面板
  if (state.tasks.length === 0) {
    state.showPanel = false
  }
}

/**
 * 清除已完成的任务
 */
export function clearCompletedTasks() {
  state.tasks = state.tasks.filter(
    t => t.status !== TaskStatus.SUCCESS && t.status !== TaskStatus.ERROR
  )
  
  if (state.tasks.length === 0) {
    state.showPanel = false
  }
}

/**
 * 切换面板最小化状态
 */
export function toggleMinimize() {
  state.isMinimized = !state.isMinimized
}

/**
 * 关闭面板
 */
export function closePanel() {
  state.showPanel = false
}

/**
 * 显示面板
 */
export function showPanel() {
  state.showPanel = true
}

// 计算属性
export const tasks = computed(() => state.tasks)
export const activeTasks = computed(() => 
  state.tasks.filter(t => t.status === TaskStatus.RUNNING || t.status === TaskStatus.PENDING)
)
export const hasActiveTasks = computed(() => activeTasks.value.length > 0)
export const isMinimized = computed(() => state.isMinimized)
export const showTaskPanel = computed(() => state.showPanel)
export const taskCount = computed(() => state.tasks.length)

// 导出 store 对象方便使用
export const taskStore = {
  // State
  tasks,
  activeTasks,
  hasActiveTasks,
  isMinimized,
  showTaskPanel,
  taskCount,
  
  // Actions
  addTask,
  updateTask,
  completeTask,
  removeTask,
  clearCompletedTasks,
  toggleMinimize,
  closePanel,
  showPanel,
  
  // Constants
  TaskType,
  TaskStatus,
  TaskMeta
}

export default taskStore
