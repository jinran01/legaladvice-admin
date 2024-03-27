import {request} from "@/network/request";

//获取验证码api
export function getCodeImg(uuid) {
    return request({
        url: `/getLoginCode/${uuid}`,
        method: "GET",
        responseType: "blob"
    })
}
//验证验证码api
export function checkLoginCode(data) {
    return request({
        url: `/checkLoginCode/`,
        method: "POST",
        data
    })
}

//登录api
export function login(form) {
    return request({
        url:"/login",
        method:"POST",
        params: form
    })
}
//登出api
export function logout() {
    return request({
        url:"/logout",
        method:"POST",
    })
}