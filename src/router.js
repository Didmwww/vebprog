import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './views/LoginView.vue';
import TeachersCRUD from './views/TeachersCRUD.vue';
import StudentsCRUD from './views/StudentsCRUD.vue';

const routes = [
  { path: '/', redirect: '/login' }, // Перенаправлення на вхід
  { path: '/login', component: LoginView },
  { path: '/teachers', component: TeachersCRUD },
  { path: '/students', component: StudentsCRUD }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;