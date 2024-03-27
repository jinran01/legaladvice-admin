
const state={
    // isLogin: false,
    userInfo:JSON.parse(window.localStorage.getItem('userInfo')),
    tags: JSON.parse(window.localStorage.getItem("tags"))==null ? [{"name":"首页","path":"/"}]:JSON.parse(window.localStorage.getItem("tags")),
    menuList: JSON.parse(window.localStorage.getItem("menuList"))==null ? []:JSON.parse(window.localStorage.getItem("menuList")),
    is_pc: true,
};
export default state;