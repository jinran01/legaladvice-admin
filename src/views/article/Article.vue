<template>
  <div class="container">
    <!--文章标题-->
    <div class="article-title-container">
      <el-input
        v-model="article.articleTitle"
        style="margin-right: 10px"
        placeholder="输入文章标题"
      />
      <el-button
        type="danger"
        style="color: #f56c6c; background: #fff;"
        @click="saveArticleDraft"
        v-if="article.id == null || article.status == 3"
      >
        保存草稿
      </el-button>
      <el-button
        type="danger"
        @click="openModel"
        style="margin-left:10px"
      >
        发布文章
      </el-button>
    </div>
    <mavon-editor class="mavonEditor"
                  ref="md"
                  v-model="article.articleContent"
                  font-size="17"
                  @imgAdd="uploadImg"
                  :ishljs="true"/>
    <!-- 添加文章对话框 -->
    <el-dialog v-model="dialogFormVisible">
      <template #header>
        <el-icon size="15">
          <TopRight/>
        </el-icon>
        <span style="font-size: 14px;margin-left: 10px">发布文章</span>
      </template>
      <!-- 文章数据 -->
      <el-form label-width="80px" :model="article">
        <!-- 文章分类 -->
        <el-form-item label="文章分类">
          <el-tag
            type="success"
            size="large"
            v-show="article.categoryName != ''"
            style="margin:0 1rem 0 0"
            :closable="true"
            @close="removeCategory"
          >
            {{ article.categoryName }}
          </el-tag>
          <!-- 分类选项 -->
          <el-popover
            placement="bottom-start"
            width="365"
            trigger="click"
            v-if="article.categoryName == ''"
          >
            <!-- 分类 -->
            <template #default>
              <div style="text-align: center">分类</div>
              <el-autocomplete
                style="width:100%"
                v-model="categoryName"
                :fetch-suggestions="searchCategories"
                placeholder="请输入分类名搜索，enter可添加自定义分类"
                :trigger-on-focus="false"
                @keyup.enter.native="saveCategory"
                @select="handleSelectCategories"
              >
                <template #default="{item}">
                  <div>{{ item.categoryName }}</div>
                </template>
                <!--                <template slot-scope="{ item }">-->
                <!--                  <div>{{ item.categoryName }}</div>-->
                <!--                </template>-->
              </el-autocomplete>
              <div class="popover-container">
                <div
                  v-for="item of categoryList"
                  :key="item.id"
                  class="category-item"
                  @click="addCategory(item)"
                >
                  {{ item.categoryName }}
                </div>
              </div>
            </template>
            <template #reference>
              <el-button type="danger" plain size="default">
                添加分类
              </el-button>
            </template>
          </el-popover>
        </el-form-item>
        <!-- 文章标签 -->
        <el-form-item label="文章标签">
          <el-tag
            v-for="(item, index) of article.tagNameList"
            :key="index"
            size="large"
            style="margin:0 5px 0 0"
            :closable="true"
            @close="removeTag(item)"
          >
            {{ item }}
          </el-tag>
          <!-- 标签选项 -->
          <el-popover
            placement="bottom-start"
            width="365"
            trigger="click"
            v-if="article.tagNameList.length < 3"
          >
            <template #default>
              <div style="text-align: center">标签</div>
              <!-- 搜索框 -->
              <el-autocomplete
                style="width:100%"
                v-model="tagName"
                :fetch-suggestions="searchTags"
                placeholder="请输入标签名搜索，enter可添加自定义标签"
                :trigger-on-focus="false"
                @keyup.enter.native="saveTag"
                @select="handleSelectTag"
              >
                <template #default="{ item }">
                  <div>{{ item.tagName }}</div>
                </template>
              </el-autocomplete>
              <!-- 标签 -->
              <div class="popover-container">
                <el-tag
                  v-for="(item, index) of tagList"
                  size="large"
                  :key="index"
                  :class="article.tagNameList.indexOf(item.tagName) >= 0 ? 'tag-item-select' : 'tag-item'"
                  style="margin-right: 5px;margin-top: 5px;"
                  @click="addTag(item)"
                >
                  {{ item.tagName }}
                </el-tag>
              </div>
            </template>
            <template #reference>
              <el-button type="primary" plain slot="reference" size="default">
                添加标签
              </el-button>
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item label="文章类型">
          <el-select v-model="article.type" placeholder="请选择类型">
            <el-option
              v-for="item in typeList"
              :key="item.type"
              :label="item.desc"
              :value="item.type"
            />
          </el-select>
        </el-form-item>
        <!-- 文章类型 -->
        <el-form-item label="原文地址" v-if="article.type != 1">
          <el-input
            v-model="article.originalUrl"
            placeholder="请填写原文链接"
          />
        </el-form-item>
        <el-form-item label="上传封面">
          <el-upload v-if="article.articleCover == ''"
                     class="upload-cover"
                     drag
                     :show-file-list="false"
                     action="https://legaladvice.oss-cn-beijing.aliyuncs.com/"
                     :auto-upload="true"
                     :data="data"
                     :before-upload="beforeUpload"
                     :on-success="uploadCover"
          >
            <el-icon class="el-icon--upload" v-if="article.articleCover == ''">
              <upload-filled/>
            </el-icon>
            <div class="el-upload__text" v-if="article.articleCover == ''">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <el-image
              v-if="article.articleCover != ''"
              :src="article.articleCover"
            />
          </el-upload>
          <el-upload v-else
                     :show-file-list="false"
                     action="https://legaladvice.oss-cn-beijing.aliyuncs.com/"
                     :auto-upload="true"
                     :data="data"
                     :before-upload="beforeUpload"
                     :on-success="uploadCover"
          >
            <el-image
              style="width: 300px;height: 170px;border-radius: 5px"
              fit="fill"
              v-if="article.articleCover != ''"
              :src="article.articleCover"
            />
          </el-upload>
        </el-form-item>
        <el-form-item label="置顶">
          <el-switch
            v-model="article.isTop"
            active-color="#13ce66"
            inactive-color="#F4F4F5"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>
        <el-form-item label="发布形式">
          <el-radio-group v-model="article.status">
            <el-radio :label="1">公开</el-radio>
            <el-radio :label="2">私密</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="danger" @click="saveOrUpdateArticle">
          发 表
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {computed, onBeforeUnmount, onMounted, reactive, ref} from "vue";
import store from "@/store";
import {getCategories} from "@/network/category";
import {ElMessage, ElNotification} from "element-plus";
import {getTags} from "@/network/tag";
import * as imageConversion from "image-conversion";
import {v4} from "uuid";
import {addOrUpdateArticle, getArticleById} from "@/network/article";
import axios from "axios";
import router from "@/router";
import {useRoute} from "vue-router";
import {getPolicy} from "@/network/system";

export default {
  name: "Article",
  setup() {
    let articleContent = ref() //文章内容
    let dialogFormVisible = ref(false) //打开保存文章对话框
    let categoryList = ref([]) //已有的分类
    let categoryName = ref('') //查询keywords
    let tagList = ref([]) //已有的标签
    let tagName = ref('') //查询keywords
    let md = ref(null)
    let article = ref({
      id: null,
      articleContent: '',
      articleTitle: '',
      articleCover: '',
      categoryName: '',
      type: 1,
      tagNameList: [],
      originalUrl: '',
      isTop: 0,
      status: 1,
    })
    //请求oss 数据
    let data = {
      'key': '',
      'policy': '',
      'OSSAccessKeyId': '',
      'signature': '',
    }
    let state = reactive({
      bodyWidth: 0,
      autoSave: true
    })
    let typeList = ref([
      {
        type: 1,
        desc: '原创'
      },
      {
        type: 2,
        desc: '转载'
      },
      {
        type: 3,
        desc: '翻译'
      }
    ])
    const formatData = () => {
      let obj = {}
      obj.articleContent = article.value.articleContent
      obj.articleTitle = article.value.articleTitle
      obj.articleCover = article.value.articleCover
      obj.categoryName = article.value.categoryName
      obj.type = article.value.type
      obj.tagNameList = article.value.tagNameList
      obj.originalUrl = article.value.originalUrl
      obj.isTop = article.value.isTop
      obj.status = article.value.status
      return obj;
    }
    const resetData = () => {
      article.value.articleContent = ''
      article.value.articleTitle = ''
      article.value.articleCover = ''
      article.value.categoryName = ''
      article.value.type = 1
      article.value.tagNameList = []
      article.value.originalUrl = ''
      article.value.isTop = 0
      article.value.status = 1
    }
    //保存草稿
    const saveArticleDraft = () => {
      let obj = formatData()
      obj.status = 3
      addOrUpdateArticle(obj).then(res => {
        console.log(res)
        if (res.flag) {
          ElMessage({
            type: "success",
            message: "保存成功"
          })

          resetData()
          state.autoSave = false
        } else {
          ElMessage({
            type: "error",
            message: "保存失败"
          })
        }
      })
    }
    //发布文章
    const saveOrUpdateArticle = () => {
      //更新
      if (article.value.id != null) {
        let obj = formatData()
        obj.id = article.value.id
        addOrUpdateArticle(obj).then(res=>{
          if (res.flag) {
            ElMessage({
              type: "success",
              message: "发布成功"
            })
            // resetData()
            router.push("/article-list")
            resetData()
          } else {
            ElMessage({
              type: "error",
              message: "发布失败"
            })
          }
        })
      } else { //新增
        let obj = formatData()
        addOrUpdateArticle(obj).then(res => {
          if (res.flag) {
            ElMessage({
              type: "success",
              message: "发布成功"
            })
            resetData()
            router.push({path:"article-list"})
          } else {
            ElMessage({
              type: "error",
              message: "发布失败"
            })
          }
        })
      }
    }
    // 文章内容里自定义上传图片
    const uploadImg = (pos, file) => {
      // let types = ["jpg", "png", "jpeg", "JPG", "JPEG", "PNG"]
      let type = file.name.split(".")
      type = type[type.length - 1]
      let url = ""
      if (file.size / 1024 > 200) {
        imageConversion.compressAccurately(file, 200).then(res => {
          file = res
        })
      }
      getPolicy({path:'markdown'}).then(res => {
        data.signature = res.data.signature
        data.policy = res.data.policy
        data.OSSAccessKeyId = res.data.accessKeyId
        data.key = res.data.dir + v4() + "." + type
        let fd = new FormData()
        fd.append('key', data.key)
        fd.append('OSSAccessKeyId', data.OSSAccessKeyId)
        fd.append('policy', data.policy)
        fd.append('signature', data.signature)
        fd.append('file', file)
        //上传
        axios({
          url: 'https://legaladvice.oss-cn-beijing.aliyuncs.com/',
          method: 'POST',
          data: fd,
          processData: false,
          cache: false,
          contentType: false,
        }).then(res => {
          if (res.status == 204) {
            url = "https://legaladvice.oss-cn-beijing.aliyuncs.com/" + data.key
            md.value.$img2Url(pos, url)
          }
        })
      })
    }
    //上传前
    const beforeUpload = (file) => {
      // let types = ["jpg", "png", "jpeg", "JPG", "JPEG", "PNG"]
      let type = file.name.split(".")
      type = type[type.length - 1]

      return new Promise((resolve, reject) => {
        let new_file
        if (file.size / 1024 > 200) {
          imageConversion.compressAccurately(file, 200).then(res => {
            new_file = res
          })
        }
        let uuid = v4()
        getPolicy({path:'articles'}).then(res => {
          data.signature = res.data.signature
          data.policy = res.data.policy
          data.OSSAccessKeyId = res.data.accessKeyId
          data.key = res.data.dir + uuid + "." + type
        })
        setTimeout(() => {
          // uploadCover(data)
          resolve(file)
        }, 3000)
      })
    }
    //上传回调
    const uploadCover = () => {
      let url = "https://legaladvice.oss-cn-beijing.aliyuncs.com/"
      article.value.articleCover = url + data.key
      console.log(article.value.articleCover)
    }
    //搜索标签
    const searchTags = (keywords, callBack) => {
      //从后端获取搜索标签
      getTags({keywords}).then(res => {
        if (res.flag) {
          callBack(res.data)
        } else {
          ElMessage({
            type: "error",
            message: "出错了"
          })
        }
      })
    }
    //选择标签
    const handleSelectTag = (item) => {
      if (article.value.tagNameList.indexOf(item.tagName) < 0) {
        article.value.tagNameList.push(item.tagName)
      }
    }
    //创建标签
    const saveTag = () => {
      article.value.tagNameList.push(tagName.value)
    }
    //移除标签
    const removeTag = (item) => {
      article.value.tagNameList = article.value.tagNameList.filter(i => {
        return i != item
      })
    }
    //添加标签
    const addTag = (item) => {
      if (article.value.tagNameList.indexOf(item.tagName) < 0) {
        article.value.tagNameList.push(item.tagName)
      }
    }

    //选择分类
    const handleSelectCategories = (item) => {
      article.value.categoryName = item.categoryName
    }
    //移除分类
    const removeCategory = () => {
      article.value.categoryName = ''
    }
    //选择分类
    const addCategory = (item) => {
      article.value.categoryName = item.categoryName
    }
    //创建分类
    const saveCategory = () => {
      article.value.categoryName = categoryName.value
    }
    //搜索分类
    const searchCategories = (keywords, callBack) => {
      //从后端获取搜索分类
      getCategories({keywords}).then(res => {
        if (res.flag) {
          callBack(res.data)
        } else {
          ElMessage({
            type: "error",
            message: "出错了"
          })
        }
      })
    }

    const openModel = () => {
      dialogFormVisible.value = !dialogFormVisible.value
    }
    //初始化数据
    const init = () => {
      getCategories({keywords: ''}).then(res => {
        if (res.flag) {
          categoryList.value = res.data
        } else {
          ElMessage({
            type: "error",
            message: "出错了"
          })
        }
      })
      getTags({keywords: ''}).then(res => {
        if (res.flag) {
          tagList.value = res.data
        } else {
          ElMessage({
            type: "error",
            message: "出错了"
          })
        }
      })
    }
    //自动保存文章
    const autoSaveArticle = () => {
      if (state.autoSave
        && article.value.articleContent.trim() != ''
        && article.value.articleTitle.trim() != ''
        && article.value.id != null
      ) {
        let obj = formatData()
        obj.id = article.value.id
        addOrUpdateArticle(obj).then(res=>{
          if (res.flag){
            ElNotification({
              title: '成功',
              message: '自动保存成功',
              type: 'success',
              duration: 2000
            })
          }else {
            ElNotification({
              title: '失败',
              message: '自动保存失败',
              type: 'error',
              duration: 2000
            })
          }
        })
      }
    }
    const ArticleById = (id) => {
      getArticleById(id).then(res=>{
        article.value.id = res.data.id
        article.value.articleCover = res.data.articleCover
        article.value.articleTitle = res.data.articleTitle
        article.value.articleContent = res.data.articleContent
        article.value.type = res.data.type
        article.value.originalUrl = res.data.originalUrl
        article.value.categoryName = res.data.categoryName
        article.value.tagNameList = res.data.tagNameList
        article.value.status = res.data.status
      }).catch(error=>{
        console.log(error)
      })
    }
    let route = useRoute()
    onMounted(() => {
      // console.log(route.params.id)
      ArticleById(route.params.id)
      init()
    })
    //页面卸载前执行
    onBeforeUnmount(() => {
      //自动保存文章
      autoSaveArticle()
    })
    return {
      article,
      dialogFormVisible,
      articleContent,
      typeList,
      tagList,
      categoryList,
      categoryName,
      tagName,
      data,
      md,
      saveArticleDraft,
      uploadImg,
      uploadCover,
      beforeUpload,
      searchTags,
      saveTag,
      handleSelectTag,
      addTag,
      removeTag,
      saveCategory,
      addCategory,
      searchCategories,
      handleSelectCategories,
      removeCategory,
      openModel,
      saveOrUpdateArticle
    }
  },
}
</script>

<style scoped lang="less">
.mavonEditor {
  height: 600px;
}

.container {
  margin: 15px;

  .article-title-container {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
}

.category-item {
  cursor: pointer;
  padding: 10px 8px;
}

.category-item:hover {
  background-color: #f0f9eb;
  color: #67c23a;
}

.tag-item {
  margin-right: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
}

.tag-item-select {
  margin-right: 1rem;
  margin-bottom: 1rem;
  cursor: not-allowed;
  color: #ccccd8 !important;
}

.upload-cover {
  width: 300px;
}
</style>