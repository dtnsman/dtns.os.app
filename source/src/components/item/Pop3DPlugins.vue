<template>
    <div style="padding: 12px;position: fixed;width: 300px;right:0;bottom: 0px;top: 0px;background-color: #f0f0f0;overflow-y: scroll;">
        <h1>选择3D插件</h1>
        <div style="padding: 5px;position: fixed;top:3px;right: 5px;" @click="exit">隐藏</div>
        <div v-for="(item,index) in plugins" style="margin-bottom: 15px;border-bottom: 1px solid #303030;padding-bottom: 15px;" >
            <span @click.stop="addPlugin(item)" style="color: #08f;"><i>【安装插件】</i>{{ item.xmsg }}（{{item.name}}）</span>
            <x-msg-viewer :item="item.obj" :show_xmsg="false"></x-msg-viewer>
            <button v-if="item.obj.xprice" class="buybtn" @click="buyPlugin(item.obj)">购买头榜（{{item.obj.xprice}}∫）</button>
        </div>
    </div>
</template>
<script>
import XMsgViewer from './XMsgViewer.vue'
export default {
    name: 'Pop3DPlugins',
    components: {
        XMsgViewer
      },
    data() {
        return {
            errMsg:'',
            plugins:[]
        }
    },
    beforeCreate() {
        console.log()
    },
    async created() {
        console.log('into Pop3DPlugins.created')
        // this.restore()
        let params = {user_id:localStorage.user_id,s_id:localStorage.s_id,begin:0,len:10000000}
        let res = await this.$api.network.listXMSG(params)
        if(!res ||!res.ret || !res.list || res.list.length<=0) return this.$toast('列表为空！')
        for(let i=0;i<res.list.length;i++) res.list[i].class='search'
        let list = g_2d_filter_uijson(res.list,'plugin','3d')
        let rlist = []
        for(let i=0;i<list.length;i++)
        {
            let item = list[i]
            if(!item.files || item.files.length<=0) continue
            for(let k=0;k<item.files.length;k++)
            {
                if(item.files[k].name && item.files[k].name.endsWith('.object.xverse.json') )
                {
                    rlist.push({name:item.files[k].name,url:item.files[k].url,xmsg:item.xmsg,obj:item})
                }
            }
        }
        this.plugins = rlist
    },
    async mounted()
    {
        console.log('into Pop3DPlugins.mounted')
    },
    methods: {
        exit()
        {
            if(typeof window.g_hide_3d_plugins_list_func == 'function')
            {
                window.g_hide_3d_plugins_list_func()
            }
        },
        buyPlugin(item)
        {
            localStorage.setItem('poster_type','xmsg')
            localStorage.setItem('poster_value','rels')//类型
            localStorage.setItem('dweb_p_xmsg_info',JSON.stringify( item))
            this.$router.push('/poster/'+item.xmsgid)
        },
        addPlugin(item)
        {
            if(typeof window.g_add_3d_plugin=='function')
            {
                window.g_add_3d_plugin(item)
            }
        }
    }
}
</script>
