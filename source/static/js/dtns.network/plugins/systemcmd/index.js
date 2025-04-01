/**
 * system-cmd的插件代码
 */
window.systemcmd_c = {}
// const systemcmd_c_token_name = OBJ_TOKEN_NAME
// const systemcmd_c_api_base   = OBJ_API_BASE
// const systemcmd_c_token_root = OBJ_TOKEN_ROOT

systemcmd_c.routers = function(app)
{
    if(!app) return 
    if(!app.setChatC) return 
    const urlParser = null
    //app.all('/systemcmd/reboot',urlParser,console_filter,systemcmd_c.reboot)
    //app.all('/systemcmd/shutdown',urlParser,console_filter,systemcmd_c.shutdown)
    app.all('/systemcmd/killapp',urlParser,console_filter,systemcmd_c.killapp)
    app.all('/systemcmd/dtns/static',urlParser,console_filter,systemcmd_c.static)
    app.all('/systemcmd/web3/cid',urlParser,console_filter,systemcmd_c.genCID)
}
systemcmd_c.killapp = killapp
async function killapp(req,res)
{
    console.log('system-cmd-api call killapp now: success')
    res.json({ret:true,msg:'success'})
    process.exit(1)
}
systemcmd_c.static = dtns_static_query
async function dtns_static_query(req,res)
{
    console.log('system-cmd-api call dtns_static_query now: success')
    await g_dtnsManager.queryDTNSAll(true)
    let retJson = {list:g_dtnsManager.web3apps,networks:g_dtnsManager.networkInfoMapObj,ret:true,msg:'success'}

    let file_util = require('../../libs/file_util')
    await file_util.writeFile('/usr/share/nginx/html/ibapps.json',JSON.stringify(retJson))
    res.json(retJson)
}
/**
 * 新增cid----create web3app access id 
 */
systemcmd_c.genCID = dtns_web3_gen_cid
async function dtns_web3_gen_cid(req,res)
{
    console.log('system-cmd-api call dtns_web3_gen_cid now: ')
    let {num} = str_filter.get_req_data(req)
    if(!num) num=1
    else num = parseInt(num)

    let list = []
    for(let i=0;i<num;i++)
    {
        let cid = str_filter.randomBytes(32);
        // user_redis.set(ll_config.redis_key+":session:"+obj.user_id+"-"+s_id,s_id,3*24*60*60)
        let setFlag = await kmmDb.set('web3-cid:'+cid,'new',24*60*60*366)//1年有效期（365天）
        console.log('set-cid-into-kmmDb:'+setFlag,cid)
        if(!setFlag) return res.json({ret:false,msg:'save cid failed'})
        list.push(cid)
    }

    res.json({list,ret:true,msg:'success'})
}
/**
 * 重启（windows）
 */
systemcmd_c.reboot = reboot
async function reboot(req,res)
{
    console.log('system-cmd-api call reboot now:')
    const { exec } = require('child_process');
    let command = exec('shutdown -r -t 0', function(err, stdout, stderr) {
        if(err || stderr) {
            console.log("reboot failed" + err + stderr);
            return res.json({ret:false,msg:'reboot failed'})
        }
        res.json({ret:false,msg:'success'})
    });
    command.stdin.end();
    command.on('close', function(code) {
        console.log("reboot close -- code:",  code);
    });
}
//关机（windows）
systemcmd_c.shutdown = shutdown
async function shutdown(req,res)
{
    console.log('system-cmd-api call shutdown now:')
    const { exec } = require('child_process');
    let command = exec('shutdown -s -t 00', function(err, stdout, stderr) {
        if(err || stderr) {
            console.log("shutdown failed" + err + stderr);
            return res.json({ret:false,msg:'shutdown failed'})
        }
        res.json({ret:false,msg:'success'})
    });
    command.stdin.end();
    command.on('close', function(code) {
        console.log("shutdown close -- code:",  code);
    });
}
