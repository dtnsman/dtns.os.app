const most = require('most')

const { solidsAsBlob } = require('@jscad/io')

const { withLatestFrom } = require('../../most-utils')

const { exportFilePathFromFormatAndDesign } = require('../../core/io/exportUtils')

const reducers = {
  initialize: (state) => {
    const io = {
      exportFormat: '',
      exportFilePath: '', // default export file path
      availableExportFormats: []
    }
    return { io }
  },

  setExportFormat: (state, exportFormat) => {
    const io = Object.assign({ }, state.io, exportFilePathFromFormatAndDesign(state.design, exportFormat), { exportFormat })
    return { io }
  },

  requestExport: (state) => {
    const { exportFilePath, exportFormat } = state.io
    const { solids } = state.design
    const { saveAs } = require('file-saver')
    const format = exportFormat
    const blob = solidsAsBlob(solids, { format })
    // FIXME: BAD ! does not use side effects!
    // fs.writeFileSync(filePath, buffer)
    console.log('req-export-blob:',blob,exportFilePath)
    let canvas = document.getElementById('renderTarget')
    let base64 = canvas.toDataURL('image/webp',0.9)
    console.log('req-export-base64:',base64)
    let script = typeof g_get_script == 'function' ? g_get_script() :null
    console.log('req-export-script:',script)
    localStorage.setItem('jscad:script',script)

    if(typeof g_send_xmsg == 'function'){
      g_send_xmsg(exportFilePath,blob,script)
    }

    saveAs(blob, exportFilePath)
    // return { io }
  }
}

const actions = ({ sources }) => {
  const initializeExports$ = most.just({})
    .thru(withLatestFrom(reducers.initialize, sources.state))
    .map((payload) => Object.assign({}, { type: 'initializeExports', sink: 'state' }, { state: payload }))

  const changeExportFormat$ = sources.dom.select('#exportFormats').events('change')
    .map((e) => e.target.value)
    .thru(withLatestFrom(reducers.setExportFormat, sources.state))
    .map((payload) => Object.assign({}, { type: 'changeExportFormat', sink: 'state' }, { state: payload }))
    .multicast()

  const requestExport$ = sources.dom.select('#exportBtn').events('click')
    .thru(withLatestFrom(reducers.requestExport, sources.state))
    .map((data) => ({ type: 'exportRequested', data }))

  return { initializeExports$, requestExport$, changeExportFormat$ }
}

module.exports = actions
