import {createRouter, createWebHistory, useRouter} from 'vue-router'
import state from "@/store/state";
import {menus} from "@/network/menu";
import {ElMessage} from "element-plus";

const Login = () => import("../views/login")
const Layout = () => import("@/layout/Layout.vue")


const routes = [
  {
    path: '/login/:url*',
    name: "Login",
    component: Login,
  },
  {
    path: "/",
    name: "*",
    component: Layout,
    children: [],
  },
]
const generaMenu = () => {
  for (const item of state.menuList) {
    // 判断是否是一级路由，一级路由直接添加
    if (item.children.length == 0) {
      routes[1].children.push({
        name: item.name,
        path: item.path,
        meta: {
          title: item.name
        },
        component: () => import(`@/views${item.component}`)
      })
    } else { //如是二级路由则循环子路由添加
      for (const i of item.children) {
        routes[1].children.push({
          name: i.name,
          path: i.path,
          meta: {
            title: i.name
          },
          component: () => import(`@/views${i.component}`)
        })
      }
    }
  }
}
generaMenu()
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})
router.beforeEach((to, from, next) => {
  if (to.path == "/login") {
    next()
  } else {
    if (state.menuList.length == 0 || localStorage.getItem("userInfo")==null) {
      router.push("/login")
      generaMenu()
    }
    generaMenu()
    next()
  }
})
export default router