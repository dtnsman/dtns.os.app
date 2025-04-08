<template>
  <div class="box" style="position:relative;overflow-x:hidden;" ref="listScroll">
    <header class="topbar" style="border-bottom:1px solid #eee; height:46px; position:fixed; top:0; background-color:#fff; margin:0 auto; align:center; z-index:990;">
      <div style="margin:0 auto;height:46px;overflow: hidden;text-overflow: ellipsis;width:95%;" align="center">
        <svg v-if="imgStatus == true" style="width:17px;height:17px;top:13px; position:absolute;" t="1590975627508" class="icon" viewBox="0 0 1026 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5496" width="17" height="17"><path d="M514.752467 0.007392a511.992334 511.992334 0 1 0 509.254407 511.992334A511.992334 511.992334 0 0 0 514.752467 0.007392z m375.095988 528.419896A752.929903 752.929903 0 0 1 659.862593 574.972045a301.171961 301.171961 0 0 1-101.303296-16.427561c-8.213781 128.682565-161.537688 276.530619-183.441103 295.696107a21.903415 21.903415 0 0 1-19.165489 5.475854 30.117196 30.117196 0 0 1-19.165488-8.213781 27.379269 27.379269 0 0 1 2.737927-38.330977c54.758538-52.020611 188.916957-199.868665 161.537688-290.220253-71.1861-62.972319-262.840984-5.475854-331.289157 21.903415a27.379269 27.379269 0 0 1-35.59305-16.427561 24.641342 24.641342 0 0 1 13.689635-35.59305c24.641342-8.213781 224.510007-84.875734 347.716718-38.330977 8.213781-128.682565 147.848054-268.316838 167.013542-287.482327a30.117196 30.117196 0 0 1 38.330977 2.737927 27.379269 27.379269 0 0 1 0 38.330977c-49.282685 49.282685-169.751469 191.654884-150.58598 282.006473 73.924027 60.234392 254.627203 10.951708 320.337449-13.689635a27.379269 27.379269 0 1 1 19.165489 52.020612z" fill="#1afa29" p-id="5497"></path></svg>
        <svg v-if="imgStatus == false" style="width:17px;height:17px;top:13px; position:absolute;" t="1590976113043" class="icon" viewBox="0 0 1026 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5679" width="17" height="17"><path d="M514.752467 0.007392a511.992334 511.992334 0 1 0 509.254407 511.992334A511.992334 511.992334 0 0 0 514.752467 0.007392z m375.095988 528.419896A752.929903 752.929903 0 0 1 659.862593 574.972045a301.171961 301.171961 0 0 1-101.303296-16.427561c-8.213781 128.682565-161.537688 276.530619-183.441103 295.696107a21.903415 21.903415 0 0 1-19.165489 5.475854 30.117196 30.117196 0 0 1-19.165488-8.213781 27.379269 27.379269 0 0 1 2.737927-38.330977c54.758538-52.020611 188.916957-199.868665 161.537688-290.220253-71.1861-62.972319-262.840984-5.475854-331.289157 21.903415a27.379269 27.379269 0 0 1-35.59305-16.427561 24.641342 24.641342 0 0 1 13.689635-35.59305c24.641342-10.951708 224.510007-84.875734 347.716718-38.330977 8.213781-128.682565 147.848054-268.316838 167.013542-287.482327a30.117196 30.117196 0 0 1 38.330977 2.737927 27.379269 27.379269 0 0 1 0 38.330977c-49.282685 49.282685-169.751469 191.654884-150.58598 282.006473 73.924027 60.234392 254.627203 10.951708 320.337449-13.689635a27.379269 27.379269 0 1 1 19.165489 52.020612z" fill="#F00945" p-id="5680"></path></svg>
        <span @click.stop="onRefresh" style="font-size:16px; line-height:43px;width:95%;overflow:hidden;height: 43px;">{{ title }}</span>
      </div>
      <ib3status style="position:absolute; top:12px; left:15px;z-index:999" />
      <div style="position:absolute; top:14px; right:15px;z-index:99">
        <!-- <x @click="searchNow" style="color:#e0e0e0">🔍</x> &nbsp;
        <i @click="createHtml" style="color:#e0e0e0">H</i> &nbsp; -->
        <van-icon name="search" slot="right" @click="searchNow" style="margin-right:8px"/>
        <van-icon name="down" slot="right" @click="createHtml" style="margin-right:8px"/>
        <van-icon @click="showApps" name="apps-o" slot="right" style="margin-right:8px"/>
        <van-icon name="plus" slot="right" @click="sendXMsg" />
      </div>
      <apps :showAppsFlag="showAppsFlag"></apps>
    </header>
    
    <div ref="scrollEle" class="home" style="position:fixed;overflow-y:scroll;top:50px;bottom:50px;left:0;right:0;" >
      <!-- <loading v-show="topIsLoading"></loading> -->
      <!-- immediate-check="false" direction="up" v-model="isLoading"  :finished="finished"  finished-text="没有更多了" @load="onLoad" @refresh="onRefresh" -->
      <comment-window
        v-if="showCommentWindow"
        @closeCommentWindow="closeCommentWindow"></comment-window>
      <van-pull-refresh
        v-model="isLoading"
        :success-text="textNews"
        @refresh="onRefresh">
      <van-list ref="contentListEL" direction="down" immediate-check="false"  v-model="isLoading"  :finished="finished" @load="getContent">
      <!-- <picture-viewer v-show="switchPicViewer"></picture-viewer> -->
  
  
      <div class="content-tip no-text-select" v-show="noNew">
        <span>{{ pleaseWaitNewsStr }}</span>
      </div>
      <div class="top-tip" v-if="hasTopTip">
        <a class="to-top-tip">
          <i class="iconfont_dweb icon-hot"></i>
          <p class="top-tip-content txt-cut">{{topTip.text}}<i class="iconfont_dweb icon-right-arrow"></i></p>
        </a>
      </div>
      <div class="card" v-for="(item,index) in weiboContent">
        <div class="card-main">
          <header class="card-header">
            <!-- <div class="header-bg" v-if="typeof item.mblog.cardid!=='undefined'"></div> -->
            <!-- :href="item.mblog.user.profile_url"-->
            <!-- <a class="avatar"> -->
              <!-- border-around-1px-->
              <!-- <div class="avatar-wrapper"> -->
                <!-- <LogoItem :logo="item.url" style="width:72px;height:72px"  @click="intoUserSubXMSG(item,true)"></LogoItem> -->
                <!-- <img class="avatar-img" v-lzlogo="item.url">  -->
                <!-- <img class="avatar-img" :src="item.mblog.user.profile_image_url"> -->
                <!-- <img @click="chat(item.user_id)" v-lazy="item.url" alt="" style="width:40px; height:40px; border-radius:6px; float:left; margin-left:15px;margin-top:5px;"></img> -->
                <!-- <i class="iconfont_dweb" :class="calculateVerifiedClass(item.mblog.user.verified_type)"></i> -->
              <!-- </div>
            </a> -->
            <LogoItem :logo="item.url" style="width:42px;height:42px;margin:5px"  @click="intoUserSubXMSG(item,true)"></LogoItem>
            <div class="user-info" @click="intoUserSubXMSG(item,true)">
              <!-- :href="item.mblog.user.profile_url"  -->
              <a class="user-name txt-l txt-cut">{{item.user_name}}</a>
              <div class="publish-data txt-xs">
                <span class="publish-created-at">{{item.time_str}}</span>
                <!-- <span class="publish-source">来自{{item.mblog.source}}</span> -->
              </div>
            </div>
            <a class="card-operate" @click="copyXMSG(item)">
              <i class="iconfont_dweb icon-down-arrow">...</i>
            </a>
          </header>
          <section class="card-body">
            <p class="default-content" v-html="item.xmsg" @click="intoSubXMSG(item)"></p>
            <x-msg-viewer :item="item" :show_xmsg="false" style="width:100%"></x-msg-viewer>
            <button v-if="item.xprice" class="buybtn" @click="openCommentWindow(item,'rels')">购买头榜（{{item.xprice}}∫）</button>
            <p v-if="item.xbuyed" class="buyedp" style="color:red;line-height:50px;font-size:18px">已购该头榜（花费{{item.xbuyed_xprice}}∫）</p>
            <div class="retweet" v-if="item.p_xmsgid && item.p_xmsg_info">
              <p>
                <!-- :href="item.mblog.retweeted_status.user.profile_url" -->
                <a class="retweet-user">@{{item.p_xmsg_info.user_name}}</a>：<span v-html="item.p_xmsg_info.xmsg"></span>
              </p>
              <x-msg-viewer :item="item.p_xmsg_info" :show_xmsg="false" style="width:100%"></x-msg-viewer>
              <button v-if="item.p_xmsg_info.xprice" class="buybtn" @click="openCommentWindow(item.p_xmsg_info,'rels')">购买头榜（{{item.p_xmsg_info.xprice}}∫）</button>
              <p v-if="item.p_xmsg_info.xbuyed" class="buyedp" style="color:red;line-height:50px;font-size:18px">已购该头榜（花费{{item.p_xmsg_info.xbuyed_xprice}}∫）</p>
            </div>
          </section>
        </div>
        <!-- v-if="index%5==2"-->
        <footer class="card-footer border-1px border-top-1px txt-s no-text-select">
          <a class="forward"
                @click.prevent="openCommentWindow(item,'retw')">
            <table border="0px" class="dweb_table">
            <tr>
            <td><div class="dicon_retw"></div></td><td style="vertical-align: top;"><div class="dweb_text">{{item.retw_cnt}}</div></td>
            </tr>
            </table>
          </a>
          <i class="separate-line"></i>
          <a class="comment"
               @click.prevent="openCommentWindow(item,'reply')">
            <table border="0px" class="dweb_table">
            <tr>
            <td><div class="dicon_reply"></div></td><td style="vertical-align: top;"><div class="dweb_text">{{item.reply_cnt}}</div></td>
            </tr>
            </table>
            <!-- <span class="dicon_reply"></span><div class="dweb_text">{{item.mblog.comments_count}}</div> -->
          </a>
          <i class="separate-line"></i>
          <a class="like" @click.prevent="likeIt($event, item)" :class="{'liked': item.is_gooded}">
            <table border="0px" class="dweb_table">
            <tr>
            <td><div class="dicon_good"></div></td><td style="vertical-align: top;"><div class="dweb_text">{{item.good_cnt}}</div></td>
            </tr>
            </table>
            <!-- <span class="dicon_good"> </span><div class="dweb_text">{{item.mblog.attitudes_count}}</div> -->
          </a>
        </footer>
      </div>
      <transition name="like"
                             v-on:before-enter="beforeLikeEnter"
                             v-on:enter="likeEnter"
                             v-on:after-enter="afterLikeEnter">
        <div class="like-animation-wrapper" v-show="showLikeAnimationWrapper">
          <i class="iconfont_dweb icon-like"></i>
        </div>
      </transition>
      <!-- <loading v-show="bottomIsLoading"></loading> -->
      <div class="content-tip no-text-select" v-show="noMore" @click="updateContent()">
        <span>{{ pleaseRefreshDwebNowStr }}</span>
        <a class="iconfont_dweb icon-refresh"></a>
      </div>
      </van-list>
      <div ref="nullDiv" class="list" :style="{height:nullDivHeight + 'px'}" ></div>
    </van-pull-refresh>
    </div>
    <floor></floor>
    </div>
  </template>
  
  <script>
    // import loading from '../../components/loading/loading.vue'
    import floor from "../../components/floor/floor.vue";
    import LogoItem from "../../components/item/LogoItem.vue"
    import FileItem from "../../components/file/FileItem.vue"
    import FileList from "../../components/file/FileList.vue";
    import commentWindow from '../../components/commentWindow/commentWindow.vue'
    // import pictureViewer from '../../components/pictureViewer/pictureViewer.vue'
    import jsonRes0 from './data/weibo-content-1.json'
    import jsonRes1 from './data/weibo-content-0.json'
    import jsonRes2 from './data/weibo-content-2.json'
    
    import { getStyle, getCanvasStyle } from '@/utils/style'
    import { changeStyleWithScale } from '@/utils/translate'
    import ComponentWrapper from '@/components/Item/ComponentWrapper'
    import PopComponent from '@/components/Item/PopComponent'
    import XMsgViewer from '@/components/Item/XMsgViewer'
    import sharechatjson  from './data/sharechat.json'
    import sharenewsjson from './data/sharenews.json'
    import netlinkImg  from '../../assets/images/net-link.png'
    import ib3status  from "../../components/header/ib3status.vue"
    import apps from "../../components/header/apps.vue"

    const netlinkBase64 = netlinkImg //imgUrlToBase64(netlinkImg);
    console.log('netlinkBase64:',netlinkBase64)

    export default {
      name: 'dweb',
      data(){
        return {
          //要使用实例的属性，需要在这初始化声明
          hasTopTip: false,
          topTip: {},
          weiboContent: [],
          jsonRes0: jsonRes0,
          jsonRes1: jsonRes1,
          jsonRes2: jsonRes2,
          showPicViewer: this.$store.state.switchPicViewer,
          pagePos: 0,
          topIsLoading: true,
          bottomIsLoading: false,
          noMore: false,
          noNew: false,
          finished:false,
          isLoading:false,
          begin_pos:0,
          page_len:10,
          fullWidth:window.fullWidth,
          showLikeAnimationWrapper: false,
          clickedLikeBtnPos: {
            pageX: 0,
            pageY: 0
          },
          showCommentWindow: false,
          now_xmsg_info:null,
          now_user_info:null,
          now_label_flag:false,
          title:'头榜',
          textNews:'刷新成功',
          nullDivHeight:0,
          dwebTitleStr:'头榜',
          refreshSuccessStr:'刷新成功',
          pleaseWaitNewsStr:'这会儿还没有新头榜内容，等会再来刷刷看吧(｡･ω･｡)！',
          pleaseRefreshDwebNowStr:'没有更多头榜内容了QAQ，点我刷新看看吧！',
          showAppsFlag:{},
        }
      },
      components: {
        // loading,
        ComponentWrapper,
        PopComponent,
        XMsgViewer,
        FileItem,
        FileList,
        floor,
        ib3status,
        'comment-window': commentWindow,
        LogoItem,
        apps,
        // 'picture-viewer': pictureViewer
      },
      beforeDestroy () {
        console.log('into beforeDestroy()')
        if(typeof g_pop_event_bus!='undefined')
        {
          g_pop_event_bus.removeListener('update_dtns_loction',this.translate)
        }

        if(typeof clearImageLazyData =='function')  clearImageLazyData()
      },
      async created() {
        this.showAppsFlag.search = this.searchNowInnerCall
        this.showAppsFlag.subXMsg= this.intoSubXMSGFunc
        if(typeof g_pop_event_bus!='undefined')
        {
          g_pop_event_bus.on('update_dtns_loction',this.translate)
        }
        this.translate()

        if(this.intoSubXMSGFunc())
        {
          console.log('created:intoSubXMSGFunc()')
        }
        else if(this.intoUserSubXMSGFunc())
        {
          console.log('created:intoUserSubXMSGFunc()')
        }
        else if(this.intoChatSubXMSGFunc())
        {
          console.log('created:intoChatSubXMSGFunc()')
        }
        else this.getContent()

        //重新获得全屏宽度，以便zoom计算MsgItem的宽度缩放比
        let This = this
        this.onresize = () => {
          return (() => {
            window.fullWidth = document.documentElement.clientWidth;
            This.fullWidth = fullWidth
            console.log('window.fullWidth:'+fullWidth)
            console.log('this.isFull:'+This.isFull)
          })();
        };
        this.onresize()
        window.addEventListener('resize',this.onresize,true)
        
        //必然进入的是首页（也就是不是subXMSG）
        window.g_dwebRefresh = this.onRefresh
      },
      beforeRouteLeave(to,from,next){
        let scrollEle = this.$refs.scrollEle
        console.log('beforeRouteLeave---scrollEle:',scrollEle)
        console.log('scroll-val:'+scrollEle.scrollTop)//this.$refs.listScroll.scrollTop)document.documentElement
        this.scrollTop =scrollEle.scrollTop// this.$refs.listScroll.scrollTop
        next();
      },
      activated(){
        this.translate()
        // console.log('$refs',this.$refs)
        let scrollEle = this.$refs.scrollEle
        console.log('this.scrollTop:'+this.scrollTop,scrollEle)
        let newDWebFlag = localStorage.getItem('newDWebFlag')
        console.log('dweb-newDWebFlag:',newDWebFlag)

        this.now_search_key= null
        this.now_search_xtype=null
        if(this.intoSubXMSGFunc())
        {
          console.log('activited:intoSubXMSGFunc()')
        }
        else if(this.intoUserSubXMSGFunc())
        {
          console.log('activited:intoUserSubXMSGFunc()')
        }
        else if(this.intoChatSubXMSGFunc())
        {
          console.log('activited:intoChatSubXMSGFunc()')
        }
        else if(this.intoSearchXMSGFunc())
        {
          console.log('activited:intoSearchXMSGFunc()')
        }
        else if(newDWebFlag)
        {
          localStorage.removeItem('newDWebFlag')
          console.log('call g_dwebRefresh:')
          this.is_getting_content = false
          this.now_user_info = null
          this.now_xmsg_info = null
          this.now_search_key= null
          this.now_search_xtype=null
          this.now_label_flag = false
          this.title = this.dwebTitleStr;// '头榜'
          this.updateContent()
        }else{
          //document.documentElement
          scrollEle.scrollTop = this.scrollTop
        }
        // this.$refs.listScroll.scrollTop = this.scrollTop
      },
      methods: {
        getStyle,
        getCanvasStyle,
        changeStyleWithScale,
        showApps(){
          //alert('need to do it')
          if(typeof this.showAppsFlag.updateVal == 'function')
          {
            typeof this.showAppsFlag.updateVal(true)
          }
        },
        fixScrollHeight()
        {
          this.nullDivHeight = window.innerHeight- this.$refs.contentListEL.$el.offsetHeight - 46 -50 
          this.nullDivHeight = this.nullDivHeight>0 ? this.nullDivHeight:0
          console.log('into fixScrollHeight:',this.nullDivHeight,this.$refs.contentListEL,window.innerHeight)
        },
        onRefresh()
        {
          let This = this
          console.log('call onRefresh-g_dwebRefresh:')
          This.is_getting_content = false
          This.now_user_info = null
          This.now_xmsg_info = null
          This.now_chat_info = null
          This.now_search_key= null
          this.now_search_xtype=null
          This.now_label_flag = false
          This.title = this.dwebTitleStr//'头榜'
          This.updateContent()
        },
        GetDateTimeFormat(time_i){
          return str_filter.GetDateTimeFormat(time_i)
        },
        async createHtml()
        {
          let list = this.weiboContent
          let mdTextSum = '', htmlSum = '' ,imagesAll = {}
          if(!list || list.length<=0){
            this.$toast('头榜列表为空，请先刷新列表数据！')
            return null
          }   
          for(let i=0;i<list.length;i++)
          {
            let item = list[i]
            let share_xmsg = JSON.parse( JSON.stringify(item.origin_xmsg) )
            let ret = await g_dchatManager.createHtml(share_xmsg,false)//showImg为false
            if(!ret) continue
            let {html,mdText,images} = ret
            mdTextSum += '\n'+mdText+'\n'
            htmlSum += '\n'+html+'\n'
            imagesAll = Object.assign(imagesAll,images)
          }
          //汇总所有的图片在后面
          for(let x in imagesAll)
          {
              // console.log('base64s-x:',x,imagesAll[x])
              mdTextSum += '\n['+x+']:'+imagesAll[x]+'\n'
          }

          //原因是汇总的图片没有出现在旧的mdText末尾
          let converter = new showdown.Converter()
          htmlSum = converter.makeHtml(mdTextSum)

          const encoder = new TextEncoder();
          let mdU8arr = encoder.encode(mdTextSum)
          let u8arr = encoder.encode(htmlSum)
          let filename = 'dweb-'+Date.now()+'.html'
          rpc_client.downloadFileByBinary(filename,u8arr)
          rpc_client.downloadFileByBinary(filename+'.md',mdU8arr)
          return {mdData:mdU8arr,htmlData:u8arr,html:htmlSum,mdText:mdTextSum}
        },
        async expandList(res)
        {
          let list = res.list 
          for(let i =0 ; i<list.length; i++)
          {
            //for copy-data 2023-10-11
            if(!list[i].origin_xmsg)
            {
              list[i].origin_xmsg = {...list[i]}
              delete list[i].origin_xmsg.label_type //不须这个，否则会干扰下榜（普通 or 标签来源）
              if(list[i].p_xmsg_info)
              list[i].origin_xmsg.p_xmsg_info = {...list[i].p_xmsg_info}
            }
            let user = list[i].user_id
            let tmp = list[i];

            tmp.reply_cnt = tmp.reply_cnt ? tmp.reply_cnt :0
            tmp.retw_cnt = tmp.retw_cnt ? tmp.retw_cnt :0
            tmp.good_cnt = tmp.good_cnt ? tmp.good_cnt :0
            tmp.time_str = tmp.time_i ? this.GetDateTimeFormat( tmp.time_i) :user
            this.$api.network.s_queryUserInfo(user,async function(infoRet){
              //s_userInfo = res;
              //tmp.url = 'http://182.61.13.123:9000/image/view?user_id='+localStorage.user_id+'&s_id='+localStorage.s_id+'&filename='+infoRet.logo+'&img_kind=open&img_p=min1000'
              
              tmp.user_name = infoRet.user_name;
              tmp.user_id = infoRet.user_id
              let img_id = infoRet.logo
              tmp.url = img_id
              if(typeof g_setLogoMap == 'function')
              {
                g_setLogoMap(img_id)
              }
            });

            if(tmp.p_xmsg_info){
              this.$api.network.s_queryUserInfo(tmp.p_xmsg_info.user_id,async function(infoRet){
                tmp.p_xmsg_info.user_name = infoRet.user_name;
                tmp.p_xmsg_info.user_id = infoRet.user_id
                let img_id = infoRet.logo
                tmp.p_xmsg_info.url = img_id
                if(typeof g_setLogoMap == 'function')
                {
                  g_setLogoMap(img_id)
                }
              });
            }
          }
        },
        card_name(item){///点击进入名片联系人的个人信息
          console.log('card_name:',item)
          this.$router.push(`/index/GroupInformation/GroupOwner/${item.dst_user_id}`)
        },
        async comeNews(item)
        {
          console.log('come-news:',item)
          let gotoInfo=Object.assign({},item)
          delete gotoInfo.xitem
          console.log('comeNews-gotoInfo:',gotoInfo)
          localStorage.setItem('goto-http',JSON.stringify(gotoInfo))
          this.$router.push('/http')
        },
        async come(item) {//跳转进入聊天室
          console.log(item)
          let shop_id = item.shop_id
          localStorage.setItem('shopid',shop_id)
          console.log(shop_id)
          let chatname = item.title
          console.log(chatname)
          localStorage.setItem("chatname",chatname)

          let random = Math.random()
          let user = {
            user_id:localStorage.user_id,
            s_id:localStorage.s_id,   
            chatid:item.share_chatid,
          }
          let res =  await this.$api.network.Chatjoin(user)
          console.log('这是加入群聊' + res)
          if(!res || !res.ret)
          {
          //     this.$toast.success('加入成功')
          // }else{
              this.$toast.fail('加入失败:' + res.msg)
              return 
          }

          // imDb.addData({key:item.token_y,data:item})
          if(item.chat_type =='group_live' || item.chat_type == "group_shop"){
            this.$router.push(`/LiveBroadcast/videoChat/${item.share_chatid}`)
          }
          else{
            this.$router.push(`/index/chat/${item.share_chatid}`)
          }
        },
        calculateVerifiedClass: function (verifiedType) {
          let tempOutcome = ''
          switch (verifiedType) {
            case -1:
              tempOutcome = 'no-verified'
              break
            case 0:
              tempOutcome = 'icon-yellow-v'
              break
            case 1:
              tempOutcome = 'icon-blue-v'
              break
          }
          return tempOutcome
        },
        sendXMsg()
        {
          localStorage.setItem('poster_type','xmsg')
          localStorage.setItem('poster_value','normal')//类型
          if(this.now_xmsg_info && this.now_xmsg_info.xmsgid && this.now_xmsg_info.xmsgid.indexOf('xmsgl')>0)
          {
            localStorage.setItem('from_label_type',this.now_xmsg_info.xmsgid)
          }
          else if( this.now_chat_info )
          {
            localStorage.setItem('from_label_type',this.now_chat_info.label_type)
          }
          this.$router.push('/poster/xmsg')
        },
        openPicViewer(targetPicUrl) {
  //        this.$store.commit('disableBodyScroll');
          this.$store.commit('openPicViewer', {targetPicUrl: targetPicUrl})
        },
        intoSubXMSG(item)
        {
          this.now_label_flag = false
          if(item.xmsgid && item.xmsgid.indexOf('xmsgl')>0)// && confirm('是否按[标签]查看内容？')
          {
            this.now_label_flag = true
          }
          this.now_xmsg_info = item
          this.now_user_info = null
          this.now_chat_info = null
          this.now_search_key= null
          this.now_search_xtype=null
          this.title = item ? this.dwebTitleStr+'-'+(this.now_label_flag ?'[标签]':'') + item.xmsg.replace('<p>','').replace('</p>','') : this.dwebTitleStr//'头榜'
          this.updateContent()
        },
        intoSubXMSGFunc()
        {
          let intoXMsgInfo = null;
          try {
            intoXMsgInfo = JSON.parse( localStorage.getItem('dweb-into-xmsg-info') )
          }catch(ex){
            console.log('into-xmsg-info-ex:'+ex,ex)
            return false;
          }
          if(intoXMsgInfo)
          {
            localStorage.removeItem('dweb-into-xmsg-info')
            this.intoSubXMSG(intoXMsgInfo)
            return true;
          }
          return false
        },
        intoUserSubXMSG(item,userClicked=false)
        {
          //配置项是否进入user-subxmsg
          if(userClicked && !window.g_dweb_click_user_logo_into_sub_xmsg_flag)
          {
            return this.$router.push('/index/GroupInformation/GroupOwner/'+item.user_id)
          }
          this.now_xmsg_info = null
          this.now_chat_info = null
          this.now_user_info = item
          this.now_search_key= null
          this.now_search_xtype=null
          this.title = item ? this.dwebTitleStr+'-'+item.user_name+(item.label_type=='relf'?'-收藏':(item.label_type=='relp' ? '-稿箱':'')) : this.dwebTitleStr
          this.updateContent()
        },
        intoUserSubXMSGFunc()
        {
          let intoUserInfo = null;
          try {
            intoUserInfo = JSON.parse( localStorage.getItem('dweb-into-user-info') )
          }catch(ex){
            console.log('into-user-info-ex:'+ex,ex)
            return false;
          }
          if(intoUserInfo)
          {
            localStorage.removeItem('dweb-into-user-info')
            this.intoUserSubXMSG(intoUserInfo)
            return true;
          }
          return false
        },
        intoChatSubXMSGFunc()
        {
          let intoChatInfo = null;
          try {
            intoChatInfo = JSON.parse( localStorage.getItem('dweb-into-chat-info') )
          }catch(ex){
            console.log('into-chat-info-ex:'+ex,ex)
            return false;
          }
          if(intoChatInfo)
          {
            localStorage.removeItem('dweb-into-chat-info')
            this.now_xmsg_info = null
            this.now_user_info = null
            this.now_chat_info = intoChatInfo
            this.now_search_key= null
            this.now_search_xtype=null
            this.title = this.dwebTitleStr+'-'+intoChatInfo.chatname+'[群]'
            this.updateContent()
            return true;
          }
          return false
        },
        intoSearchXMSGFunc()
        {
          let searchKey = null;
          let searchStr = localStorage.getItem('dweb-search-key')
          if(!searchStr) return false
          let searchType = searchStr.indexOf('::')>0? searchStr.split('::')[0] :'xmsg'
          searchKey = searchStr.indexOf('::')>0? searchStr.split('::')[1] :searchStr
          // if(searchKey) //支持搜索全部内容（例如xverse应用的全部）此时searchKey=""
          {
            localStorage.removeItem('dweb-search-key')
            this.now_xmsg_info = null
            this.now_user_info = null
            this.now_chat_info = null
            this.now_search_key= searchKey
            this.now_search_xtype=searchType
            this.title = this.now_search_xtype == 'xmsg' ? this.dwebTitleStr+'-'+searchKey+'[搜索]'
              :this.dwebTitleStr+'-'+searchKey+'[搜索'+searchType+']'
            this.updateContent()
            return true;
          }
          return false
        },
        searchNow()
        {
          const input =  prompt('请输入搜索的关键词（以空格隔开多个关键词）：')
          if(!input) return this.$toast('搜索关键词输入错误：空值')
          localStorage.setItem('dweb-search-key',input)
          this.intoSearchXMSGFunc()
        },
        searchNowInnerCall()
        {
          //localStorage.setItem('dweb-search-key',input)
          this.intoSearchXMSGFunc()
        },
        async getContent() {
          console.log('into getContent-this.isLoading:',this.isLoading,this.is_getting_content)
          // if(this.is_getting_content){
          //   console.log('getContent-this.is_getting_content is true')
          //   return 
          // }
          this.is_getting_content = true
          
          while(!iWalletDb.db)  await rpc_client.sleep(100)
          while(!imageDb.db)  await rpc_client.sleep(100)
          // while(!imDb.db)  await rpc_client.sleep(100)
          let firstTimeFlag = false
          // firstTimeFlag =  rpc_client.client.peers().length<1
          // while(!rpc_client.client ||rpc_client.client.peers().length<1)
          // {
          //   await rpc_client.sleep(50)
          // }
          while(!rpc_client.pingpong_flag){
            firstTimeFlag =true
            await rpc_client.sleep(50)
          }
          // if(firstTimeFlag)
          // await rpc_client.sleep(2000)

          console.log('into getContent:',this.weiboContent)
          this.begin_pos = this.weiboContent.length//+= this.page_len

          let params = {user_id:localStorage.user_id,s_id:localStorage.s_id,begin:this.begin_pos,len:this.page_len}
          if(this.now_xmsg_info)
          {
            //进行标签判断，是否查看的是标签
            if(this.now_label_flag) params.label_type = this.now_xmsg_info.xmsgid
            else params.p_xmsgid =  this.now_xmsg_info.xmsgid
          }else if(this.now_user_info)
          {
            //我的收藏或我的草稿（relp--待支持）
            if(this.now_user_info.label_type == 'relf' || this.now_user_info.label_type == 'relp')
              params.label_type = this.now_user_info.label_type
            else params.p_userid = this.now_user_info.user_id
          }
          else if(this.now_chat_info)
          {
            params.label_type = this.now_chat_info.label_type
          }
          else if(this.now_search_key || this.now_search_xtype) //10-30 fix the bug when search xverse and search-key is empty
          {
            params.begin=0
            params.len = 10000000 //10万条
            this.now_search_key=this.now_search_key.replace(' ','-')
          }
          console.log('dweb-getContent-listXMSG-req-params:',params)
          let res = await this.$api.network.listXMSG(params)//this.jsonRes0;
          console.log('dweb-getContent-listXMSG-res:',res)
          this.is_getting_content = false
          if(!res || !res.ret){
            this.$toast('没有更多头榜内容了')
            this.noMore = true
            this.bottomIsLoading = false
            this.finished = true
            this.isLoading = false //2023-6-12追加
            setTimeout(()=>this.fixScrollHeight(),500)
            return 
          }
          //2024-7-9新增搜索头榜内容功能
          if(this.now_search_key || this.now_search_xtype) //2024-10-30 fix search-xverse-all failed bug
          {
            for(let i=0;i<res.list.length;i++) res.list[i].class='search'
            if(this.now_search_xtype != 'xmsg') res.list = g_2d_filter_uijson(res.list,'xtype',this.now_search_xtype)
            if(this.now_search_key)//如果为""则不需再检索一次
            res.list = g_2d_filter_uijson(res.list,'xmsg',this.now_search_key)
            this.finished = true
            this.isLoading = false //2023-6-12追加
          }
    // eslint-disable-next-line
          await this.expandList(res)
          //追加长度
          this.weiboContent = params.begin == 0 ?  res.list : this.weiboContent.concat(res.list)
          this.isLoading = false
          setTimeout(()=>this.fixScrollHeight(),500)
        },
        async updateContent() {
          this.noMore = false
          // this.topIsLoading = true
          // this.hideAppAddTip()
          // this.scrollToTop()
          this.finished = false
          this.begin_pos = 0
          this.weiboContent = []
          this.isLoading = false //2023-6-12追加
          this.getContent()
        },
        scrollToTop() {
          window.scrollTo(0, 0)
        },
        myDebounce(func, wait) {
          let timeout;
          return function () {
            clearTimeout(timeout)
            timeout = setTimeout(func, wait)
            /*一个事件发生wait毫秒后，不再触发该事件，才执行相应的处理函数。*/
          }
        },
        async likeIt(e, item) {
          // 保存点击位置，用于设置动画块的起始位置：
          this.clickedLikeBtnPos.pageX = e.pageX - parseInt(window.scrollX)
          this.clickedLikeBtnPos.pageY = e.pageY - parseInt(window.scrollY)
  
          if (item.is_gooded) {
            this.$set(item, 'good_cnt', item.good_cnt - 1)
            this.$set(item, 'is_gooded', false)
          }
          else{
            //显示点赞动画：
            this.showLikeAnimationWrapper = true
            // 点赞数+1，并设置为已经赞了的状态
            /* vm.$set( target, key, value ) 用于设置对象的属性。
            如果对象是响应式的，确保属性被创建后也是响应式的，
            同时 **“触发视图更新” **。
            这个方法主要用于避开 Vue 不能检测属性被添加的限制。*/
            this.$set(item, 'good_cnt', item.good_cnt + 1)
            this.$set(item, 'is_gooded', true)

            let params = {user_id:localStorage.user_id,s_id:localStorage.s_id,p_xmsgid:item.xmsgid,xmsg:'点赞了',xtype:'good'}
            let ret = await this.$api.network.sendXMSG(params)
            console.log('sendXMSG-good-op-ret:',ret)
            if(ret && ret.ret){
                this.$toast('点赞成功')
            }else{
                this.$toast('点赞失败，原因：'+(ret ? ret.msg:'未知网络原因'))
            }
          }
        },
        beforeLikeEnter(el) {
          /*在动画块呈现之前，将其位置设置到点赞开始的位置上：*/
          el.style.transform = 'scale(0.1)'
          el.style.top = this.clickedLikeBtnPos.pageY + 'px'
          el.style.left = this.clickedLikeBtnPos.pageX + 'px'
        },
        likeEnter(el, done) {
          /* eslint-disable no-unused-vars*/
          /*TODO:Figure out 很奇怪！必须要触发一次重绘才能实现位置移动的过渡效果？？？*/
          let rf = el.offsetHeight
          el.style.transform = 'scale(1)'
          el.style.top = '190px'
          el.style.left = '50%'
          done()
        },
        afterLikeEnter(el) {
          //动画结束后，隐藏该动画块（需要enter钩子中调用done()）：
          this.showLikeAnimationWrapper = false
        },
        hideAppAddTip() {
          this.$emit('hideAppAddTip')
        },
        preventBgScroll() {
          // setTimeout(0) to avoid flash when the page scroll to top
          setTimeout(() => {
            this.$store.commit('storePagePos');
            this.$store.commit('disableBodyScroll');
          }, 0)
        },
        allowBgScroll () {
          setTimeout(() => {
            this.$store.commit('enableBodyScroll');
            this.$store.commit('restorePagePos');
          }, 0)
        },
        openCommentWindow(item,xtype) {
          /*TODO:BUG Prevent scrolling when overlaid. (Headache!!!)
          Read the 23 in ../../notes/Summary-of-experience for detail.*/
          this.preventBgScroll();
          // this.showCommentWindow = true;
          localStorage.setItem('poster_type','xmsg')
          localStorage.setItem('poster_value',xtype)//类型
          if(this.now_xmsg_info && this.now_xmsg_info.xmsgid && this.now_xmsg_info.xmsgid.indexOf('xmsgl')>0)
          {
            localStorage.setItem('from_label_type',this.now_xmsg_info.xmsgid)
          }
          else if( this.now_chat_info )
          {
            localStorage.setItem('from_label_type',this.now_chat_info.label_type)
          }
          if(xtype)
          {
            localStorage.setItem('dweb_p_xmsg_info',JSON.stringify( item))
          }
          this.$router.push('/poster/'+item.xmsgid)
        },
        closeCommentWindow() {
          this.allowBgScroll();
          this.showCommentWindow = false;
        },
        copyXMSG(item)
        {
          imDb.deleteDataByKey('sharetext')
          if(this.now_label_flag) item.origin_xmsg.label_type =  this.now_xmsg_info.xmsgid
          else if(this.now_xmsg_info) item.origin_xmsg.label_type  = 'rels' //用于删除子榜
          if(this.now_user_info && this.now_user_info.label_type) item.origin_xmsg.label_type = this.now_user_info.label_type
          if(this.now_chat_info && this.now_chat_info.label_type) item.origin_xmsg.label_type = this.now_chat_info.label_type
          imDb.addData({key:'sharetext',data:JSON.stringify(item.origin_xmsg)})
          localStorage.setItem('poster_type','sharetext')
          if(item.origin_xmsg.xtype=='xverse')//新增对录制视频的需求的支持
          {
            imDb.deleteDataByKey('from.dtns.xverse.xmsg')
            imDb.addData({key:'from.dtns.xverse.xmsg',data:item.origin_xmsg})
          }
          this.$router.push('/poster/sharetext')
        },
        translate()
        {
          // dwebTitleStr:'头榜',
          // refreshSuccessStr:'刷新成功',
          // pleaseWaitNewsStr:'这会儿还没有新头榜内容，等会再来刷刷看吧(｡･ω･｡)！',
          // pleaseRefreshDwebNowStr:'没有更多头榜内容了QAQ，点我刷新看看吧！',

            this.dwebTitleStr = g_dtnsStrings.getString('/index/dweb/title')
            this.title = this.dwebTitleStr
            this.refreshSuccessStr=g_dtnsStrings.getString('/index/dweb/refresh-success')
            this.textNews = this.refreshSuccessStr
            this.pleaseWaitNewsStr = g_dtnsStrings.getString('/index/dweb/news/wait')
            this.pleaseRefreshDwebNowStr = g_dtnsStrings.getString('/index/dweb/news/refresh/now')
        }
      },
      computed: {
        switchPicViewer() {
          return this.$store.state.switchPicViewer;
        }
      },
    }
  </script>
  
  <style scoped lang="stylus" scoped>
  .van-tag {
    position absolute
    font-size 12px;
    padding-top:0px;
    padding-bottom:0px;
    padding-left: 5px;
    padding-right:5px;
    line-height 17px;
    top 40px;
    right:20px;
  }
  .box_x {
    position:fixed; z-index:999; width:120px; height:200px; background-color:#333;border-radius:5px;
    right 10px;
    top:56px;
  }
  .box >>> .van-nav-bar__title {
    font-size 16px 
    font-weight bold
  }
  .box >>> .van-nav-bar .van-icon{
    font-size 1.1rem
    color #000
  }
  .topbar {
    position fixed
    top 0
    width 100%
    z-index 99
  }  
  .home
    line-height: 1
    font-weight: normal
    font-family: 'PingFang SC', 'STHeitiSC-Light', 'Helvetica-Light', arial, sans-serif
    &.scroll-disabled
      overflow hidden !important
      position: fixed;

    a
      cursor pointer
      color #598abf

    .clearfix
      zoom 1
      &:before,&:after
        display: table
        content: ""
        clear: both

    //基本框架样式：
    .card
      width 100%
      background-color #fff
      margin-bottom .5625rem
      position: relative
      box-shadow: 0 1px 0.1875rem -0.125rem rgba(0,0,0,.2)

    .card-4
      a
        height 2rem
        display: flex
        align-items center
        padding .375rem 0 .375rem .75rem
    .content
      flex 1
      display: flex
      align-items center

    .card-line-group
      width 100%
      background-color #fff
      margin-bottom .5625rem
      a
        color #333

    .card-line
      color #fff
      border-bottom-1px()
      can-active()
      a>.iconfont
        color: #fff;
        width 24px
        height 24px
        text-align: center
        line-height: 24px
        font-size: 20px;
        margin-right .625rem
      a>.icon-right-arrow
        font-size:16px
        color #aaa

    .avatar-card
      display flex
      background-color #fff
      can-active()
      .card-avatar
        display block
        width 3rem
        height 3rem
        line-height 3rem
        text-align center
        margin .5rem 0 .5rem .5rem
        & img
          width 48px
          height 48px
      .avatar-card-content
        display flex
        flex 1
        width 100%
        flex-direction column
        justify-content center
        overflow hidden
        padding .5rem .6875rem
        .sub-text
          padding 5px 20px 0 0
      .plus-content
        color #aaa
        display flex
        align-items center
        margin-right .75rem

    .btn
      display: inline-block;
      text-align: center;
      font-size: 18px;
      color: #212529;
      background-color: #e2e6ea;
      padding: 6px 12px;
      border: 1px solid #0000
      border-radius 4px
      outline none
      user-select none
      cursor pointer
      &:active
        box-shadow: 0 0 0 0.2rem rgba(248,249,250,.5)

    .btn-sm
      font-size: .75rem;
      padding: 0 .625rem;
      margin-left: .75rem;
      margin-right: .001rem;
      height: 1.6875rem;
      line-height: 1.6875rem;

    .btn-warning
      color: #212529;
      background-color: #ffc107;
      border-color: #ffc107;
      &:active
        box-shadow: 0 0 0 0.2rem  rgba(255,193,7,.5)

    .btn-orange
        color: #fff;
        background: #FF8200;
        border: 0 solid #0000;
        &:active
          background: #E07400;
          border-color: #0000;


    //文字相关类：
    .txt-l
      font-size .9375rem
    .txt-m
      font-size .875rem
    .txt-s
      font-size .8125rem
    .txt-xs
      font-size .625rem
    .txt-cut
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap

    .mct-a
      color #333
    .mct-b
      color: #5d5d5d
    .mct-d
      color #929292
    /*active style:*/
    /*微博用的是data-act-type:"hover"，估计是为了适配移动端。稍后更改这个问题。
    IOS safari浏览器对于:active有怪癖。
    https://stackoverflow.com/questions/3885018/active-pseudo-class-doesnt-work-in-mobile-safari*/
    .able-to-active:active
      background-color #ebebeb
    .no-text-select
      -webkit-user-select: none
      -moz-user-select: none
      -ms-user-select: none
      -o-user-select: none
      user-select: none

    /*1px hack:*/
    .separate-line
      //width .0625rem
      //height 1.5rem
      //background-color #dcdcdc
      //line-height 1
      //微博所用方法：
      height: 1.5rem
      width: 1px
      background-color: #dadada
      background-image: -webkit-gradient(linear,left top,right top,color-stop(50%,rgba(0, 0, 0, 0)),color-stop(50%,#dadada),color-stop(100%,#dadada))
      background-image: -webkit-linear-gradient(left,rgba(0, 0, 0, 0) 50%,#dadada 50%,#dadada 100%)
      background-image: linear-gradient(to right,rgba(0, 0, 0, 0) 50%,#dadada 50%,#dadada 100%)
      background-size: 1px 100%
      background-repeat: no-repeat
      background-position: right
      //搭配mask蒙版/遮罩属性，实现向上下两端渐细
      -webkit-mask: -webkit-gradient(linear,left top,left bottom,color-stop(0%,rgba(0, 0, 0, 0)),color-stop(30%,#000),color-stop(70%,#000),color-stop(100%,rgba(0, 0, 0, 0)))
      -webkit-mask: -webkit-linear-gradient(top,rgba(0, 0, 0, 0),#000 30%,#000 70%,rgba(0, 0, 0, 0) 100%)


    .border-1px
      border none
      position: relative

    .border-top-1px:before
        position: absolute
        top 0
        left 0
        content ' '
        width: 100%
        height 1px
        background-color #dadada

    .border-bottom-1px:after
        position: absolute
        left 0
        bottom 0
        content ' '
        width: 100%
        height .0625rem
        background-color #dadada


    @media (-webkit-min-device-pixel-ratio: 2), not all
      .border-top-1px:before
        transform scaleY(0.5)
      .border-bottom-1px:after
        transform scaleY(0.5)
      .separate-line
        transform scaleX(0.5)

    .border-around-1px
      position: relative
    .border-around-1px:before
      /*border-1px-hack
      http://jinlong.github.io/2015/05/24/css-retina-hairlines/*/
      content: ' '
      position: absolute
      top: 0
      left: 0
      border: .0625rem solid #e4e4e4
      -webkit-box-sizing: border-box
      box-sizing: border-box
      border-radius: 50%
      width: 200%
      height: 200%
      transform: scale(0.5)
      transform-origin: left top
      /** -------- */
      border-bottom-1px()
      position: relative
      &:after
        width:100%
        height 1px
        content ''
        left 0
        bottom  0
        position absolute
        background-image linear-gradient(to bottom,rgba(0, 0, 0, 0) 50%,#dadada 50%,#dadada 100%)
        background-size 100% 1px
        background-repeat no-repeat
        background-position bottom
    
    line-around()
      position: relative;
      &:before
        width:100%
        height 1px
        content ''
        left 0
        top  0
        position absolute
        background-image linear-gradient(to bottom,rgba(0, 0, 0, 0) 50%,#dadada 50%,#dadada 100%)
        background-size 100% 1px
        background-repeat no-repeat
        background-position bottom
      &:after
        width:100%
        height 1px
        content ''
        left 0
        bottom  0
        position absolute
        background-image linear-gradient(to bottom,rgba(0, 0, 0, 0) 50%,#dadada 50%,#dadada 100%)
        background-size 100% 1px
        background-repeat no-repeat
        background-position bottom
    
    list-separator-horizontal()
      position: relative
      border none
      &:before
        width 1px
        height 80%
        content ''
        position absolute
        top  10%
        right 0
        background-image linear-gradient(to right,rgba(0, 0, 0, 0) 50%,#dadada 50%,#dadada 100%)
        background-size 1px 100%
        background-repeat no-repeat
        background-position right
    
    list-separator-vertical()
      position: relative
      border none
      &:after
        width 92%
        height 1px
        content ''
        position absolute
        left 4%
        bottom 0
        background-image linear-gradient(to bottom,rgba(0, 0, 0, 0) 50%,#dadada 50%,#dadada 100%)
        background-size 100% 1px
        background-repeat no-repeat
        background-position bottom
    
    can-active()
      &:active
        background-color #ebebeb
  
  /** -------------------------------------------------------------- */
  .top-tip
    width 100%
    background-color #fed
    .to-top-tip
      height 2.75em
      display: flex
      align-items: center
      padding-left .75rem
      .icon-hot
        color: #ff8200
        margin-top -5px
        font-size: 22px
      .top-tip-content
        font-size: .875rem
        color: #FF8200;
        padding 0 .6875rem
        line-height: 1.5rem
        .iconfont
          margin-left: .5rem
          font-size: 0.775rem
  
  .card-main:active
    background-color #ebebeb
  
  .card-header
    display: flex
    .header-bg
      background-image url("../../../static/images/card-header-bg-headline.png")
      width: 100%
      height: 60px
      background-repeat: no-repeat
      background-position: top right
      background-size: 100% auto
      position: absolute
      top -4px
      left 0
    .avatar
      margin .75rem 0 .5rem 10px/**.75rem */
      display flex
      position relative
      .avatar-img
        width 2.125rem
        height 2.125rem
        border-radius 50%
        vertical-align top
        display block
      .no-verified
        display none
      .icon-yellow-v,.icon-blue-v
        position: absolute
        right: -.125rem
        bottom: -.125rem
  
  .user-info
    max-width 16rem
    display: flex
    justify-content center
    flex-direction column
    padding: 0
    line-height: 1rem
    .user-name
      color #333
    .publish-data
      color #929292
      .publish-source
        padding-left .5rem
  
  .card-operate
    position: absolute
    top: 0
    right: 0
    width: 3.75rem
    height: 3.375rem
    &:active
      background-color #ebebeb
    .icon-down-arrow
      position: absolute
      top .5rem
      right .5rem
  
  
  .card-body
    padding: .25rem .75rem .625rem
    line-height 1.35rem
    overflow: hidden
  .pic-list
    margin-top .4375rem
    width: 15.5rem
    overflow hidden
    & li
      float: left
    & img
      width 4.75rem
      height 4.75rem
      margin-right .25rem
  .file-list
    margin-top .4375rem
    width: 100%
    overflow hidden
  
  .single-pic
    margin-top .3125rem
    max-height 12.5rem
    overflow hidden
    text-align left
    & img
      width: 11.25rem
      vertical-align top
  
  .retweet
    padding: .625rem
    margin .4375rem -.75rem -.75rem
    background-color #f7f7f7
    overflow: hidden
  
  .card-footer
    width: 100%
    display: flex
    align-items center
    background-image: -webkit-gradient(linear,left top,left bottom,color-stop(0%,#dadada),color-stop(50%,#dadada),color-stop(50%,rgba(0, 0, 0, 0)))
    background-image: -webkit-linear-gradient(top,#dadada 0,#dadada 50%,rgba(0, 0, 0, 0) 50%)
    background-image: linear-gradient(to bottom, #dadada 0, #dadada 50%, rgba(0, 0, 0, 0) 50%)
    /*从上到下，在1px的高度之中，从#dadada开始，直到0.5px时，将剩余的下半部分0.5px设置为透明，
    从而实现视觉上的0.5px。*/
    -webkit-background-size: 100% 1px
    background-size: 100% 1px
    background-repeat: no-repeat
    background-position: top
    & > a
      color #292929/**#929292*/
      flex:1
      text-align center
      padding: 0px /**.375rem 0 */
      display: inline-block
      height: 21px /** 1.5rem*/
      line-height: 21px /** 1.5rem */
      &:active
        background-color #ebebeb
  
  
  .liked
    color red !important
  
  .like-animation-wrapper
    width: 50px
    height 50px
    line-height 50px
    text-align center
    color: #ff8200
    background-color: #f5f5f5
    border: 1px solid #eee
    border-radius 50%
    position: fixed
    transition all .3s linear
    margin-left -25px
    .icon-like
      font-size 32px
  
  .content-tip
    width 100%
    text-align center
    min-height 50px
    margin-bottom .5625rem
    &:active
      background-color #ebebeb
    span
      display inline-block
      font-size .75rem
      line-height 19px
      color #7c7c7c
      margin 14px 0
  
  .like-enter-to
    // like动画最后一帧，即结束时，给图标添加上转动的动画
    animation: like-rotate .8s .4s
  
  @keyframes like-rotate {
    0% {
      transform: rotate(30deg)
    }
    20% {
      transform: rotate(-30deg)
    }
    40% {
      transform: rotate(30deg)
    }
    60% {
      transform: rotate(0deg)
    }
  }
  
  @media (min-width: 600px) {
    // m.weibo.com没有很完美的解决微博卡片标题背景挂件比例失调的问题，
    // 只是在大屏幕下粗暴的隐藏掉了。
    // 相比之下，我认为下面这个方法虽然多了一些代码，但至少没有因噎废食。
    .card-header .header-bg {
      background-size 50%
    }
  }
  /** -------------fonts--------- */
  @font-face {
    font-family: "iconfont_dweb";
    src: url('../../assets/fonts/iconfont.eot?t=1497272791227'); /* IE9*/
    src: url('../../assets/fonts/iconfont.eot?t=1497272791227#iefix') format('embedded-opentype'), /* IE6-IE8 */
      url('../../assets/fonts/iconfont.woff?t=1497272791227') format('woff'), /* chrome, firefox */
      url('../../assets/fonts/iconfont.ttf?t=1497272791227') format('truetype'), /* chrome, firefox, opera, Safari, Android, iOS 4.2+*/
      url('../../assets/fonts/iconfont.svg?t=1497272791227#iconfont') format('svg'); /* iOS 4.1- */
  }
  
  .iconfont_dweb {
    font-family:"iconfont_dweb" !important;
    font-size:16px;
    font-style:normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  .icon-crown:before { content: "\e600"; }
  
  .icon-forward:before { content: "\e65f"; }
  
  .icon-gear:before { content: "\e634"; }
  
  .icon-comment:before { content: "\e621"; }
  .icon-comments:before { content: "\e621"; }
  
  .icon-collect:before { content: "\e604"; }
  
  .icon-compose:before { content: "\e60b"; }
  
  .icon-position:before { content: "\e606"; }
  
  .icon-msg:before { content: "\e75a"; }
  
  .icon-t:before { content: "\e607"; }
  
  .icon-level:before { content: "\e862"; }
  
  .icon-article:before { content: "\e6bc"; }
  
  .icon-like:before { content: "\e65c"; }
  .icon-good:before { content: "\e65c"; }
  
  .icon-search:before { content: "\e651"; }
  
  .icon-up-arrow:before { content: "\e65d"; }
  
  .icon-down-arrow:before { content: "\e65e"; }
  
  .icon-right-arrow:before { content: "\e660"; }
  
  .icon-left-arrow:before { content: "\e661"; }
  
  .icon-hot:before { content: "\e63a"; }
  .icon-red-hot {color: red;}
  
  .icon-film:before { content: "\e60d"; }
  
  .icon-video:before { content: "\e737"; }
  
  .icon-music:before { content: "\e60c"; }
  
  .icon-charity:before { content: "\e601"; }
  
  .icon-at:before { content: "\e700"; }
  
  .icon-album:before { content: "\e60a"; }
  
  .icon-v:before { content: "\e64a"; }
  .icon-yellow-v:before { content: "\e64v"; color:#FFB502;}
  .icon-blue-v:before { content: "\e64v"; color:#00A4FF;}
  
  .icon-link:before { content: "\e665"; }
  
  .icon-refresh:before { content: "\e726"; }
  
  .icon-speaker:before { content: "\e668"; }
  .icon-box:before { content: "\e668"; }
  
  .icon-famous-people:before { content: "\e618"; }
  
  .icon-friends:before { content: "\e6ae"; }
  
  .dicon_retw {
    display:inline-block;
    background:url('../../../static/images/dweb_icon.png');
    background-repeat:no-repeat;
    background-position:52% 0%;
    height:58px;
    width:60px;
    zoom:0.35
    }

  .dicon_good {
    display:inline-block;
    background:url('../../../static/images/dweb_icon.png');
    background-repeat:no-repeat;
    background-position:5% 0%;
    height:58px;
    width:60px;
    zoom:0.35
    }
  
  .dicon_reply {
    display:inline-block;
    background:url('../../../static/images/dweb_icon.png');
    background-repeat:no-repeat;
    background-position:77% 0%;
    height:58px;
    width:60px;
    zoom:0.35
    }
  .dweb_text{
    display:inline-block;
    height:22px;
    width:auto;
  }
  .dweb_table{
    display:inline-block;
    align:center
  }

  .drecord{
    background-color: #f0f0f0;
    padding: 8px 8px;
    border-radius: 4px;
    display:inline-block
    position: relative;
    font-size:14px;
    //margin:25px 35px 0px 0; 
    word-break: break-all
    word-wrap: break-word
    // white-space: pre-wrap
  }
.drecord::after{
    content: '';
    border: 8px solid #f0f0f000;
    border-right: 8px solid #fff;
    position: absolute;
    top: 6px;
    left: -16px;
  }

.buybtn{
  padding: 8px;
  // color: #F5C400; 
  // border-radius: 0px; font-size: 13px; height: auto; background-color: rgb(18, 173, 245); border: none;
}
.buyedp{
  padding-left:10px;
  height:50px;
  width:100%;
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)),
    linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.1) 0px,
      rgba(0, 0, 0, 0.1) 1px,
      transparent 1px,
      transparent 100px
    ),
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.1) 0px,
      rgba(0, 0, 0, 0.1) 1px,
      transparent 1px,
      transparent 100px
    );
  background-size: 5px 5px;
  z-index: -1;
}
  </style>
  