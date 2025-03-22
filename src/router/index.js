import { createRouter, createWebHistory } from 'vue-router';
import SignUpPage from '../views/SignUpPage.vue';
import LoginPage from '../views/LoginPage.vue';
import MonitoringPage from "../views/MonitoringPage.vue";
import MyProfilePage from "../views/MyProfilePage.vue";
import WeeklyMonitoringSummaryPage from "../views/WeeklyMonitoringSummaryPage.vue";
import {useUserInfoStore} from "@/store/auth/useAuthStore";

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
        component: LoginPage, // 로그인 화면
    },
    {
        path: '/monitor',
        name: 'MonitoringPage',
        component: MonitoringPage, // 모니터링 화면
    },
    {
        path: '/summary',
        name: 'WeeklyMonitoringSummaryPage',
        component: WeeklyMonitoringSummaryPage, // 주간요약정보 화면
    },
    {
        path: '/profile',
        name: 'MyProfilePage',
        component: MyProfilePage, // 회원정보 화면
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// 로그인 여부 체크
router.beforeEach(async (to, from, next) => {
    const userInfo = localStorage.getItem("userInfo"); // 로그인 정보 확인

    // 로그아웃 시 로직
    if (to.path === "/login" && to.query.logout) {
        next();
        return;
    }

    // JWT 필터에서 검증 실패 시 로그인 페이지로 이동
    if (to.path === "/login" && to.query.reLogin) {
        const userInfoStore = useUserInfoStore();
        await userInfoStore.logout();  // 로그아웃 처리 후 로그인 페이지로 이동
        next();
        return;
    }

    if (to.path === "/login" && userInfo) {
        // 로그인된 상태일 경우 메인으로 리다이렉트
        alert("이미 로그인된 상태입니다. 모니터링화면으로 이동합니다.");
        next("/monitor");
    } else if (!userInfo && to.path !== "/login" && to.path !== "/signup") {
        // 로그인 안 된 상태에서 다른 페이지에 접근할 때 로그인 페이지로 이동
        alert("로그인 후 이용해주세요.");
        next("/login");
    } else {
        next(); // ✅ 정상적으로 이동
    }
});

export default router;
