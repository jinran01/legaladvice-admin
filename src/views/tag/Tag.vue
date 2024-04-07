<template>
  <div class="container">
    <div class="operation">
      <el-button type="primary" @click="openDialog(null)">
        <template #icon>
          <el-icon>
            <Plus/>
          </el-icon>
        </template>
        新增分类
      </el-button>
      <el-button type="danger" :disabled="selectTags.length == 0" @click="doDeleteTagBatch">
        <template #icon>
          <el-icon>
            <DeleteFilled/>
          </el-icon>
        </template>
        批量删除
      </el-button>
      <div class="search">
        <el-input v-model="tagName" style="margin-right: 10px">
          <template #prefix>
            <el-icon>
              <Search/>
            </el-icon>
          </template>
        </el-input>
        <el-button @click="searchTag">
          <template #icon>
            <el-icon>
              <Search/>
            </el-icon>
          </template>
        </el-button>
      </div>
    </div>
  </div>
  <div class="tableList">
    <el-table
        :data="tagList"
        border
        @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column prop="tagName" label="分类名称" align="center" />
      <el-table-column prop="articleCount" label="文章量" align="center"/>
      <el-table-column prop="createTime" label="创建时间" align="center">
        <template #default="scope">
          {{formatDate(scope.row.createTime,"YYYY-MM-dd hh:mm:ss")}}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="scope">
          <el-button size="small" @click="openDialog(scope.row)">
            <template #icon>
              <Edit/>
            </template>
            编辑
          </el-button>
          <el-popconfirm
              confirm-button-text="确定"
              cancel-button-text="取消"
              width="220"
              icon-color="#626AEF"
              title="确定要删除该标签吗?"
              @confirm="doDeleteTag(scope.row)"
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
        style="margin-top: 10px;float: right;margin-bottom: 10px"
        background
        layout="prev, pager, next"
        :page-size="pageInfo.size"
        :total="count"
        @current-change="handleCurrentChange"
    />
  </div>
  <!-- 添加编辑对话框 -->
  <el-dialog v-model="addOrEdit" :width="getBodyWidth >= 667 ? '30%' : '90%'">
    <template #header>
      <div style="font-size: 17px">
        {{ tagForm.id != null ? '编辑分类' : '新增分类' }}
      </div>
    </template>
    <el-form label-width="80px" size="medium" :model="tagForm">
      <el-form-item label="分类名">
        <el-input v-model="tagForm.tagName"  />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="addOrEdit = false">取 消</el-button>
      <el-button type="primary" @click="addOrEditTag">
        确 定
      </el-button>
    </template>
  </el-dialog>
</template>

<script>
import {computed, onMounted, reactive, ref, toRefs} from "vue";
import {formatDate} from "@/common/js/formatDate";
import {addOrUpdateTag, deleteTag, getTagList} from "@/network/tag";
import store from "@/store";
import {ElMessage, ElMessageBox} from "element-plus";

export default {
  name: "Tag",
  setup() {
    let tagName = ref('')
    let tagList = ref([])
    let selectTags = ref([])
    let addOrEdit = ref(false)
    let pageInfo = {
      size:10,
      current:1,
    }
    let state = reactive({
      count:0,
      bodyWidth:0
    })
    let tagForm = reactive({
      id:null,
      tagName:''
    })
    //批量删除
    const doDeleteTagBatch = () => {
      ElMessageBox.confirm(
          '确定删除吗?',
          '提示',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
          }
      ).then(() => {
        deleteTag(selectTags.value).then(res=>{
          if (res.flag){
            ElMessage({
              type:"success",
              message:"删除成功"
            })
            getTags()
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
    //单删
    const doDeleteTag = (data) => {
      deleteTag([data.id]).then(res=>{
        if (res.flag){
          ElMessage({
            type:"success",
            message:"删除成功"
          })
          getTags()
        }else {
          ElMessage({
            type:"error",
            message:"删除失败"
          })
        }
      })
    }
    const getBodyWidth = computed(() => {
      state.bodyWidth = store.state.bodyWidth
      return state.bodyWidth
    })
    //打开对话框
    const openDialog = (data) => {
      tagForm.id = null
      tagForm.tagName = ''
      if (data != null){
        tagForm.id = data.id
        tagForm.tagName =data.tagName
      }
      addOrEdit.value = !addOrEdit.value
    }
    //新增或者编辑分类
    const addOrEditTag = () => {
      let data = {}
      if (tagForm.id == null){
        data.tagName = tagForm.tagName
      }else {
        data.id = tagForm.id
        data.tagName = tagForm.tagName
      }
      addOrUpdateTag(data).then(res=>{
        if (res.flag){
          ElMessage({
            type:"success",
            message:"操作成功"
          })
          addOrEdit.value = !addOrEdit.value
          getTags()
        }else {
          ElMessage({
            type:"error",
            message:"操作失败"
          })
        }
      })
    }
    //获取标签
    const getTags = () => {
      getTagList(pageInfo).then(res => {
        tagList.value = res.data.recordList
        state.count = res.data.count
      })
    }
    const searchTag = () => {
      pageInfo.keywords = tagName.value
      getTags()
    }
    //选择的标签
    const handleSelectionChange = (data) => {
      selectTags.value = []
      data.map(item=>{
        selectTags.value.push(item.id)
      })
    }
    //当前页改变
    const handleCurrentChange = (current) => {
      pageInfo.current = current
      getTags()
    }
    onMounted(()=>{
      getTags()
    })
    return {
      ...toRefs(state),
      addOrEdit,
      tagName,
      tagList,
      pageInfo,
      getBodyWidth,
      tagForm,
      selectTags,
      doDeleteTag,
      doDeleteTagBatch,
      searchTag,
      openDialog,
      addOrEditTag,
      handleSelectionChange,
      handleCurrentChange,
      formatDate
    }
  },

}
</script>

<style scoped lang="less">
.container{
  margin: 10px;
  .operation{
    display: flex;
    margin-bottom: 15px;
    .search{
      display: flex;
      margin-left: auto;
    }
  }
}
.tableList{
  margin: 10px;
}
</style>
