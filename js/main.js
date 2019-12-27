// * Ghost Note
const editor = new Stackedit()
editor.on('fileChange', file => {
  note = utools.db.get(unsafeid(file.name))
  note.content = file.content.text
  note.updated = new Date()
  utools.db.put(note)
})
editor.on('close', () => {
  updateNotes()
})

var app = new Vue({
  el: '#list',
  data() {
    return {
      notes: [],
      fields: [
        '#',
        {
          key: 'app',
          label: 'Bind App',
          sortable: true,
        },
        {
          key: 'created',
          label: 'Created',
          sortable: true,
          formatter: 'timeFormatter',
        },
        {
          key: 'updated',
          label: 'Updated',
          sortable: true,
          formatter: 'timeFormatter',
        },
        'Actions',
      ],
    }
  },
  methods: {
    timeFormatter(value) {
      const date = new Date(value)
      return [
        [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('/'),
        [date.getHours(), date.getMinutes(), date.getSeconds()]
          .map(item => (item > 9 ? item : '0' + item))
          .join(':'),
      ].join(' ')
    },
  },
})

function updateNotes() {
  app.notes = utools.db
    .allDocs()
    .sort((x, y) => +new Date(y.updated) - +new Date(x.updated))
}

function editNote(id, payload) {
  let note = utools.db.get(id) || {
    _id: id,
    app: payload.app,
    created: new Date(),
    updated: new Date(),
    content: `# Note for ${payload.app}\n`,
  }
  utools.db.put(note)
  editor.openFile({
    name: safeid(id),
    content: {
      text: note.content,
    },
  })
}

function delNote(id) {
  utools.db.remove(id)
  updateNotes()
}

function runApp(path) {
  spawn(path)
}

function safeid(id) {
  return id.replace(/\//g, '{{._.}}')
}

function unsafeid(id) {
  return id.replace(/\{\{\._\.\}\}/g, '/')
}
