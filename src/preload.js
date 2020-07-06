// * Ghost Note
utools.onPluginEnter(({ code, payload }) => {
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
