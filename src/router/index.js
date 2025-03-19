import { createRouter, createWebHistory } from 'vue-router';
import SignUpPage from '../views/SignUpPage.vue';
import LoginPage from '../views/LoginPage.vue';
import MonitoringPage from "../views/MonitoringPage.vue";

const routes = [
    {
        path: '/',
        redirect: '/login', // 초기 화면
    },
    {
        path: '/signup',
        name: 'SignUpPage',
        component: SignUpPage, // 회원가입 화면
    },
    {
        path: '/login',
        name: 'LoginPage',
        component: LoginPage, // 회원가입 화면
    },
    {
        path: '/monitor',
        name: 'MonitoringPage',
        component: MonitoringPage, // 회원가입 화면
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
