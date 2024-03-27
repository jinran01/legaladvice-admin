<template>
  <div class="main">
    <div ref="MyEcharts" id="chart-container" class="chart-container">
<!--      <canvas id="chart"></canvas>-->
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import {onMounted, ref} from "vue";
export default {
  name: "Home",
  setup(){
    onMounted(()=>{
      // let MyEcharts = ref()
      let myChart  =  echarts.init(document.getElementById('chart-container'));
      myChart.setOption({
        title: {
          text: 'ECharts 入门示例'
        },
        tooltip: {},
        xAxis: {
          data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
        },
        yAxis: {},
        series: [
          {
            name: '销量',
            type: 'line',
            data: [5, 20, 36, 10, 10, 20]
          }
        ]
      })
    })
    return{
    }
  }
}
</script>
<style scoped lang="scss">
.chart-container{
  height: 200px;
  width: 500px;
}
</style>