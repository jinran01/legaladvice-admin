<template>
  <div class="login">
    <el-form ref="loginFormRef" :model="form" class="login-form">
      <h3 class="title">后台管理系统</h3>
      <el-form-item prop="username" :rules="[
        {
          required: true,
          message: '账号不能为空',
          trigger: 'blur',
        },
      ]">
        <el-input
          v-model="form.username"
          type="text"
          auto-complete="off"
          placeholder="账号"
          :prefix-icon="User"

        >
        </el-input>
      </el-form-item >
      <el-form-item prop="password" :rules="[
        {
          required: true,
          message: '密码不能为空',
          trigger: 'blur',
        },
      ]">
        <el-input
          v-model="form.password"
          type="password"
          show-password
          auto-complete="off"
          placeholder="密码"
          :prefix-icon="Unlock"
          @keyup.enter="handleLogin"
        >
        </el-input>
      </el-form-item>
      <el-form-item prop="code" v-if="stat.captchaEnabled" :rules="[
        {
          required: true,
          message: '验证码不能为空',
          trigger: 'blur',
        },
      ]">
        <el-input
          v-model="form.code"
          auto-complete="off"
          placeholder="验证码"
          style="width: 63%"
          @keyup.enter.native="handleLogin"
        >
          <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon"/>
        </el-input>
                <div class="login-code">
                  <img :src="codeUrl" @click="getCode" class="login-code-img"/>
                </div>
      </el-form-item>
      <el-checkbox v-model="form.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
      <el-form-item style="width:100%;">
        <el-button
          :loading="stat.loading"
          type="primary"
          style="width:100%;"
          @click="handleLogin"
        >
          <span v-if="!stat.loading">登 录</span>
          <span v-else>登 录 中...</span>
        </el-button>
        <div style="float: right;" v-if="register">
          <router-link class="link-type" :to="'/register'">立即注册</router-link>
        </div>
      </el-form-item>
    </el-form>
    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2018-2024 fiee.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script>
import {checkLoginCode, getCodeImg, login} from "@/network/login";
import Cookies from "js-cookie";
import { encrypt, decrypt } from '@/utils/jsencrypt'
import { v4 as uuidv4 } from 'uuid';
import {Unlock, User} from "@element-plus/icons-vue";
import {onMounted, reactive, ref, toRefs} from "vue";
import {ElMessage} from "element-plus";
import {useRoute, useRouter} from "vue-router";
import state from "@/store/state";
import {menus} from "@/network/menu";
import {routes} from "vue-router/auto-routes";

export default {
  name: "Login",
  setup() {
    const loginFormRef = ref({})
    let form = reactive({
      username: "",
      password: "",
      code: "",
      //记住我
      rememberMe: false,
    })
    let routes = useRoute()
    let router = useRouter();
    let stat = ref({
      // 验证码开关
      captchaEnabled : true,
      // 注册开关
      register : false,
      loading : false,
    })
    let codeUrl = ref("")
    const getCode = ()=>{
      const uuid = uuidv4();
      getCodeImg(uuid).then(res => {
          //获取验证码图片
          codeUrl.value = window.URL.createObjectURL(new window.Blob([res],{type: 'image/png'}))
          Cookies.set("uuidCode",uuid,{expires:10})
      });
    }
    const getCookie= ()=>{
      const username = Cookies.get("username");
      const password = Cookies.get("password");
      const rememberMe = Cookies.get('rememberMe')
      form.username = username === undefined ? form.username : username
      form.password = password === undefined ? form.password : decrypt(password)
      form.rememberMe = rememberMe === undefined ? false : Boolean(rememberMe)
    }
    //登陆操作
    const handleLogin = () => {
      loginFormRef.value.validate(valid => {
        if (valid){
          //检查验证码是否正确
          checkLoginCode({"uuid":Cookies.get("uuidCode"),"code":form.code}).then(res=>{
            if (res.flag){
              const LoginForm = {
                username:form.username,
                password:form.password
              }
              login(LoginForm).then(res =>{
                //登陆成功
                if (res.flag){
                  if (form.rememberMe) {
                    Cookies.set("username", form.username, { expires: 30 });
                    Cookies.set("password", encrypt(form.password), { expires: 30 });
                    Cookies.set('rememberMe', form.rememberMe, { expires: 30 });
                  } else {
                    Cookies.remove("username");
                    Cookies.remove("password");
                    Cookies.remove('rememberMe');
                  }
                  stat.value.loading = !stat.value.loading
                  localStorage.setItem("userInfo",JSON.stringify(res.data.userInfo))
                  menus().then(res=>{
                    localStorage.setItem("menuList",JSON.stringify(res.data))
                  })
                  setTimeout(() => {
                    router.push("/")
                  }, 1500)
                }else {
                  ElMessage({
                    message: res.message,
                    type: 'error',
                  })
                  router.push("/login")
                }
              })
            }else {
              // getCode()
              ElMessage({
                message: '验证码错误.',
                type: 'error',
              })
            }
          })
        }
      })
    }
    onMounted(() => {
      getCode()
      getCookie()
    })
    return {
      stat,
      Unlock,
      User,
      codeUrl,
      loginFormRef,
      form,
      handleLogin,
      getCode,
    }
  },
};
</script>

<style scoped lang="scss">
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-image: url("../assets/images/login-background.jpg");
  background-size: cover;
}

.title {
  margin: 0px auto 30px auto;
  text-align: center;
  color: #707070;
}

.login-form {
  border-radius: 6px;
  background: #ffffff;
  width: 400px;
  padding: 25px 25px 5px 25px;

  .el-input {
    height: 38px;

    input {
      height: 38px;
    }
  }

  .input-icon {
    height: 39px;
    width: 14px;
    margin-left: 2px;
  }
}

.login-tip {
  font-size: 13px;
  text-align: center;
  color: #bfbfbf;
}

.login-code {
  width: 33%;
  height: 38px;
  float: right;
  margin-left: 5px;
  border: 1px solid rgb(0,0,0,0.1);
  box-shadow: rgb(0,0,0,0.1) 0px 1px 1px 0px;
  img {
    width: 100%;
    cursor: pointer;
    vertical-align: middle;
  }
}

.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}

.login-code-img {
  height: 38px;
}
</style>
