<template>
    <div style="height: 0px;width: 0px;">
        <Pop3DPlugins v-if="show3DPluginFlag"></Pop3DPlugins>
    </div>
</template>
<script>
import Pop3DPlugins from './Pop3DPlugins.vue'
export default {
    name: 'PopInit',
    components: {
        Pop3DPlugins
      },
    data() {
        return {
            errMsg:'',
            show3DPluginFlag:false,
        }
    },
    beforeCreate() {
        console.log('canvasStyleData:' + JSON.stringify(this.canvasStyleData))
    },
    async created() {
        console.log('into PopInit.created')
        // this.restore()
    },
    async mounted()
    {
        console.log('into PopInit.mounted')
        while(typeof g_dchatManager=='undefined')
        {
            console.log('PopInit wait g_dchatManager is ok')
            await rpc_client.sleep(300)
        }
        //
        console.log('call g_dchatManager.setViewContext')
        g_dchatManager.setViewContext(this)

        const This = this
        window.g_show_3d_plugins_list_func = function()
        {
            This.show3DPluginFlag = true
        }
        window.g_hide_3d_plugins_list_func = function()
        {
            This.show3DPluginFlag = false
        }
    },
}
</script>
