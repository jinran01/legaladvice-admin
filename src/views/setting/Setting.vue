<template>
  <div class="main" style="display: flex">
    <el-row style="width: 100%;padding: 20px">
      <el-col :span="8">
        <el-card style="max-width: 400px" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
            </div>
          </template>
          <el-upload
            action="https://legaladvice.oss-cn-beijing.aliyuncs.com"
            :data="data"
            :auto-upload="true"
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="before_upload"
            :on-success="handleAvatarSuccess"
          >
            <img :src="base_info.avatarUrl" class="avatar" />
          </el-upload>
          <el-divider/>
          <p class="info_item">
            <a class="title"><i class="fas fa-user-alt"></i>用户名称</a>
            <a class="info">{{ base_info.username }}</a>
            <el-divider/>
          </p>
          <p class="info_item">
            <a class="title"><i class="fas fa-mobile"></i>手机号码</a>
            <a class="info">{{ base_info.phone }}</a>
            <el-divider/>
          </p>
          <p class="info_item">
            <a class="title"><i class="fas fa-envelope"></i>用户邮箱</a>
            <a class="info">{{ base_info.email }}</a>
            <el-divider/>
          </p>
          <p class="info_item">
            <a class="title"><i class="fas fa-user-alt"></i>所属角色</a>
            <a class="info" v-for="item in base_info.roles">
              <el-tag type="danger">{{ item }}
              </el-tag>
            </a>
            <el-divider/>
          </p>
          <p class="info_item">
            <a class="title"><i class="fas fa-calendar-alt"></i>上次登录</a>
            <a class="info">
              {{ formatDate(base_info.lastLoginTime, "YYYY-MM-dd hh:mm:ss") }}
            </a>
            <el-divider/>
          </p>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>基本资料</span>
            </div>
          </template>
          <el-tabs v-model="activeName" class="info_tabs" @tabChange="handlerTab">
            <el-tab-pane label="基本资料" name="base_info">
              <el-form
                ref="baseInfoRef"
                label-position="right"
                label-width="auto"
                :model="base_info"
                style="max-width: 600px"
              >
                <el-form-item prop="nickname" label="用户昵称" :rules="[
                  {
                      required: true,
                      message: '昵称不能为空',
                      trigger: 'blur',
                  },
                 ]">
                  <el-input v-model="base_info.nickname"/>
                </el-form-item>
                <el-form-item label="手机号码">
                  <el-input v-model="base_info.phone" disabled/>
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input v-model="base_info.email" disabled/>
                </el-form-item>
                <el-form-item label="性别">
                  <el-radio-group v-model="base_info.sex" class="ml-4">
                    <el-radio :value=1 size="default">男</el-radio>
                    <el-radio :value=2 size="default">女</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label=" ">
                  <el-button type="primary" @click="saveBaseInfo">保存</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="change_password">
              <el-form
                ref="passInfoRef"
                label-position="right"
                label-width="auto"
                :model="passInfo"
                style="max-width: 600px"
              >
                <el-form-item prop="old_password" label="原密码" :rules="[
                  {
                      required: true,
                      message: '原密码不能为空',
                      trigger: 'blur',
                  },
                 ]">
                  <el-input v-model="passInfo.old_password" type="password" show-password/>
                </el-form-item>
                <el-form-item prop="new_password" label="新密码" :rules="[
                  {
                      required: true,
                      message: '新密码不能为空',
                      trigger: 'blur',
                  },
                  {
                      pattern:  /^(?![a-zA-Z]+$)(?!\d+$)(?![^\da-zA-Z\s]+$).{8,16}$/,
                      message: '密码只能由字母、数字、特殊字符组成',
                      trigger: 'blur',
                  },
                 ]">
                  <el-input v-model="passInfo.new_password" type="password" show-password/>
                </el-form-item>
                <el-form-item prop="check_password" label="确认密码" :rules="[
                  {
                      required: true,
                      message: '确认密码不能为空',
                      trigger: 'blur',
                  },
                  { required: true, validator: equalPassword, trigger: 'blur' }
                 ]">
                  <el-input v-model="passInfo.check_password" type="password" show-password/>
                </el-form-item>
                <el-form-item label=" ">
                  <el-button type="primary" @click="updatePassword">保存</el-button>
                </el-form-item>
              </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import {onMounted, reactive, ref, toRefs} from "vue";
import {formatDate} from "@/common/js/formatDate";
import {getBaseInfo, updateBaseInfo, updatePass} from "@/network/setting";
import {ElMessage} from "element-plus";
import router from "@/router";
import {getPolicy, uploadImg} from "@/network/system";
import {getAvatarOssToken, updateUserAvatar} from "@/network/user";
import {v4} from "uuid";
import state from "@/store/state";

export default {
  name: "Setting",
  setup() {
    let baseInfoRef = ref()
    let passInfoRef = ref()
    let data = {
      'key': '',
      'policy': '',
      'OSSAccessKeyId': '',
      'signature': '',
    };
    let base_info = reactive({
      id: '',
      userInfoId: '',
      nickname: '',
      phone: '',
      email: '',
      sex: '1',
      username: '',
      roles: [],
      lastLoginTime: '',
      avatarUrl:''
    })
    let passInfo = reactive({
      old_password: '',
      new_password: '',
      check_password: ''
    })
    let stat = reactive({
      activeName: 'base_info'
    })
    let userInfo = reactive({})

    //TODO upload data属性未能够绑定 疑似bug
    getPolicy({path:"avatar/"}).then(res => {
      data.signature = res.data.signature,
        data.policy = res.data.policy,
        data.OSSAccessKeyId = res.data.accessKeyId,
        data.key = res.data.dir + v4() + "." + "jpg"
    })

    //上传前
    const before_upload = (file) => {
      let flag = false
      let types = ["jpg", "png", "jpeg", "JPG", "JPEG", "PNG"]
      let type = file.name.split(".")
      type = type[type.length - 1]
      if (file.size > 10 * 1024 * 1024) {
        ElMessage.error('最大支持 10MB 文件')
        return Promise.reject('最大支持 10MB 文件')
      }
      if (types.indexOf(type) >= 0) {
        flag = true
      } else {
        flag = false
      }
      return new Promise((resolve, reject) => {
        // getPolicy().then(res => {
        //   data.signature = res.data.signature,
        //     data.policy = res.data.policy,
        //     data.OSSAccessKeyId = res.data.accessKeyId,
        //     data.key = res.data.dir + v4() + "." + "jpg"
        // })
          setTimeout(()=>{
            resolve(file)
          },1000)
      })
    }

    //上传成功
    const handleAvatarSuccess = () => {
      let url = "https://legaladvice.oss-cn-beijing.aliyuncs.com/"
      base_info.avatarUrl = url + data.key
      let userInfo = JSON.parse(window.localStorage.getItem("userInfo"))
      userInfo.avatar = base_info.avatarUrl
      window.localStorage.setItem("userInfo",JSON.stringify(userInfo))
      updateUserAvatar({id:base_info.userInfoId,avatar:base_info.avatarUrl}).then(res=>{
        if (res.flag){
          ElMessage({
            message:"修改成功！",
            type:"success"
          })
        }else {
          ElMessage({
            message:res.message,
            type:"error"
          })
        }
      })
    }
    //更新密码
    const updatePassword = () => {
      passInfoRef.value.validate((valid)=>{
        if (valid) {
          let info = {
            id:base_info.id,
            old_password:passInfo.old_password,
            new_password:passInfo.new_password,
          }
          updatePass(info).then(res=>{
            if (res.flag){
              ElMessage({
                message: '更新成功!',
                type: 'success'
              })
              setTimeout(()=>{
                router.push("/login")
              },1000)
            }else {
              ElMessage({
                message: res.message,
                type: 'error'
              })
              passInfo.old_password = ''
            }
          })
        }
      })
    }
    const equalPassword = (rule,value,callback) => {
      if (value != passInfo.new_password){
        callback(new Error("两次输入的密码不一致"))
      }else {
        callback()
      }
    }
    //更新用户信息
    const saveBaseInfo = () => {
      baseInfoRef.value.validate(valid => {
        if (valid) {
          let info = {
            id: base_info.userInfoId,
            nickname: base_info.nickname,
            sex: base_info.sex
          }
          updateBaseInfo(info).then(res => {
            if (res.flag) {
              ElMessage({
                message: '更新成功!',
                type: 'success'
              })
            } else {
              ElMessage({
                message: '出错了!',
                type: 'error'
              })
            }
          })
        }
      })
    }
    const handlerTab = () => {
      passInfo.old_password = ''
      passInfo.new_password = ''
      passInfo.check_password = ''
    }

    onMounted(() => {
      getBaseInfo().then((res) => {
        if (res.flag) {
          base_info.id = res.data.id
          base_info.userInfoId = res.data.userInfoId
          base_info.username = res.data.username
          base_info.nickname = res.data.nickname
          base_info.phone = res.data.phone
          base_info.email = res.data.email
          base_info.roles = res.data.roleList
          base_info.sex = res.data.sex
          base_info.lastLoginTime = res.data.lastLoginTime
          base_info.avatarUrl = JSON.parse(window.localStorage.getItem("userInfo")).avatar
        } else {
          ElMessage({
            message: '出错了！',
            type: 'error'
          })
        }
      })
    })
    return {
      ...toRefs(stat),
      userInfo,
      base_info,
      passInfo,
      baseInfoRef,
      passInfoRef,
      data,
      handlerTab,
      equalPassword,
      updatePassword,
      formatDate,
      saveBaseInfo,
      before_upload,
      handleAvatarSuccess,

    }
  }
}
</script>
<style scoped lang="scss">
.main {
  height: 95%;
}

.info_item {
  margin: 10px;
  font-size: 13px;

  .title {

  }

  .info {
    float: right;
  }
}
.avatar{
  width: 120px;
  height: 120px;
  border-radius: 120px;
  border: rgb(0,0,0,0.1) 1px solid;
  &:hover{
    box-shadow: 0px 0px 2px 2px rgb(0,0,0,0.1);
  }
}
.avatar-uploader{
  display: flex;
  justify-content: center;
}
.el-divider {
  margin: 8px 0px;
}
</style>