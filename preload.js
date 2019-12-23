// ! Ghost Note

utools.onPluginEnter(({ code, payload, type }) => {
  console.log('..:: type', type)
  console.log('..:: payload', payload)
  console.log('..:: code', code)
  switch (code) {
    case 'addnote':
      let _id = payload.appPath
      let data = utools.db.get(_id) || { _id, note: payload.app }
      console.log('..:: data', data)
      utools.db.put(data)
      break
    case 'listnote':
    default:
      let notes = utools.db.allDocs()
      console.log('..:: notes', notes)
      break
  }
})
