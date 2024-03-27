import {request} from "@/network/request";

export function updateBaseInfo(data) {
    return request({
        url:`admin/users/info`,
        method:"POST",
        data
    })
}
export function updatePass(data) {
    return request({
        url:`admin/users/pass`,
        method:"POST",
        data
    })
}


export function getBaseInfo() {
    return request({
        url:`admin/users/info`,
        method:"get",
    })
}

