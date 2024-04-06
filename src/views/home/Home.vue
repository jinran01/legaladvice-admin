<template>
  <div class="main">
      <el-row class="panel-group" :gutter="50">
        <el-col :span="6">
          <el-card class="card-panel" body-style="padding: 0">
            <div class="card-panel-icon-wrapper">
              <img src="@/assets/icons/png/pvCount.png" alt="" style="width: 58px;height: 58px">
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">访问量</div>
              <span class="card-panel-num">{{ pv }}</span>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="card-panel" body-style="padding: 0">
            <div class="card-panel-icon-wrapper">
              <img src="@/assets/icons/png/userCount.png" alt="" style="width: 48px;height: 48px">
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">用户量</div>
              <span class="card-panel-num">{{ uv }}</span>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="card-panel" body-style="padding: 0">
            <div class="card-panel-icon-wrapper">
              <img src="@/assets/icons/png/articleCount.png" alt="" style="width: 48px;height: 48px">
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">文章数</div>
              <span class="card-panel-num">{{ commentCount }}</span>
            </div>
          </el-card>
        </el-col>

        <el-col :span="6">
          <el-card class="card-panel" body-style="padding: 0">
            <div class="card-panel-icon-wrapper">
              <img src="@/assets/icons/png/commentCount.png" alt="" style="width: 48px;height: 48px">
            </div>
            <div class="card-panel-description">
              <div class="card-panel-text">评论数</div>
              <span class="card-panel-num">{{ commentCount }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row class="panel-group" :gutter="20">
        <el-col :span="16" :xs="24">
          <el-card>
            <div ref="mapEcharts" id="mapEcharts" style="height:500px"></div>
          </el-card>
        </el-col>
        <el-col :span="8" :xs="24">
          <el-card>
            <div ref="categoryEcharts" id="categoryEcharts" style="height:500px;"></div>
          </el-card>
        </el-col>
<!--        <el-col :span="8">-->
<!--          <el-card>-->
<!--            <div ref="tagEcharts" style="height:500px;"></div>-->
<!--          </el-card>-->
<!--        </el-col>-->
      </el-row>

      <el-row class="panel-group" :gutter="20">
      <el-col :span="8" :xs="24">
        <el-card>
          <div ref="tagEcharts" id="tagEcharts" style="height:500px;"></div>
        </el-card>
      </el-col>
        <el-col :span="16" :xs="24">
          <el-card>
            <div ref="articleEcharts" id="articleEcharts" style="height:500px"></div>
          </el-card>
        </el-col>
    </el-row>

<!--      <el-card class="panel-group">-->
<!--        <div ref="visitRecordEcharts" style="height:500px;"></div>-->
<!--      </el-card>-->
    </div>
</template>

<script>
import echarts from 'echarts'
import 'echarts/map/js/china'
//城市经纬度数据来自 https://github.com/Naccl/region2coord
import  geoCoordMap from '@/utils/city2coord.json'

import {onMounted, reactive, ref, toRefs} from "vue";
export default {
  name: "Home",
  setup(){
    let stat = reactive({
      pv: 0,
      uv: 0,
      blogCount: 0,
      commentCount: 0,
    })
    let categoryEcharts = ref()
    let tagEcharts = ref()
    let mapEcharts = ref()
    let articleEcharts = ref()
    //封装数据
    const convertData = (data) =>{
      let res = []
      for (let i = 0; i < data.length; i++) {
        let geoCoord = geoCoordMap[data[i].city]
        if (geoCoord) {
          res.push({
            name: data[i].city,
            value: geoCoord,
            uv: data[i].uv
          })
        }
      }
      return res
    }
    //初始化分类表格
    const initCategory = () => {
      categoryEcharts = echarts.init(document.getElementById('categoryEcharts'))
      let categoryOption = {
        title: {
          text: '分类下文章数量',
          x: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        legend: {
          left: 'center',
          top: 'bottom',
          data: []
        },
        series: [
          {
            name: '文章数量',
            type: 'pie',
            radius: [30, 110],
            roseType: 'area',
            data: []
          }
        ]
      }
      //TODO 获取数据
      let legendData = ["学习笔记", "个人项目", "技术杂烩", "心情随写"]
      let series = [
          {
            "id": 32,
            "name": "心情随写",
            "value": 7
          },
          {
            "id": 33,
            "name": "技术杂烩",
            "value": 8
          },
          {
            "id": 34,
            "name": "个人项目",
            "value": 5
          },
          {
            "id": 35,
            "name": "学习笔记",
            "value": 9
          },
        ]
      categoryOption.legend.data = legendData
      categoryOption.series[0].data = series
      console.log(categoryOption)
      categoryEcharts.setOption(categoryOption)
    }
    //初始化文章表格
    const initArticle = () => {
      articleEcharts = echarts.init(document.getElementById('articleEcharts'))
      let articleOption = {
        title: {
          text: '文章访问量TOP10',
          x: 'center'
        },
        tooltip:{
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisTick: {
            alignWithLabel: true
          }
        },
        yAxis: {
          name: '访问量/次',
          type: 'value',
        },
        series: [
          {
            data: [120, 200, 150, 80, 70, 110, 130],
            type: 'bar',
          },
        ]
      }
      articleEcharts.setOption(articleOption)

    }
    // window.onresize = function () {
    //   articleEcharts.resize();
    // };
    //初始化文章标签图表
    const initTag = () => {
      tagEcharts = echarts.init(document.getElementById('tagEcharts'))
      let articleOption = {

      }
    }

    //初始化地图表格
    const  initMap = () => {
      mapEcharts = echarts.init(document.getElementById('mapEcharts'))
      let mapOption =  {
        title: {
          text: '访客地图',
          x: 'center'
        },
        tooltip: {
          show: false
        },
        geo: {
          map: "china",
          roam: false,//关闭拖拽
          zoom: 1.24,
          center: [104.2, 36],//调整地图位置
          label: {
            normal: {
              show: true,//关闭省份名展示
              fontSize: "10",
              color: "rgba(0,0,0,0.7)"
            },
            emphasis: {
              show: false,
            }
          },
          itemStyle: {
            normal: {
              areaColor: "#0d0059",
              borderColor: "#389dff",
              borderWidth: 1,//设置外层边框
              shadowBlur: 5,
              shadowOffsetY: 8,
              shadowOffsetX: 0,
              shadowColor: "#01012a"
            },
            emphasis: {
              areaColor: "#184cff",
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 5,
              borderWidth: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        },
        series: [
          {
            type: "map",
            map: "china",
            roam: false,
            zoom: 1.24,
            center: [104.2, 36],
            showLegendSymbol: false,
            label: {
              normal: {
                show: true,
                color: "rgba(255,255,255,0.7)"
              },
              emphasis: {
                show: true,
                fontSize: '14',
                color: "rgba(255,255,255,1.5)",
              }
            },
            itemStyle: {
              normal: {
                areaColor: "#0d0059",
                borderColor: "#389dff",
                borderWidth: 0.5
              },
              emphasis: {
                areaColor: "#17008d",
                shadowOffsetX: 0,
                shadowOffsetY: 0,
                shadowBlur: 5,
                borderWidth: 0,
                shadowColor: "rgba(236,113,164,0.5)"
              }
            }
          },
          {
            name: "",
            type: "scatter",
            coordinateSystem: "geo",
            data: [],
            symbol: "circle",
            symbolSize: 5,
            hoverSymbolSize: 10,
            tooltip: {
              formatter(value) {
                return value.data.name + "<br/>" + "访客数：" + value.data.uv
              },
              show: true
            },
            encode: {
              value: 2
            },
            label: {
              formatter: "{b}",
              position: "right",
              show: false
            },
            itemStyle: {
              color: "#0efacc"
            },
            emphasis: {
              label: {
                show: false
              }
            }
          },
          {
            name: "Top 5",
            type: "effectScatter",
            coordinateSystem: "geo",
            data: [],
            symbol: "circle",
            symbolSize: 12,
            tooltip: {
              formatter(value) {
                return value.data.name + "<br/>" + "访客数：" + value.data.uv
              },
              show: true
            },
            encode: {
              value: 2
            },
            showEffectOn: "render",
            rippleEffect: {
              brushType: "stroke",
              color: "#0efacc",
              period: 9,
              scale: 5
            },
            hoverAnimation: true,
            label: {
              formatter: "{b}",
              position: "right",
              show: true
            },
            itemStyle: {
              color: "#0efacc",
              shadowBlur: 2,
              shadowColor: "#333"
            },
            zlevel: 1
          }
        ]
      }
      //TODO 获取数据
      let data = [
        {
          "city": "上海市",
          "uv": 3930
        },
        {
          "city": "杭州市",
          "uv": 2925
        },
        {
          "city": "北京市",
          "uv": 2808
        },
        {
          "city": "广州市",
          "uv": 2696
        },
        {
          "city": "成都市",
          "uv": 1784
        },
        {
          "city": "深圳市",
          "uv": 1761
        },
        {
          "city": "郑州市",
          "uv": 1640
        },
        {
          "city": "武汉市",
          "uv": 1490
        },
        {
          "city": "南京市",
          "uv": 1476
        },
        {
          "city": "重庆市",
          "uv": 1002
        }
      ]
      mapOption.series[1].data = convertData(data)
      mapOption.series[2].data = convertData(data).splice(0,6)
      mapEcharts.setOption(mapOption)
    }

    onMounted(()=>{
      initMap()
      initCategory()
      initTag()
      initArticle()
    })
    return{
      ...toRefs(stat),
    }
  }
}
</script>
<style scoped lang="scss">
.main{
  overflow-x: hidden
}
.panel-group {
  margin-bottom: 30px;
}

.panel-group .card-panel {
  height: 108px;
  position: relative;
  overflow: hidden;
}

.panel-group .card-panel .card-panel-icon-wrapper {
  float: left;
  margin: 14px 0 0 14px;
  padding: 16px;
}

.panel-group .card-panel .card-panel-icon {
  float: left;
  font-size: 48px;
}

.panel-group .card-panel .card-panel-description {
  float: right;
  font-weight: 700;
  margin: 26px 26px 26px 0;
}

.panel-group .card-panel .card-panel-description .card-panel-text {
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
  margin-bottom: 12px;
}

.panel-group .card-panel .card-panel-description .card-panel-num {
  font-size: 20px;
}

</style>