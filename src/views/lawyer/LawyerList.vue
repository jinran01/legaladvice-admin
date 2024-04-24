<template>
  <div class="main">
    <form class="main_form" :model="pageInfo" @submit.native.prevent>
      <el-form-item>
        <el-select v-model="pageInfo.status"
                   placeholder="状态"
                   @change="getTypeHandler"
                   clearable
                   @clear="clearTypeHandler"
                   style="width: 120px;margin-right: 10px;"
        >
          <el-option label="通过" :value="1"/>
          <el-option label="待审核" :value="2"/>
          <el-option label="未通过" :value="3"/>
        </el-select>
        <el-input
            v-model="pageInfo.keywords"
            placeholder="姓名查询"
            :prefix-icon="Search"
            @keyup.enter.stop="searchAuth"
            style="width: 200px;margin-right: 10px"
        />
        <el-button type="primary" :icon="Search" @click="searchAuth"></el-button>
      </el-form-item>

    </form>
    <el-table :data="lawyerAuthList" border table-layout="fixed">
      <el-table-column type="selection" width="45"/>
      <el-table-column prop="avatar" label="头像" width="65">
        <template #default="scope">
          <img :src="scope.row.avatar" width="40" height="40">
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="100"/>
      <el-table-column prop="phone" label="手机号" width="120"/>
      <el-table-column prop="idCard" label="身份证" width="180"/>
      <el-table-column prop="school" label="学校" width="150"/>
      <el-table-column prop="qualification" label="学历" width="80"/>
      <el-table-column prop="major" label="专业" width="100"/>
      <el-table-column prop="loginType" label="状态" width="90">
        <template #default="scope">
          <el-tag round v-if="scope.row.status == 1" type="success">通过</el-tag>
          <el-tag round v-else-if="scope.row.status == 2" type="warning">待审核</el-tag>
          <el-tag round v-else type="danger">未通过</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="remarks" label="备注" width="90" />
      <el-table-column prop="createTime" label="创建时间" width="150">
        <template #default="scope">
          <el-icon>
            <timer/>
          </el-icon>
          {{ formatDate(scope.row.createTime, "YYYY-MM-dd") }}
        </template>
      </el-table-column>
      <el-table-column prop="lastLoginTime" label="审核时间" width="150">
        <template #default="scope">
          <el-icon>
            <timer/>
          </el-icon>
          {{ formatDate(scope.row.updateTime, "YYYY-MM-dd") }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="160">
        <template #default="scope">
          <el-button size="small" @click="showDialog(scope.row)" v-if="scope.row.status == 2">
            <el-icon>
              <EditPen/>
            </el-icon>
            审核
          </el-button>
          <el-button size="small" @click="showDialog(scope.row)" v-else>
            <el-icon>
              <EditPen/>
            </el-icon>
            详情
          </el-button>
          <el-button size="small" type="danger" @click="delAuth">
            <el-icon>
              <Delete/>
            </el-icon>
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog v-model="Auditing" title="审核" width="800" style="height: 95%;overflow-y: auto" draggable destroy-on-close>
      <template #default="scope">
        <div class="auth_title">
          <el-icon><UserFilled /></el-icon>
          <span>基本信息</span>
        </div>
        <el-input
            v-model="authInfo.name"
            style="max-width: 300px;margin-right:50px;margin-bottom: 20px"
            disabled
        >
          <template #prepend>姓名</template>
        </el-input>
        <el-input
            input-style="margin-right:50px"
            v-model="authInfo.phone"
            style="max-width: 300px;margin-right:50px;margin-bottom: 20px"
            disabled
        >
          <template #prepend>电话</template>
        </el-input>
        <el-input
            input-style="margin-right:50px"
            v-model="authInfo.school"
            style="max-width: 300px;margin-right:50px;margin-bottom: 20px"
            disabled
        >
          <template #prepend>学校</template>
        </el-input>
        <el-input
            input-style="margin-right:50px"
            v-model="authInfo.qualification"
            style="max-width: 300px;margin-right:50px;margin-bottom: 20px"
            disabled
        >
          <template #prepend>学历</template>
        </el-input>
        <el-input
            input-style="margin-right:50px"
            v-model="authInfo.major"
            style="max-width: 300px;margin-right:50px;margin-bottom: 20px"
            disabled
        >
          <template #prepend>专业</template>
        </el-input>
        <el-input
            input-style="margin-right:50px;"
            v-model="authInfo.idCard"
            style="max-width: 300px;margin-right:50px;margin-bottom: 20px"
            disabled
        >
          <template #prepend>身份证号</template>
        </el-input>
        <div>
          <div class="auth_title">
            <el-icon><UserFilled /></el-icon>
            <span>身份认证</span>
          </div>
          <el-image
              v-for="(i,index) in authInfo.idCardAuth"
              :src="i"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="authInfo.idCardAuth"
              :initial-index="index"
              fit="cover"
              class="auth_img"
          />
        </div>

        <div>
          <div class="auth_title">
            <el-icon><UserFilled /></el-icon>
            <span>律师执业证书</span>
          </div>
          <el-image
              v-for="(i,index) in authInfo.lpc"
              :src="i"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="authInfo.lpc"
              :initial-index="index"
              fit="cover"
              class="auth_img"
          />
        </div>
        <div>
          <div class="auth_title">
            <el-icon><UserFilled /></el-icon>
            <span>律师职业资格证书</span>
          </div>
          <el-image
              v-for="(i,index) in authInfo.lpqc"
              :src="i"
              :zoom-rate="1.2"
              :max-scale="7"
              :min-scale="0.2"
              :preview-src-list="authInfo.lpqc"
              :initial-index="index"
              fit="cover"
              class="auth_img"
          />
        </div>
        <div class="auth_title">
          <el-icon><ChatDotSquare /></el-icon>
          <span>备注</span>
        </div>
        <el-input
            v-model="authInfo.remarks"
            type="textarea"
            :disabled="authInfo.status != 2"
            autosize
            placeholder="用于说明通过或者不通过的原因及理由。"
            style="width: 600px"
        >
        </el-input>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="passOrNoAuth(1)" type="success" style="float: left" v-if="authInfo.status==2">
            通过
          </el-button>
          <el-button type="danger" @click="passOrNoAuth(3)"  style="float: left" v-if="authInfo.status==2">
            未通过
          </el-button>
          <el-button @click="Auditing = false" >
            取消
          </el-button>
        </div>
      </template>
    </el-dialog>
    <el-pagination
        background
        layout="prev,pager,next"
        :page-size=pageInfo.size
        :total="count"
        @current-change="pageChange"
    />
  </div>
</template>

<script>
import {getLawyerAuth,updateStatusLawyer} from "@/network/user";
import {onMounted, reactive, ref} from "vue";
import {formatDate} from "@/common/js/formatDate";
import {Check, Close} from '@element-plus/icons-vue'
import {ElMessage} from "element-plus";
import {Search} from '@element-plus/icons-vue'
import state from "@/store/state";

export default {
  name: "Lawyerlist",
  computed: {
    state() {
      return state
    }
  },
  setup() {
    let Auditing = ref(false)
    let count = ref()
    let authInfo = reactive({
      id:0,
      name: "",
      status: 2,
      phone: "",
      idCard: "",
      qualification: "",
      school: "",
      major: "",
      idCardAuth: [],
      lpc: [],
      lpqc: [],
      remarks: ""
    })
    let pageInfo = reactive({
      status: '',
      keywords: '',
      current: 1, // 当前页
      size: 10, //每页大小
    })
    let lawyerAuthList = ref([])
    //获取列表
    const getLawyerList = () => {
      getLawyerAuth(pageInfo).then(res => {
        if (res.flag) {
          lawyerAuthList.value = res.data.recordList
          count.value = res.data.count
        } else {
          ElMessage.error(res.message)
        }
      })
    }
    //通过或者不通过律师认证
    const passOrNoAuth = (status) => {
      let data = {
        id: authInfo.id,
        userAuthId: authInfo.userAuthId,
        status: status,
        remarks: authInfo.remarks || "无"
      }
      updateStatusLawyer(data).then(res=>{
        if (res.flag){
          ElMessage.success("操作成功！")
          Auditing.value = false
          getLawyerList()
        }else {
          ElMessage.error(res.message)
        }
      })
    }
    //展示审核框
    const showDialog = (data) => {
      authInfo.id = data.id
      authInfo.status = data.status
      authInfo.userAuthId = data.userAuthId
      authInfo.name = data.name
      authInfo.phone = data.phone
      authInfo.idCard = data.idCard
      authInfo.qualification = data.qualification
      authInfo.school = data.school
      authInfo.major = data.major
      authInfo.remarks = data.remarks
      authInfo.idCardAuth = data.idCardAuth.slice(1,-1).split(",")
      authInfo.lpc = data.lpc.slice(1,-1).split(",")
      authInfo.lpqc = data.lpqc.slice(1,-1).split(",")
      Auditing.value = !Auditing.value
    }
    const pageChange = () => {
      getLawyerList()
    }
    //查找用户
    const searchAuth = () => {
      getLawyerList()
    }
    //登录类型查找用户
    const getTypeHandler = () => {
      getLawyerList()
    }
    //清除登录类型选项
    const clearTypeHandler = () => {
      pageInfo.status = ''
      getLawyerList()
    }
    onMounted(() => {
      getLawyerList()
    })
    return {
      pageInfo,
      authInfo,
      lawyerAuthList,
      count,
      Auditing,
      Search,
      Check,
      Close,
      passOrNoAuth,
      showDialog,
      pageChange,
      formatDate,
      searchAuth,
      getTypeHandler,
      clearTypeHandler,
    }
  }
}
</script>

<style scoped lang="less">
.el-table {
  width: 100%;
  border-radius: 10px;
  box-shadow: 2px 2px 2px 2px rgba(200, 200, 200, 0.7);
}

.el-pagination {
  float: right;
  padding: 10px;
}

.main_form {
  float: right;
  margin-top: 18px;
  margin-right: 7px;
}

.main {
  border: 1px rgb(224, 224, 224) solid;
  box-shadow: 0px 1px 30px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  border-radius: 5px;
}
.auth_title{
  font-size: 16px;
  margin-bottom: 16px;
  margin-top: 10px;
}
.auth_img{
  margin-right: 16px;
  height: 120px;
  width: 200px;
  border-radius: 10px;
}
</style>