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
            <span class="card-panel-num">{{ userCount }}</span>
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
          <div ref="visitRecordEcharts" class="visitRecordEcharts" id="visitRecordEcharts"
               style="height:500px;width: 100%"></div>
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
import {formatDate} from "@/common/js/formatDate";
import {getBlogBackInfo} from "@/network/home";
import {ElMessage} from "element-plus";
import {getArticleTop} from "@/network/article";
import {userArea} from "@/network/user";

export default {
  name: "Home",
  setup() {
    let stat = reactive({
      pv: 0,
      userCount: 0,
      articleCount: 0,
      messageCount: 0,
      tagList: [],
      categoryList: [],
      legendData: [],
      increateData: {
        viewWeek:[],
        articleWeek:[],
        messageWeek:[],
        userWeek:[]
      },
      articleTitle:[],
      articleViewCount:[],
      userAreaList:[]
    })
    let categoryEcharts = ref()
    let tagEcharts = ref()
    let mapEcharts = ref()
    let articleEcharts = ref()
    let visitRecordEcharts = ref()

    //文章访问量top10
    const getArticleTopList = async () => {
      await getArticleTop().then(res => {
        if (res.flag) {
          for (let i = 0; i < res.data.length; i++) {
            stat.articleTitle.push(res.data[i].articleTitle)
            stat.articleViewCount.push(res.data[i].viewCount)
          }
        }
      })
    }

    //封装地图数据
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
    //封装标签、分类数据
    const convert = (data, type) => {
      let res = []
      if (type == 'tag'){
        for (let i = 0; i < data.length; i++) {
          res.push({
            name: data[i]['tagName'],
            value: 0,
          })
        }
      }else {
        for (let i = 0; i < data.length; i++) {
          if (data[i]['articleCount'] > 0){
            stat.legendData.push(data[i]['categoryName'])
            res.push({
              name: data[i]['categoryName'],
              value: data[i]['articleCount'],
            })
          }
        }
      }
      return res
    }
    //初始化访问量图表
    const initVisitRecordEcharts = () => {
      visitRecordEcharts = echarts.init(document.getElementById('visitRecordEcharts'))
      let dateInfo = []
      for (let i = 6; i >= 0; i--) {
        let date = new Date(Date.now() - (60 * 60 * 24 * i) * 1000)
        dateInfo.push(date.toLocaleDateString().replace(/\//g, '-'))
      }
      let visitRecordOption = {
        tooltip: {
          trigger: 'axis',
        },
        color: [
          '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'
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
          data: dateInfo
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            name: '访问量',
            type: 'line',
            data: stat.increateData.viewWeek,
          },
          {
            name: '用户量',
            type: 'line',
            data: stat.increateData.userWeek
          },
          {
            name: '文章数',
            type: 'line',
            data: stat.increateData.articleWeek
          },
          {
            name: '留言数',
            type: 'line',
            data: stat.increateData.messageWeek
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
          data: stat.legendData
        },
        series: [
          {
            name: '文章数量',
            type: 'pie',
            radius: [30, 110],
            roseType: 'area',
            data: stat.categoryList
          }
        ]
      }
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
          data: stat.articleTitle,
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
            data: stat.articleViewCount,
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
            type: 'wordCloud',
            shape: 'cardioid',
            size: ['100%', '100%'],
            textStyle: {
              normal: {
                fontFamily: '微软雅黑',
                color: function () {
                  // Random color
                  return 'rgb(' + [
                    Math.round(Math.random() * 200),
                    Math.round(Math.random() * 250),
                    Math.round(Math.random() * 250)
                  ].join(',') + ')';
                }
              }
            },
            data: stat.tagList
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
      mapOption.series[1].data = convertData(stat.userAreaList)
      mapOption.series[2].data = convertData(stat.userAreaList).splice(0, 6)
      mapEcharts.setOption(mapOption)
    }
    const getHomeInfo = () => {
      getBlogBackInfo().then(res => {
        stat.articleCount = res.data.articleCount
        stat.pv = res.data.viewsCount
        stat.messageCount = res.data.messageCount
        stat.userCount = res.data.userCount
        stat.tagList = convert(res.data.tagDTOList,'tag')
        stat.categoryList = convert(res.data.categoryDTOList,'category')
        stat.increateData = res.data.increateDataDTOList
      })
    }
    const getUserArea = () => {
      userArea().then(res=>{
        stat.userAreaList = res.data
      })
    }
    onMounted(() => {
      getHomeInfo()
      getArticleTopList()
      getUserArea()
      setTimeout(() => {
        try {
          initMap()
          initCategory()
          initTag()
          initArticle()
          initVisitRecordEcharts()
        } catch(e)
        {
          ElMessage.error("出错了！！！")
        }
      }, 700)
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

.visitRecordEcharts {
  div {
    width: 100%;

    canvas {
      width: 100%;
    }
  }
}
</style>