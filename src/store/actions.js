import {getMenuList, menus} from "@/network/menu";

const actions={
    async setMenu({commit}){
        await menus().then(res=>{
            commit('setMenu',res.data)
        })
    },
};
export default actions;