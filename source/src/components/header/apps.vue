<template>
    <div>
        <van-popup v-model="showFlag" position="top" :style="{ height: '80%' }"   closeable close-icon="close">
            <div style="margin: 20px 0 0 20px;font-size: 16px;color:#1989fa">头榜标签</div>
            <div style="margin: 20px 0 0 20px;">
                <van-tag plain type="primary" :size="medium"  v-for="(item,index) in labels" :key="index"  @click="gotoXMsg(item)" style="margin: 8px;">{{ item.xmsg }}</van-tag>
            </div>
            <div style="margin: 20px 0 0 20px;font-size: 16px;color:#1989fa">系统应用</div>
            <van-grid>
                <van-grid-item v-for="(item,index) in applist" :key="index" @click="gotoApp(item)" >
                    <img :src="item.ximg" width="50" height="50">
                    <span>{{ item.title }}</span>
                </van-grid-item>
            </van-grid>
            <div style="margin: 20px 0 0 20px;font-size: 16px;color:#1989fa">常用应用</div>
            <van-grid :column-num="4" :center="true" :square="false" :border="true">
                <van-grid-item v-for="(item,index) in apphistory" :key="index" @click="gotoHistory(item)" >
                    <img :src="item.ximg" width="50" height="50">
                    <span>{{ item.xmsg }}</span>
                </van-grid-item>
            </van-grid>
        </van-popup>
    </div>
</template>
<script>
import systemAppsJson from './apps.json'
export default {
    name: 'apps',
    props: {
        showAppsFlag: {
            default: {},
            type: Object
        },
    },
    data() {
        return {
            showFlag:false,
            applist:[],
            apphistory:[],
            labels:[],
        };
    },
    methods: {
        async loadHistory()
        {
            let list = await g_dchatManager.queryAppVisitRecord()
            for(let i=0;i<list.length;i++)
            {
                let item = list[i]
                item.ximg = await this.getXImg(item.xverse_img_dtns_url)
            }
            this.apphistory = list
        },
        async preLoadAppList()
        {
            for(let i=0;i<systemAppsJson.length;i++)
            {
                let item = systemAppsJson[i]
                if(item.logo && item.logo.startsWith('obj_'))
                {
                    //dtns://web3:jobs3d/image/view?filename=obj_imgopenCCShrcczX&img_kind=open
                    item.ximg = await this.getXImg('dtns://web3:'+rpc_client.roomid+'/image/view?filename='+item.logo+'&img_kind=open')
                }else
                    item.ximg = item.logo
            }
            this.applist = systemAppsJson
        },
        async loadAppsDefaultFromNetwork()//亦从网络加载一部分。
        {
            let settingRet = await g_dtnsManager.run('dtns://web3:'+rpc_client.roomid+'/system/apps/default',{})
            console.log('apps.vue-loadAppsDefaultFromNetwork-settingRet:',settingRet)
            let system = []
            if(settingRet && settingRet.ret && settingRet.setting&& settingRet.setting.system && settingRet.setting.system.length>0) 
                system = settingRet.setting.system

            let list = systemAppsJson.concat(system)
            for(let i=0;i<list.length;i++)
            {
                let item = list[i]
                if(item.logo && item.logo.startsWith('obj_')){
                    //dtns://web3:jobs3d/image/view?filename=obj_imgopenCCShrcczX&img_kind=open
                    item.ximg = await this.getXImg('dtns://web3:'+rpc_client.roomid+'/image/view?filename='+item.logo+'&img_kind=open')
                }else
                    item.ximg = item.logo
            }
            console.log('apps.vue--applist:',this.applist,system)
            this.applist = list
        },
        gotoUrl(app)
        {
            console.log('goto-url:',app.url,app)
            if(app.url.indexOf('/poster/')==0)
            localStorage.setItem('poster_type',app.url.replace('/poster/',''))
            this.$router.push(app.url)
        },
        search(app)
        {
            console.log('apps.vue-search:',app)
            // if(app.searchxtype == 'xmsg')
            {
                localStorage.setItem('dweb-search-key',app.searchxtype+"::"+app.searchkey)
                if(typeof this.showAppsFlag.search == 'function')
                {
                    this.showFlag = false
                    this.showAppsFlag.search()
                    return 
                }
                this.$router.push('/dweb')
            }
        },
        gotoXMsg(app)
        {
            localStorage.setItem('dweb-into-xmsg-info',JSON.stringify(app))
            if(typeof this.showAppsFlag.subXMsg == 'function')
            {
                this.showFlag = false
                this.showAppsFlag.subXMsg()
                return 
            }
            this.$router.push('/dweb')
        },
        gotoFile(app)
        {
            g_dchatManager.goFile(app.fileid)
        },
        gotoApp(app)
        {
            if(!app) return false
            switch(app.type)
            {
                case 'url':return this.gotoUrl(app);break;
                case 'search':return this.search(app);break;
                case 'xmsg':return this.gotoXMsg(app);break;
                case 'file':return this.gotoFile(app);break;
            }
        },
        async gotoHistory(item)
        {
            let fileId = item.xverse_src_dtns_url ? item.xverse_src_dtns_url :item.xverse_src_url
            setTimeout(()=>this.showTips(),300)
            let fileItem = await g_dchatManager.queryXFileInfo(fileId)
            console.log('comeXVerse-fileItem-res:',fileItem)
            if(!fileItem) return this.$toast('加载xverse的3D模型源文件失败！')
            try{
                fileItem = JSON.parse(new TextDecoder().decode(fileItem))
            }catch(ex){
                console.log('json-parse-xverse-xfile-failed:'+ex,ex)
                return this.$toast('解析xverse的3D模型源文件失败！')
            }
            ifileDb.deleteDataByKey('from.dtns.3d.creator.json')
            ifileDb.addData({key:'from.dtns.3d.creator.json',data:fileItem})
            imDb.deleteDataByKey('from.dtns.xverse.xmsg')
            imDb.addData({key:'from.dtns.xverse.xmsg',data:item.origin_xmsg})
            localStorage.setItem('xverse-filename',item.xverse_src_url)
            let xitem = JSON.parse(JSON.stringify(item))
            delete xitem.ximg
            let hlist =await g_dchatManager.saveAppVisitRecord(xitem)
            console.log('g_dchatManager.saveAppVisitRecord-hlist:',hlist)
            if(item.isProduct)
            {
                window.g_now_start_3d_player = true
                setTimeout(()=>window.g_now_start_3d_player=false,1000)
                this.$router.push('/3dp')
            }
            else{
                window.g_now_start_3d_editor = true
                setTimeout(()=>window.g_now_start_3d_editor=false,1000)
                this.$router.push('/3de')//'/3d/3d'
            }
        },
        async getXImg(img_id,tips = 'apps-img')
        {
            if(img_id) img_id=img_id.replace('&amp;','&')
            let item = await imageDb.getDataByKey(img_id)
            console.log('apps.vue-'+tips+'-imageDb-getimg-item:',item)
            if(item && item.data)
            {
                return item.data
            }else{
                let data = await queryImg(img_id,{img_kind:'open'})
                console.log('apps.vue-load-from-network-'+tips+'-img:',data)
                if(data && data.data){
                    let ximg ='data:image/png;base64,'+data.data
                    imageDb.addData({img_id,data:ximg })
                    return ximg
                }else{
                    console.log('apps.vue-load-failed-'+tips+'-img:',img_id)
                    return null
                }
            }
        },
    },
    async mounted() {
        console.log('into apps.vue mounted()')
        const that = this
        this.showAppsFlag.updateVal = function(flag)
        {
            console.log('call apps.vue--showAppsFlag.updateVal:',flag)
            that.showFlag = flag
        }
        // await new Promise((resolve)=>setTimeout(resolve,2000))
        await this.preLoadAppList()
        this.labels = await g_dchatManager.queryXMSGLabels()
        await this.loadHistory()
        await this.loadAppsDefaultFromNetwork()
    },
    async created()
    {
        console.log('into apps.vue created()')
        // await this.loadHistory()
    },
    async activated(){
        console.log('into apps.vue activated()')
        this.labels = await g_dchatManager.queryXMSGLabels()
        await this.loadHistory()
        await this.loadAppsDefaultFromNetwork()
    }
}
</script>
