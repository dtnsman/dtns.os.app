<template>
    <div>
    <div class="app-header">
      <span @click="back"> ❮返回 </span> &nbsp;
      <template v-if="isLoading"> Loading... </template>
      <template v-else><span>{{ title }}</span>
        <label class="right">
          <DXIBOPBanner v-if="this.dxib" :dxib="dxib" style="width: 150px;height: auto;"></DXIBOPBanner>
          <span @click="createHtml">HTML</span>
          <span @click="edit">编辑</span>
          <span @click="copyFile">复制</span>
          <span @click="download">下载</span>
        </label>
      </template>
    </div>
  
    <div class="app-content" style="position:fixed;z-index:99;overflow-y:scroll;top:53px;bottom:0;left:0;right:0;">
        <!-- <vue-markdown :source="src"/> -->
        <div id="editor-show" class="markdown-body" v-html="mhtml" ></div>
    </div>
    </div>
  </template>
  
  <script>
  import DXIBOPBanner from '../../../components/item/DXIBOPBanner.vue'
  export default {
    name:'mdViewer',
    components: {
      DXIBOPBanner
    },
    data() {
      return {
        isLoading: true,
        page: null,
        pageCount: 1,
        src:null,
        scale:5,
        rotation:0,
        mhtml:'',
       //   'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
        showAllPages: true,
        title:'',
        vtips:null,//videoTipsJson,
        fullWidth:window.innerWidth,
        fileId:'',
        show_vtips:false,
        dxib:null,
        poplangs: [],
      }
    },
    watch: {
      showAllPages() {
        this.page = this.showAllPages ? null : 1
      }
    },
    beforeRouteLeave(to,from,next){
      console.log('into mdViewer beforeRouteLeave')
      this.exit()
      
      next();
    },
    async created(){
      this.converter = new showdown.Converter()
      this.updateActionInfo()
    },
    methods: {
      back(){
        // this.exit()
        this.$router.go(-1)
      },
      exit()
      {
        if(this.dxibManager)
        {
          this.dxibManager.exit()//保存saveState，方便下次打开时继续保持history和now_pos等
          this.dxibManager = null
          this.dxib = null
          console.log('imageViewer call dxibManager.exit()')
        }
      },
      async updateActionInfo()
      {
        console.log('into updateActionInfo')
        let This = this
        if(window.g_now_action_info)
        {
          this.actionInfo = window.g_now_action_info.actionInfo
          this.dxibManager = window.g_now_action_info.context
          //更新之下,不用修改dxib的指向
          //initDXIBRuntime:this.initDXIBRuntime
          this.dxib = this.dxib?this.dxib: {actionInfo:this.actionInfo,context:this.dxibManager,viewThis:this}
          this.dxib.actionInfo = this.actionInfo
          // window.g_now_action_info = null

          console.log('g_now_action_info:',this.actionInfo,this.dxibManager,this.actionInfo.ended)

          this.dxibName = !this.dxibManager.getDXIBObj() ?  '查看文本': this.dxibManager.getDXIBObj().xmsg ? this.dxibManager.getDXIBObj().xmsg : this.dxibManager.getDXIBObj().name
          this.title = this.actionInfo.xmsg ? this.actionInfo.xmsg : this.dxibName +'-'+ this.actionInfo.name //this.dxibManager.getDXIBObj() ?this.dxibManager.getDXIBObj().xmsg: 'dxib视频播放'
          this.filedata= await this.dxibManager.loadActionResFile(this.actionInfo)
          
          let utf8decoder = new TextDecoder()
          this.src  = utf8decoder.decode(this.filedata)
          this.mhtml= this.converter.makeHtml(this.src)

          this.isLoading =false
        }
        else{
          let params = {filename:localStorage.getItem('md-filename')}

          let file_url = 'dtns://web3:'+rpc_client.roomid+'/file?filename='+params.filename
          let cachedFileItem = await ifileDb.getDataByKey(file_url)
          // let cachedFileItem = await ifileDb.getDataByKey(params.filename)//await ifileDb.getDataByKey(params.filename)
          console.log('download fast by ifileDb:',cachedFileItem)
          if(!cachedFileItem ){
              this.isLoading = false
              return this.$toast.fail('查看失败:MD文件不存在');
          } 
          // this.src = '\n## Build Setup\nxxxxxxxxxxxxxxxxxx\n'+ cachedFileItem.data.filedata
          let utf8decoder = new TextDecoder()
          this.src  = utf8decoder.decode(cachedFileItem.data.filedata)
          this.mhtml= this.converter.makeHtml(this.src)
          this.title = cachedFileItem.data.filename
          this.filedata=cachedFileItem.data.filedata
          this.isLoading = false
        }
      },
      createHtml() //2024-5-20新增（与头榜编辑器的功能类似，支持生成HTML，以便制作静态html站点，方便SEO）
      {
          let title = this.title
          // while(title && title[0] == '#') title = title.substring(1,title.length)
          // if(!title || title.length<=0) title = '头榜-'+this.share_xmsg.xmsgid
          // console.log('createHtml-title:',title,this.share_xmsg,html)
          let filename = title+'.html'
          let html = this.converter.makeHtml(this.src)
          const encoder = new TextEncoder();
          let u8arr = encoder.encode(html)
          rpc_client.downloadFileByBinary(filename,u8arr)
      },
      edit()
      {
        imDb.addData({key:'markdown_text',data:this.src})
        localStorage.setItem('poster_type','markdown')
        localStorage.setItem('poster_value','normal')//类型
        // if(this.now_label_type) localStorage.setItem('from_label_type',this.now_label_type)
        this.$router.push('/poster/markdown')
      },
      copyFile()
      {
        if(this.dxibManager)
        {
          let dxibObj = this.dxibManager.getDXIBObj()
          if(!dxibObj || !dxibObj.dxib_url) return this.$toast('无法复制文件，dxib对象为空或资源链接为空！！')
          window.g_folder_copy_data = {url:dxibObj.dxib_url}
          this.$toast('复制成功，请切换到文件夹目录粘贴！')
        }else{
          if(!localStorage.getItem('md-filename')) return this.$toast('无法复制文件，该文件URL为空！')
          window.g_folder_copy_data = {url:localStorage.getItem('md-filename')}
          this.$toast('复制成功，请切换到文件夹目录粘贴！')
        }
      },
      download(){
        if(this.dxibManager)
        {
          // let dxibObj = this.dxibManager.getDXIBObj()
          let fileData = this.dxibManager.getDXIBFileData()
          if(!fileData) return this.$toast('无法下载文件，dxib对象为空或资源文件为空！！')
          rpc_client.downloadFileByBinary(this.title+'.dxib',fileData)
        }
        else 
          rpc_client.downloadFileByBinary(this.title,this.filedata)
      },
      rotationAdd()
      {
        this.rotation += 90
      },
      rotationSub()
      {
        if(this.rotation>=90)
            this.rotation -= 90
        else
            this.rotation = 0
      },
      scaleAdd()
      {
        this.scale++
      },
      scaleSub(){
        if(this.scale>=2) this.scale -- 
        else this.scale =1
      },
      
      rendered() {
        this.isLoading  =false
        console.log("渲染完成")
        this.$toast('渲染完成')
        },
        errorHandler() {
            this.isLoading  =false
            console.log("渲染失败")
            this.$toast('渲染失败')
        }
    }
  }
  </script>
  <style>
body {
  margin: 0;
  padding: 0;
  background-color: #ccc;
}

.vue-pdf-embed > div {
  margin-bottom: 8px;
  box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.1);
}

.app-header {
  padding: 16px;
  box-shadow: 0 2px 8px 4px rgba(0, 0, 0, 0.1);
  background-color: #555;
  color: #ddd;
}

.app-content {
  padding: 24px 16px;
}

.right {
  float: right;
  display: flex;
}
.right span{display: flex;margin-left:5px;margin-right: 5px;}
.markdown-body img{max-width: 100%;}
</style>
<style scoped rc="../../../static/js/vue-markdown/prism.min.css" >
</style>
<style scoped rc="../../../static/js/vue-markdown/katex.min.css" >
</style>

