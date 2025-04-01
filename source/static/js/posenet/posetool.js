window.g_2d_pose_find =async function(base64)
{
    const imgEle = document.createElement('img')
    imgEle.src =base64
    let net = await posenet.load()
    const pose = await net.estimateSinglePose(imgEle, {
        flipHorizontal: true
      });
    const imageWidth = imgEle.width;
    const imageHeight = imgEle.height;
    let result =  {pose,w:imageWidth,h:imageHeight}
    console.log('g_2d_pose_find:result:',result)
    return result
}

function speak({ text, speechRate, lang, volume, pitch }, endEvent, startEvent) {
  if (!window.SpeechSynthesisUtterance) {
      console.warn('当前浏览器不支持文字转语音服务')
      return;
  }

  if (!text) {
      return;
  }

  const speechUtterance = new SpeechSynthesisUtterance();
  speechUtterance.text = text;
  speechUtterance.rate = speechRate || 1;
  speechUtterance.lang = lang || 'zh-CN';
  speechUtterance.volume = volume || 1;
  speechUtterance.pitch = pitch || 1;
  speechUtterance.onend = function() {
      endEvent && endEvent();
  };
  speechUtterance.onstart = function() {
      startEvent && startEvent();
  };
  speechSynthesis.speak(speechUtterance);
  
  return speechUtterance;
}
const poseVoiceTimeObj = {text:null,lastTime:0}
window.g_2d_voice_play = function(text)
{
  console.log('g_2d_voice_play:text:',text)
  //3秒播放一次（避免重复）
  if(text == poseVoiceTimeObj.text && poseVoiceTimeObj.lastTime+ 3000 > Date.now()) return false
  poseVoiceTimeObj.lastTime = Date.now()
  poseVoiceTimeObj.text = text
  speak({text})
}