import { createRouter, createWebHistory } from 'vue-router';
import { ParsePage, HistoryPage, SettingsPage } from '@/views';

const routes = [
  {
    path: '/',
    redirect: '/parse'
  },
  {
    path: '/parse',
    name: 'Parse',
    component: ParsePage,
    meta: { title: '视频解析' }
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryPage,
    meta: { title: '下载历史' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage,
    meta: { title: '设置' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
