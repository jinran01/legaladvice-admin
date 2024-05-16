<template>
  <div class="comment_container">
    <el-tabs v-model="activeName" class="article-tabs" @tab-click="handleTabClick">
      <el-tab-pane v-for="item in tab_pane" :label="item.label" :name="item.name">
        <div class="op-container">
          <el-button type="danger" :disabled="selectCommentIds.length == 0" @click="deleteCommentBatch">
            <template #icon>
              <el-icon>
                <DeleteFilled/>
              </el-icon>
            </template>
            批量删除
          </el-button>
          <el-button type="success" :disabled="selectCommentIds.length == 0" @click="reviewCommentBatch">
            <template #icon>
              <el-icon>
                <Help/>
              </el-icon>
            </template>
            批量通过
          </el-button>
          <!-- 条件筛选 -->
          <div style="margin-left:auto">
            <!-- 评论来源 -->
            <el-select
              clearable
              v-model="type"
              placeholder="请选择来源"
              style="margin-right:10px;width: 180px;"
            >
              <el-option
                v-for="item in typeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <!-- 用户昵称 -->
            <el-input
              clearable
              v-model="keywords"
              placeholder="请输入文用户昵称"
              style="width:200px"
            >
              <template #prefix>
                <el-icon>
                  <Search/>
                </el-icon>
              </template>
            </el-input>
            <el-button
              type="primary"
              style="margin-left:10px"
              @click="searchComment"
            >
              <template #icon>
                <el-icon>
                  <Search/>
                </el-icon>
              </template>
              搜索
            </el-button>
          </div>
        </div>
        <div class="commentList">
          <el-table
            :data="commentList"
            v-loading="loading"
            border
            @selection-change="selectionChange"
          >
            <el-table-column type="selection" width="55" align="center"/>
            <el-table-column prop="avatar" label="头像" align="center" width="120">
              <template #default="scope">
                <img :src="scope.row.avatar" width="40" height="40" />
              </template>
            </el-table-column>
            <!-- 评论人昵称 -->
            <el-table-column
              prop="nickname"
              label="评论人"
              align="center"
              width="120"
            />
            <!-- 回复人昵称 -->
            <el-table-column
              prop="replyNickname"
              label="回复人"
              align="center"
              width="120"
            >
              <template #default="scope">
          <span v-if="scope.row.replyNickname">
            {{ scope.row.replyNickname }}
          </span>
                <span v-else>无</span>
              </template>
            </el-table-column>
            <!-- 评论文章标题 -->
            <el-table-column prop="articleTitle" label="文章标题" align="center">
              <template #default="scope">
          <span v-if="scope.row.articleTitle">
            {{ scope.row.articleTitle }}
          </span>
                <span v-else>无</span>
              </template>
            </el-table-column>
            <!-- 评论内容 -->
            <el-table-column prop="commentContent" label="评论内容" align="center">
              <template #default="scope">
                <span v-html="scope.row.commentContent" class="comment-content" />
              </template>
            </el-table-column>
            <!-- 评论时间 -->
            <el-table-column
              prop="createTime"
              label="评论时间"
              width="150"
              align="center"
            >
              <template #default="scope">
                {{ formatDate(scope.row.createTime,"YYYY-MM-dd")}}
              </template>
            </el-table-column>
            <!-- 状态 -->
            <el-table-column prop="isReview" label="状态" width="80" align="center">
              <template #default="scope">
                <el-tag v-if="scope.row.isReview == 0" type="warning">审核中</el-tag>
                <el-tag v-if="scope.row.isReview == 1" type="success">正常</el-tag>
              </template>
            </el-table-column>
            <!-- 来源 -->
            <el-table-column label="来源" align="center" width="100">
              <template #default="scope">
                <el-tag v-if="scope.row.type == 1">文章</el-tag>
                <el-tag v-if="scope.row.type == 2" type="warning">友链</el-tag>
                <el-tag v-if="scope.row.type == 3" type="danger">说说</el-tag>
              </template>
            </el-table-column>
            <!--操作-->
            <el-table-column label="操作" align="center" width="165">
              <template #default="scope">
                <el-button size="small" type="success" @click="reviewComment(scope.row)" v-if="scope.row.isReview == 0">
                  <template #icon>
                    <el-icon>
                      <Help/>
                    </el-icon>
                  </template>
                  通过
                </el-button>
                <el-popconfirm
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  width="220"
                  icon-color="#626AEF"
                  title="确定要删除该条评论吗?"
                  @confirm="deleteComment(scope.row)"
                >
                  <template #reference>
                    <el-button size="small" type="danger">
                      <template #icon>
                        <el-icon>
                          <DeleteFilled/>
                        </el-icon>
                      </template>
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
              background
              layout="prev,pager,next"
              :page-size=pageInfo.size
              :total="count"
              @current-change="pageChange"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {onMounted, reactive, ref, toRefs} from "vue";
import {deleteComments, getCommentList, reviewComments} from "@/network/comment";
import {formatDate} from "@/common/js/formatDate"
import {ElMessage, ElMessageBox} from "element-plus";
export default {
  name: "Comment",
  setup() {
    let activeName = ref('1') //
    let type = ref('') //评论来源 1文章 2友链 3说说
    let commentList = ref([]) //评论列表
    let selectCommentIds = ref([]) //选择的评论id
    let loading = ref(false)
    let count = ref(0)
    let pageInfo = {
      current:1,
      size:10
    }
    let typeList = ref([
      {
        value: 1,
        label: "文章"
      },
      {
        value: 2,
        label: "友链"
      },
      {
        value: 3,
        label: "说说"
      }
    ])
    let tab_pane = ref([
      {label: '全部', name: '1'},
      {label: '正常', name: '2'},
      {label: '审核中', name: '3'},
    ])
    let state = reactive({
      keywords:''
    })
    //换页
    const pageChange = (current) => {
      pageInfo.current = current
      getComment();
    }
    //多删评论
    const deleteCommentBatch = () => {
      ElMessageBox.confirm(
        '确定删除吗?',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        deleteComments(selectCommentIds.value).then(res=>{
          if (res.flag){
            ElMessage({
              type:"success",
              message:"删除成功"
            })
            getComment()
          }else {
            ElMessage({
              type:"error",
              message:"删除失败"
            })
          }
        })
      }).catch(() => {
      })
    }
    //单删评论
    const deleteComment = (data) => {
      deleteComments([data.id]).then(res=>{
        if (res.flag){
          ElMessage({
            type:"success",
            message:"删除成功"
          })
          getComment()
        }else {
          ElMessage({
            type:"error",
            message:"删除失败"
          })
        }
      })
    }
    //多条通过评论
    const reviewCommentBatch = () => {
      ElMessageBox.confirm(
        '确定进行该操作吗?',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        let obj = []
        selectCommentIds.value.map(item=>{
          obj.push({id:item,isReview:0})
        })

        reviewComments(obj).then(res=>{
          if (res.flag){
            ElMessage({
              type:"success",
              message:"通过成功"
            })
            getComment()
          }else {
            ElMessage({
              type:"error",
              message:"操作失败"
            })
          }
        })
      }).catch(() => {
      })
    }
    //通过评论
    const reviewComment = (data) => {
      let obj = []
      obj.push({id:data.id,isReview:1})
      reviewComments(obj).then(res=>{
        if (res.flag){
          ElMessage({
            type:"success",
            message:"通过成功"
          })
          getComment()
        }else {
          ElMessage({
            type:"error",
            message:"操作失败"
          })
        }
      })
    }
    //选择评论
    const selectionChange = (data) => {
      selectCommentIds.value = []
      data.map(item=>{
        selectCommentIds.value.push(item.id)
      })
    }
    //改变type 1:全部 2:正常 3:审核中
    const handleTabClick = (pane) => {
      if (pane.paneName == '1'){
        pageInfo.isReview = ''
      }else if(pane.paneName == '2'){
        pageInfo.isReview = '1'
      }else {
        pageInfo.isReview = '0'
      }
      getComment()
    }
    //搜索评论
    const searchComment = () => {
      getComment()
    }
    //获取评论列表
    const getComment = () => {
      pageInfo.keywords = state.keywords
      pageInfo.type = type.value
      getCommentList(pageInfo).then(res=>{
        commentList.value = res.data.recordList
        count.value = res.data.count
      })
    }
    onMounted(()=>{
      getComment()
    })
    return {
      ...toRefs(state),
      handleTabClick,
      selectionChange,
      searchComment,
      formatDate,
      deleteComment,
      reviewComment,
      deleteCommentBatch,
      reviewCommentBatch,
      pageChange,
      commentList,
      selectCommentIds,
      loading,
      type,
      pageInfo,
      count,
      activeName,
      typeList,
      tab_pane,
    }
  },

}
</script>

<style scoped lang="less">
.article-tabs {
  margin: 10px;
}

.op-container {
  display: flex;
}

.commentList {
  margin-top: 10px;
}
.el-pagination {
  float: right;
  padding: 10px;
}
</style>