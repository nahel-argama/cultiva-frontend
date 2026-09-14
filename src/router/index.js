import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/Landing/LandingPage.vue';
import LoginView from '@/views/Auth/LoginView.vue';
import RegisterView from '@/views/Auth/RegisterView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: LandingPage },
    { path: '/login', component: LoginView },
    { path: '/register', component: RegisterView },
    { path: '/dashboard', component: LandingPage },
  ],
});

export default router;
