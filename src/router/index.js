import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from '../views/HelloWorld.vue';
import SignUpPage from '../views/SignUpPage.vue';
import LoginPage from '../views/LoginPage.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HelloWorld, // 초기 화면
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
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
