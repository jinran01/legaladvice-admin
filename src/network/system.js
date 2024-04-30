
import {request} from "@/network/request";

export function getPolicy(data) {
    return request({
        url:`system/oss/policy`,
        params: data
    })
}
