let currentLang = "js";
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
  const name = prompt("Project name:");
  if (!name) return;
  const projects = JSON.parse(localStorage.getItem(`projects_${currentLang}`) || "[]");
  projects.push({ name, code: "" });
  localStorage.setItem(`projects_${currentLang}`, JSON.stringify(projects));
  updateProjectList();
  log(`✅ Project "${name}" created`);
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
  log(`✅ Project saved`);
}

function runCode() {
  saveCurrentProject();
  const code = document.getElementById("editor").textContent;
  const lang = document.getElementById("languageSelect").value;
  const output = document.getElementById("output");

  if(lang === "js") {
    try {
      const result = eval(code);
      log(result !== undefined ? result : "✅ JS executed");
    } catch(e) {
      log("❌ JS Error: " + e);
    }
  }
  else if(lang === "html") {
    const iframe = document.createElement("iframe");
    iframe.style.width="100%";
    iframe.style.height="200px";
    output.appendChild(iframe);
    iframe.contentDocument.open();
    iframe.contentDocument.write(code);
    iframe.contentDocument.close();
    log("✅ HTML rendered");
  }
  else if(lang === "css") {
    const style = document.getElementById("dynamicStyle") || document.createElement("style");
    style.id = "dynamicStyle";
    style.textContent = code;
    document.head.appendChild(style);
    log("✅ CSS applied");
  }
  else {
    log("⚠️ Language not supported");
  }
}

// Initialize
updateProjectList();
log("IDE ready. Select language and write code above.");
