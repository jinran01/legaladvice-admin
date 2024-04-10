<template>
  <div class="articleList_container">
    <el-tabs v-model="activeName" class="article-tabs" @tab-click="handleTabClick">
      <el-tab-pane v-for="item in tab_pane" :label="item.label" :name="item.name">
        <div class="op-container">
          <el-button
            v-if="!isDelete"
            type="danger"
            :disabled="articleIdList.length == 0"
            @click="updateIsDelete"
          >
            <template #icon>
              <el-icon>
                <DeleteFilled/>
              </el-icon>
            </template>
            批量删除
          </el-button>
          <el-button
            v-else
            type="danger"
            :disabled="articleIdList.length == 0"
            @click="updateIsDelete"
          >
            <template #icon>
              <el-icon>
                <DeleteFilled/>
              </el-icon>
            </template>
            批量删除
          </el-button>
          <el-button
            type="success"
            :disabled="articleIdList.length == 0"
            @click="isExport"
          >
            <template #icon>
              <el-icon>
                <Download/>
              </el-icon>
            </template>
            批量导出
          </el-button>
          <el-dropdown
            trigger="click"
            style="margin-left: 10px"
          >
            <el-button type="primary" plain>
              <template #icon>
                <el-icon>
                  <upload-filled/>
                </el-icon>
              </template>
              批量导入
            </el-button>
            <template #dropdown>
              <el-dropdown-item>
                <el-upload
                  action="/api/admin/articles/import"
                  multiple
                  :limit="9"
                  :show-file-list="false"
                  :on-success="uploadArticle"
                >
                  普通文章
                </el-upload>
              </el-dropdown-item>
              <el-dropdown-item>
                <el-upload
                  action="/api/admin/articles/import?type=hexo"
                  multiple
                  :limit="9"
                  :show-file-list="false"
                  :on-success="uploadArticle"
                >
                  Hexo文章
                </el-upload>
              </el-dropdown-item>
            </template>
          </el-dropdown>
          <!-- 条件筛选 -->
          <div style="margin-left:auto">
            <!-- 文章类型 -->
            <el-select
              clearable
              v-model="type"
              placeholder="请选择文章类型"
              style="margin-right:10px;width: 180px;"
            >
              <el-option
                v-for="item in typeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <!-- 分类 -->
            <el-select
              clearable
              v-model="categoryId"
              filterable
              placeholder="请选择分类"
              style="margin-right:10px;width: 180px;"
            >
              <el-option
                v-for="item in categoryList"
                :key="item.id"
                :label="item.categoryName"
                :value="item.id"
              />
            </el-select>
            <!-- 标签 -->
            <el-select
              clearable
              v-model="tagId"
              filterable
              placeholder="请选择标签"
              style="margin-right:10px;width: 180px;"
            >
              <el-option
                v-for="item in tagList"
                :key="item.id"
                :label="item.tagName"
                :value="item.id"
              />
            </el-select>
            <!-- 文章名 -->
            <el-input
              clearable
              v-model="keywords"
              placeholder="请输入文章名"
              style="width:200px"
              @keyup.enter.native="searchArticles"
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
              @click="searchArticles"
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
        <div class="articleList">
          <el-table
            :data="articleList"
            v-loading="loading"
            border
            @selection-change="selectionChange"
          >
            <el-table-column type="selection" width="55" align="center"/>
            <!--文章封面-->
            <el-table-column prop="articleCover" label="封面" align="center" width="140">
              <template #default="scope">
                <el-image :src="scope.row.articleCover" style="width: 115px;height: 70px"/>
              </template>
            </el-table-column>
            <!--文章标题-->
            <el-table-column prop="articleTitle" label="标题" align="center"/>
            <!--文章分类-->
            <el-table-column prop="categoryName" label="分类" align="center">
              <template #default="scope">
                <el-tag v-if="scope.row.categoryName != '' && scope.row.categoryName != null">{{
                    scope.row.categoryName
                  }}
                </el-tag>
              </template>
            </el-table-column>
            <!--文章标签-->
            <el-table-column prop="tagDTOList" label="标签" align="center" width="100">
              <template #default="scope">
                <el-tag style="margin-right: 5px"
                        v-for="item in scope.row.tagDTOList"
                        v-if="scope.row.tagDTOList.length > 0 "
                >
                  {{ item.tagName }}
                </el-tag>
              </template>
            </el-table-column>
            <!--文章浏览量-->
            <el-table-column prop="viewsCount" label="浏览量" align="center" width="70"/>
            <!--文章点赞量-->
            <el-table-column prop="likeCount" label="点赞量" align="center" width="70"/>
            <!--文章类型-->
            <el-table-column prop="type" label="类型" align="center" width="70">
              <template #default="scope">
                <el-tag type="danger" v-if="scope.row.type == 1">原创</el-tag>
                <el-tag type="danger" v-if="scope.row.type == 2">转载</el-tag>
                <el-tag type="danger" v-if="scope.row.type == 3">翻译</el-tag>
              </template>
            </el-table-column>
            <!--文章发表时间-->
            <el-table-column prop="createTime" label="发表时间" align="center" width="120">
              <template #default="scope">
                {{ formatDate(scope.row.createTime, "YYYY-MM-dd") }}
              </template>
            </el-table-column>
            <!--文章置顶-->
            <el-table-column prop="isTop" label="置顶" align="center" width="70">
              <template #default="scope">
                <el-switch v-model="scope.row.isTop" :active-value="1" :inactive-value="0"
                           @change="updateTop(scope.row)"/>
              </template>
            </el-table-column>
            <!--操作-->
            <el-table-column label="操作" align="center" width="165">
              <template #default="scope">
                <el-button size="small" @click="getArticleInfo(scope.row)" v-if="isDelete == false">
                  <template #icon>
                    <el-icon>
                      <Edit/>
                    </el-icon>
                  </template>
                  编辑
                </el-button>
                <el-button size="small" type="success" v-if="isDelete != false"  @click="review(scope.row)">
                  <template #icon>
                    <el-icon>
                      <Help/>
                    </el-icon>
                  </template>
                  恢复
                </el-button>
                <el-popconfirm
                  confirm-button-text="确定"
                  cancel-button-text="取消"
                  width="220"
                  icon-color="#626AEF"
                  title="确定要删除该篇文章吗?"
                  @confirm="deleteArticles(scope.row)"
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
        </div>
        <el-pagination
            class="pagination"
            background
            layout="prev,pager,next"
            :page-size=pageInfo.size
            :total="pageInfo.count"
            @current-change="pageChange"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import {onMounted, reactive, ref, toRefs} from "vue";
import {articleIsTop, deleteArticle, getArticles, reviewOrRemove} from "@/network/article";
import {formatDate} from "@/common/js/formatDate";
import {getCategories} from "@/network/category";
import {getTags} from "@/network/tag";
import {useRouter} from "vue-router";
import {ElMessage, ElMessageBox} from "element-plus";

export default {
  name: "ArticleList",
  setup() {
    let loading = ref(false) //显示加载
    let activeName = ref('1')
    let isDelete = ref(false) // 是否为回收站
    let tagList = ref([]) //标签列表
    let categoryList = ref([]) //分类列表
    let articleIdList = ref([]) //文章Id列表
    let articleList = ref([]) //文章列表
    let pageInfo = {
      current: 1,
      size: 10,
      count: 0,
    }
    let state = reactive({
      keywords: '', //根据文章名
      type: '', //根据文章类型 1原创 2转载 3翻译
      tagId: '', //根据文章标签
      status: '', //根据文章状态 1公开 2私密 3草稿
      categoryId: '', // 根据文章分类
      isDelete: ''
    })
    let typeList = ref([
      {
        value: 1,
        label: "原创"
      },
      {
        value: 2,
        label: "转载"
      },
      {
        value: 3,
        label: "翻译"
      }
    ])
    //导入文章
    const uploadArticle = () => {

    }
    //文章导出 //TODO
    const isExport = () => {
      ElMessageBox.confirm(
        '确定导出吗?',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {

      }).catch(() => {
      })
    }

    //批量删除
    const updateIsDelete = () => {
      ElMessageBox.confirm(
        '确定删除吗?',
        '提示',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).then(() => {
        if (isDelete.value) {
          //物理删除
          deleteArticle(articleIdList.value).then(res => {
            if (res.flag) {
              ElMessage({
                type: 'success',
                message: '删除成功'
              })
            } else {
              ElMessage({
                type: 'error',
                message: '删除失败'
              })
            }
          })
        } else {
          let data = []
          articleIdList.value.map(item=>{
            data.push({id:item,isDelete:1})
          })
          //逻辑删除
          reviewOrRemove(data).then(res => {
            if (res.flag) {
              ElMessage({
                type: 'success',
                message: '已将该文章放入回收站'
              })
            } else {
              ElMessage({
                type: 'error',
                message: '操作失败'
              })
            }
          })
        }
      }).catch(() => {
      })
    }
    let tab_pane = ref([
      {label: '全部', name: '1'},
      {label: '公开', name: '2'},
      {label: '私密', name: '3'},
      {label: '草稿箱', name: '4'},
      {label: '回收站', name: '5'}
    ])
    let router = useRouter()
    //编辑文章
    const getArticleInfo = (data) => {
      router.push({path: `/articles/${data.id}`})
    }

    //恢复文章
    const review = (data) => {
      reviewOrRemove([{id: data.id, isDelete: 0}]).then(res => {
        if (res.flag) {
          ElMessage({
            type: 'success',
            message: '恢复文章成功'
          })
        } else {
          ElMessage({
            type: 'error',
            message: '操作失败'
          })
        }
      })
    }

    //删除文章
    const deleteArticles = (data) => {
      if (isDelete.value) {
        let id = []
        id.push(data.id)
        console.log(id)
        //物理删除
        deleteArticle(id).then(res => {
          if (res.flag) {
            ElMessage({
              type: 'success',
              message: '删除成功'
            })
          } else {
            ElMessage({
              type: 'error',
              message: '删除失败'
            })
          }
        })
      } else {
        //逻辑删除
        reviewOrRemove([{id: data.id, isDelete: 1}]).then(res => {
          if (res.flag) {
            ElMessage({
              type: 'success',
              message: '已将该文章放入回收站'
            })
          } else {
            ElMessage({
              type: 'error',
              message: '操作失败'
            })
          }
        })
      }
    }
    //文章置顶
    const updateTop = (data) => {
      let info = {
        "id": data.id,
        "isTop": data.isTop
      }
      articleIsTop(info).then(res => {
        console.log(info)
        if (res.flag) {
          ElMessage({
            type: 'success',
            message: '操作成功'
          })
        } else {
          ElMessage({
            type: 'error',
            message: '操作失败'
          })
        }
      })

    }
    //选择的文章
    const selectionChange = (data) => {
      let obj = []
      data.map(item => {
        obj.push(item.id)
      })
      articleIdList.value = obj
    }
    const pageChange = (current) => {
      pageInfo.current = current
      getArticleList();
    }
    onMounted(() => {
      getArticleList()
      getCategoryList()
      getTagList()
    })
    //获取分类列表
    const getCategoryList = () => {
      getCategories({keyword: ''}).then(res => {
        if (res.flag) {
          categoryList.value = res.data
        }
      })
    }
    //获取标签列表
    const getTagList = () => {
      getTags({keyword: ''}).then(res => {
        if (res.flag) {
          tagList.value = res.data
        }
      })
    }
    //获取文章列表
    const getArticleList = () => {
      let data = {}
      data.current = pageInfo.current
      data.size = pageInfo.size
      data.keywords = state.keywords
      data.type = state.type
      data.tagId = state.tagId
      data.status = state.status
      data.categoryId = state.categoryId
      data.isDelete = state.isDelete
      getArticles(data).then(res => {
        articleList.value = res.data.recordList
        pageInfo.count = res.data.count
      })
    }
    //搜索文章
    const searchArticles = () => {
      getArticleList()
    }
    //获取文章列表 type 1:全部 2:公开 3:私密 4:草稿箱 5:回收站
    const getArticleType = (type) => {
      switch (type) {
        case '1':
          state.isDelete = '0'
          state.status = ''
          break
        case '2':
          state.isDelete = '0'
          state.status = '1'
          break
        case '3':
          state.isDelete = '0'
          state.status = '2'
          break
        case '4':
          state.isDelete = '0'
          state.status = '3'
          break
        case '5':
          state.status = ''
          state.isDelete = '1'
          break
        default:
          state.status = '0'
          break
      }
    }
    //改变type 1:全部 2:公开 3:私密 4:草稿箱 5:回收站 获取数据
    const handleTabClick = (pane) => {
      isDelete.value = false
      if (pane.paneName == '5') {
        isDelete.value = true
      }
      getArticleType(pane.paneName)
      getArticleList()
    }
    return {
      ...toRefs(state),
      pageChange,
      activeName,
      tab_pane,
      articleIdList,
      isDelete,
      typeList,
      loading,
      articleList,
      pageInfo,
      tagList,
      categoryList,
      updateTop,
      review,
      isExport,
      uploadArticle,
      deleteArticles,
      formatDate,
      getArticleInfo,
      searchArticles,
      selectionChange,
      updateIsDelete,
      handleTabClick
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

.articleList {
  margin-top: 10px;
  margin-bottom: 15px;
}
.pagination{
  float: right;
}
</style>