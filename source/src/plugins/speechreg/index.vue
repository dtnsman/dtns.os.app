<template>
    <div>
        this is speech-reg 
    </div>
  </template>
  
  <script>
  window.g_speech_sdk_check = function ()
  {
    return window.plus && window.plus.speech
  }
  window.g_speech_reg = async function () 
  {
    let cnt =0
    while(!g_speech_sdk_check() && cnt ++  <=10) await new Promise((res)=>setTimeout(res,100))
    if(!g_speech_sdk_check()) 
    {
        console.log('g_speech_sdk_check is false')
        return null
    }
    try{
        let result = await new Promise((res)=>{
            window.plus.speech.startRecognize(options, function(s){
                console.log('g_speech_reg-s:',s);
                // text.value += s;
                //alert('语音识别结果：'+s);
                res(s)
            }, function(e){
                console.log('g_speech_reg-语音识别失败：'+JSON.stringify(e));
                //alert('语音识别失败：'+JSON.stringify(e));
                res(null)
            } );
        })
        
        return result
    }catch(ex)
    {
        console.log('g_speech_reg-ex:'+ex)
        return null
    }
}

  export default {
    data() {
        return {
            title:''
        };
    },
    created()
    {
        console.log('into created()')
    },
    async mounted() {
    },
    async activated(){
        console.log('into index.vue activated()')
    },
    methods: {
    }
  };
  </script>
  <style lang="stylus" scoped>
  </style>
  