import state from "@/store/state";

const getters={
    getAvatarUrl(){
        return state.userInfo.avatar
    }
};
export default getters;