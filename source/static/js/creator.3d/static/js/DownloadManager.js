class DownloadManager{
    constructor()
    {
        this.downMap = new Map()
        this.downCallBacks = new Map()
    }
    isDownloading(dtnsUrl){
        //先从内存中判断
        let downloadManagerInfo = this.downMap.get(dtnsUrl) // await iFileDb.getDataByKey('')
        return downloadManagerInfo ? downloadManagerInfo.down_flag :false
    }
    //得到downloadManagerInfo，以便进行查询当前下载进度等、下载速率等
    async getDownloadManagerInfo(dtnsUrl)
    {
        let downloadManagerInfo = this.downMap.get(dtnsUrl) // await iFileDb.getDataByKey('')
        if(!downloadManagerInfo){
            let info = await ifileDb.getDataByKey('download-dtns-url:'+dtnsUrl)
            if(info && info.data){
                downloadManagerInfo = info.data
            }else{
                downloadManagerInfo = null
            }
        }
        return downloadManagerInfo
    }
    //一键下载
    async download(dtnsUrl,params,callback)
    {
        if(this.is_locked) return false
        this.is_locked = true
        //先从内存中判断
        let downloadManagerInfo = this.downMap.get(dtnsUrl) // await iFileDb.getDataByKey('')
        if(!downloadManagerInfo){
            let info = await ifileDb.getDataByKey('download-dtns-url:'+dtnsUrl)
            if(info && info.data){
                downloadManagerInfo = info.data
            }
        }
        this.is_locked = false

        console.log('query-download-list-downloadManagerInfo:',downloadManagerInfo)
        let first_time_flag = false 
        if(!downloadManagerInfo){ //首次
            downloadManagerInfo = {down_flag: true} //首次初始化下载 
            this.downMap.set(dtnsUrl,downloadManagerInfo)
            this.downCallBacks.set(dtnsUrl,[callback])
            first_time_flag = true
        }else{
            //添加回调事件，方便回调
            let callbackList = this.downCallBacks.get(dtnsUrl)
            if(callbackList) callbackList.push(callback)
            else{
                this.downCallBacks.set(dtnsUrl,[callback])
            }
        }

        let This = this
        // let countID = -1
        
        let func = function(data){
            let callbackList = This.downCallBacks.get(dtnsUrl)
            console.log('[t]download-func---callbackList:',callbackList,dtnsUrl)
            if(!callbackList || !callbackList.length) return 
            let result = data && data.data ? data:null
            for(let i=0;i<callbackList.length;i++)
            {
                if(typeof callbackList[i] == 'function'){
                    callbackList[i](result)
                }
            }
            This.downMap.delete(dtnsUrl)
            This.downCallBacks.delete(dtnsUrl)
            ifileDb.deleteDataByKey('download-dtns-url:'+dtnsUrl)
            // clearInterval(countID)
        }
        //非首次仅须Push callback to calbacklist
        if(!first_time_flag && downloadManagerInfo.down_flag){
            let callbackList = this.downCallBacks.get(dtnsUrl)
            console.log('first_time_flag is first, callbackList:',callbackList)
            if(callbackList) callbackList.push(callback)
            return true
        }
        //首次则请求网络
        let dtnsInfo = await g_dtnsManager.nslookup(dtnsUrl)
        if(!dtnsInfo || !dtnsInfo.web3name) return false
        let client = await g_dtnsManager.connect('dtns://web3:'+dtnsInfo.web3name)
        if(!client){
            func({ret:false,msg:'[rpc-client]download-manager: network-error!'})
            return false
        }
        // countID =  setInterval(()=>{
        //     let radio = client.downloadRadio(downloadManagerInfo)
        //     client.downloadCount(downloadManagerInfo)
        //     console.log('download-radio:'+radio,dtnsUrl,downloadManagerInfo)
        // },1000) //1秒统计一下速率
        let tmpParams = Object.assign({},dtnsInfo.params,params)
        client.download(tmpParams,func,downloadManagerInfo,async function(){
            // setTimeout(async ()=>{
                let stopFlag = await This.stop(dtnsUrl) //依旧保存最后的下载slice结果（如有）
                console.log('download-stop-called:'+stopFlag,dtnsUrl)
            // },3000)
            // clearInterval(countID)
        })
        //得到下载的返回结果
        return true
    }
    //暂停下载 
    async stop(dtnsUrl)
    {
        let downloadManagerInfo = await this.getDownloadManagerInfo(dtnsUrl)
        console.log('download-manager-stop:',dtnsUrl,downloadManagerInfo)
        if(!downloadManagerInfo) return false
        downloadManagerInfo.down_flag = false
        await ifileDb.deleteDataByKey('download-dtns-url:'+dtnsUrl) //先删除后新增
        await ifileDb.addData({key:'download-dtns-url:'+dtnsUrl,data:downloadManagerInfo})
        return true;
    }
}