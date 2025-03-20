<template>
  <div class="monitoring">
    <p>모니터링 페이지</p>
<!--    <h1> Piana :: {{ clientName }}</h1>-->
    <button @click="test">테스트(JWT)</button>
  </div>
</template>

<script>
// import {onMounted, ref} from "vue";
// import {useUserInfoStore} from "@/store/auth/useAuthStore";
// import {storeToRefs} from "pinia";
import authService from "@/api/service/authService";
import router from "@/router";

export default {
  name: 'MonitoringPage',

  setup() {
    // const userInfoStore = useUserInfoStore();
    // const {clientName} = storeToRefs(userInfoStore); // Pinia 상태를 반응형으로 가져오기
    // const loading = ref(true); // 로딩 상태 관리
    //
    // onMounted(async () => {
    //   await userInfoStore.restoreUserInfo(); // Pinia 상태 복원
    //   loading.value = false; // 로딩 완료
    // });

    const test = async () => {
      authService.test()
          .then(response => {
            console.log(response)
          })
          .catch(error => {
            // JwtAuthenticationFilter 경고메시지
            // (로그인 후 이용가능합니다.)
            if (error.response.status === 401) {
              alert(error.response.data.metaData.message);
              router.push({ path: "/login", query: { reLogin: true } });
            }
          })
    }

    return {
      // userInfoStore,
      // clientName,
      // loading,
      test
    };
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.monitoring {
  //text-align: center;
}
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>
