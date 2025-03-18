<template>
  <div class="login-container">
    <h1 class="title">로그인</h1>
    <form @submit.prevent="login">
      <!-- 이메일 -->
      <div class="form-group">
        <label for="email">이메일</label>
        <input
            type="email"
            id="email"
            v-model="form.email"
            placeholder="이메일을 입력하세요"
            required
        />
      </div>

      <!-- 비밀번호 -->
      <div class="form-group">
        <label for="password">비밀번호</label>
        <input
            type="password"
            id="password"
            v-model="form.password"
            placeholder="비밀번호를 입력하세요"
            required
        />
      </div>

      <!-- 로그인 버튼 -->
      <button type="submit" class="submit-button">
        로그인
      </button>
    </form>

    <!-- 회원가입 및 비밀번호 찾기 링크 -->
    <div class="help-links">
      <router-link to="/signup" class="help-link">
        회원가입
      </router-link>
      <span class="divider">|</span>
      <router-link to="/forgot-password" class="help-link">
        비밀번호 찾기
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  name: "LoginForm",
  setup() {
    const form = ref({
      email: "",
      password: ""
    });

    const login = () => {
      // 로그인 로직 구현
      console.log("로그인 시도:", form.value);
      // API 호출 코드 작성
    };

    return {
      form,
      login
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.login-container {
  width: 460px;
  max-width: 90%;
  margin: 40px auto;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  background-color: #f5f5f5;
  font-family: 'Noto Sans KR', sans-serif;
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-weight: 700;
  font-size: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.form-group input {
  width: 100%;
  padding: 12px 6px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: #fff;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.submit-button {
  width: 100%;
  padding: 14px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
  position: relative;
}

.submit-button:hover {
  background-color: #3a80d2;
}

.help-links {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

.help-link {
  color: #4a90e2;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  position: relative;
  margin: 0 10px;
}

.help-link:hover {
  text-decoration: underline;
}

.divider {
  color: #ddd;
  margin: 0 5px;
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .login-container {
    padding: 20px;
  }
}
</style>