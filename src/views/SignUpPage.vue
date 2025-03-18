<template>
  <div class="signup-container">
    <h1 class="title">회원가입</h1>
    <form @submit.prevent="signUp">
      <!-- 이메일 -->
      <div class="form-group">
        <label for="email">이메일</label>
        <div class="input-with-button">
          <input
              type="email"
              id="email"
              v-model="form.email"
              placeholder="이메일을 입력하세요"
              required
              pattern="^[a-zA-Z0-9._%+-]{1,20}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              title="이메일 아이디는 최대 20자까지 입력 가능합니다."
              maxlength="20"
          />
          <button type="button" class="verify-button" @click="verifyEmail">본인인증</button>
        </div>
      </div>

      <!-- 인증코드 -->
      <div class="form-group">
        <label for="verifyCode">인증코드</label>
        <div class="input-with-button">
          <input
              type="text"
              id="verifyCode"
              v-model="form.verifyCode"
              placeholder="인증코드를 입력하세요"
          />
          <button type="button" class="verify-button" @click="verifyCodeValidation">확인</button>
        </div>
      </div>

      <!-- 이름 -->
      <div class="form-group">
        <label for="name">이름</label>
        <input
            type="text"
            id="name"
            v-model="form.name"
            placeholder="이름을 입력하세요"
            required
            pattern="^[가-힣]{1,10}$"
            title="이름은 한글만 가능하며, 최대 10자까지 입력 가능합니다."
            maxlength="10"
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
            pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$"
            title="비밀번호는 영문, 숫자, 특수문자를 포함해 8~20자 사이여야 합니다."
            maxlength="20"
        />
      </div>

      <!-- 비밀번호 확인 -->
      <div class="form-group">
        <label for="confirmPassword">비밀번호 확인</label>
        <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            placeholder="비밀번호를 다시 입력하세요"
            required
            maxlength="20"
        />
      </div>

      <!-- 연락처 -->
      <div class="form-group">
        <label for="phoneNumber">연락처</label>
        <input
            type="text"
            id="phoneNumber"
            v-model="form.phoneNumber"
            placeholder="연락처를 입력하세요"
            required
            pattern="^01[016789]\d{7,8}$"
            title="연락처는 숫자 10~11자리로만 입력 가능합니다."
            @input="filterNonNumeric"
            maxlength="11"
        />
      </div>

      <!-- 가입 버튼 -->
      <button type="submit" class="submit-button">가입하기</button>
    </form>

    <!-- 로그인 페이지 이동 링크 -->
    <p class="login-link">
      이미 가입된 회원입니까?
      <router-link to="/login" class="help-link">로그인 페이지로 이동</router-link>
    </p>
  </div>
</template>


<script>
import {ref} from "vue";
import authService from "@/api/service/authService";
import router from "@/router";

export default {
  name: "SignUpForm",
  setup() {
    const form = ref({
      email: "",
      verifyCode: "",
      name: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    });
    let accessToken = null;
    // eslint-disable-next-line no-unused-vars
    let hasEmailAuth = false;
    let verifyCode = null;

    // 본인인증 메일 발송
    const verifyEmail = () => {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      if (!form.value.email) {
        alert("이메일 입력 후 본인인증을 진행해주세요.");
        return;
      }

      if (!emailRegex.test(form.value.email)) {
        alert("유효하지 않은 이메일 형식입니다.");
        return;
      }

      authService.verifyEmailSend(form.value)
          .then((response) => {
            // metaData와 data 추출
            const metaData = response.data.metaData;
            if (metaData.status === 400) {
              alert(metaData.message);  // 유효하지 않은 이메일 형식
              return;
            }
            const data = response.data.data;

            // console.log("메타데이터:", metaData);
            // console.log("데이터:", data);
            if (metaData.status === 200) {
              alert("메일 발신요청이 성공적으로 처리되었습니다.");
              accessToken = data.accessToken;
            }
          })
    };

    const verifyCodeValidation = () => {
      verifyCode = form.value.verifyCode;
      if (!verifyCode) {
        alert("인증코드를 입력해주세요."); // verifyCode가 없는 경우
        return;
      }

      const request = {
        accessToken: accessToken,      // accessToken
        verifyCode: verifyCode,        // 인증코드
      };

      authService.verifyEmail(request)
          .then((response) => {
            // // metaData와 data 추출
            const metaData = response.data.metaData;
            if (metaData.status === 400) {
              alert(metaData.message);  // 유효하지 않은 인증코드 알림
              hasEmailAuth = false;
              return;
            }
            if (metaData.status === 200) {
              alert("인증되었습니다.");

              // response.data.data가 null이 아닐 때만 추출
              if (response.data && response.data.data) {
                const data = response.data.data;
                hasEmailAuth = data.hasEmailAuth;
              }
            }
          })
    };


    const signUp = () => {
      if (!hasEmailAuth) {
        alert("메일인증 후 회원가입 진행가능합니다.")
        return;
      }
      if (verifyCode !== form.value.verifyCode) {
        alert("인증코드를 다시 확인해주세요.");
        return;
      }
      if (form.value.password !== form.value.confirmPassword) {
        alert("비밀번호가 일치하지 않습니다. 다시 입력해주세요.");
        return;
      }

      const signupRequest = {
        email: form.value.email,
        name: form.value.name,
        password: form.value.password,
        confirmPassword: form.value.confirmPassword,
        phoneNumber: form.value.phoneNumber
      };
      authService.signUp(signupRequest)
          .then((response) => {
            // // metaData와 data 추출
            const metaData = response.data.metaData;
            if (metaData.status === 400) {
              alert(metaData.message);  // 유효하지 않은 인증코드 알림
              return;
            }else {
              alert("회원가입에 성공하였습니다.");
              router.push("/login");
            }
          })
    };
    const filterNonNumeric = (event) => {
      const value = event.target.value;
      event.target.value = value.replace(/[^0-9]/g, ""); // 숫자가 아닌 문자를 제거
    };

    return {
      form,
      verifyEmail,
      verifyCodeValidation,
      signUp,
      filterNonNumeric
    };
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.signup-container {
  width: 460px;
  max-width: 90%;
  margin: 40px auto; /* auto 값을 사용하여 좌우 균등하게 설정 */
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
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
  padding: 10px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.input-with-button {
  display: flex;
  gap: 10px;
}

.input-with-button input {
  flex: 1;
}

.verify-button {
  padding: 0 15px;
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
}

.verify-button:hover {
  background-color: #e0e0e0;
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
}

.submit-button:hover {
  background-color: #3a80d2;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link a {
  color: #4a90e2;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.login-link a:hover {
  color: #3a80d2;
  text-decoration: underline;
}

/* 모바일 반응형 */
@media (max-width: 480px) {
  .signup-container {
    padding: 20px;
  }

  .input-with-button {
    flex-direction: column;
    gap: 10px;
  }

  .verify-button {
    width: 100%;
    padding: 12px;
  }
}
</style>
