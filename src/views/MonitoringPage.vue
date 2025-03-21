<template>
  <div class="monitoring">
    <p>모니터링 페이지</p>
    <button @click="test">테스트(JWT)</button>
  </div>
  <div class="chart-container" style="position: relative; height:60vh; width:80vw">
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

// Chart.js 관련
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

    const chartCanvas = ref(null);
    let chartInstance = null;

    // 차트 데이터 및 설정
    const DATA_COUNT = 7;
    const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};

    const labels = Utils.months({count: 7});
    const data = {
      labels: labels,
      datasets: [
        {
          label: '온도',
          data: Utils.numbers(NUMBER_CFG),
          borderColor: Utils.CHART_COLORS.red,
          backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        },
        {
          label: '습도',
          data: Utils.numbers(NUMBER_CFG),
          borderColor: Utils.CHART_COLORS.blue,
          backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
        },
        {
          label: '수분량',
          data: Utils.numbers(NUMBER_CFG),
          borderColor: Utils.CHART_COLORS.yellow,
          backgroundColor: Utils.transparentize(Utils.CHART_COLORS.yellow, 0.5),
        }
      ]
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
    };

    const actions = [
      {
        name: 'Randomize',
        handler(chart) {
          chart.data.datasets.forEach(dataset => {
            dataset.data = Utils.numbers({count: chart.data.labels.length, min: -100, max: 100});
          });
          chart.update();
        }
      },
      {
        name: 'Add Dataset',
        handler(chart) {
          const data = chart.data;
          const dsColor = Utils.namedColor(chart.data.datasets.length);
          const newDataset = {
            label: 'Dataset ' + (data.datasets.length + 1),
            backgroundColor: Utils.transparentize(dsColor, 0.5),
            borderColor: dsColor,
            data: Utils.numbers({count: data.labels.length, min: -100, max: 100}),
          };
          chart.data.datasets.push(newDataset);
          chart.update();
        }
      },
      {
        name: 'Add Data',
        handler(chart) {
          const data = chart.data;
          if (data.datasets.length > 0) {
            data.labels = Utils.months({count: data.labels.length + 1});

            for (let index = 0; index < data.datasets.length; ++index) {
              data.datasets[index].data.push(Utils.rand(-100, 100));
            }

            chart.update();
          }
        }
      },
      {
        name: 'Remove Dataset',
        handler(chart) {
          chart.data.datasets.pop();
          chart.update();
        }
      },
      {
        name: 'Remove Data',
        handler(chart) {
          chart.data.labels.splice(-1, 1); // remove the label first

          chart.data.datasets.forEach(dataset => {
            dataset.data.pop();
          });

          chart.update();
        }
      }
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
.monitoring {

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
