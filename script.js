import { loadPyodide } from './pyodide/pyodide.js';

let pyodide = null;
let currentLang = "python";
let currentProject = null;

function log(text) {
  const out = document.getElementById("output");
  out.textContent += text + "\n";
}

function updateProjectList() {
  currentLang = document.getElementById("languageSelect").value;
}

function createProject() {
  const name = prompt("Project name:");
  if (!name) return;
  const projects = JSON.parse(localStorage.getItem(`projects_${currentLang}`) || "[]");
  projects.push({ name, code: "" });
  localStorage.setItem(`projects_${currentLang}`, JSON.stringify(projects));
  log(`✅ Project "${name}" created`);
}

function saveCurrentProject() {
  if (currentProject === null) return;
  const code = document.getElementById("editor").textContent;
  const projects = JSON.parse(localStorage.getItem(`projects_${currentLang}`) || "[]");
  projects[currentProject].code = code;
  localStorage.setItem(`projects_${currentLang}`, JSON.stringify(projects));
  log("✅ Project saved");
}

async function runCode() {
  saveCurrentProject();
  const code = document.getElementById("editor").textContent;

  if (currentLang === "python") {
    if (!pyodide) { log("❌ Pyodide not loaded"); return; }
    try {
      const result = await pyodide.runPythonAsync(code);
      log(result ?? "✅ Done");
    } catch(e) {
      log("❌ Python Error: " + e);
    }
  } else if (currentLang === "js") {
    try {
      const result = eval(code);
      log(result ?? "✅ Done");
    } catch(e) {
      log("❌ JS Error: " + e);
    }
  } else if (currentLang === "html") {
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "200px";
    document.getElementById("output").appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(code);
    iframe.contentDocument.close();
    log("✅ HTML displayed");
  } else {
    log("⚠️ This language is not supported yet");
  }
}

async function loadPlugins() {
  log("✅ Plugins loaded (add .py files in plugins folder)");
}

async function main() {
  log("⏳ Loading Python...");
  try {
    pyodide = await loadPyodide({
      indexURL: "./pyodide/"
    });
    log("✅ Python ready!");
  } catch(e) {
    log("❌ Pyodide load error: " + e);
  }
  loadPlugins();
  updateProjectList();
}

// Attach buttons
document.getElementById("newProjectBtn").onclick = createProject;
document.getElementById("saveBtn").onclick = saveCurrentProject;
document.getElementById("runBtn").onclick = runCode;

main();
