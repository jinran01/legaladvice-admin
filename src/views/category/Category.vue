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
      <el-button type="danger" :disabled="selectCategory.length == 0" @click="doDeleteCategoryBatch">
        <template #icon>
          <el-icon>
            <DeleteFilled/>
          </el-icon>
        </template>
        批量删除
      </el-button>
      <div class="search">
        <el-input v-model="categoryName" style="margin-right: 10px" @keydown.enter="searchCategory">
          <template #prefix>
            <el-icon>
              <Search/>
            </el-icon>
          </template>
        </el-input>
        <el-button @click="searchCategory">
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
        :data="categoryList"
        border
        @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center"/>
      <el-table-column prop="categoryName" label="分类名称" align="center" />
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
              title="确定要删除该分类吗?"
              @confirm="doDeleteCategory(scope.row)"
          >
            <template #reference>
              <el-button size="small" type="danger">
                <template #icon>
                  <DeleteFilled/>
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
  <el-dialog v-model="addOrEdit">
    <template #header>
      <div style="font-size: 17px">
        {{ categoryForm.id != null ? '编辑分类' : '新增分类' }}
      </div>
    </template>
    <el-form label-width="80px" ref="formRef" :model="categoryForm" @submit.native.prevent>
      <el-form-item prop="categoryName" label="分类名"  :rules="[
        {
          required: true,
          message: '分类名不能为空',
          trigger: 'blur',
        },
      ]"  >
        <el-input v-model="categoryForm.categoryName"  />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="addOrEdit = false">取 消</el-button>
      <el-button type="primary" @click="addOrEditCategory">
        确 定
      </el-button>
    </template>
  </el-dialog>

</template>

<script>
import {computed, onMounted, reactive, ref, toRefs} from "vue";
import {addOrUpdateCategory, deleteCategory, getCategoryList} from "@/network/category";
import {formatDate} from "@/common/js/formatDate";
import {ElMessage, ElMessageBox} from "element-plus";
import store from "@/store";

export default {
  name: "Category",
  setup() {
    let categoryName = ref('')
    let categoryList = ref([])
    let selectCategory = ref([])
    let addOrEdit = ref(false) //编辑或者新增对话框
    let formRef = ref()
    let categoryForm = reactive({
      id:null,
      categoryName:'',
    })
    let pageInfo = {
      size:10,
      current:1,
    }
    let state = reactive({
      count:0,

    })
    //批量删除
    const doDeleteCategoryBatch = () => {
      ElMessageBox.confirm(
          '确定删除吗?',
          '提示',
          {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
          }
      ).then(() => {
        deleteCategory(selectCategory.value).then(res=>{
          if (res.flag){
            ElMessage({
              type:"success",
              message:"删除成功"
            })
            getCategories()
          }else {
            ElMessage({
              type:"error",
              message: res.message
            })
          }
        })
      }).catch(() => {
      })
    }
    //单删
    const doDeleteCategory = (data) => {
      deleteCategory([data.id]).then(res=>{
        if (res.flag){
          ElMessage({
            type:"success",
            message:"删除成功"
          })
          getCategories()
        }else {
          ElMessage({
            type:"error",
            message: res.message
          })
        }
      })
    }
    //打开对话框
    const openDialog = (data) => {
      categoryForm.id = null
      categoryForm.categoryName = ''
      if (data != null){
        categoryForm.id = data.id
        categoryForm.categoryName =data.categoryName
      }
      addOrEdit.value = !addOrEdit.value
    }
    //新增或者编辑分类
    const addOrEditCategory = () => {
      formRef.value.validate(valid=>{
        if (valid){
          let data = {}
          if (categoryForm.id == null){
            data.categoryName = categoryForm.categoryName
          }else {
            data.id = categoryForm.id
            data.categoryName = categoryForm.categoryName
          }
          addOrUpdateCategory(data).then(res=>{
            if (res.flag){
              ElMessage({
                type:"success",
                message:"操作成功"
              })
              addOrEdit.value = !addOrEdit.value
              getCategories()
            }else {
              ElMessage({
                type:"error",
                message:"操作失败"
              })
            }
          })
        }
      })
    }
    //获取非类
    const getCategories = () => {
      getCategoryList(pageInfo).then(res => {
        categoryList.value = res.data.recordList
        state.count = res.data.count
      })
    }
    const searchCategory = () => {
      pageInfo.keywords = categoryName.value
      getCategories()
    }
    //选择的分类
    const handleSelectionChange = (data) => {
      selectCategory.value = []
      data.map(item=>{
        selectCategory.value.push(item.id)
      })
    }
    //当前页改变
    const handleCurrentChange = (current) => {
      pageInfo.current = current
      getCategories()
    }
    onMounted(()=>{
      getCategories()
    })
    return {
      ...toRefs(state),
      categoryName,
      addOrEdit,
      categoryForm,
      categoryList,
      pageInfo,
      selectCategory,
      doDeleteCategory,
      doDeleteCategoryBatch,
      openDialog,
      searchCategory,
      addOrEditCategory,
      handleSelectionChange,
      formatDate,
      formRef,
      handleCurrentChange
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
