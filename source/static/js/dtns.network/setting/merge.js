/**
 * author:poplang
 * date:2025-2-6
 * descript: merge the *.json to setting.js， format the setting.json for dtns.network（copy from node-js-version setting）
 */
const fs = require('fs');
// directory path
const dir = './';
const files = fs.readdirSync(dir);
let codeStr = ''
for(let i=0;i<files.length;i++)
{
    if(['setting.json','.','..','merge.js','setting.js','setting.json'].indexOf( files[i]) >=0) continue
    const tmpSetting = require('./'+files[i])
    codeStr += '//------文件名：'+files[i]+'--------------------\n'
    for(key in tmpSetting) //window[key] = dnalink_setting[key]
    {
        codeStr += 'window.'+key+'\t=\t'+JSON.stringify(tmpSetting[key])+'\n\n'
    }
}

console.log('merge-result:',codeStr)
fs.writeFileSync('./setting.js',codeStr)
