<template>
  <router-view/>
</template>

<style scoped>
#app {
  display: none;
}
</style>
<script setup>
import {onMounted} from "vue";

onMounted(()=>{
  document.title = "法律咨询与援助后台管理系统"
})
const debounce = (fn, delay) => {

  let timer = null;

  return function () {

    let context = this;

    let args = arguments;

    clearTimeout(timer);

    timer = setTimeout(function () {

      fn.apply(context, args);

    }, delay);

  }

}

// 解决ERROR ResizeObserver loop completed with undelivered notifications.

//问题的

const _ResizeObserver = window.ResizeObserver;

window.ResizeObserver = class ResizeObserver extends _ResizeObserver {

  constructor(callback) {

    callback = debounce(callback, 16);

    super(callback);

  }

}
</script>