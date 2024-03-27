<template>
  <div class="article-main">
11111
  </div>
</template>

<script lang="js">
import {reactive, ref} from "vue";

export default {
  name:"Articles",
  setup(){
    let f = reactive({
      'icon':"el-fiee-diyiye"
    })
    return{
      f,
    }
  }
}
</script>

<style scoped lang="scss">
.url-main{

}
</style>