<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h1> PianaTest :: {{ user.clientName }}</h1>
    <button @click="user.changeName">이름 변경</button>

    <div>
      <h2>Auth API 호출</h2>
      <button @click="fetchAuthData" :disabled="loading">
        {{ loading ? "불러오는 중..." : "API 호출하기" }}
      </button>
      <div v-if="error">{{ error }}</div>
      <div v-if="testData">
        <h3>응답 데이터:</h3>
        <pre>{{ testData }}</pre>
      </div>
    </div>

    <p>
      For a guide and recipes on how to configure / customize this project,<br>
      check out the
      <a href="https://cli.vuejs.org" target="_blank" rel="noopener">vue-cli documentation</a>.
    </p>
    <h3>Installed CLI Plugins</h3>
    <ul>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel" target="_blank"
             rel="noopener">babel</a></li>
      <li><a href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint" target="_blank"
             rel="noopener">eslint</a></li>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li><a href="https://vuejs.org" target="_blank" rel="noopener">Core Docs</a></li>
      <li><a href="https://forum.vuejs.org" target="_blank" rel="noopener">Forum</a></li>
      <li><a href="https://chat.vuejs.org" target="_blank" rel="noopener">Community Chat</a></li>
      <li><a href="https://twitter.com/vuejs" target="_blank" rel="noopener">Twitter</a></li>
      <li><a href="https://news.vuejs.org" target="_blank" rel="noopener">News</a></li>
    </ul>
    <h3>Ecosystem</h3>
    <ul>
      <li><a href="https://router.vuejs.org" target="_blank" rel="noopener">vue-router</a></li>
      <li><a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a></li>
      <li><a href="https://github.com/vuejs/vue-devtools#vue-devtools" target="_blank" rel="noopener">vue-devtools</a>
      </li>
      <li><a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener">vue-loader</a></li>
      <li><a href="https://github.com/vuejs/awesome-vue" target="_blank" rel="noopener">awesome-vue</a></li>
    </ul>
  </div>
</template>

<script>
import {useUserInfoStore} from "@/store/auth/useAuthStore";
import { ref } from "vue";
import authService from "@/api/service/authService";

export default {
  name: 'HelloWorld',

  // Piana 구현 테스트 & API 호출 테스트
  props: {
    msg: String
  },
  setup() {
    const user = useUserInfoStore()

    // 모듈화 API 호출 테스트
    const testData = ref(null);
    const error = ref(null);
    const loading = ref(false);

    const fetchAuthData = async () => {
      loading.value = true;
      error.value = null;
      const input = "abcd1234";
      try {
        const response = await authService.fetchTest(input);
        testData.value = response.data; // API 응답 저장
      } catch (err) {
        error.value = "API 호출 실패!";
      } finally {
        loading.value = false;
        console.log("test API 정상동작");
      }
    };
    return {
      user,
      fetchAuthData, testData, error, loading
    }


  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
