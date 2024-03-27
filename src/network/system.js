
import {request} from "@/network/request";

export function getPolicy(data) {
    return request({
        url:`system/oss/policy`,
        params: data
    })
}

export function uploadImg(data) {
    return request({
        url:`https://legaladvice.oss-cn-beijing.aliyuncs.com`,
        method:"POST",
        data
    })
}
