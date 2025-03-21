<template>
  <div class="profile-container">
    <h1 class="title">회원정보</h1>
    <form @submit.prevent="updateProfile">
      <!-- 이메일 (수정 불가) -->
      <div class="form-group">
        <label for="email">이메일</label>
        <div class="readonly-field">{{ userInfo.email }}</div>
      </div>

      <!-- 이름 (수정 불가) -->
      <div class="form-group">
        <label for="name">이름</label>
        <div class="readonly-field">{{ userInfo.name }}</div>
      </div>

      <!-- 연락처 (수정 가능) -->
      <div class="form-group">
        <label for="phone">연락처</label>
        <div class="phone-input-group">
          <input
              type="text"
              v-model="phoneNumber.first"
              maxlength="3"
              @input="filterNonNumeric($event, 'first')"
          />
          <span class="separator">-</span>
          <input
              type="text"
              v-model="phoneNumber.middle"
              maxlength="4"
              @input="filterNonNumeric($event, 'middle')"
          />
          <span class="separator">-</span>
          <input
              type="text"
              v-model="phoneNumber.last"
              maxlength="4"
              @input="filterNonNumeric($event, 'last')"
          />
          <button type="submit" class="update-button">
            수정
          </button>
        </div>
      </div>
    </form>

    <!-- 회원탈퇴 섹션 -->
    <div class="withdrawal-section">
      <h2 class="withdrawal-title">회원탈퇴</h2>
      <p class="withdrawal-text">계정 및 개인정보를 삭제하시겠습니까?</p>
      <button @click="confirmDeleteUser" class="withdrawal-button">
        회원탈퇴
      </button>
    </div>
  </div>
</template>

<script>
import {ref, computed, onBeforeMount} from "vue";
import {useUserInfoStore} from "@/store/auth/useAuthStore";
import userService from "@/api/service/userService";
import router from "@/router";

export default {
  name: "UserProfile",
  setup() {
    const userInfoStore = useUserInfoStore();
    const loading = ref(true); // 로딩 상태 관리

    const userInfo = ref({
      email: null,
      name: null,
      phoneNumber: null
    });

    onBeforeMount(async () => {
      await userInfoStore.restoreUserInfo(); // Pinia 상태 복원
      loading.value = false;
      getUserProfile();
    });

    // 전화번호를 각 부분으로 분리
    const phoneNumber = ref({
      first: "",
      middle: "",
      last: ""
    });

    const getUserProfile = () => {
      userService.getUserProfile(userInfoStore.id)
          .then((response) => {
            // data 추출
            const data = response.data.data;
            userInfo.value.email = data.email;
            userInfo.value.name = data.name;
            userInfo.value.phoneNumber = data.phoneNumber;
            initPhoneNumber();
          })
          .catch((error) => {
            // JwtAuthenticationFilter 경고메시지
            // (로그인 후 이용가능합니다.)
            if (error.response.status === 401) {
              alert(error.response.data.metaData.message);
              router.push({path: "/login", query: {reLogin: true}});
            }
          })
    }

    // 전화번호 초기화
    const initPhoneNumber = () => {
      if (userInfo.value.phoneNumber) {
        const phoneStr = userInfo.value.phoneNumber;
        if (phoneStr.length === 11) {
          phoneNumber.value.first = phoneStr.substring(0, 3);    // 첫 3자리
          phoneNumber.value.middle = phoneStr.substring(3, 7);   // 중간 4자리
          phoneNumber.value.last = phoneStr.substring(7, 11);    // 마지막 4자리
        }
        if (phoneStr.length === 10) {
          phoneNumber.value.first = phoneStr.substring(0, 3);    // 첫 3자리
          phoneNumber.value.middle = phoneStr.substring(3, 6);   // 중간 3자리
          phoneNumber.value.last = phoneStr.substring(6, 10);    // 마지막 4자리
        }
      }
    };

    // 전체 전화번호 조합
    const fullPhoneNumber = computed(() => {
      return `${phoneNumber.value.first}${phoneNumber.value.middle}${phoneNumber.value.last}`;
    });

    // 숫자만 입력되도록 필터링
    const filterNonNumeric = (event, part) => {
      const value = event.target.value;
      phoneNumber.value[part] = value.replace(/[^0-9]/g, "");
    };

    // 프로필 업데이트
    const updateProfile = () => {
      // 전화번호 유효성 검사
      if (
          !phoneNumber.value.first ||
          !phoneNumber.value.middle ||
          !phoneNumber.value.last
      ) {
        alert("전화번호를 모두 입력해주세요.");
        return;
      }

      if (fullPhoneNumber.value.length !== 11 && fullPhoneNumber.value.length !== 10) {
        alert("전화번호는 10~11글자로 수정이 가능합니다.");
        return;
      }

      const form = ref({
        id: userInfoStore.id,
        phoneNumber: fullPhoneNumber.value
      })

      userService.updateProfile(form.value)
          .then(() => {
            alert("회원정보가 수정되었습니다.");
          })
          .catch((error) => {
            if (error.response) {
              const metaData = error.response.data.metaData;
              alert(metaData.message);
              return;
            }
          });

    };

    // 회원탈퇴 확인
    const confirmDeleteUser = () => {
      if (confirm("정말 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.\n모든 센서 정보들과 함께 삭제됩니다.")) {
        deleteUser();
      }
    };

    // 회원탈퇴 처리
    const deleteUser = () => {
      userService.deleteCurrentUser(userInfoStore.id)
          .then(() => {
            alert("회원탈퇴가 처리되었습니다.");
            router.push({path: "/login", query: {reLogin: true}});
          })
          .catch((error) => {
            if (error.response) {
              const metaData = error.response.data.metaData;
              alert(metaData.message);
              return;
            }
          })
    };

    return {
      userInfoStore,
      userInfo,
      phoneNumber,
      filterNonNumeric,
      updateProfile,
      confirmDeleteUser,
      deleteUser
    };
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');

.profile-container {
  width: 700px;
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
  margin-right: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.readonly-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #eaeaea;
  color: #333;
  font-size: 14px;
}

.phone-input-group {
  display: flex;
  align-items: center;
}

.phone-input-group input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.phone-input-group input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.separator {
  margin: 0 8px;
  color: #666;
  font-weight: 500;
}

.update-button {
  margin-left: 10px;
  padding: 12px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
}

.update-button:hover {
  background-color: #3a80d2;
}

.withdrawal-section {
  margin-top: 40px;
  height: 150px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
}

.withdrawal-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #333;
}

.withdrawal-text {
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}

.withdrawal-button {
  padding: 12px 20px;
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  position: relative;
  float: right;
}

.withdrawal-button:hover {
  background-color: #e0e0e0;
}

/* 모바일 반응형 */
@media (max-width: 880px) {
  .profile-container {
    padding: 20px;
  }

  .phone-input-group {
    flex-wrap: wrap;
  }

  .update-button {
    width: 100%;
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>