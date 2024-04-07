<template>
  <div class="main" style="width: 100%">
    <el-row class="panel-group" :gutter="50">
      <el-col :span="6" :xs="24">
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

      <el-col :span="6" :xs="24">
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

      <el-col :span="6" :xs="24">
        <el-card class="card-panel" body-style="padding: 0">
          <div class="card-panel-icon-wrapper">
            <img src="@/assets/icons/png/articleCount.png" alt="" style="width: 48px;height: 48px">
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">文章数</div>
            <span class="card-panel-num">{{ articleCount }}</span>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6" :xs="24">
        <el-card class="card-panel" body-style="padding: 0">
          <div class="card-panel-icon-wrapper">
            <img src="@/assets/icons/png/commentCount.png" alt="" style="width: 48px;height: 48px">
          </div>
          <div class="card-panel-description">
            <div class="card-panel-text">留言数</div>
            <span class="card-panel-num">{{ messageCount }}</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row class="panel-group">
      <el-col>
        <el-card>
          <div ref="visitRecordEcharts" class="visitRecordEcharts" id="visitRecordEcharts" style="height:500px;width: 100%"></div>
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

  </div>
</template>

<script>
import echarts from 'echarts'
import 'echarts/map/js/china'
import 'echarts-wordcloud'
//城市经纬度数据来自 https://github.com/Naccl/region2coord
import geoCoordMap from '@/utils/city2coord.json'

import {onMounted, reactive, ref, toRefs} from "vue";

export default {
  name: "Home",
  setup() {
    let stat = reactive({
      pv: 0,
      uv: 0,
      articleCount: 0,
      messageCount: 0,
    })
    let categoryEcharts = ref()
    let tagEcharts = ref()
    let mapEcharts = ref()
    let articleEcharts = ref()
    let visitRecordEcharts = ref()
    //封装数据
    const convertData = (data) => {
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
    //初始化访问量图表
    const initVisitRecordEcharts = () => {
      visitRecordEcharts = echarts.init(document.getElementById('visitRecordEcharts'))
      let visitRecordOption = {
        tooltip: {
          trigger: 'axis',
        },
        color: [
            '#5470c6','#91cc75','#fac858','#ee6666','#73c0de','#3ba272','#fc8452','#9a60b4','#ea7ccc'
        ],
        legend: {
          data: ["访问量", '用户量', '文章数', '留言数'],
          // y: 'bottom'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: ['2024-4-7', '2024-4-8', '2024-4-9', '2024-4-10', '2024-4-11', '2024-4-12', '2024-4-13  ']
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '访问量',
            type: 'line',
            data: [120, 132, 101, 134, 90, 230, 210],
          },
          {
            name: '用户量',
            type: 'line',
            data: [150, 160, 170, 180, 190, 200, 210]
          },
          {
            name: '文章数',
            type: 'line',
            data: [70, 90, 150, 130, 135, 140, 120]
          },
          {
            name: '留言数',
            type: 'line',
            data: [100, 200, 300, 400, 500, 600, 700]
          },
        ]
      }
      visitRecordEcharts.setOption(visitRecordOption)
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
        tooltip: {
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
    window.onresize = function () {
      articleEcharts.resize();
      tagEcharts.resize();
      categoryEcharts.resize();
      mapEcharts.resize();
      visitRecordEcharts.resize();
    };

    //初始化文章标签图表
    const initTag = () => {
      tagEcharts = echarts.init(document.getElementById('tagEcharts'))
      let articleOption = {
        tooltip: {
          show: false,
        },
        series: [
          {
            type:'wordCloud',
            shape: 'cardioid',
            size: ['100%', '100%'],
            // sizeRange: [20, 52.42],
            textStyle: {
              normal: {
                fontFamily: '微软雅黑',
                color: function() {
                  // Random color
                  return 'rgb(' + [
                    Math.round(Math.random() * 200),
                    Math.round(Math.random() * 250),
                    Math.round(Math.random() * 250)
                  ].join(',') + ')';
                }
              }
            },
            data: [
              { name: '微信', value: 1 },
              { name: '南方+', value: 1045 },
              { name: '东莞时间网', value: 834 },
              { name: '东莞', value: 804 },
              { name: '新浪微博', value: 532 },
              { name: '今日头条', value: 493 },
              { name: '腾讯新闻', value: 479 },
              { name: '东莞阳光网', value: 387 },
              { name: '东莞日报', value: 289 },
              { name: '一点资讯', value: 287 },
              { name: '东方头条网', value: 233 },
              { name: '南方都市报', value: 228 },
              { name: '新粤网', value: 207 },
              { name: '南方plus', value: 206 },
              { name: '网易新闻', value: 201 },
              { name: '东方头条', value: 180 },
              { name: '趣头条', value: 178 },
              { name: '羊城派', value: 151 },
              { name: '东莞时报', value: 143 },
              { name: '微信', value: 2 },
              { name: '南方+', value: 3 },
              { name: '东莞时间网', value: 4 },
              { name: '东莞', value: 5 },
              { name: '新浪微博', value: 6 },
              { name: '今日头条', value: 7 },
              { name: '腾讯新闻', value: 9 },
              { name: '东莞阳光网', value: 8 },
              { name: '东莞日报', value: 10 },
              { name: '一点资讯', value: 11 },
              { name: '东方头条网', value: 12 },
              { name: '南方都市报', value: 13 },
              { name: '新粤网', value: 14 },
              { name: '南方plus', value: 15 },
              { name: '网易新闻', value: 16 },
              { name: '东方头条', value: 17 },
              { name: '趣头条', value: 18 },
              { name: '羊城派', value: 19 },
              { name: '东莞时报', value: 20 },
            ]
          }
        ]
      }
      tagEcharts.setOption(articleOption)
    }

    //初始化地图表格
    const initMap = () => {
      mapEcharts = echarts.init(document.getElementById('mapEcharts'))
      let mapOption = {
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
      mapOption.series[2].data = convertData(data).splice(0, 6)
      mapEcharts.setOption(mapOption)
    }

    onMounted(() => {
      setTimeout(()=>{
        initMap()
        initCategory()
        initTag()
        initArticle()
        initVisitRecordEcharts()
      },500)
    })
    return {
      ...toRefs(stat),
    }
  }
}
</script>
<style scoped lang="scss">
.main {
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
.visitRecordEcharts{
  div{
    width: 100%;
    canvas{
      width: 100%;
    }
  }
}
</style>