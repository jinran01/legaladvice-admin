import {request} from "@/network/request";

//获取后台首页数据信息
export function getBlogBackInfo() {
    return request({
        url: `/admin/`,
        method: "GET",
    })
}