// * Ghost Note

var timeid = null
var mde = new SimpleMDE({
  autofocus: true,
  status: false,
  toolbar: false,
  spellChecker: false,
  shortcuts: {
    toggleBlockquote: null,
    toggleBold: null,
    cleanBlock: null,
    toggleHeadingSmaller: null,
    toggleItalic: null,
    drawLink: null,
    toggleUnorderedList: null,
    togglePreview: null,
    toggleCodeBlock: null,
    drawImage: null,
    toggleOrderedList: null,
    toggleHeadingBigger: null,
    toggleSideBySide: null,
    toggleFullScreen: null,
  },
})

mde.codemirror.on('change', (editor, evt) => {
  // save note
  timeid && clearTimeout(timeid)
  timeid = setTimeout(() => {
    timeid = null
    saveNote()
  }, 1000)
})
mde.codemirror.on('keydown', (editor, evt) => {
  if (evt.ctrlKey || evt.metaKey) {
    switch (evt.key) {
      case 's':
        break
      case 'w':
        app.status = 'ghost'
        saveNote()
        updateNotes()
        break
      default:
        break
    }
  }
})

var app = new Vue({
  el: '#app',
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
      status: null,
      noteid: null,
    }
  },
  watch: {
    status(newVal, oldVal) {
      document.getElementById('editorbox').hidden = newVal !== 'bind'
    },
  },
  methods: {
    runApp(path) {
      utools.shellOpenPath(path)
    },
    timeFormatter(value) {
      const date = new Date(value)
      return [
        [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('/'),
        [date.getHours(), date.getMinutes(), date.getSeconds()]
          .map((item) => (item > 9 ? item : '0' + item))
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
  app.status = 'bind'
  app.noteid = id
  setTimeout(() => {
    mde.value(note.content)
  }, 0)

  utools.db.put(note)
}

function saveNote() {
  let note = utools.db.get(app.noteid)
  note.content = mde.value()
  note.updated = new Date()
  utools.db.put(note)
}

function delNote(evt) {
  app.$bvModal
    .msgBoxConfirm('Sure to delete this Note?', {
      title: 'Confirm',
      okVariant: 'danger',
      okTitle: 'Delete',
      cancelTitle: 'Cancel',
    })
    .then((value) => {
      if (value) {
        utools.db.remove(evt.target.value)
        updateNotes()
      }
    })
}

function safeid(id) {
  return id.replace(/\//g, '{{._.}}')
}

function unsafeid(id) {
  return id.replace(/\{\{\._\.\}\}/g, '/')
}
