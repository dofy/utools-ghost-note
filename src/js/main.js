// * Ghost Note
var app = new Vue({
  el: "#app",
  data() {
    // const option = utools.getFeatures(["bind"])[0];
    return {
      notes: [],
      fields: [
        "#",
        {
          key: "app",
          label: "Bind App",
          sortable: true,
        },
        {
          key: "created",
          label: "Created",
          sortable: true,
          formatter: "timeFormatter",
        },
        {
          key: "updated",
          label: "Updated",
          sortable: true,
          formatter: "timeFormatter",
        },
        "Actions",
      ],
      apps: [],
      status: null,
      noteid: null,
      keyword: "",
      keywordContent: "",
      keywordLength: 0,
      keywordIndex: 1,
      isShowedit: true,
      note: "",
    };
  },
  watch: {
    apps(apps) {
      utools.setFeature({
        code: "bind",
        explain: "为当前应用添加 Ghost Note",
        cmds: [
          {
            type: "window",
            label: "Bind Ghost Note",
            match: {
              app: apps,
            },
          },
        ],
      });
      utools.showNotification("应用列表保存成功!");
    },
  },
  methods: {
    runApp(path) {
      utools.shellOpenPath(path);
    },
    timeFormatter(value) {
      const date = new Date(value);
      return [
        [date.getFullYear(), date.getMonth() + 1, date.getDate()].join("/"),
        [date.getHours(), date.getMinutes(), date.getSeconds()]
          .map((item) => (item > 9 ? item : "0" + item))
          .join(":"),
      ].join(" ");
    },
  },
});

let timeid = null;
let mde = new SimpleMDE({
  autofocus: true,
  status: false,
  toolbar: false,
  spellChecker: false,
  autoDownloadFontAwesome: true,
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
});

mde.codemirror.on("change", (editor, evt) => {
  // save note
  timeid && clearTimeout(timeid);
  timeid = setTimeout(() => {
    timeid = null;
    saveNote();
  }, 1000);
});

mde.codemirror.on("keydown", (editor, evt) => {
  if (evt.ctrlKey || evt.metaKey) {
    switch (evt.key) {
      case "s":
        break;
      case "w":
        app.status = "ghost";
        saveNote();
        updateNotes();
        break;
      default:
        break;
    }
  }
});

function updateNotes() {
  app.notes = utools.db
    .allDocs()
    .sort((x, y) => +new Date(y.updated) - +new Date(x.updated));
}

async function editNote(id, payload) {
  let note = utools.db.get(id) || {
    _id: id,
    app: payload.app,
    created: new Date(),
    updated: new Date(),
    content: ` # Note for ${payload.app}\n  `,
  };
  app.status = "bind";
  app.noteid = id;
  setTimeout(() => {
    mde.value(note.content);
  }, 0);
  utools.db.put(note);
}

function saveNote() {
  let note = utools.db.get(app.noteid);
  note.content = mde.value();
  note.updated = new Date();
  utools.db.put(note);
}

function delNote(evt) {
  app.$bvModal
    .msgBoxConfirm("确定要删除这条 Note 吗?", {
      title: "确认",
      okVariant: "danger",
      okTitle: "删除",
      cancelTitle: "取消",
    })
    .then((value) => {
      if (value) {
        utools.db.remove(evt.target.value);
        updateNotes();
      }
    });
}

// safeid
function safeid(id) {
  return id.replace(/\//g, "{{._.}}");
}

// unsafeid
function unsafeid(id) {
  return id.replace(/\{\{\._\.\}\}/g, "/");
}

// init settings
function initSettings() {
  const features = utools.getFeatures(["bind"]);
  if (features.length <= 0) {
    // fix old user's options by database
    app.apps = utools.db.allDocs().map((item) => item.app);
  } else {
    // read apps from features
    app.apps = features[0].cmds[0].match.app;
  }

  utools.setFeature({
    code: "bind",
    explain: "为当前应用添加 Ghost Note",
    cmds: [
      {
        type: "window",
        label: "Bind Ghost Note",
        match: {
          app: app.apps,
        },
      },
    ],
  });
}

//search
let precentIndex = 0;
function search() {
  let note = utools.db.get(app.noteid);
  if (app.keyword) {
    mde.codemirror.getWrapperElement().style.display = "none";
    app.isShowedit = false;
    let noteList = note.content.split("\n");
    let arr = noteList.map((item) => {
      if (item.indexOf("## ") != -1) {
        item = "<h2>" + item + "</h2>";
      } else if (item.indexOf("# ") != -1) {
        item = "<h1>" + item + "</h1>";
      } else {
        item = "<p>" + item + "<p>";
      }
      return item;
    });
    app.note = arr.join("\n");
    let reg = new RegExp(`(${app.keyword})`, "g");
    app.keywordLength = note.content.match(reg)
      ? note.content.match(reg).length
      : 0;
    app.note = app.note.replace(
      reg,
      `<span class="search-span" style="color:#FFBB33;">${app.keyword}</span>`
    );
    let length =
      `<span class="search-span" style="color:#FFBB33;">${app.keyword}</span>`
        .length;
    let firstIndex = app.note.indexOf(
      `<span class="search-span" style="color:#FFBB33;">${app.keyword}</span>`
    );
    let left =
      app.note.slice(0, firstIndex) +
      `<span class="search-span" style="color:#37f;">${app.keyword}</span>`;
    let right = app.note.slice(firstIndex + length);
    let newStr = left + right;
    app.note = newStr;
    app.keywordIndex = 0;
    down();
  } else {
    mde.codemirror.getWrapperElement().style.display = "block";
    app.isShowedit = true;
  }
}
function changeColor(val) {
  let domList = document.querySelectorAll(".search-span");
  domList.forEach((span, index) => {
    if (index + 1 == val) {
      span.style.color = "#37f";
    } else {
      span.style.color = "#FFBB33";
    }
  });
}

function scroll() {
  let targetElement;
  let domList = document.querySelectorAll(".search-span");
  domList.forEach((span) => {
    if (span.style.color === "rgb(51, 119, 255)") {
      // 对应 #37f 的 RGB 值
      targetElement = span;
    }
  });
  if (targetElement) {
    targetElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }
}
function down() {
  if (app.keywordIndex < app.keywordLength) {
    app.keywordIndex++;
    changeColor(app.keywordIndex);
    scroll();
  } else {
    app.keywordIndex = 0;
    down();
    scroll();
  }
}
function up() {
  if (app.keywordIndex > 1) {
    app.keywordIndex--;
    changeColor(app.keywordIndex);
    scroll();
  } else {
    app.keywordIndex = app.keywordLength + 1;
    up();
    scroll();
  }
}

document.addEventListener("keydown", function (event) {
  if (
    event.ctrlKey &&
    (event.key === "n" || event.key === "N") &&
    app.keyword
  ) {
    down();
  }
  if (
    event.ctrlKey &&
    (event.key === "p" || event.key === "P") &&
    app.keyword
  ) {
    down();
  }
});
