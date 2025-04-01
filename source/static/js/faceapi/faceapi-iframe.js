const faceapiFuncs = new Map()

window.g_2d_faceapi_load_models = async function()
{
    // if(window.g_2d_faceapi_load_models_called) return false
    // window.g_2d_faceapi_load_models_called = true
    console.log('call g_2d_faceapi_load_models:')
    let flag = await new Promise((resolve)=>
    {
        let callid = 'callid:'+Date.now()+'-'+Math.random()
        faceapiFuncs.set(callid,function(flag)
        {
            faceapiFuncs.delete(callid)
            resolve(flag)
        })
        //给iframe发送消息（无OffscreenCanvas避免阻塞的模式）
        document.getElementById('faceapiIframe').contentWindow.postMessage(
                JSON.stringify({callid,time:Date.now(),
                xtype:'models'}),'*')
    
    })
    return flag
}
//设置检索的目标图像
window.g_2d_faceapi_user_set = async function(base64)
{
    console.log('call g_2d_faceapi_user_set:')
    let flag = await new Promise((resolve)=>
    {
        let callid = 'callid:'+Date.now()+'-'+Math.random()
        faceapiFuncs.set(callid,function(flag)
        {
            faceapiFuncs.delete(callid)
            resolve(flag)
        })
        //给iframe发送消息（无OffscreenCanvas避免阻塞的模式）
        document.getElementById('faceapiIframe').contentWindow.postMessage(
                JSON.stringify({callid,time:Date.now(),
                xtype:'set_user',base64}),'*')
    
    })
    return flag
}
//判断是否存在已经设置的待识别的人脸
window.g_2d_faceapi_user_ok = async function()
{
    console.log('call g_2d_faceapi_user_ok:')
    let flag = await new Promise((resolve)=>
    {
        let callid = 'callid:'+Date.now()+'-'+Math.random()
        faceapiFuncs.set(callid,function(flag)
        {
            faceapiFuncs.delete(callid)
            resolve(flag)
        })
        //给iframe发送消息（无OffscreenCanvas避免阻塞的模式）
        document.getElementById('faceapiIframe').contentWindow.postMessage(
                JSON.stringify({callid,time:Date.now(),
                xtype:'user_ok'}),'*')
    
    })
    return flag
}
/**
 * 识别图像
 * @param {*} base64 
 * @returns 
 */
window.g_2d_faceapi_search = async function(base64)
{
    console.log('call g_2d_faceapi_search:')
    let flag = await new Promise((resolve)=>
    {
        let callid = 'callid:'+Date.now()+'-'+Math.random()
        faceapiFuncs.set(callid,function(flag)
        {
            faceapiFuncs.delete(callid)
            resolve(flag)
        })
        //给iframe发送消息（无OffscreenCanvas避免阻塞的模式）
        document.getElementById('faceapiIframe').contentWindow.postMessage(
                JSON.stringify({callid,time:Date.now(),
                xtype:'search',base64}),'*')
    
    })
    return flag
}




window.addEventListener("message", function(e){
    // console.log('e.data:',e.data)
    try{
        let xobj = JSON.parse(e.data)
        if(xobj.xtype == 'models')
        {
            console.log('faceapi-iframe-models-used-time:',(Date.now()-xobj.time))
            let func = faceapiFuncs.get(xobj.callid)
            if(typeof func == 'function'){
                func(xobj.flag)
            }
        }
        else if(xobj.xtype == 'set_user')
        {
            console.log('faceapi-iframe-set_user-used-time:',(Date.now()-xobj.time))
            let func = faceapiFuncs.get(xobj.callid)
            if(typeof func == 'function'){
                func(xobj.flag)
            }
        }
        else if(xobj.xtype == 'user_ok')
        {
            console.log('faceapi-iframe-user_ok-used-time:',(Date.now()-xobj.time))
            let func = faceapiFuncs.get(xobj.callid)
            if(typeof func == 'function'){
                func(xobj.flag)
            }
        }
        else if(xobj.xtype == 'search')
        {
            console.log('faceapi-iframe-search-used-time:',(Date.now()-xobj.time))
            let func = faceapiFuncs.get(xobj.callid)
            if(typeof func == 'function'){
                func(xobj.flag)
            }
        }
    }catch(ex){
        console.log('faceapi-iframe-message-ex:'+ex,ex)
    }
}, false);