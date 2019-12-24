// ! Ghost Note

let mde = new SimpleMDE({
  element: $('mde'),
  autofocus: true,
  spellChecker: false,
  status: false,
  toolbar: false,
})

mde.codemirror.on('change', function() {
  console.log(mde.value())
})

function $(id) {
  return document.getElementById(id)
}

function autosave(form) {
  console.log(form.mde)
}

utools.onPluginEnter(({ code, payload, type }) => {
  switch (code) {
    case 'addnote':
      $('list').style.display = 'none'
      $('editor').style.display = 'block'
      let _id = payload.appPath
      let note = utools.db.get(_id) || { _id, note: `# Note for payload.app\n` }
      console.log('..:: note', note)
      utools.db.put(note)
      mde.value(note.note)
      break
    case 'listnote':
    default:
      $('editor').style.display = 'none'
      $('list').style.display = 'block'
      let notes = utools.db.allDocs()
      break
  }
})
