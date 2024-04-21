<template>
  <div class="navbar">
<!--    <el-hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container"-->
<!--               @toggleClick="toggleSideBar"/>-->
    <div class="hamburger" @click="handleFold">
      <el-icon v-if="!stat.isFold">
        <Fold  />
      </el-icon>
      <el-icon v-else>
        <Expand  />
      </el-icon>
    </div>
    <el-breadcrumb separator="/" class="breadcrumb-container">
      <el-breadcrumb-item >首页</el-breadcrumb-item>
<!--      <el-breadcrumb-item >{{ breadcrumb }}</el-breadcrumb-item>-->

    </el-breadcrumb>
    <div class="right-menu">
        <el-tooltip content="全站搜索" effect="dark" placement="bottom">
          <div class="icon-container">
            <el-icon v-if="state.is_pc">
              <Search />
            </el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="全屏" effect="dark" placement="bottom">
          <div class="icon-container" @click="SetFullScreen">
            <el-icon v-if="state.is_pc">
              <FullScreen />
            </el-icon>
          </div>
        </el-tooltip>
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatarUrl" class="user-avatar" @changeAvatarUrl="changeAvatarUrl">
          <i class="el-icon-caret-bottom"/>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="goToSetting">个人中心</el-dropdown-item>
            <el-dropdown-item>布局设置</el-dropdown-item>
            <el-dropdown-item divided @click="logoutHandle">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import {computed, onMounted, reactive, ref, watch} from "vue";
import {logout} from "@/network/login";
import router from "@/router";
import {ElMessage} from "element-plus";
import screenFull from "screenfull"
import {Expand} from "@element-plus/icons-vue";
import state from "@/store/state";
import store from "@/store";
import {routes} from "vue-router/auto-routes";
import {useRouter} from "vue-router";
export default {
  name: "Navbar",
  methods: {
    router() {
      return router
    }
  },
  components: {Expand},
  props:{
    avatarUrl:{
      type: String,
      default: ""
    }
  },
  computed: {
    state() {
      return state
    },
  },
  setup(props, context){
    let stat = ref({
      isFold : false,
    })
    const goToSetting = () => {
      // window.location.href = "/setting";
      router.push("/setting")
    }
    //更新头像
    const avatarUrl = computed(()=>{
      return store.getters.getAvatarUrl
    })
    //是否折叠菜单
    const handleFold = () => {
      stat.value.isFold = !stat.value.isFold
      context.emit("changeIsFold",stat.value.isFold)
    }

    // 全屏
    const SetFullScreen = () => {
      //screenfull.isEnabled  此方法返回布尔值，判断当前能不能进入全屏
      if (!screenFull.isEnabled) {
        return false
      }
      //screenfull.toggle 此方法是执行全屏化操作。如果已是全屏状态，则退出全屏
      screenFull.toggle()
    }
    // 登出操作
    const logoutHandle = () => {
      logout().then(res=>{
        if (res.flag){
          ElMessage({
            message:"退出成功！",
            type:"success"
          })
          router.push("/login")
        }else {
          ElMessage({
            message:"出错了",
            type:"error"
          })
        }
      })
    }
    return{
      stat,
      avatarUrl,
      // breadcrumb,
      goToSetting,
      SetFullScreen,
      handleFold,
      logoutHandle,
    }
  }
}


</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, .08);

  .icon-container{
    width: 34px;
    height: 50px;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover{
      background-color: rgb(0,0,0,0.025);
      cursor: pointer;
    }
  }
  .hamburger{
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 20px;
    cursor: pointer;
    &:hover {
      background-color: rgba(0,0,0,.025)
    }
  }
  .breadcrumb-container {
    float: left;
    width: 80%;
    display: flex;
  }

  //.topmenu-container {
  //  position: absolute;
  //  left: 50px;
  //}

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    display: flex;
    float: right;
    width: 20%;
    height: 100%;
    line-height: 50px;
    justify-content: end;
    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
