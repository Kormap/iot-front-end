<template>
  <div class="monitoring">
    <h2>모니터링 페이지</h2>
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

  <!-- 센서 모니터링 차트 정보 섹션 -->
  <div class="sensor-info-section">
    <h2 class="sensor-title">센서 모니터링 차트</h2>

    <div class="sensor-info-container">
      <div class="sensor-info-box">
        <h3 class="sensor-info-title">온습도센서 정보 및 설정</h3>
        <div class="sensor-info-content">
          <p>측정일자 : {{ formatDate(latestTemperatureData?.x) }}</p>
          <p>설정범위(온도) : {{ temperatureThreshold?.minThreshold }}도 ~ {{ temperatureThreshold.maxThreshold }}도</p>
          <p>설정범위(습도) : {{ humidityThreshold?.minThreshold }}% ~ {{ humidityThreshold?.maxThreshold }}%</p>
          <p>최근 측정값 : {{ latestTemperatureData?.y.toFixed(1) }}도, {{ latestHumidityData?.y.toFixed(1) }}%</p>

          <p class="alert-title">경고</p>
          <p>설정값 이하 : {{ dhtSensorAlerts.below }}건</p>
          <p>설정값 이상 : {{ dhtSensorAlerts.above }}건</p>

          <p class="status" :class="{ normal: dhtSensorStatus === '정상', abnormal: dhtSensorStatus !== '정상' }">
            [연결상태 : {{ dhtSensorStatus }}]
          </p>
        </div>
      </div>

      <div class="sensor-info-box">
        <h3 class="sensor-info-title">토양수분센서 정보 및 설정</h3>
        <div class="sensor-info-content">
          <p>측정일자 : {{ formatDate(latestSoilMoistureData?.x) }}</p>
          <p>설정범위 : {{ soilMoistureThreshold?.minThreshold }}% ~ {{ soilMoistureThreshold?.maxThreshold }}%</p>
          <p>최근 측정값 : {{ latestSoilMoistureData?.y.toFixed(2) }}%</p>

          <p class="alert-title">경고</p>
          <p>설정값 이하 : {{ soilMoistureAlerts.below }}건</p>
          <p>설정값 이상 : {{ soilMoistureAlerts.above }}건</p>

          <p class="status" :class="{ normal: soilMoistureStatus === '정상', abnormal: soilMoistureStatus !== '정상' }">
            [연결상태 : {{ soilMoistureStatus }}]
          </p>
        </div>
      </div>
    </div>
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
              tooltipFormat: 'yy.MM.d HH:mm:ss' // 툴팁 시간 형식
            },
            // x 축 라벨 24시간 형식 설정
            min: Utils.newTimeFormatted(0, 0, 0, 0),
            max: Utils.newTimeFormatted(hours, minutes, seconds, milliseconds),
            title: {
              display: true,
              text: '측정시간 (자정 ~ 현재시간)'
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

      // 센서 정보조회
      try {
        // 센서데이터 조회 API
        await getSensorData();
        // 센서 임계값(설정범위) 조회 API
        await getSensorsThreshold();
        // 센서 경고정보 조회 API
        await getSensorsWarning();
      } catch (error) {
        if (error.response.status === 401) {
          alert(error.response.data.metaData.message);
          router.push({ path: "/login", query: { reLogin: true } });
          return;
        }

        if (error.response) {
          const metaData = error.response.data.metaData;
          alert(metaData.message);
        }
      }
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
        chartInstance.data.datasets[0].data = TEMPERATURE_DATA.value;
        // console.log(TEMPERATURE_DATA.value);
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

        // 3. 토양수분 센서 데이터 조회
        const soilMoistureData = await getSensorDataByType("SOIL_MOISTURE");
        SOIL_MOISTURE_DATA.value = soilMoistureData.map(item => ({
          x: new Date(item.measuredAt), // ISO 8601 문자열을 Date 객체로 변환
          y: item.measuredValue,
        }));
        // console.log(SOIL_MOISTURE_DATA.value);
        chartInstance.data.datasets[2].data = SOIL_MOISTURE_DATA.value;

        // 센서 데이터 차트 업데이트
        chartInstance.update();

        // 최신 온도 값 업데이트(센서정보)
        if (TEMPERATURE_DATA.value.length > 0) {
          latestTemperatureData.value = TEMPERATURE_DATA.value[TEMPERATURE_DATA.value.length - 1];
        }
        // 최신 습도 값 업데이트(센서정보)
        if (HUMIDITY_DATA.value.length > 0) {
          latestHumidityData.value = HUMIDITY_DATA.value[HUMIDITY_DATA.value.length - 1];
        }
        // 최신 토양 수분 값 업데이트(센서정보)
        if (SOIL_MOISTURE_DATA.value.length > 0) {
          latestSoilMoistureData.value = SOIL_MOISTURE_DATA.value[SOIL_MOISTURE_DATA.value.length - 1];
        }
      } catch (error) {
        if (error.response.status === 401) {
          throw error;
        }

        if (error.response) {
          const metaData = error.response.data.metaData;
          alert(metaData.message);
          return;
        }
      }
    };

    const getSensorDataByType = async (sensorType) => {
      return sensorService.getSensorsData(userInfoStore.id, sensorType)
          .then(response => response.data.data)
    };


    /*
    *   센서 정보 및 설정 관련
    */

    // 설정범위(임계값) 변수
    const temperatureThreshold = ref({minThreshold: 0, maxThreshold: 0});
    const humidityThreshold = ref({minThreshold: 0, maxThreshold: 0});
    const soilMoistureThreshold = ref({minThreshold: 0, maxThreshold: 0});

    // 최근 측정값 변수
    const latestTemperatureData = ref({x: new Date(), y: 0});
    const latestHumidityData = ref({x: new Date(), y: 0});
    const latestSoilMoistureData = ref({x: new Date(), y: 0});

    // 센서 상태 관련 변수
    const dhtSensorStatus = ref('정상');
    const soilMoistureStatus = ref('비정상(임시)');

    // 경고 건수 관련 변수
    const dhtSensorAlerts = ref({
      below: 0,
      above: 0
    });

    const soilMoistureAlerts = ref({
      below: 0,
      above: 0
    });

    // 센서 설정범위(임계값) 조회 API
    const getSensorsThreshold = async () => {
      try {
        const response = await sensorService.getSensorsThreshold(userInfoStore.id);
        const data = response.data.data;

        // 각 센서별 임계값 설정
        data.forEach(item => {
          if (item.sensorType === "DHT_TEMPERATURE") {
            temperatureThreshold.value.minThreshold = item.minThreshold;
            temperatureThreshold.value.maxThreshold = item.maxThreshold;
          } else if (item.sensorType === "DHT_HUMIDITY") {
            humidityThreshold.value.minThreshold = item.minThreshold;
            humidityThreshold.value.maxThreshold = item.maxThreshold;
          } else if (item.sensorType === "SOIL_MOISTURE") {
            soilMoistureThreshold.value.minThreshold = item.minThreshold;
            soilMoistureThreshold.value.maxThreshold = item.maxThreshold;
          }
        });
      } catch (error) {
        if (error.response.status === 401) {
          throw error;
        }

        if (error.response) {
          const metaData = error.response.data.metaData;
          alert(metaData.message);
        }
      }
    };

    const getSensorsWarning = async () => {
      try {
        const response = await sensorService.getSensorsWarning(userInfoStore.id);
        const data = response.data.data;
        console.log(data);
        dhtSensorAlerts.value.above = data.dhtMinWarningCount;
        dhtSensorAlerts.value.below = data.dhtMaxWarningCount;
        soilMoistureAlerts.value.above = data.soilMinWarningCount;
        soilMoistureAlerts.value.below = data.soilMaxWarningCount;
      } catch (error) {
        if (error.response.status === 401) {
          throw error;
        }

        if (error.response) {
          const metaData = error.response.data.metaData;
          alert(metaData.message);
        }
      }
    }

    // 날짜 형식 포맷팅 함수
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}.${month}.${day}`;
    };

    return {
      chartCanvas,
      actions,
      chartInstance,
      test,

      // 센서 정보 관련
      temperatureThreshold,
      humidityThreshold,
      soilMoistureThreshold,
      dhtSensorStatus,
      soilMoistureStatus,
      dhtSensorAlerts,
      soilMoistureAlerts,
      latestTemperatureData,
      latestHumidityData,
      latestSoilMoistureData,
      formatDate,
    };
  }
}
</script>

<style scoped>
.chart-container {
  text-align: center;
  position: relative;
  margin-top: 20px;
  width: 100%; /* 컨테이너 크기를 100%로 설정 */
  min-height: 300px; /* 너무 작아지지 않도록 최소 높이 설정 */
}

.chart-container canvas {
  display: block;
  width: 100% !important; /* 강제적으로 전체 너비 사용 */
  height: 100% !important; /* 강제적으로 전체 높이 사용 */
  max-height: 400px;
}

.sensor-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 20px auto;
  padding: 10px;
  border: 2px solid #333;
  width: 60%;
  max-width: 500px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

/* 센서 정보 섹션 스타일 */
.sensor-info-section {
  margin: 30px 0;
  font-family: 'Noto Sans KR', sans-serif;
}

.monitoring {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 20px auto;
  width: 60%;
  max-width: 500px;
}

.sensor-info-container {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  margin: 0 auto;
  max-width: 95%;
}

.sensor-info-box {
  flex: 1;
  border: 2px solid #555;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.sensor-info-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
}

.sensor-info-title {
  text-align: center;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #ddd;
  color: #333;
  font-size: 1.2rem;
}

.sensor-info-content {
  line-height: 1.6;
}

.info-row {
  display: flex;
  margin: 8px 0;
  align-items: center;
}

.info-label {
  min-width: 110px;
  font-weight: 500;
  color: #555;
}

.info-value {
  font-weight: bold;
  color: #333;
}

.info-section {
  margin: 15px 0 10px;
  padding-top: 5px;
  border-top: 1px dashed #ddd;
}

.alert-title {
  font-weight: bold;
  font-size: 1.05rem;
  color: #d32f2f;
  margin-bottom: 5px;
}

.alert-item {
  padding-left: 10px;
}

.status-row {
  margin-top: 15px;
  justify-content: center;
}

.status {
  font-weight: bold;
  padding: 5px 12px;
  border-radius: 4px;
  display: inline-block;
}

.normal {
  color: white;
  background-color: #2e7d32;
}

.abnormal {
  color: white;
  background-color: #d32f2f;
}

/* 반응형 스타일 */
@media (max-width: 768px) {
  .sensor-info-container {
    flex-direction: column;
  }

  .sensor-title {
    width: 90%;
  }
}
</style>
