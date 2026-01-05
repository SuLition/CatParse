<template>
  <Teleport to="body">
    <!-- 最小化状态：只显示浮动按钮 -->
    <Transition name="task-fab">
      <button 
        v-if="showTaskPanel && isMinimized && taskCount > 0"
        class="task-fab"
        @click="toggleMinimize"
      >
        <span class="fab-icon">📋</span>
        <span class="fab-badge" v-if="activeTasks.length > 0">{{ activeTasks.length }}</span>
      </button>
    </Transition>

    <!-- 任务面板 -->
    <Transition name="task-panel">
      <div 
        v-if="showTaskPanel && !isMinimized && taskCount > 0"
        class="task-panel"
      >
        <!-- 面板头部 -->
        <div class="task-panel-header">
          <div class="header-title">
            <span class="header-icon">📋</span>
            <span>任务中心</span>
            <span class="task-count" v-if="activeTasks.length > 0">({{ activeTasks.length }})</span>
          </div>
          <div class="header-actions">
            <button class="action-btn" @click="toggleMinimize" title="最小化">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
            <button class="action-btn" @click="closePanel" title="关闭">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 任务列表 -->
        <div class="task-list">
          <TransitionGroup name="task-item">
            <div 
              v-for="task in tasks" 
              :key="task.id"
              class="task-item"
              :class="[`status-${task.status}`]"
            >
              <!-- 任务图标 -->
              <div class="task-icon" :style="{ color: getTaskMeta(task.type).color }">
                {{ getTaskMeta(task.type).icon }}
              </div>

              <!-- 任务内容 -->
              <div class="task-content">
                <div class="task-title">{{ task.title }}</div>
                
                <!-- 进度条 -->
                <div class="task-progress" v-if="task.status === 'running'">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ 
                        width: task.progress + '%',
                        backgroundColor: getTaskMeta(task.type).color 
                      }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ task.progress }}%</span>
                </div>

                <!-- 状态文字 -->
                <div class="task-status">
                  <span v-if="task.status === 'success'" class="status-success">✓ 完成</span>
                  <span v-else-if="task.status === 'error'" class="status-error">✗ {{ task.statusText }}</span>
                  <span v-else class="status-running">{{ task.statusText }}</span>
                </div>
              </div>

              <!-- 关闭按钮（仅完成/失败状态） -->
              <button 
                v-if="task.status === 'success' || task.status === 'error'"
                class="task-close"
                @click="removeTask(task.id)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </TransitionGroup>

          <!-- 空状态 -->
          <div v-if="tasks.length === 0" class="task-empty">
            暂无任务
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="task-panel-footer" v-if="hasCompletedTasks">
          <button class="clear-btn" @click="clearCompletedTasks">
            清除已完成
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { 
  tasks, 
  activeTasks, 
  showTaskPanel, 
  isMinimized,
  taskCount,
  TaskMeta,
  TaskStatus,
  toggleMinimize,
  closePanel,
  removeTask,
  clearCompletedTasks
} from '../../stores/taskStore.js'

// 获取任务元信息
const getTaskMeta = (type) => TaskMeta[type] || { icon: '📋', label: '任务', color: '#6b7280' }

// 是否有已完成的任务
const hasCompletedTasks = computed(() => 
  tasks.value.some(t => t.status === TaskStatus.SUCCESS || t.status === TaskStatus.ERROR)
)
</script>

<style scoped>
/* 浮动按钮 */
.task-fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-fab:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
}

.fab-icon {
  font-size: 20px;
}

.fab-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  background: #ef4444;
  color: white;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* 任务面板 */
.task-panel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 320px;
  max-height: 400px;
  background: #1e1e2e;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 面板头部 */
.task-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
}

.header-icon {
  font-size: 16px;
}

.task-count {
  color: #888;
  font-weight: normal;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #888;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}

/* 任务列表 */
.task-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
  max-height: 300px;
}

.task-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 8px;
  position: relative;
  transition: background 0.2s;
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.task-item.status-success {
  background: rgba(16, 185, 129, 0.1);
}

.task-item.status-error {
  background: rgba(239, 68, 68, 0.1);
}

.task-icon {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.task-content {
  flex: 1;
  min-width: 0;
}

.task-title {
  font-size: 13px;
  font-weight: 500;
  color: #e0e0e0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 6px;
}

/* 进度条 */
.task-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.progress-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 11px;
  color: #888;
  min-width: 32px;
  text-align: right;
}

/* 状态文字 */
.task-status {
  font-size: 12px;
}

.status-running {
  color: #888;
}

.status-success {
  color: #10b981;
}

.status-error {
  color: #ef4444;
}

/* 关闭按钮 */
.task-close {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s, background 0.2s;
}

.task-item:hover .task-close {
  opacity: 1;
}

.task-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}

/* 空状态 */
.task-empty {
  padding: 24px;
  text-align: center;
  color: #666;
  font-size: 13px;
}

/* 底部操作 */
.task-panel-footer {
  padding: 8px 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.clear-btn {
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #888;
  font-size: 12px;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.2s, color 0.2s;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}

/* 动画 */
.task-fab-enter-active,
.task-fab-leave-active {
  transition: all 0.3s ease;
}

.task-fab-enter-from,
.task-fab-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

.task-panel-enter-active,
.task-panel-leave-active {
  transition: all 0.3s ease;
}

.task-panel-enter-from,
.task-panel-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.task-item-enter-active,
.task-item-leave-active {
  transition: all 0.3s ease;
}

.task-item-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.task-item-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.task-item-move {
  transition: transform 0.3s ease;
}

/* 滚动条样式 */
.task-list::-webkit-scrollbar {
  width: 4px;
}

.task-list::-webkit-scrollbar-track {
  background: transparent;
}

.task-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.task-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
