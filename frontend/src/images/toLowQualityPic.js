export const toLowQualityPic = url => {
    return url.replace(
        "/upload/",
        "/upload/q_auto:low,w_100,h_100,c_fill/"
    )
}