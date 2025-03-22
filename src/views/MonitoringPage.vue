<template>
  <div class="monitoring">
    <p>모니터링 페이지</p>
    <button @click="test">테스트(JWT)</button>
  </div>
  <div class="chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
  <div class="button-container">
    <button v-for="(action, index) in actions" :key="index" @click="() => action.handler(chartInstance)">
      {{ action.name }}
    </button>
  </div>
</template>

<script>
import authService from "@/api/service/authService";
import router from "@/router";
// Chart.js 관련 import
import * as Utils from "../Utils";
import {onMounted, ref} from "vue";
import {Chart} from "chart.js/auto";
import 'chartjs-adapter-date-fns';

import sensorService from "@/api/service/sensorService";
import {useUserInfoStore} from "@/store/auth/useAuthStore";

export default {
  name: 'MonitoringPage',
  components: {},

  setup() {
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
              router.push({path: "/login", query: {reLogin: true}});
            }
          })
    }

    // Chart.js 관련 설정
    const chartCanvas = ref(null);
    let chartInstance = null;

    // 차트 데이터 및 설정
    const TEMPERATURE_DATA = ref([]);
    const HUMIDITY_DATA = ref([]);
    const SOIL_MOISTURE_DATA = ref([]);

    // Chart.js 차트 x 축 시간 설정
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();

    const data = {
      labels: [ // Date Objects
      ],
      datasets: [{
        label: '온도(°C)',
        backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: Utils.CHART_COLORS.red,
        fill: false,
        data: TEMPERATURE_DATA,
      }, {
        label: '습도(%)',
        backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
        borderColor: Utils.CHART_COLORS.blue,
        fill: false,
        data: HUMIDITY_DATA,
      }, {
        label: '수분량(%)',
        backgroundColor: Utils.transparentize(Utils.CHART_COLORS.yellow, 0.5),
        borderColor: Utils.CHART_COLORS.yellow,
        fill: false,
        data: SOIL_MOISTURE_DATA,
      }]
    };

    // 차트 설정에서 x축을 0~24시간으로 설정
    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'IOT 센서 데이터 차트'
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'hour', // 시간 단위
              displayFormats: {
                hour: 'HH:mm' // 24시간 형식
              },
              tooltipFormat: 'yy.MM.d HH:mm' // 툴팁 시간 형식
            },
            // x 축 라벨 24시간 형식 설정
            min: Utils.newTimeFormatted(0,0,0,0),
            max: Utils.newTimeFormatted(hours,minutes,seconds,milliseconds),
            title: {
              display: true,
              text: '측정시간 (0~24시간)'
            },
          },
          y: {
            title: {
              display: true,
              text: '측정값'
            },
            min: -20,
            max: 100,
          }
        }
      }
    };


    const actions = [
      // {
      //   name: '랜덤하게 변해라(테스트용)',
      //   handler() {
      //     chartInstance.data.datasets.forEach(dataset => {
      //       dataset.data.forEach(function (dataObj, j) {
      //         const newVal = Utils.rand(-100, 100);
      //
      //         if (typeof dataObj === 'object') {
      //           dataObj.y = newVal;
      //         } else {
      //           dataset.data[j] = newVal;
      //         }
      //       });
      //     });
      //     chartInstance.update();
      //   }
      // },
    ];

    const userInfoStore = useUserInfoStore();
    const loading = ref(true); // 로딩 상태 관리

    onMounted(async () => {
      await userInfoStore.restoreUserInfo(); // Pinia 상태 복원
      loading.value = false;

      // 차트 생성
      const ctx = chartCanvas.value.getContext('2d');
      chartInstance = new Chart(ctx, config);

      // 센서데이터 조회 API
      await getSensorData();
    });

    // 센서데이터 조회 API
    const getSensorData = async () => {
      try {
        // 1. 온도 센서 데이터 조회
        const temperatureData = await getSensorDataByType("DHT_TEMPERATURE");
        TEMPERATURE_DATA.value = temperatureData.map(item => ({
          x: new Date(item.measuredAt), // ISO 8601 문자열을 Date 객체로 변환
          y: item.measuredValue,
        }));
        // console.log(TEMPERATURE_DATA.value);
        chartInstance.data.datasets[0].data = TEMPERATURE_DATA.value;
        chartInstance.update();

        // console.log(Utils.newTimeFormatted(0,0,0,0));
        // console.log(chartInstance.data.datasets[0].data);
        // 2. 습도 센서 데이터 조회
        const humidityData = await getSensorDataByType("DHT_HUMIDITY");
        HUMIDITY_DATA.value = humidityData.map(item => ({
          x: new Date(item.measuredAt), // ISO 8601 문자열을 Date 객체로 변환
          y: item.measuredValue,
        }));
        // console.log(HUMIDITY_DATA.value);
        chartInstance.data.datasets[1].data = HUMIDITY_DATA.value;
        chartInstance.update();

        // 3. 토양수분 센서 데이터 조회
        const soilMoistureData = await getSensorDataByType("SOIL_MOISTURE");
        SOIL_MOISTURE_DATA.value = soilMoistureData.map(item => ({
          x: new Date(item.measuredAt), // ISO 8601 문자열을 Date 객체로 변환
          y: item.measuredValue,
        }));
        // console.log(SOIL_MOISTURE_DATA.value);
        chartInstance.data.datasets[2].data = SOIL_MOISTURE_DATA.value;
        chartInstance.update();
      } catch (error) {
        if (error.response.status === 401) {
          alert(error.response.data.metaData.message);
          router.push({path: "/login", query: {reLogin: true}});
          return;
        }

        if (error.response) {
          const metaData = error.response.data.metaData;
          alert(metaData.message);
          return;
        }
      }
    };

    const getSensorDataByType = (sensorType) => {
      return sensorService.getSensorsData(userInfoStore.id, sensorType)
          .then(response => response.data.data)
    };

    return {
      chartCanvas,
      actions,
      chartInstance,
      test
    };
  }
}
</script>

<style scoped>
.chart-container {
  text-align: center;
  position: relative;
}

.chart-container canvas {
  display: block;
  max-height: 400px;
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
