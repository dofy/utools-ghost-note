// * Ghost Note
const { shell } = require('electron')

window.runApp = shell.openItem

utools.onPluginEnter(({ code, payload, type }) => {
  utools.setExpendHeight(630)
  app.status = code
  updateNotes()
  switch (code) {
    case 'bind':
      editNote(payload.appPath, payload)
      break
    case 'ghost':
    default:
      break
  }
})

utools.onPluginOut(() => {})
