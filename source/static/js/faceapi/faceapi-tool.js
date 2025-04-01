window.g_2d_faceapi_load_models = async function()
{
    // if(window.g_2d_faceapi_load_models_called) return false
    // window.g_2d_faceapi_load_models_called = true
    console.log('call g_2d_faceapi_load_models:')
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('https://static.dtns.top/faceapi-models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('https://static.dtns.top/faceapi-models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('https://static.dtns.top/faceapi-models'),
        faceapi.nets.faceExpressionNet.loadFromUri('https://static.dtns.top/faceapi-models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('https://static.dtns.top/faceapi-models')
    ])
    console.log('g_2d_faceapi_load_models:return:true')
    return true
}
//设置检索的目标图像
window.g_2d_faceapi_user_set = async function(base64)
{
    console.log('faceapi-tool-g_2d_faceapi_user_set:call')
    const imgEle = document.createElement('img')
    imgEle.src = base64
    const beginTime0 = Date.now()
    const reResults = await faceapi
            .detectAllFaces(imgEle)
        .withFaceLandmarks()
        .withFaceDescriptors()
    console.log('g_2d_faceapi_user_set-result:',reResults,Date.now()-beginTime0)
    if(!reResults || reResults.length<=0) return false
    //人脸匹配
    const faceMatcher = new faceapi.FaceMatcher(reResults)
    console.log('g_2d_faceapi_user_set-faceMatcher:',faceMatcher,Date.now()-beginTime0)
    window.g_2d_faceapi_face_matcher = faceMatcher
    return true
}
//判断是否存在已经设置的待识别的人脸
window.g_2d_faceapi_user_ok = function()
{
    if(window.g_2d_faceapi_face_matcher) return true
    else return false
}
/**
 * 识别图像
 * @param {*} base64 
 * @returns 
 */
window.g_2d_faceapi_search = async function(base64)
{
    if(!window.g_2d_faceapi_face_matcher) return false
    
    const imgEle = document.createElement('img')
    imgEle.src = base64
    let beginTime = Date.now()
    const results = await faceapi
        .detectAllFaces(imgEle)
        .withFaceLandmarks()
        .withFaceDescriptors()

    if(!results || results.length<=0) return null

    let matchUser = null
    let faceMatcher = window.g_2d_faceapi_face_matcher
    for(let i=0;i<results.length;i++)
    {
        let result = results[i]
        const bestMatch = faceMatcher.findBestMatch(result.descriptor)
        console.log('result-beseMatch:',bestMatch,bestMatch.toString(),result,Date.now()-beginTime)
        if(bestMatch && bestMatch._label.startsWith('person'))// && bestMatch._distance <=0.3) 
        {
            matchUser ={ result ,bestMatch}
            break;
        }
    }
    return matchUser
}