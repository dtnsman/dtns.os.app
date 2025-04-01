// const str_filter = require('../libs/str_filter');
// const config = require('../config').config;
// const user_redis = require('../config').user_redis;
// var fs = require("fs");


// const rpc_query = require('../rpc_api_config').rpc_query
// const str_filter = require('../libs/str_filter')
// const {RPC_API_BASE,USER_API_BASE,USER_TOKEN_ROOT,USER_TOKEN_NAME,
//     ORDER_API_BASE,ORDER_TOKEN_ROOT,ORDER_TOKEN_NAME,
//     GSB_API_BASE,GSB_TOKEN_NAME,GSB_TOKEN_ROOT,
//     PCASH_API_BASE,PCASH_TOKEN_NAME,PCASH_TOKEN_ROOT,
//     RMB_API_BASE,RMB_TOKEN_NAME,RMB_TOKEN_ROOT,
//     SCORE_API_BASE,SCORE_TOKEN_NAME,SCORE_TOKEN_ROOT,
//     OBJ_API_BASE,OBJ_TOKEN_ROOT,OBJ_TOKEN_NAME,
//     MSG_API_BASE,MSG_TOKEN_NAME,MSG_TOKEN_ROOT,
//     VIP_API_BASE,VIP_TOKEN_ROOT,VIP_TOKEN_NAME } = require('../rpc_api_config')

// const rpc_api_util = require('../rpc_api_util')
window.AlipaySdk = null 
window.AlipayFormData= null
window.alipaySdk = null
if(typeof g_forklist_user=='undefined')
{
  window.AlipaySdk = typeof require!='undefined' ? require('alipay-sdk').default :null
  window.AlipayFormData = typeof require!='undefined' ? require('alipay-sdk/lib/form').default : null

  // 初始化插件
  window.alipaySdk = AlipaySdk ? new AlipaySdk({
    appId:window.g_system_alipay_sdk_appid,
    gateway: 'https://openapi.alipay.com/gateway.do',
    // signType: 'RSA2', // 注意这里默认是RSA2, 但是我自己只能用RSA, 所以是RSA, 正常不要配置
    // privateKey: fs.readFileSync('./key/rsa_private_key.pem', 'ascii'),
    privateKey: window.g_system_alipay_sdk_private_key
  }) : null 
}

/**
 * 支付成功的回调通道（特殊通道）
 */
window.forklist_pay_c = {}
window.forklist_pay_c.pay_channel =pay_channel;
async function pay_channel(req,res)
{
  let {web3name} = str_filter.get_req_data(req)
  if(!req.peer){
    return res.json({ret:false,msg:'Error: RPCHost version is old, need param : req.peer'})
  }
  if(!web3name) {
    return res.json({ret:false,msg:'param web3name error'})
  }

  if(typeof g_forklist_pay_channels == 'undefined'){
    window.g_forklist_pay_channels = new Map()
  }
  if(g_forklist_pay_channels.has(web3name)){
    let peerArray = g_forklist_pay_channels.get(web3name)
    if(peerArray.indexOf(req.peer)>=0)
    {
      console.log('[double push]req.peer is exits in g_forklist_pay_channels',web3name,req.peer)
    }
    else{
      peerArray.push(req.peer)
    }
  }else{
    g_forklist_pay_channels.set(web3name,[req.peer])
  }
  let web3name_peers = g_forklist_pay_channels.get(web3name)
  console.log('web3name_peers:',web3name_peers,web3name)
  res.json({ret:true,msg:'success',web3name_peers_size:web3name_peers.length,web3name})

  //开始测试 2023-5-11
  setTimeout(()=>{
    forklist_channel_notify('1|2|3:forklist')
    forklist_channel_notify('xxxxxxxxxxx:forklist')
  },3000)
  user_redis.set('forklist_channel:4','3|4|5:forklist',300)
  user_redis.set('forklist_channel:yyyyy','yyyyy:forklist',300)
  setTimeout(()=>{

    let req = {body:{body:'3|4|5'},params:{trade_status:'TRADE_SUCCESS'}}
    let req2 = {body:{body:'yyyyy'},params:{trade_status:'TRADE_SUCCESS'}}
    let res = {json:function(data){
      console.log('test-notify-data-res:',data)
    }}
    notify(req,res)
    h5_notify(req2,res)
  },6000)
}
window.forklist_pay_c.forklist_channel_notify = forklist_channel_notify
function forklist_channel_notify(channel_info)
{
  console.log('forklist_channel_notify:channel_info:',channel_info)
  if(!channel_info) return ;
  let web3name = channel_info.split(':')[1]
  let body = channel_info.split(':')[0]
  if(typeof g_forklist_pay_channels == 'undefined'){
    console.log('g_forklist_pay_channels is undefined')
    return 
  }
  if(!g_forklist_pay_channels.has(web3name)){
    console.log('g_forklist_pay_channels-web3name is empty!')
    return 
  }
  let channels = g_forklist_pay_channels.get(web3name)
  let iCnt = 0;
  let new_channels = []
  for(let i=0;i<channels.length;i++)
  {
    try{
      channels[i].send(JSON.stringify({forklist_channel_notify:true,web3name,body:body,trade_status : "TRADE_SUCCESS"}))
      iCnt+=1
      new_channels.push(channels[i])
    }catch(ex){
      console.log('send forklist_channel_notify failed,exception:'+ex,ex)
    }
  }
  g_forklist_pay_channels.set(web3name,new_channels)
  console.log('forklist_channel_notify-old-new-channels:',channels.length,new_channels.length)
  console.log('forklist_channel_notify-send-cnt:'+iCnt)
}

window.forklist_pay_c.forklist_pay = forklist_pay
async function forklist_pay(req,res)
{
  if(typeof g_loginDtnsAndForklist_started == 'undefined' || !g_loginDtnsAndForklist_started)
  {
    if(typeof g_loginDtnsAndForklist == 'function')
    {
      await g_loginDtnsAndForklist()
    }
  }
  let obj = req.obj
  let obj_id = req.obj_id
  let forkComments = req.forkComments
  if(!obj){//h5-pay-order情况下
    obj = await rpc_api_util.s_query_token_info(OBJ_API_BASE,obj_id,'assert')
  }
  if(!obj){
    return res.json({ret:false,msg:'may be obj-info is empty, obj_id='+obj_id})
  }
  let reloginFunc =async function(){
    console.log('forklist_pay-call-reloginFunc:')
    let web3name = g_forklist_user.web3name
    let timestamp = parseInt( Date.now()/1000)
    let hash = await key_util.hashVal(web3name+':'+timestamp)
    let sign = await key_util.signMsg(hash,g_forklist_user.private_key) //使用的是dtns-device-id设备id的密钥

    let ret = await g_dtnsManager.run('dtns://web3:'+web3name+'/user/device/login',{timestamp,web3name,sign})
    console.log('forklist_pay:'+web3name+'-/user/device/login--ret:'+JSON.stringify(ret))

    if(!ret || !ret.ret) return res.json({ret:false,msg:'forklist_pay-forklist-user-session login failed:'+JSON.stringify(ret)})
    window.g_forklist_user_session = ret

    let channelRet = await g_dtnsManager.run('dtns://web3:'+web3name+'/forklist/pay/channel',{web3name:ll_config.roomid})
    console.log('reloginFunc:'+ll_config.roomid+'-/forklist/pay/channel--ret:channelRet:'+JSON.stringify(channelRet))
    return {ret:true,msg:'success',channelRet}
  }
  
  if(typeof g_forklist_user_session =='undefined'){
    console.log('forklist_pay-check-forklist-user-session init failed???')
    let reloginRet = await reloginFunc()
    console.log('forklist_pay-reloginRet:',reloginRet)
    // return res.json({ret:false,msg:'forklist-user-session init failed???'})
  }

  let user_id = g_forklist_user_session.user_id, s_id = g_forklist_user_session.s_id,
    web3name = g_forklist_user.web3name,forkid = g_forklist_user.forkid

  let channelRet = await g_dtnsManager.run('dtns://web3:'+web3name+'/forklist/pay/channel',{web3name:ll_config.roomid})
  console.log('forklist_pay:'+ll_config.roomid+'-/forklist/pay/channel--ret:channelRet:'+JSON.stringify(channelRet))
  if(typeof g_forkinfo == 'undefined')
  {
    let fork_res = await g_dtnsManager.run('dtns://web3:'+web3name+'/obj/fork/queryInfo',{forkid})
    console.log('/obj/fork/queryInfo-fork-res:',fork_res)
    if(!fork_res || !fork_res.ret){
      await reloginFunc()
      if(g_forklist_user_session){
        user_id = g_forklist_user_session.user_id
        s_id = g_forklist_user_session.s_id
      }
      fork_res = await g_dtnsManager.run('dtns://web3:'+web3name+'/obj/fork/queryInfo',{forkid})
      console.log('/obj/fork/queryInfo-fork-res:',fork_res)
      if(!fork_res || !fork_res.ret)
        return res.json({ret:false,msg:'forklist-user query FORK-info failed, forkid:'+forkid})
    }
    window.g_forkinfo = fork_res
  }

  //free fork
  let fork_objinfo = Object.assign({},g_forkinfo)
  fork_objinfo.rmb_price = obj.rmb_price

  let freeParams = {user_id,s_id,obj_id:fork_objinfo.obj_id,work_type:fork_objinfo.work_type,
    work_name:fork_objinfo.work_name,work_specification:'auto',rmb_price:obj.rmb_price,
    work_describe:fork_objinfo.work_describe,work_image:fork_objinfo.work_image}
  let fork_res = await g_dtnsManager.run('dtns://web3:'+web3name+'/obj/fork/freeFork',freeParams)
  console.log('free-fork-res:',fork_res)
  if(!fork_res || !fork_res.ret){
    await reloginFunc()
    if(g_forklist_user_session){
      user_id = g_forklist_user_session.user_id
      s_id = g_forklist_user_session.s_id
      freeParams.user_id = user_id
      freeParams.s_id = s_id
    }
    fork_res = await g_dtnsManager.run('dtns://web3:'+web3name+'/obj/fork/freeFork',freeParams)
    console.log('free-fork-res:',fork_res)
    if(!fork_res || !fork_res.ret)
      return res.json({ret:false,msg:'forklist-user free-FORK failed'})
  }

  let new_obj_id = fork_res.obj_id
  fork_objinfo.obj_id = new_obj_id

  fork_res = await g_dtnsManager.run('dtns://web3:'+web3name+'/obj/fork/releaseNFTFork',
    {user_id,s_id,obj_id:new_obj_id} )
  console.log('release-fork-res:',fork_res)
  if(!fork_res || !fork_res.ret){
    return res.json({ret:false,msg:'release free-fork failed'})
  }

  // let new_fork_info =  await g_dtnsManager.run('dtns://web3:'+web3name+'/obj/fork/queryNftInfo',{obj_id:new_obj_id})
  // console.log('new_fork_info:',new_fork_info,user_id)

  fork_res = await g_dtnsManager.run('dtns://web3:'+web3name+'/obj/nft/sendOkFork',
    {user_id,s_id,obj_id:new_obj_id} )
  console.log('sendOk-fork-res:',fork_res)
  if(!fork_res || !fork_res.ret){
    return res.json({ret:false,msg:'sendOk free-fork failed'})
  }

  if(!req.order_id)
  {
    let paySessionId =  await str_filter.randomBytes(16)
    let setPaySIDFlag = await user_redis.set('psid:'+paySessionId,
            req.params.user_id+ '|' +obj_id+ '|' +forkComments,60*60*24)
    console.log('forklist_pay-pay-setPaySIDFlag:'+setPaySIDFlag)

    fork_res = await g_dtnsManager.run('dtns://web3:'+web3name+'/forklist/pay',
      {user_id,s_id,obj_id:new_obj_id,forklist_pay_notify_info:paySessionId,web3name:ll_config.roomid} )
    console.log('pay-fork-res:',fork_res)
    if(!fork_res || !fork_res.ret){
      return res.json({ret:false,msg:'pay free-fork failed'})
    }
    res.json(fork_res)
  }else{
    let paySessionId =  await str_filter.randomBytes(16)
    let setPaySIDFlag = await user_redis.set('psid:'+paySessionId,req.order_id,60*60*24)
    console.log('forklist_pay-h5-pay-setPaySIDFlag:'+setPaySIDFlag)

    obj.original_obj= '';
		obj.creatorInfo= '';
		obj.forkUserInfo= '';
    fork_res = await g_dtnsManager.run('dtns://web3:'+web3name+'/fork/order/createOrder',
      {user_id,s_id,note:'创意不错，支持！',goods:JSON.stringify([fork_objinfo]),random:Math.random()} )
    console.log('h5-pay-createOrder-fork-res:',fork_res)
    if(!fork_res || !fork_res.ret){
      return res.json({ret:false,msg:'h5-pay-createOrder failed'})
    }

    let res_order_id = fork_res.order_id
    let order_h5_pay_res = await await g_dtnsManager.run('dtns://web3:'+web3name+'/forklist/h5_pay',
        {user_id,s_id,order_id:res_order_id,forklist_pay_notify_info:paySessionId,web3name:ll_config.roomid} )
    console.log('h5-pay-end-res:',fork_res)
    if(!order_h5_pay_res || !order_h5_pay_res.ret) 
      return res.json({ret:false,msg:'h5-pay ret failed, result:'+JSON.stringify(order_h5_pay_res)})
    res.json(order_h5_pay_res)
  }
  return 
}
window.forklist_pay_c.notify_all = notify_all
async function notify_all(req,res){
  console.log('into notify_all:',req,res)
  if(typeof g_body_exists_map =='undefined') window.g_body_exists_map = new Map()
  if(g_body_exists_map.has(req.body.body)){
    console.log('notify_all-g_body_exists_map-has-ed:'+req.body.body)
    return 
  }
  g_body_exists_map.set(req.body.body,'')
  let body = await user_redis.get('psid:'+req.body.body)
  if(body && body.indexOf('|')>0){
    notify(req,res)
  }else{
    h5_notify(req,res)
  }
}
/**
 * 返回支付链接
 * @type {pay}
 */
window.forklist_pay_c.pay =pay;
async function pay (req, res) {
    let {user_id, s_id, obj_id,forklist_pay_notify_info,web3name,forkComments,random} = str_filter.get_req_data(req);
    let s_str = await user_redis.get(ll_config.redis_key+":session:"+user_id+"-"+s_id)
    if(!s_str) return res.json({ret:false,msg:"session error"})

    if(!obj_id) return res.json({ret:false,msg:"obj_id error"})

    let assertInfoRet = await rpc_query(OBJ_API_BASE+'/chain/opcode',{token:obj_id,opcode:'assert',begin:0,len:1})
    if(!assertInfoRet || !assertInfoRet.ret) return res.json({ret:false,msg:"obj-assert-info is empty"})

    let obj = JSON.parse(JSON.parse(assertInfoRet.list[0].txjson).opval)
    //创建一个obj-id（关于用户的购买记录？）
    // if(obj.user_id==user_id) return res.json({ret:false,msg:"can not buy youself nft"})

    //查询用户资料，nft_buyed_id
    let assertUserInfoRet = await rpc_query(USER_API_BASE+'/chain/opcode',{token:user_id,opcode:'assert',begin:0,len:1})
    if(!assertUserInfoRet || !assertUserInfoRet.ret) return res.json({ret:false,msg:'user unexists'})
    let userInfo = JSON.parse(JSON.parse(assertUserInfoRet.list[0].txjson).opval)

    if(userInfo.nft_buyed_id)
    {
      let isholdRet = await rpc_query(OBJ_API_BASE+'/chain/relations/exists',{token_x:userInfo.nft_buyed_id,token_y:obj_id,opcode:'hold'})
      if(isholdRet.ret == true) return res.json({ret:false,msg:'您已经购买了该作品'})
    }

    //当使用forklist之pay时（请求相应的pay服务节点完成支付）
    if(typeof g_forklist_user!='undefined')
    {
      req.obj_id = obj_id
      req.obj = obj
      req.forkComments = forkComments
      await forklist_pay(req,res)
      return 
    }


    const formData = new AlipayFormData()
    // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
    formData.setMethod('get')
    // 配置回调接口
    // formData.addField('notifyUrl', 'http://static.dtns.yunapi.org')
    formData.addField('notifyUrl', typeof g_system_alipay_sdk_notify_url !='undefined' ? g_system_alipay_sdk_notify_url: 'http://static.dtns.yunapi.org/forklist/notify'); // 当支付完成后，支付宝主动向我们的服务器发送回调的地址
    // formData.addField('returnUrl', 'http://static.dtns.yunapi.org/return'); // 当支付完成后，当前页面跳转的地址

    let paySessionId =  await str_filter.randomBytes(16)
    let setPaySIDFlag = await user_redis.set('psid:'+paySessionId,
            user_id+ '|' +obj.obj_id+ '|' +forkComments,60*60*24)
    console.log('setPaySIDFlag:'+setPaySIDFlag)
    // 设置参数
    formData.addField('bizContent', {
      outTradeNo: new Date().valueOf(),
      productCode: 'QUICK_WAP_WAY',
      totalAmount: obj.rmb_price,
      subject: '购买福刻作品',
      body:paySessionId ,
    });
    // 请求接口
    const result = await alipaySdk.exec(
      'alipay.trade.wap.pay',
      {},
      { formData: formData },
    );

    // result 为可以跳转到支付链接的 url
    console.log(result);

    if(forklist_pay_notify_info){
      user_redis.set('forklist_channel:'+obj.obj_id,forklist_pay_notify_info+':'+web3name,60*60*24*3)//3天超时
    }

    return res.json({ret:true,msg:'success',result:result})
}

// pay()

/**
 * 返回退款链接
 * @type {refund}
 */
 window.forklist_pay_c.refund =refund;
async function refund (out_trade_no,refund_amount,out_request_no) {
  const formData = new AlipayFormData()
  // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
  formData.setMethod('get')

  // 设置参数
  formData.addField('bizContent', {
    outTradeNo: "164627465207873815", //商户订单号。订单支付时传入的商户订单号，商家自定义且保证商家系统中唯一。与支付宝交易号 trade_no 不能同时为空。
    //tradeNo: 'trade_no',//支付宝交易号。和商户订单号 out_trade_no 不能同时为空。
    refund_amount: '2',
    out_request_no: "out_request_no", //退款请求号。标识一次退款请求，需要保证在交易号下唯一，如需部分退款，则此参数必传。
  });
  // 请求接口
  const result = await alipaySdk.exec(
    'alipay.trade.refund',
    {},
    { formData: formData },
  );

  // result 为可以跳转到支付链接的 url
  console.log(result);
}

// refund()


/**
 * 当支付完成后，支付宝主动向我们的服务器发送回调的地址
 * @type {notify}
 */
window.forklist_pay_c.notify =notify;
async function notify(req, res) {
    let {trade_status} = str_filter.get_req_data(req);

    console.log("触发付款");
    console.log("支付宝回调接口参数:",req.body);
    console.log("支付宝回调接口参数:"+JSON.stringify(req.body));
    if (trade_status === "TRADE_SUCCESS") {
      let data = req.body // 订单信息
      let psid = data.body
      // ========= 由请求体内的订单信息，在这里进行数据库中订单状态的更改 ============
      //下单接口中提交的body，user_id和obj_id（#作为分隔符号）
      let body = await user_redis.get('psid:'+psid)
      if(!body)
      {
        console.log('[error]notify-check psid:',psid,body,' is failed!')
        res.json(false)
        return 
      }
      let str =  body.split('|')
      if(!req.peer_data_flag &&  str[1])
      {
        let channel_info = await user_redis.get('forklist_channel:'+str[1])
        console.log('notify-channel_info:',channel_info)
        forklist_channel_notify(channel_info)
      }
      let flag = await forklist_c.sbuyNft(str[0],str[1],str[2],"rmb");
      if(flag){
        console.log("支付完成！");
      }else{
        console.log("支付失败！")

      };
    }

    return res.json(true)

}


/**
 * 当支付完成后，当前页面跳转的地址
 * @type {returnSuccess}
 */
 window.forklist_pay_c.returnSuccess =returnSuccess;
 async function returnSuccess(req, res) {
    let {trade_status} = str_filter.get_req_data(req);

    console.log("支付成功");
 
 }






//pc网页支付


async function testpay () {
  
    const formData = new AlipayFormData()
    // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
    formData.setMethod('get')
    // 配置回调接口
    // formData.addField('notifyUrl', 'http://static.dtns.yunapi.org')
    formData.addField('notifyUrl', typeof g_system_alipay_sdk_notify_url !='undefined' ? g_system_alipay_sdk_notify_url: 'http://static.dtns.yunapi.org/notify'); // 当支付完成后，支付宝主动向我们的服务器发送回调的地址
    // formData.addField('returnUrl', 'http://static.dtns.yunapi.org/return'); // 当支付完成后，当前页面跳转的地址

    // 设置参数
    formData.addField('bizContent', {
      outTradeNo: new Date().valueOf(),
      productCode: 'FAST_INSTANT_TRADE_PAY',
      totalAmount: '0.01',
      subject: '购买NFTlist作品',
      body: 'obj.work_name',
    });
    // 请求接口
    const result = await alipaySdk.exec(
      'alipay.trade.page.pay',
      {},
      { formData: formData },
    );

    // result 为可以跳转到支付链接的 url
    console.log(result);

   
}
// testpay ()


async function testrefund () {
  const formData = new AlipayFormData()
  // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
  formData.setMethod('get')

  // 设置参数
  formData.addField('bizContent', {
    outTradeNo: "1637304493434", //商户订单号。订单支付时传入的商户订单号，商家自定义且保证商家系统中唯一。与支付宝交易号 trade_no 不能同时为空。
    //tradeNo: 'trade_no',//支付宝交易号。和商户订单号 out_trade_no 不能同时为空。
    refund_amount: '0.01',
    out_request_no: "out_request_no", //退款请求号。标识一次退款请求，需要保证在交易号下唯一，如需部分退款，则此参数必传。
  });
  // 请求接口
  const result = await alipaySdk.exec(
    'alipay.trade.refund',
    {},
    { formData: formData },
  );

  // result 为可以跳转到支付链接的 url
  console.log(result);
}

// testrefund()







////////////////////////手机h5支付///////////////////////////
/**
 * 返回支付链接
 * @type {h5_pay}
 */
window.forklist_pay_c.h5_pay =h5_pay;
async function h5_pay (req, res) {
  let {user_id, s_id, order_id,forklist_pay_notify_info,web3name,random} = str_filter.get_req_data(req);
  
  if(!order_id) return res.json({ret:false,msg:"order_id error"})

  let s_str = await user_redis.get(ll_config.redis_key+":session:"+user_id+"-"+s_id)
  if(!s_str) return res.json({ret:false,msg:"session error"})

  //防重放攻击
  str = await user_redis.get(ll_config.redis_key+":payOrder:"+order_id+random)
  if(str)
  {
      return res.json({ret: false, msg: "muti call failed"});
  }
  user_redis.set(ll_config.redis_key+":payOrder:"+order_id+random,random,120)

  //判断是否已经支付过。
  str = await user_redis.get(ll_config.redis_key+":order-status:"+order_id)
  if(str=='ok')
  {
      return res.json({ret: false, msg: "order is payed"});
  }
  // user_redis.set(ll_config.redis_key+":order-status:"+order_id,'ok',60*60)

  let assertInfoRet = await rpc_query(ORDER_API_BASE+'/chain/opcode',{token:order_id,begin:0,len:1,opcode:'assert'});
  if(!assertInfoRet || !assertInfoRet.ret) return res.json({ret: false, msg: "order-info is empty"});

  let orderInfo = JSON.parse(JSON.parse(assertInfoRet.list[0].txjson).opval)
  if(orderInfo.state >1) return res.json({ret: false, msg: "order is payed",state: orderInfo.state});
  if(orderInfo.user_id!=user_id) return res.json({ret: false, msg: "it is not your order"});

  //当使用forklist之pay时（请求相应的pay服务节点完成支付）
  if(typeof g_forklist_user!='undefined')
  {
    let goods = orderInfo.goods
    req.obj_id = goods &&goods.length ? goods[0].obj_id:null
    req.obj = goods &&goods.length ? goods[0]:null
    req.order_id = order_id
    await forklist_pay(req,res)
    return 
  }

  //查询用户资料，nft_buyed_id
  // let assertUserInfoRet = await rpc_query(USER_API_BASE+'/chain/opcode',{token:user_id,opcode:'assert',begin:0,len:1})
  // if(!assertUserInfoRet || !assertUserInfoRet.ret) return res.json({ret:false,msg:'user unexists'})
  // let userInfo = JSON.parse(JSON.parse(assertUserInfoRet.list[0].txjson).opval)

  // if(userInfo.nft_buyed_id)
  // {
  //   let isholdRet = await rpc_query(OBJ_API_BASE+'/chain/relations/exists',{token_x:userInfo.nft_buyed_id,token_y:obj_id,opcode:'hold'})
  //   if(isholdRet.ret == true) return res.json({ret:false,msg:'您已经购买了该作品'})
    
  // }


  const formData = new AlipayFormData()
  // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
  // formData.setMethod('get')
  // 配置回调接口
  // formData.addField('notifyUrl', 'http://static.dtns.yunapi.org')
  // formData.addField('notifyUrl', 'http://119.29.19.74:8088/alipay/h5_notify'); // 当支付完成后，支付宝主动向我们的服务器发送回调的地址
  formData.addField('notifyUrl',  typeof g_system_alipay_sdk_h5_notify_url !='undefined' ? g_system_alipay_sdk_h5_notify_url: 'http://static.dtns.yunapi.org/forklist/h5_notify'); // 当支付完成后，支付宝主动向我们的服务器发送回调的地址
  formData.addField('returnUrl', 'http://nftlist.opencom.cn/h5/#/pages/money/paySuccess'); // 当支付完成后，当前页面跳转的地址

  let paySessionId =  await str_filter.randomBytes(16)
  let setPaySIDFlag = await user_redis.set('psid:'+paySessionId,order_id,60*60*24)
  console.log('h5-pay-setPaySIDFlag:'+setPaySIDFlag,paySessionId,order_id)

  // 设置参数
  formData.addField('bizContent', {
    outTradeNo: new Date().valueOf() + str_filter.randomNum(7),
    productCode: 'QUICK_WAP_WAY',
    totalAmount: (typeof g_system_alipay_sdk_test_users!='undefined' ? g_system_alipay_sdk_test_users :['user_CKyBroXPr6Vmetbd']).indexOf(orderInfo.user_id)>=0 ? 0.1:( orderInfo.total_money ? orderInfo.total_money : orderInfo.pay_money ),
    subject:  orderInfo.total_money ? '购买福刻作品' :'会员充值',
    body:paySessionId,
    // quitUrl: "http://www.taobao.com/product/113714.html",
  });
  // 请求接口
  const result = await alipaySdk.exec(
    'alipay.trade.wap.pay',
    {},
    { formData: formData },
  );

  // result 为可以跳转到支付链接的 url
  console.log(result);

  if(forklist_pay_notify_info){
    user_redis.set('forklist_channel:'+order_id,forklist_pay_notify_info+':'+web3name,60*60*24*3)//3天超时
  }

  return res.json({ret:true,msg:'success',result:result})
}

/**
 * h5,当支付完成后，支付宝主动向我们的服务器发送回调的地址
 * @type {h5_notify}
 */
window.forklist_pay_c.h5_notify =h5_notify;
async function h5_notify(req, res) {
  let {trade_status} = str_filter.get_req_data(req);

  console.log("h5触发付款");
  console.log("支付宝回调接口参数:",req.body);
  console.log("支付宝回调接口参数:"+JSON.stringify(req.body));
  if (trade_status === "TRADE_SUCCESS") {
    let data = req.body // 订单信息
    // ========= 由请求体内的订单信息，在这里进行数据库中订单状态的更改 ============
    //下单接口中提交的body，order_id
    let body = data.body
    let order_id = await user_redis.get('psid:'+body)
    if(!order_id)
    {
      console.log('[error]check h5_notify psid:',body,order_id,' is failed!')
      res.json(false)
      return 
    }

    if(order_id)
    {
      let channel_info = await user_redis.get('forklist_channel:'+order_id)
      console.log('notify-channel_info:',channel_info)
      forklist_channel_notify(channel_info)
    }
    //增加对充值业务的订单支付成功notify通知回调处理（会员支付和普通的充值业务）2023-5-13
    if(order_id.indexOf(ORDER_TOKEN_NAME+'_rmb')==0)
    {
      console.log('h5_notify-order_c.s_pay_rmb_recharge_order:',order_id)
      let rechargeRes = await order_c.s_pay_rmb_recharge_order(order_id)
      if(rechargeRes && rechargeRes.ret)
        console.log("h5支付回调成功！",order_id,JSON.stringify(rechargeRes));
      else
        console.log("h5支付回调失败！",order_id,JSON.stringify(rechargeRes));
      return 
    }

    let assertInfoRet = await rpc_query(ORDER_API_BASE+'/chain/opcode',{token:order_id,begin:0,len:1,opcode:'assert'});
    if(!assertInfoRet || !assertInfoRet.ret) return res.json({ret: false, msg: "order-info is empty"});
    let orderInfo = JSON.parse(JSON.parse(assertInfoRet.list[0].txjson).opval)

    let flag = await forklist_c.sbuyNft(orderInfo.user_id, orderInfo.goods[0].obj_id, orderInfo.note, "rmb");
    if(flag){
      console.log("h5支付回调成功！");
    }else{
      console.log("h5支付回调失败！支付成功,更新福刻列表失败")
    };

    //修改订单状态：
    orderInfo.pay_type = data
    orderInfo.state=2;
    orderInfo.payed='ok'
    let saveRet = await rpc_query(ORDER_API_BASE+'/op',{ token_x:ORDER_TOKEN_ROOT, token_y:order_id,opcode:'assert',
        opval:JSON.stringify(orderInfo),extra_data:orderInfo.user_id})
    if(!saveRet || !saveRet.ret) {

      await str_filter.sleep(2000)

      let saveRet = await rpc_query(ORDER_API_BASE+'/op',{ token_x:ORDER_TOKEN_ROOT, token_y:order_id,opcode:'assert',
        opval:JSON.stringify(orderInfo),extra_data:orderInfo.user_id})
      if(!saveRet || !saveRet.ret) {
        console.log("pay successed! and update order-status failed");
      }
    }

  }

  return res.json(true)

}


///////////////////////////h5提现/////////////////////////
/**
 * 提现
 * @type {cashOut}
 */
 window.forklist_pay_c.cashOut =cashOut;
 async function cashOut (req, res) {
   let {user_id, s_id, order_id,random} = str_filter.get_req_data(req);
   
   if(!order_id) return res.json({ret:false,msg:"order_id error"})
 
   let s_str = await user_redis.get(ll_config.redis_key+":session:"+user_id+"-"+s_id)
   if(!s_str) return res.json({ret:false,msg:"session error"})
 
   //防重放攻击
   str = await user_redis.get(ll_config.redis_key+":payOrder:"+order_id+random)
   if(str)
   {
       return res.json({ret: false, msg: "muti call failed"});
   }
   user_redis.set(ll_config.redis_key+":payOrder:"+order_id+random,random,120)
 
   //判断是否已经支付过。
   str = await user_redis.get(ll_config.redis_key+":order-status:"+order_id)
   if(str=='ok')
   {
       return res.json({ret: false, msg: "order is payed"});
   }
   // user_redis.set(ll_config.redis_key+":order-status:"+order_id,'ok',60*60)
 
   let assertInfoRet = await rpc_query(ORDER_API_BASE+'/chain/opcode',{token:order_id,begin:0,len:1,opcode:'assert'});
   if(!assertInfoRet || !assertInfoRet.ret) return res.json({ret: false, msg: "order-info is empty"});
 
   let orderInfo = JSON.parse(JSON.parse(assertInfoRet.list[0].txjson).opval)
   if(orderInfo.state >1) return res.json({ret: false, msg: "order is payed",state: orderInfo.state});
   if(orderInfo.user_id!=user_id) return res.json({ret: false, msg: "it is not your order"});
 
 
 
   //查询用户资料，nft_buyed_id
   // let assertUserInfoRet = await rpc_query(USER_API_BASE+'/chain/opcode',{token:user_id,opcode:'assert',begin:0,len:1})
   // if(!assertUserInfoRet || !assertUserInfoRet.ret) return res.json({ret:false,msg:'user unexists'})
   // let userInfo = JSON.parse(JSON.parse(assertUserInfoRet.list[0].txjson).opval)
 
   // if(userInfo.nft_buyed_id)
   // {
   //   let isholdRet = await rpc_query(OBJ_API_BASE+'/chain/relations/exists',{token_x:userInfo.nft_buyed_id,token_y:obj_id,opcode:'hold'})
   //   if(isholdRet.ret == true) return res.json({ret:false,msg:'您已经购买了该作品'})
     
   // }
 
 
   const formData = new AlipayFormData()
   // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
   // formData.setMethod('get')
  
   // 设置参数
   formData.addField('bizContent', {
     outBizNo: new Date().valueOf() + str_filter.randomNum(7),
     productCode: 'TRANS_ACCOUNT_NO_PWD',
     bizScene: 'DIRECT_TRANSFER',
     transAmount: '',
     orderTitle: '福刻利市提现',
     body: order_id,
   });
   // 请求接口
   const result = await alipaySdk.exec(
     'alipay.fund.trans.uni.transfer',
     {},
     { formData: formData },
   );
 
   // result 为可以跳转到支付链接的 url
   console.log(result);
 
   return res.json({ret:true,msg:'success',result:result})
 }
