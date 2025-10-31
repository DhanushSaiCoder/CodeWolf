export const toMediumQualityPic = url => {
    return url.replace(
        "/upload/",
        "/upload/q_auto:good,w_200,h_200,c_fill/"
    )
}