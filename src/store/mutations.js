const mutations={
    setMenu(state, data) {
        state.menuList = data
        localStorage.setItem("menuList",JSON.stringify(data))
    },
};
export default mutations;