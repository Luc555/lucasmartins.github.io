/* ================================================================
   admin.js — painel admin protegido por senha
   ================================================================ */

/* ── SUPABASE (service key) ──────────────────────────────────── */
function hdrs() {
  return {
    "Content-Type":  "application/json",
    "apikey":        CONFIG.supabaseServiceKey,
    "Authorization": `Bearer ${CONFIG.supabaseServiceKey}`,
    "Prefer":        "return=representation",
  };
}

async function dbGet(table, qs = "") {
  const r = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}?${qs}`, { headers: hdrs() });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function dbInsert(table, data) {
  const r = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}`, {
    method: "POST", headers: hdrs(), body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function dbUpdate(table, id, data) {
  const r = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH", headers: hdrs(), body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

async function dbDelete(table, id) {
  const r = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}?id=eq.${id}`, {
    method: "DELETE",
    headers: { ...hdrs(), "Prefer": "return=minimal" },
  });
  if (!r.ok) throw new Error(await r.text());
}

/* ── STATE ───────────────────────────────────────────────────── */
let projects  = [];
let editingId = null;

/* ── DOM ─────────────────────────────────────────────────────── */
const $ = id => document.getElementById(id);

const loginScreen   = $("login-screen");
const adminPanel    = $("admin-panel");
const passwordInput = $("password-input");
const loginBtn      = $("login-btn");
const loginError    = $("login-error");
const logoutBtn     = $("logout-btn");
const projectsList  = $("projects-list");
const newBtn        = $("new-project-btn");
const formPanel     = $("form-panel");
const formTitle     = $("form-title");
const cancelBtn     = $("cancel-btn");
const saveBtn       = $("save-btn");
const saveStatus    = $("save-status");
const contactsList  = $("contacts-list");

/* ── LOGIN ───────────────────────────────────────────────────── */
if (sessionStorage.getItem("admin_ok") === "1") {
  showPanel();
}

loginBtn.addEventListener("click", () => {
  if (passwordInput.value === CONFIG.adminPassword) {
    sessionStorage.setItem("admin_ok", "1");
    loginError.textContent = "";
    showPanel();
  } else {
    loginError.textContent = "Senha incorreta.";
    passwordInput.value    = "";
    passwordInput.focus();
  }
});

passwordInput.addEventListener("keydown", e => { if (e.key === "Enter") loginBtn.click(); });

logoutBtn.addEventListener("click", () => {
  sessionStorage.removeItem("admin_ok");
  location.reload();
});

function showPanel() {
  loginScreen.style.display = "none";
  adminPanel.style.display  = "block";
  loadAll();
}

/* ── LOAD ────────────────────────────────────────────────────── */
async function loadAll() {
  await Promise.all([loadProjects(), loadContacts()]);
}

async function loadProjects() {
  try {
    projects = await dbGet("projects", "order=created_at.asc");
    renderList();
  } catch (e) {
    projectsList.innerHTML = `<p class="adm-error">Erro: ${e.message}</p>`;
  }
}

async function loadContacts() {
  try {
    const contacts = await dbGet("contacts", "order=created_at.desc");
    renderContacts(contacts);
  } catch (e) {
    contactsList.innerHTML = `<p class="adm-error">Erro: ${e.message}</p>`;
  }
}

/* ── PROJECTS LIST ───────────────────────────────────────────── */
function renderList() {
  if (!projects.length) {
    projectsList.innerHTML = `<p class="adm-empty">Nenhum projeto. Clique em "Novo projeto".</p>`;
    return;
  }
  projectsList.innerHTML = projects.map(p => `
    <div class="proj-row">
      <div class="proj-row-info">
        <span class="proj-row-title">${p.title}</span>
        <span class="proj-row-meta">${(p.tags||[]).join(" · ")} &nbsp;|&nbsp; ${p.folder}</span>
      </div>
      <div class="proj-row-btns">
        <button class="adm-btn-edit" data-id="${p.id}">Editar</button>
        <button class="adm-btn-del"  data-id="${p.id}">Excluir</button>
      </div>
    </div>
  `).join("");

  projectsList.querySelectorAll(".adm-btn-edit").forEach(b =>
    b.addEventListener("click", () => openForm(+b.dataset.id))
  );
  projectsList.querySelectorAll(".adm-btn-del").forEach(b =>
    b.addEventListener("click", () => deleteProject(+b.dataset.id))
  );
}

/* ── DELETE ──────────────────────────────────────────────────── */
async function deleteProject(id) {
  const p = projects.find(p => p.id === id);
  if (!confirm(`Excluir "${p.title}"?`)) return;
  try {
    await dbDelete("projects", id);
    await loadProjects();
    closeForm();
  } catch (e) {
    alert("Erro ao excluir: " + e.message);
  }
}

/* ── FORM ────────────────────────────────────────────────────── */
newBtn.addEventListener("click",    () => openForm(null));
cancelBtn.addEventListener("click", closeForm);

function openForm(id) {
  editingId = id;
  saveStatus.textContent    = "";
  saveStatus.className      = "adm-status";
  formTitle.textContent     = id ? "Editar projeto" : "Novo projeto";

  if (id) {
    const p = projects.find(p => p.id === id);
    $("f-title").value       = p.title;
    $("f-description").value = p.description;
    $("f-tags").value        = (p.tags  || []).join(", ");
    $("f-github").value      = p.github;
    $("f-live").value        = p.live   || "";
    $("f-folder").value      = p.folder;
    $("f-photos").value      = (p.photos|| []).join(", ");
  } else {
    ["f-title","f-description","f-tags","f-github","f-live","f-folder","f-photos"]
      .forEach(id => $(id).value = "");
  }

  formPanel.style.display = "block";
  formPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  $("f-title").focus();
}

function closeForm() {
  formPanel.style.display = "none";
  editingId = null;
}

function getFormData() {
  return {
    title:       $("f-title").value.trim(),
    description: $("f-description").value.trim(),
    tags:        $("f-tags").value.split(",").map(t=>t.trim()).filter(Boolean),
    github:      $("f-github").value.trim(),
    live:        $("f-live").value.trim() || null,
    folder:      $("f-folder").value.trim(),
    photos:      $("f-photos").value.split(",").map(t=>t.trim()).filter(Boolean),
  };
}

saveBtn.addEventListener("click", async () => {
  const data = getFormData();

  if (!data.title || !data.description || !data.github || !data.folder) {
    saveStatus.textContent = "Preencha título, descrição, GitHub e pasta.";
    saveStatus.className   = "adm-status err";
    return;
  }

  saveBtn.textContent    = "Salvando…";
  saveBtn.disabled       = true;
  saveStatus.textContent = "";

  try {
    if (editingId) {
      await dbUpdate("projects", editingId, data);
    } else {
      await dbInsert("projects", data);
    }
    saveStatus.textContent = "Salvo com sucesso!";
    saveStatus.className   = "adm-status ok";
    await loadProjects();
    setTimeout(closeForm, 800);
  } catch (e) {
    saveStatus.textContent = "Erro: " + e.message;
    saveStatus.className   = "adm-status err";
  } finally {
    saveBtn.textContent = "Salvar projeto";
    saveBtn.disabled    = false;
  }
});

/* ── CONTACTS LIST ───────────────────────────────────────────── */
function renderContacts(contacts) {
  if (!contacts.length) {
    contactsList.innerHTML = `<p class="adm-empty">Nenhuma mensagem ainda.</p>`;
    return;
  }
  contactsList.innerHTML = contacts.map(c => `
    <div class="contact-row">
      <div class="contact-header">
        <span class="contact-name">${c.name}</span>
        <span class="contact-email">${c.email}</span>
        <span class="contact-date">${new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
      </div>
      <p class="contact-msg">${c.message}</p>
    </div>
  `).join("");
}