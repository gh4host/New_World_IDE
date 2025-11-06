<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>New Peace Studio</title>
<style>
body { font-family: monospace; background: #1e1e1e; color: #f5f5f5; margin:0; padding:10px; }
#editor { width: 100%; height: 200px; background:#2e2e2e; color:#f5f5f5; padding:5px; }
#output { width: 100%; height:200px; background:#111; color:#0f0; padding:5px; overflow:auto; margin-top:10px; }
button { margin: 5px; }
select { margin: 5px; }
</style>
</head>
<body>

<h2>New Peace Studio</h2>

<select id="languageSelect">
  <option value="python">Python</option>
  <option value="js">JavaScript</option>
  <option value="html">HTML</option>
</select>
<button onclick="createProject()">Новый проект</button>
<button onclick="saveCurrentProject()">Сохранить</button>
<button onclick="runCode()">▶ Запустить</button>

<div id="editor" contenteditable="true">print("Привет, Эльдар!")</div>
<div id="output"></div>

<script type="module">
import { loadPyodide } from "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";

let pyodide = null;
let currentLang = "python";
let currentProject = null;

function log(text) {
  const out = document.getElementById("output");
  out.textContent += text + "\n";
}

function updateProjectList() {
  currentLang = document.getElementById("languageSelect").value;
  const projects = JSON.parse(localStorage.getItem(`projects_${currentLang}`) || "[]");
  // можно добавить UI списка проектов
}

function createProject() {
  const name = prompt("Имя проекта:");
  if (!name) return;
  const projects = JSON.parse(localStorage.getItem(`projects_${currentLang}`) || "[]");
  projects.push({ name, code: "" });
  localStorage.setItem(`projects_${currentLang}`, JSON.stringify(projects));
  updateProjectList();
  log(`✅ Проект "${name}" создан`);
}

function openProject(index) {
  const projects = JSON.parse(localStorage.getItem(`projects_${currentLang}`) || "[]");
  currentProject = index;
  document.getElementById("editor").textContent = projects[index].code;
}

function saveCurrentProject() {
  if (currentProject === null) return;
  const code = document.getElementById("editor").textContent;
  const projects = JSON.parse(localStorage.getItem(`projects_${currentLang}`) || "[]");
  projects[currentProject].code = code;
  localStorage.setItem(`projects_${currentLang}`, JSON.stringify(projects));
  log("✅ Проект сохранён");
}

async function runCode() {
  saveCurrentProject();
  const code = document.getElementById("editor").textContent;
  
  if (currentLang === "python") {
    if (!pyodide) { log("❌ Pyodide не загружен"); return; }
    try {
      const result = await pyodide.runPythonAsync(code);
      log(result ?? "✅ Готово");
    } catch(e) {
      log("❌ Ошибка: " + e);
    }
  } else if (currentLang === "js") {
    try {
      const result = eval(code);
      log(result ?? "✅ Готово");
    } catch(e) {
      log("❌ Ошибка JS: " + e);
    }
  } else if (currentLang === "html") {
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "200px";
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
  // пока просто заглушка
  log("✅ Плагины загружены (можно добавить .py файлы через localStorage)");
}

async function main() {
  log("⏳ Загружается Python...");
  try {
    pyodide = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
    });
    log("✅ Python готов!");
  } catch(e) {
    log("❌ Ошибка загрузки Pyodide: " + e);
  }
  await loadPlugins();
  updateProjectList();
}

main();
</script>

</body>
</html>
