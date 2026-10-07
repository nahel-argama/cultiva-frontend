import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/Landing/LandingPage.vue';
import LoginView from '@/views/Auth/LoginView.vue';
import RegisterView from '@/views/Auth/RegisterView.vue';
import DashboardView from '@/views/Dashboard/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LandingPage },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/dashboard', component: DashboardView, meta: { requiresAuth: true } },
  ],
});

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !localStorage.getItem('cultiva.access_token')) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
});

export default router;
