let pyodide;
let currentLang = "python";
let currentProject = null;

async function main() {
  showTab("projects");
  log("⏳ Загружается Python...");
  try {
    pyodide = await loadPyodide({ indexURL: "pyodide/" });
    log("✅ Python готов!");
  } catch(e) {
    log("❌ Ошибка загрузки Pyodide: " + e);
  }
  await loadPlugins();
  updateProjectList();
}

function log(text) {
  const out = document.getElementById("output");
  out.textContent += text + "\n";
}

function showTab(id) {
  document.querySelectorAll(".tab").forEach(el => el.style.display = "none");
  document.getElementById(id).style.display = "block";
}

function updateProjectList() {
  currentLang = document.getElementById("languageSelect").value;
  const list = document.getElementById("projectList");
  list.innerHTML = "";
  const projects = JSON.parse(localStorage.getItem(`projects_${currentLang}`) || "[]");
  projects.forEach((p, i) => {
    const li = document.createElement("li");
    li.textContent = p.name;
    li.onclick = () => openProject(i);
    list.appendChild(li);
  });
}

function createProject() {
  const name = prompt("Имя проекта:");
  if (!name) return;
  const projects = JSON.parse(localStorage.getItem(`projects_${currentLang}`) || "[]");
  projects.push({ name, code: "" });
  localStorage.setItem(`projects_${currentLang}`, JSON.stringify(projects));
  updateProjectList();
}

function openProject(index) {
  const projects = JSON.parse(localStorage.getItem(`projects_${currentLang}`) || "[]");
  currentProject = index;
  document.getElementById("codeArea").value = projects[index].code;
  showTab("editor");
}

function saveCurrentProject() {
  if (currentProject === null) return;
  const code = document.getElementById("codeArea").value;
  const projects = JSON.parse(localStorage.getItem(`projects_${currentLang}`) || "[]");
  projects[currentProject].code = code;
  localStorage.setItem(`projects_${currentLang}`, JSON.stringify(projects));
}

async function runCode() {
  saveCurrentProject();
  const code = document.getElementById("codeArea").value;
  if (currentLang === "python") {
    if(!pyodide) { log("❌ Pyodide не загружен"); return; }
    try {
      const result = await pyodide.runPythonAsync(code);
      log(result || "✅ Готово");
    } catch(e) { log("❌ Ошибка: " + e); }
  } else if (currentLang === "js") {
    try { const result = eval(code); log(result || "✅ Готово"); }
    catch(e) { log("❌ Ошибка JS: " + e); }
  } else if (currentLang === "html") {
    const iframe = document.createElement("iframe");
    iframe.style.width="100%";
    iframe.style.height="200px";
    document.getElementById("output").appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(code);
    iframe.contentDocument.close();
    log("✅ HTML отображён");
  } else {
    log("⚠️ Этот язык пока не поддерживается");
  }
}

async function loadPlugins() {
  const pluginList = document.getElementById("pluginList");
  pluginList.textContent = "✅ Плагины загружены (добавь .py файлы в папку plugins)";
}

main();
