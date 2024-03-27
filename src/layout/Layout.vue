<template>
  <div class="layout">
    <el-container>
      <div class="aside" :style="{width:stat.isFold}">
<!--      <div class="aside" :style="{width:!state.is_pc && !stat.isFold ? '64px' : '0px',width:state.is_pc?stat.isFold:'64px'}" >-->
          <div class="menu-top">
            Fiee
          </div>
          <el-scrollbar>
          <el-menu
            router
            :collapse="stat.isFold"
            :unique-opened="true"
            :default-active="stat.menuCheck"
            style="overflow-x: hidden"
          >
            <template v-for="menu in menuList">
              <!-- 有子菜单 -->
              <el-sub-menu v-if="menu.children && menu.children.length>0" :index="menu.path">
                <template #title>
                  <el-icon>
                    <i :class="['fas',menu.icon]"></i>
                  </el-icon>
                  <a style="padding-left: 20px">{{ menu.name }}</a>
                </template>
                <el-menu-item v-for="item in menu.children" :index="item.path" @click="handleCheckMenu(item)">
                  <el-icon>
                    <i :class="['fas',item.icon]"></i>
                  </el-icon>
                  <template #title>
                    <a style="padding-left: 5px">{{ item.name }}</a>
                  </template>
                </el-menu-item>
              </el-sub-menu>
              <!-- 无子菜单 -->
              <el-menu-item v-else :index="menu.path" @click="handleCheckMenu(menu)">
                <el-icon>
                  <i :class="['fas',menu.icon]"></i>
                </el-icon>
                <template #title>
                  <a style="padding-left: 20px">{{ menu.name }}</a>
                </template>
              </el-menu-item>
            </template>
          </el-menu>
        </el-scrollbar>
      </div>
      <el-main class="layout-main">
        <el-container>
          <el-header class="el-header">
            <el-container>
              <el-header class="navBar">
                <navbar @changeIsFold="changeIsFold"/>
              </el-header>
              <el-scrollbar class="tags-view-container">
                <div class="scrollbar-flex-content">
                  <p v-for="(item,index) in tags" :key="index" class="scrollbar-item"
                     :class="{'scrollbar-item-check':stat.tags_check!=index}"
                     @click="check_tag(index,item.path)"
                  >
                    {{ item.name }}
                    <el-icon @click.stop="closeTags(index)" class="tags-close" v-if="item.name !== '首页'">
                      <Close/>
                    </el-icon>
                  </p>
                </div>
              </el-scrollbar>
            </el-container>
          </el-header>
          <el-main class="main-container" style="background-color: rgba(0, 0, 0, 0.03);">
            <router-view v-slot="{ Component }" :key="$route.fullPath">
              <keep-alive>
                <transition name="el-zoom-in-top">
                  <component :is="Component"/>
                </transition>
              </keep-alive>
            </router-view>
          </el-main>
        </el-container>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="js">
import {onMounted, reactive, ref} from "vue";
import Navbar from "@/layout/Navbar.vue";
import {Discount, User} from "@element-plus/icons-vue";
import index from "vuex";
import {menus} from "@/network/menu";
import {useRoute, useRouter} from "vue-router";
import state from "@/store/state";
import {ElMessage} from "element-plus";

export default {
  name: "Layout",
  computed: {
    state() {
      return state
    },
  },
  components: {
    User,
    Discount,
    Navbar
  },
  setup() {
    let stat = ref({
      isFold: false,
      tags_check: 0,
      menuCheck: '/',
    })
    // let breadcrumbName = ref('')
    let tags = ref(state.tags)
    let menuList = reactive([])
    let router = useRouter()
    // 修改tag颜色
    const check_tag = (index, path) => {
      stat.value.tags_check = index
      stat.value.menuCheck = path
      // breadcrumbName = tags.value[index].name
      // console.log(breadcrumbName)
      // breadcrumb.value = tags.value[index].name
      router.push(path)
    }
    //左菜单收缩功能
    let changeIsFold = (val) => {
      stat.value.isFold = val
    }


    //关闭tags
    const closeTags = (index) => {
      if (stat.value.tags_check >= index) {
        let next = stat.value.tags_check - 1
        tags.value.splice(index, 1);
        check_tag(next, tags.value[next].path)
      } else {
        // let next = stat.value.tags_check
        tags.value.splice(index, 1)
        // check_tag(next,tags.value[next].path)
      }
      window.localStorage.setItem("tags", JSON.stringify(tags.value))
    }
    //点击菜单事件
    const handleCheckMenu = (data) => {
      stat.value.menuCheck = data.path
      let flag = false
      //记录该tag坐标
      let index = 0
      if (data.name != '首页') {
        for (let i of tags.value) {
          if (i.name == data.name) {
            flag = true
            break
          }
          index += 1
        }
        //没有在tags里面则添加，否则跳转
        if (!flag) {
          tags.value.push({"name": data.name, "path": data.path})
          check_tag(tags.value.length - 1, data.path)
        } else {
          // let index = tags.value.findIndex()
          check_tag(index, data.path)
        }
      }
      window.localStorage.setItem("tags", JSON.stringify(tags.value))
    }
    onMounted(() => {
      new Promise((resolve, reject) => {
        menus().then(res => {
          if (res.flag) {
            resolve(res)
          } else {
            reject(res)
          }
        })
      }).then(res => {
        menuList.push(...res.data)
      }).catch((res) => {
        ElMessage({
          message: res.message,
          type: "error"
        })
        setTimeout(() => {
          router.push("/login")
        }, 1000)
      })

      let route = useRoute()
      let flag = false
      let index = 0
      for (const tag of tags.value) {
        if (tag.path === route.path) {
          flag = true
          break
        }
        index += 1
      }
      if (flag) {
        check_tag(index, tags.value[index].path)
        stat.value.menuCheck = tags.value[index].path
      } else {
        tags.value[tags.value.length] = {name: route.name, path: route.path}
        window.localStorage.setItem("tags", JSON.stringify(tags.value))
        stat.value.menuCheck = route.path
        check_tag(tags.value.length - 1, route.path)
      }
    })
    return {
      stat,
      tags,
      menuList,
      // breadcrumbName,
      check_tag,
      handleCheckMenu,
      changeIsFold,
      closeTags,
    }
  }
}

</script>

<style scoped lang="scss">
.layout {
  .aside {
    display: block;
    border-right: 1px solid #d8dce5;
    box-shadow: 0 1px 7px 0 rgba(0, 0, 0, .12), 0 0 5px 0 rgba(0, 0, 0, .04);
  }

  .el-menu {
    border-right: none;
  }

  .el-scrollbar {
    height: calc(100% - 50px);
  }
}

.layout-main {
  padding: 0px;
}

.main-container {
  min-height: auto;
  padding: 20px;
}

.navBar {
  height: 50px;
}

.tags-view-container {
  //height: 30px;
  margin-top: 3px;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
}

.menu-top {
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scrollbar-flex-content {
  display: flex;
}

.scrollbar-item {
  font-size: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: auto;
  height: 22px;
  margin: 0 10px;
  text-align: center;
  padding: 0 10px;
  border-radius: 4px;
  border: rgb(64, 158, 255) 1px solid;
  background: rgb(64, 158, 255);
  color: #FFFFFF;
}

.scrollbar-item-check {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #d8dce5;
}
.el-sub-menu{
  .el-sub-menu__icon-arrow{
    display: none;
  }
}
.tags-close {
  font-size: 12px;
  cursor: pointer;
  padding-left: 5px;

  &:hover {
    color: #ff253a;
  }
}
</style>