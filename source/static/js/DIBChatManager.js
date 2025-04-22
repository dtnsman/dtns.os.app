class DIBChatManager
{
    constructor(contextView)
    {
        this.history = null
        this.session_id = null
        this.history = null
        this.contextView = contextView

        let This = this
        window.g_goAgent = async function(fileid)
        {
            return await This.goAgent(fileid)
        }
       
    }
    async new(label_type,session_id = null)
    {
        let ret = null;
        //如session_id不为空，则代表要恢复智体管家（包含了历史纪录）
        if(session_id)
        {
          ret = await g_dtnsManager.run('dtns://web3:'+rpc_client.roomid+'/rtibchat/session/recover',{session_id})
          if(!ret || !ret.ret) return this.contextView.$toast('恢复智体管家失败，原因：'+(ret ? ret.msg:'未知网络原因'))
        }
        //创建新的智体管家
        else
        {
          ret = await g_dtnsManager.run('dtns://web3:'+rpc_client.roomid+'/rtibchat/manager/new',{label_type})
          if(!ret || !ret.ret) return this.contextView.$toast('创建智体管家失败，原因：'+(ret ? ret.msg:'未知网络原因'))
        }
       //如有旧会话先关闭
        if(this.contextView.session_id && this.contextView.session_id != ret.session_id)
        {
            g_dtnsManager.run('dtns://web3:'+rpc_client.roomid+'/rtibchat/session/chat/stop',{session_id:this.contextView.session_id})
            //并且保存
            g_dtnsManager.run('dtns://web3:'+rpc_client.roomid+'/rtibchat/session/save',{session_id:this.contextView.session_id})
            this.contextView.chatRecord = [] //2025-2-26新增
        }  
        if(!ret.session_id) return this.contextView.$toast('进入智体管家，但会话返回的session_id为空！')
        this.session_id = this.contextView.session_id =  ret.session_id
        this.history = this.contextView.history = ret.history
        let history = this.history
        let ibres = {"ret":true,"msg":"success","txid":"txid_9WSWbtWMmKpRfAtq",
            "token":"msg_chat02GFpM86ouge",
            "create_time_i":1684897079,
            "create_time":"2023-05-24 10:57",
            "msg_obj":
            {"msgid":"msg_msgFe19LvGASNGWr",
            "msg":"","type":"text",
            "time_i":1684897079},
            "msg_info":{"type":"text",
            "msg":"",
            "time_i":parseInt(Date.now()/1000),"time":this.GetDateTimeFormat(parseInt(Date.now()/1000)),
            "from":"user","to":"ib",
            "body":null,"is_encrypted":false,"encrypt_method":"aes256",
            "status":0,"user_id":"user",
            "msgid":"msg_msgFe19LvGASNGWr"},"height":101,
            "msgid":"msg_msgFe19LvGASNGWr"}
        let res = ibres
        res.msg_info.from="ib"
        res.msg_info.user_id = res.msg_info.from
        const converter = new showdown.Converter()
        for(let i=0;i<history.length;i++)
        {
            let ses = history[i]
            let talkMsgInfo = Object.assign({}, res.msg_info)
            talkMsgInfo.from = ses.role == 'assistant' ? 'ib' : 'user'
            talkMsgInfo.user_id= talkMsgInfo.from
            let max_width = window.screen.width - 100
            //if( talkMsgInfo.from == 'ib') 
            //处理image_url的消息
            if(ses.content.length == 2 && ses.content[0].type == 'text')
            {
                let tmpContent = ses.content[0].text +'![img]('+ses.content[1].image_url+')'
                talkMsgInfo.origin_msg = tmpContent
                talkMsgInfo.msg = converter.makeHtml(tmpContent).replaceAll('<img','<img style="max-width:'+max_width+'px" ')
            }
            else
            { 
                talkMsgInfo.origin_msg = ses.content
                talkMsgInfo.msg = converter.makeHtml(ses.content).replaceAll('<img','<img style="max-width:'+max_width+'px" ')
            }
            //else talkMsgInfo.msg = ses.content
            this.contextView.websocketonmessage(talkMsgInfo,true,true)
            if(i==history.length-1 && ses.model)
            {
                this.contextView.model = ses.model
                this.contextView.chatText = '智体管家'+'('+this.contextView.model+')'
            }
        }
        setTimeout(()=>this.contextView.poplangAgent = null,1000)
        // this.contextView.poplangAgent = null //2025-3-27
        this.contextView.$toast('你当前对话的是智体管家！')
        return true
    }
    //退出
    async back()
    {
        //if(!(this.session_id && this.history))
        {
            return await this.new(null,this.session_id)
        }
    }
    async goAgent(fileid)
    {
        console.log('goAgent:',fileid)
        if(!fileid) return this.contextView.$toast('参数（智体应用的文件ID）不能为空！')
        //判断是否是分享来的会话历史文件
        let session_file_id = fileid
        if(session_file_id)
        {
          let params = {filename:session_file_id}
          
          //2025-3-26，参数会用 file_id加速recover-history（不传递history——避免image_url是base64图片，上传参数过大导致超时30s）
          let ret = session_file_id.indexOf('folder') >0 ? 
             await g_dtnsManager.run('dtns://web3:'+rpc_client.roomid+'/rtkown/chat',{folder_id:params.filename}) : 
             await g_dtnsManager.run('dtns://web3:'+rpc_client.roomid+'/rtibchat/session/recover',{file_id:params.filename})//{history:JSON.stringify(sessionInfo.history)})
          console.log('goAgent-get-session-ret:',ret)
          if(!ret || !ret.ret) return this.contextView.$toast('恢复会话失败！原因：'+(ret ? ret.msg:'未知网络原因'))
          //如有旧会话先关闭
          if(this.contextView.session_id)
          {
            g_dtnsManager.run('dtns://web3:'+rpc_client.roomid+'/rtibchat/session/chat/stop',{session_id:this.contextView.session_id})
            //并且保存
            g_dtnsManager.run('dtns://web3:'+rpc_client.roomid+'/rtibchat/session/save',{session_id:this.contextView.session_id})
            this.contextView.chatRecord = [] //2025-2-26新增
          }  
          this.contextView.session_id = ret.session_id

          let history = null
          if(!ret.history && session_file_id.indexOf('folder') <0)
          {
            let file_url = 'dtns://web3:'+rpc_client.roomid+'/file?filename='+params.filename
            let cachedFileItem = await ifileDb.getDataByKey(file_url)
            let iCnt = 0
            while(!cachedFileItem && iCnt++ <=100) 
            {
              await rpc_client.sleep(300)
              cachedFileItem = await ifileDb.getDataByKey(file_url) 
              console.log('goAgent wait for file-download, iCnt:',iCnt)
            }
            // let cachedFileItem = await ifileDb.getDataByKey(params.filename)//await ifileDb.getDataByKey(params.filename)
            console.log('download fast by ifileDb:',cachedFileItem)
            if(!cachedFileItem ){
              return this.contextView.$toast('打开智体聊会话文件失败，原因：文件不存在')
            } 
            // this.src = '\n## Build Setup\nxxxxxxxxxxxxxxxxxx\n'+ cachedFileItem.data.filedata
            let utf8decoder = new TextDecoder()
            let text = utf8decoder.decode(cachedFileItem.data.filedata)
            console.log('agent-text:',text)
            let sessionInfo = null
            try{
              sessionInfo = JSON.parse(text)
            }catch(ex){
              return this.contextView.$toast('智体聊会话文件内容非JSON')
            }
            if(!sessionInfo.session_id || !sessionInfo.history || sessionInfo.history.length<=0 || !sessionInfo.history[0].role) return this.contextView.$toast('错误：智体聊会话文件无会话纪录！')
            history = sessionInfo.history 
          }
          else{
            history = ret.history
          }
          console.log('goAgent-history:',history)
          let ibres = {"ret":true,"msg":"success","txid":"txid_9WSWbtWMmKpRfAtq",
              "token":"msg_chat02GFpM86ouge",
              "create_time_i":1684897079,
              "create_time":"2023-05-24 10:57",
              "msg_obj":
                {"msgid":"msg_msgFe19LvGASNGWr",
                "msg":"","type":"text",
                "time_i":1684897079},
              "msg_info":{"type":"text",
                "msg":"",
                "time_i":parseInt(Date.now()/1000),"time":this.GetDateTimeFormat(parseInt(Date.now()/1000)),
                "from":"user","to":"ib",
                "body":null,"is_encrypted":false,"encrypt_method":"aes256",
                "status":0,"user_id":"user",
                "msgid":"msg_msgFe19LvGASNGWr"},"height":101,
                "msgid":"msg_msgFe19LvGASNGWr"}
          let res = ibres
          res.msg_info.from="ib"
          res.msg_info.user_id = res.msg_info.from
          const converter = new showdown.Converter()
          for(let i=0;i<history.length;i++)
          {
            let ses = history[i]
            let talkMsgInfo = Object.assign({}, res.msg_info)
            talkMsgInfo.from = ses.role == 'assistant' ? 'ib' : 'user'
            talkMsgInfo.user_id= talkMsgInfo.from
            let max_width = window.screen.width - 100
            //if( talkMsgInfo.from == 'ib') 
            //处理image_url的消息
            if(ses.content.length == 2 && ses.content[0].type == 'text')
            {
              let tmpContent = ses.content[0].text +'![img]('+ses.content[1].image_url+')'
              talkMsgInfo.origin_msg = tmpContent
              talkMsgInfo.msg = converter.makeHtml(tmpContent).replaceAll('<img','<img style="max-width:'+max_width+'px" ')
            }
            else
            { 
              talkMsgInfo.origin_msg = ses.content
              talkMsgInfo.msg = converter.makeHtml(ses.content).replaceAll('<img','<img style="max-width:'+max_width+'px" ')
            }
            //else talkMsgInfo.msg = ses.content
            this.contextView.websocketonmessage(talkMsgInfo,true,true)
            if(i==history.length-1 && ses.model)
            {
                this.contextView.model = ses.model
                this.contextView.chatText = '智体应用'+'('+this.contextView.model+')'
            }
          }
          setTimeout(()=>this.contextView.poplangAgent = null,1000)
          // this.contextView.poplangAgent = null //2025-3-27
          this.contextView.$toast('成功打开智体应用！')
          return true
        }
        return false
    }
    GetDateTimeFormat(timestr)
    {
        let data = new Date();;
        if (timestr) {
            data = new Date(timestr * 1000);
        }
        let t = data.getFullYear() + "-" + (data.getMonth() < 9 ? '0' + (data.getMonth() + 1) : (data.getMonth() + 1))
            + "-" + (data.getDate() < 10 ? '0' + data.getDate() : data.getDate()) +
            " "+(data.getHours() < 10 ? '0' + data.getHours() : data.getHours()) +":"
            +(data.getMinutes() < 10 ? '0' + data.getMinutes() : data.getMinutes()) //+"."+data.getSeconds();

        return t;
    }
}