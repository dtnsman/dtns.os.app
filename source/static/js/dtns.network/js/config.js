/**
 * Created by dtns.network
 * 初始化配置加载
 */

// const pkg = require('./package.json');
// const str_filter = require("./libs/str_filter")
// const redis_config = require('./redis_config');
// const RedisClient = require('./libs/RedisClient');
async function initConfigDb(name='')
{
    // const SQLDB = require('./libs/SQLDB')
    const sqldb = new SQLDB()

    while(!ifileDb.db)  await str_filter.sleep(100)
    await str_filter.sleep(300)

    let buffer = []
    if(true)//!dbopt || !dbopt.buffer || dbopt.buffer.length==0 )
    {
        console.log('load LX-sqljs-dbBuffer now:')
        //加载缓存
        let item_name = ll_config.roomid+'_last_db'+name
        let bakName = localStorage.getItem(item_name) 
        let dbBuff = await ifileDb.getDataByKey(bakName)
        dbBuff = dbBuff ? dbBuff.data :null
        console.log('LX-db:'+bakName+'----cached-buffer.len:'+(dbBuff?dbBuff.length:0))
        // if(dbopt) dbopt.buffer = dbBuff
        buffer = dbBuff
    }
    
    // let that  = this
    if(typeof onbeforeunload_list =='undefined')
    {
        window.onbeforeunload_list = []
    }
    //window.onbeforeunload = 
    let xfunc = function(){
        console.log('[lx-notice]save db-data before close window')
        let dbname = 'lx'+ll_config.roomid+'.db'
        let data = sqldb.export()
        console.log('save-db-data:',data)
        let bakName = dbname+'.'+new Date().getTime()+'.bak'
        ifileDb.addData({key:bakName,data:data})
        let item_name = ll_config.roomid+'_last_db'+name
        localStorage.setItem(item_name,bakName)
    }
    onbeforeunload_list.push(xfunc)
    window.m_onbeforeunload = function(){
        //遍历
        if(onbeforeunload_list && onbeforeunload_list.length>0)
        for(let i=0;i<onbeforeunload_list.length;i++)
        {
            onbeforeunload_list[i]()
        }
    }
    console.log('onbeforeunload_list-len:'+onbeforeunload_list.length)

    await sqldb.initDB({type:'buffer',buffer:buffer,dbtype:'sqljs'},null,//{type:'file',filepath:'rmb_test.db',dbtype:'sqlite3'},//filepath:'db1.1.data',dbtype:'sqlite3'
                        {type:'sql',path:'leveldb_cache1',vtype:'json'})//'sql'
    // sqldb.initDB(null,'',{type:'level',path:__dirname+'/leveldb-storage',vtype:'json'})
    return sqldb
}
async function configLDB()
{
    const user_redis_ = {}//new RedisClient(redis_config);
    // window.db_cloud = db_cloud;
    window.user_redis = await initConfigDb();
    window.kmmDb      = await initConfigDb('_kmm')
    window.burnlist_redis = user_redis_; //主要用于处理阅兵即焚消息（待后续使用leveldb改进）
    // window.errorLogfile = errorLogfile;
}

// window.ll_config = ll_config;
// configLDB()