/* ================================================================
   main.js — site público. Não precisa mexer aqui.
   ================================================================ */

async function supabaseGet(table, params = "") {
  const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/${table}?${params}`, {
    headers: {
      "apikey":        CONFIG.supabasePublicKey,
      "Authorization": `Bearer ${CONFIG.supabasePublicKey}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}`);
  return res.json();
}

function photoPath(folder, filename) {
  return `assets/images/projects/${folder}/${filename}`;
}

function githubIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`;
}

/* ── RENDER CARDS ────────────────────────────────────────────── */
function renderCards(projects) {
  const grid = document.getElementById("projects-grid");

  if (!projects.length) {
    grid.innerHTML = `<div class="empty-state">
      Nenhum projeto ainda.<br/>
      Adicione pelo <a href="admin.html" style="color:var(--accent)">painel admin</a>.
    </div>`;
    return;
  }

  // Store globally for gallery
  window._projects = projects.map(p => ({
    ...p,
    _photos: (p.photos || []).map(f => photoPath(p.folder, f)),
  }));

  grid.innerHTML = projects.map((p, i) => {
    const photos = (p.photos || []).map(f => photoPath(p.folder, f));
    const count  = photos.length;
    return `
    <article class="card reveal" data-index="${i}" tabindex="0" role="button" aria-label="Ver ${p.title}">
      <div class="card-thumb">
        ${count > 0
          ? `<img src="${photos[0]}" alt="${p.title}" loading="lazy" />`
          : `<div class="card-placeholder">${p.title.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>`
        }
        ${count > 0 ? `
        <div class="card-hover-overlay">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          <span>${count} foto${count > 1 ? "s" : ""}</span>
        </div>` : ""}
      </div>
      <div class="card-body">
        <div class="card-tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("")}</div>
        <h3 class="card-title">${p.title}</h3>
        <p class="card-desc">${p.description}</p>
        <div class="card-footer">
          <a class="card-github" href="${p.github}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
            ${githubIcon()} View repo
          </a>
          ${p.live ? `<a class="card-github" href="${p.live}" target="_blank" rel="noopener" onclick="event.stopPropagation()" style="margin-left:auto">Live demo</a>` : ""}
        </div>
      </div>
    </article>`;
  }).join("");

  grid.querySelectorAll(".card").forEach(card => {
    const i = parseInt(card.dataset.index);
    card.addEventListener("click",   ()  => openGallery(i, 0));
    card.addEventListener("keydown", e  => { if (e.key === "Enter") openGallery(i, 0); });
  });

  grid.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
}

/* ── GALLERY ─────────────────────────────────────────────────── */
let curProj  = 0;
let curPhoto = 0;

const overlay   = document.getElementById("modal-overlay");
const closeBtn  = document.getElementById("modal-close");
const modalImg  = document.getElementById("modal-img");
const modalTit  = document.getElementById("modal-title");
const modalDes  = document.getElementById("modal-desc");
const modalRep  = document.getElementById("modal-repo");
const modalLiv  = document.getElementById("modal-live");
const modalDots = document.getElementById("modal-dots");
const prevBtn   = document.getElementById("modal-prev");
const nextBtn   = document.getElementById("modal-next");
const imgCount  = document.getElementById("modal-img-count");

function openGallery(pi, ph) {
  const p = window._projects[pi];
  if (!p._photos.length) { window.open(p.github, "_blank"); return; }
  curProj = pi; curPhoto = ph;
  modalTit.textContent   = p.title;
  modalDes.textContent   = p.description;
  modalRep.href          = p.github;
  modalLiv.style.display = p.live ? "inline-flex" : "none";
  if (p.live) modalLiv.href = p.live;
  showPhoto();
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function showPhoto() {
  const photos = window._projects[curProj]._photos;
  const total  = photos.length;
  modalImg.classList.remove("loaded");
  modalImg.src = photos[curPhoto];
  modalImg.onload = () => modalImg.classList.add("loaded");
  imgCount.textContent = total > 1 ? `${curPhoto + 1} / ${total}` : "";
  modalDots.innerHTML = photos.map((_, i) =>
    `<button class="dot-btn${i===curPhoto?" active":""}" data-i="${i}" aria-label="Foto ${i+1}"></button>`
  ).join("");
  modalDots.querySelectorAll(".dot-btn").forEach(b =>
    b.addEventListener("click", () => { curPhoto = +b.dataset.i; showPhoto(); })
  );
  prevBtn.style.visibility = (total>1 && curPhoto>0)          ? "visible":"hidden";
  nextBtn.style.visibility = (total>1 && curPhoto<total-1)    ? "visible":"hidden";
}

function closeGallery() {
  overlay.classList.remove("open");
  modalImg.src = "";
  document.body.style.overflow = "";
}

prevBtn.addEventListener("click", () => { if (curPhoto>0) { curPhoto--; showPhoto(); } });
nextBtn.addEventListener("click", () => { if (curPhoto < window._projects[curProj]._photos.length-1) { curPhoto++; showPhoto(); } });

let txStart = 0;
overlay.addEventListener("touchstart", e => { txStart = e.touches[0].clientX; }, { passive:true });
overlay.addEventListener("touchend",   e => { const dx=e.changedTouches[0].clientX-txStart; if(Math.abs(dx)<40)return; dx<0?nextBtn.click():prevBtn.click(); });
closeBtn.addEventListener("click", closeGallery);
overlay.addEventListener("click", e => { if(e.target===overlay) closeGallery(); });
document.addEventListener("keydown", e => {
  if (!overlay.classList.contains("open")) return;
  if (e.key==="Escape") closeGallery();
  if (e.key==="ArrowLeft")  prevBtn.click();
  if (e.key==="ArrowRight") nextBtn.click();
});

/* ── CONTACT FORM ────────────────────────────────────────────── */
async function saveContact(name, email, message) {
  const res = await fetch(`${CONFIG.supabaseUrl}/rest/v1/contacts`, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "apikey":        CONFIG.supabaseServiceKey,
      "Authorization": `Bearer ${CONFIG.supabaseServiceKey}`,
      "Prefer":        "return=minimal",
    },
    body: JSON.stringify({ name, email, message }),
  });
  if (!res.ok) throw new Error("error");
}

const form      = document.getElementById("contact-form");
const submitBtn = document.getElementById("submit-btn");
const statusEl  = document.getElementById("form-status");

form.addEventListener("submit", async e => {
  e.preventDefault();
  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();
  if (!name||!email||!message) { statusEl.textContent="Please fill in all fields."; statusEl.className="form-status err"; return; }
  submitBtn.textContent = "Sending…"; submitBtn.disabled = true; statusEl.className = "form-status";
  try {
    await saveContact(name, email, message);
    statusEl.textContent = "Message sent! I'll get back to you soon.";
    statusEl.className   = "form-status ok";
    form.reset();
  } catch {
    statusEl.textContent = "Something went wrong. Try emailing me directly.";
    statusEl.className   = "form-status err";
  } finally {
    submitBtn.textContent = "Send message"; submitBtn.disabled = false;
  }
});

/* ── SCROLL REVEAL ───────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(el => { if (el.isIntersecting) { el.target.classList.add("visible"); revealObserver.unobserve(el.target); } });
}, { threshold: 0.1 });

/* ── INIT ────────────────────────────────────────────────────── */
document.getElementById("year").textContent = new Date().getFullYear();

(async () => {
  try {
    const projects = await supabaseGet("projects", "order=created_at.asc");
    renderCards(projects);
  } catch (err) {
    console.error(err);
    document.getElementById("projects-grid").innerHTML =
      `<div class="empty-state">Erro ao carregar projetos.<br/>Verifique as credenciais no config.js.</div>`;
  }
})();