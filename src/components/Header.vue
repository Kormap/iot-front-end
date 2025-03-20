<template>
  <div class="header-container" :class="{ 'scrolled': isScrolled }">
    <!-- 로고 영역 -->
    <div class="logo-container">
      <a @click="routerMonitoring" class="logo-link">
        <p v-if="!logoLoaded">로고자리</p>
        <!-- <img v-if="logoLoaded" :src="require('@/assets/images/dongActivityLogo.png')" alt="로고" class="logo-image" @load="logoLoaded = true"> -->
      </a>
    </div>

    <!-- 모바일 메뉴 토글 버튼 -->
    <div class="mobile-toggle" @click="toggleMobileMenu">
      <span></span>
      <span></span>
      <span></span>
    </div>

    <!-- 헤더 우측 영역 - 데스크탑 & 모바일 -->
    <div class="header-right" :class="{ 'mobile-open': mobileMenuOpen }">
      <a
          v-if="isShow"
          class="underline-hover-btn user-name"
          @click="goMyProfile()"
      >
        {{ clientName }}
      </a>
      <a
          v-if="isShow"
          class="underline-hover-btn logout-btn"
          @click="userInfoStore.logout"
      >
        로그아웃
      </a>
    </div>
  </div>
</template>

<script>
import {useUserInfoStore} from "@/store/auth/useAuthStore";
import {storeToRefs} from "pinia";
import {onMounted, ref, watch, onBeforeUnmount} from "vue";
import {useRoute} from "vue-router";
import router from "@/router";

export default {
  name: "Header-component",
  setup() {
    const userInfoStore = useUserInfoStore();
    const {clientName} = storeToRefs(userInfoStore);
    const loading = ref(true);
    const isShow = ref(false);
    const route = useRoute();
    const logoLoaded = ref(false);
    const mobileMenuOpen = ref(false);
    const isScrolled = ref(false);

    // 로그인 상태 체크
    const loginStatusCheck = async () => {
      const userInfo = localStorage.getItem("userInfo");
      isShow.value = userInfo !== null;
    };

    // 모바일 메뉴 토글
    const toggleMobileMenu = () => {
      mobileMenuOpen.value = !mobileMenuOpen.value;
    };

    // 스크롤 감지
    const handleScroll = () => {
      isScrolled.value = window.scrollY > 50;
    };

    // 라우팅 함수
    const routerMonitoring = async () => {
      const userInfo = localStorage.getItem("userInfo");
      console.log(userInfo);
      mobileMenuOpen.value = false; // 메뉴 닫기
      await router.push("/"); // 홈으로 이동 (또는 원하는 경로)
    };

    const goMyProfile = async () => {
      mobileMenuOpen.value = false; // 메뉴 닫기
      await router.push("/profile");
    };

    // 라우트 변경 시 자동으로 모바일 메뉴 닫기
    watch(() => route.path, () => {
      mobileMenuOpen.value = false;
      loginStatusCheck();
    });

    onMounted(async () => {
      await userInfoStore.restoreUserInfo();
      await loginStatusCheck();
      loading.value = false;
      window.addEventListener('scroll', handleScroll);
    });

    onBeforeUnmount(() => {
      window.removeEventListener('scroll', handleScroll);
    });

    return {
      userInfoStore,
      routerMonitoring,
      loginStatusCheck,
      goMyProfile,
      clientName,
      isShow,
      logoLoaded,
      mobileMenuOpen,
      toggleMobileMenu,
      isScrolled
    };
  },
};
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  background-color: white;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.header-container.scrolled {
  padding: 0.5rem 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.logo-link {
  display: flex;
  align-items: center;
  color: #3a3131;
  text-decoration: none;
  cursor: pointer;
}

.logo-image {
  max-width: 150px;
  height: auto;
  transition: all 0.3s ease;
}

.header-right {
  display: flex;
  align-items: center;
  margin-left: auto;
  flex-wrap: nowrap;
  padding-right: 15px;
}

/* 원래 버튼 스타일 */
.underline-hover-btn {
  display: inline-block;
  padding: 1em 0;
  border-radius: 0;
  color: #3a3131;
  margin-top: 0;
  margin-right: 0.8rem;
  font-weight: bold;
  font-size: 0.9rem;
  letter-spacing: 3px;
  text-transform: uppercase;
  text-decoration: none;
  position: relative;
  white-space: nowrap;
  cursor: pointer;
}

.logout-btn {
  color: #be0000;
}

.underline-hover-btn:hover {
  color: #b2876f;
}

.underline-hover-btn:before {
  content: "";
  position: absolute;
  width: 100%;
  height: 2px;
  left: 0;
  bottom: 0px;
  background: #d6beb1;
  transform: translateY(6px);
  opacity: 0;
  transition: 1.8s cubic-bezier(0.2, 1, 0.3, 1);
  pointer-events: none;
}

.underline-hover-btn:hover:before {
  transform: none;
  opacity: 1;
  transition-duration: 0.4s;
}

.mobile-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  cursor: pointer;
  z-index: 1100;
  margin-left: 1rem;
}

.mobile-toggle span {
  display: block;
  width: 100%;
  height: 3px;
  background-color: #3a3131;
  transition: all 0.3s ease;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .header-container {
    padding: 1rem;
  }

  .mobile-toggle {
    display: flex;
  }

  .header-right {
    position: fixed;
    top: 0;
    right: -100%;
    width: 70%;
    height: 100vh;
    background-color: white;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding: 5rem 2rem;
    transition: all 0.3s ease;
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
  }

  .header-right.mobile-open {
    right: 0;
  }

  .underline-hover-btn {
    margin: 1rem 0;
    font-size: 1.1rem;
  }
}

/* 스크롤을 위한 페이지 패딩 조정 */
@media (min-width: 769px) {
  body {
    padding-top: 70px;
  }
}
</style>