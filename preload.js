// * Ghost Note
const { spawn } = require('child_process')

window.spawn = spawn

utools.onPluginEnter(({ code, payload, type }) => {
  utools.setExpendHeight(630)
  updateNotes()
  switch (code) {
    case 'addnote':
      editNote(payload.appPath, payload)
      break
    case 'listnote':
    default:
      editor.close()
      break
  }
})

utools.onPluginOut(() => {
  editor.close()
})