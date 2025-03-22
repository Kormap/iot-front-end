<template>
  <div class="monitoring">
    <p>주간 요약 정보</p>
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

export default {
  name: 'MonitoringPage',
  components: { },

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
              router.push({ path: "/login", query: { reLogin: true } });
            }
          })
    }

    // Chart.js 관련 설정
    const chartCanvas = ref(null);
    let chartInstance = null;

    // 차트 데이터 및 설정
    const DATA_COUNT = 100;
    const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};

    const data = {
      labels: [ // Date Objects
        // 현재일 기준 일주일 전 7일 생성
        Utils.newDateFormatted(-7),
        Utils.newDateFormatted(-6),
        Utils.newDateFormatted(-5),
        Utils.newDateFormatted(-4),
        Utils.newDateFormatted(-3),
        Utils.newDateFormatted(-2),
        Utils.newDateFormatted(-1),
      ],
      datasets: [{
        label: '온도',
        backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        borderColor: Utils.CHART_COLORS.red,
        fill: false,
        data: Utils.numbers(NUMBER_CFG),
      }, {
        label: '습도',
        backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
        borderColor: Utils.CHART_COLORS.blue,
        fill: false,
        data: Utils.numbers(NUMBER_CFG),
      }, {
        label: '수분량',
        backgroundColor: Utils.transparentize(Utils.CHART_COLORS.yellow, 0.5),
        borderColor: Utils.CHART_COLORS.yellow,
        fill: false,
        data:Utils.numbers(NUMBER_CFG),
      }]
    };

    const config = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        plugins: {
          title: {
            text: 'IOT 센서 측정값',
            display: true
          },
          legend: {
            position: 'top',
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            // Luxon format string
            tooltipFormat: 'DD T'
          },
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          title: {
            display: true,
            text: 'value'
          }
        }
      },
    };

    const actions = [
      {
        name: '랜덤하게 변해라(테스트용)',
        handler() {
          chartInstance.data.datasets.forEach(dataset => {
            dataset.data.forEach(function(dataObj, j) {
              const newVal = Utils.rand(0, 100);

              if (typeof dataObj === 'object') {
                dataObj.y = newVal;
              } else {
                dataset.data[j] = newVal;
              }
            });
          });
          chartInstance.update();
        }
      },
    ];

    onMounted(() => {
      // 차트 생성
      const ctx = chartCanvas.value.getContext('2d');
      chartInstance = new Chart(ctx, config);
    });

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
