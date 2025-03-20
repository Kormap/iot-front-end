<template>
  <div id="app">
    <HeaderComponent></HeaderComponent>
    <div class="router-view-container">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import HeaderComponent from "@/components/Header.vue";

export default {
  name: 'App',
  components: {HeaderComponent},
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 헤더가 fixed이므로 router-view에 적절한 margin 추가 */
.router-view-container {
  margin-top: 70px; /* 헤더 높이만큼 상단 여백 추가 */
  flex: 1;
  width: 100%;
  padding: 1rem;
  box-sizing: border-box;
}

/* 모바일 환경에서는 헤더 높이가 다를 수 있으므로 조정 */
@media (max-width: 768px) {
  .router-view-container {
    margin-top: 60px; /* 모바일에서 헤더가 더 작을 경우 */
    padding: 0.5rem;
  }
}
</style>
