/* ═══════════════════════════════════════════════════════════════
   main.js — Lucas Martins Portfolio
   
   HOW TO ADD YOUR PROJECTS:
   Edit the PROJECTS array below. Each project has:
     - title       : project name
     - desc        : short description (1-2 sentences)
     - tags        : array of tech stack strings
     - github      : full GitHub repo URL
     - live        : live demo URL (or null)
     - video       : YouTube/Vimeo embed URL (or null)
                     YouTube: "https://www.youtube.com/embed/VIDEO_ID"
                     Vimeo:   "https://player.vimeo.com/video/VIDEO_ID"
     - thumb       : thumbnail image URL (or null for placeholder)
   ═══════════════════════════════════════════════════════════════ */

const PROJECTS = [
  {
    title: "Project Alpha",
    desc: "A full-stack web app for managing tasks with real-time collaboration and role-based access control.",
    tags: ["React", "Node.js", "PostgreSQL"],
    github: "https://github.com/Luc555/project-alpha",
    live: null,
    video: null, // e.g. "https://www.youtube.com/embed/dQw4w9WgXcQ"
    thumb: null,
  },
  {
    title: "Project Beta",
    desc: "REST API for e-commerce with JWT auth, product search, and payment integration.",
    tags: ["Python", "FastAPI", "Docker"],
    github: "https://github.com/Luc555/project-beta",
    live: null,
    video: null,
    thumb: null,
  },
  {
    title: "Project Gamma",
    desc: "Mobile-first dashboard to visualise financial data with interactive charts.",
    tags: ["JavaScript", "Chart.js", "CSS"],
    github: "https://github.com/Luc555/project-gamma",
    live: null,
    video: null,
    thumb: null,
  },
];

/* ───────────────────────────────────────────────────────────────
   SUPABASE CONFIG
   Replace these values with your own from supabase.com
   Project Settings → API → Project URL and anon/public key
   ─────────────────────────────────────────────────────────────── */
const SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

/* ───────────────────────────────────────────────────────────────
   SAVE CONTACT FORM TO SUPABASE
   In Supabase: run this SQL once in the SQL editor:
   
   create table contacts (
     id         bigint generated always as identity primary key,
     name       text not null,
     email      text not null,
     message    text not null,
     created_at timestamptz default now()
   );
   ─────────────────────────────────────────────────────────────── */
async function saveContact(name, email, message) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify({ name, email, message }),
  });
  if (!res.ok) throw new Error("Supabase error");
}

/* ─── RENDER PROJECT CARDS ─────────────────────────────────────── */
function githubIcon() {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>`;
}

function playIcon() {
  return `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
}

function buildThumb(project) {
  if (project.thumb) {
    return `<img src="${project.thumb}" alt="${project.title} screenshot" loading="lazy" />`;
  }
  // Placeholder with project initials
  const initials = project.title.split(" ").map(w => w[0]).join("").slice(0, 2);
  return `<div style="
    width:100%;height:100%;display:flex;align-items:center;justify-content:center;
    background:linear-gradient(135deg,#1c1c1c,#222);
    font-family:'Syne',sans-serif;font-size:2.5rem;font-weight:800;
    color:rgba(200,240,60,0.18);letter-spacing:-0.04em;
  ">${initials}</div>`;
}

function renderCards() {
  const grid = document.getElementById("projects-grid");
  if (!PROJECTS.length) {
    grid.innerHTML = `<div class="empty-state">No projects yet — add them to the PROJECTS array in main.js</div>`;
    return;
  }

  grid.innerHTML = PROJECTS.map((p, i) => `
    <article class="card reveal ${!p.video ? "card-no-video" : ""}" data-index="${i}" tabindex="0" role="button" aria-label="Open ${p.title}">
      <div class="card-thumb">
        ${buildThumb(p)}
        ${p.video ? `<div class="card-play">${playIcon()}</div>` : ""}
      </div>
      <div class="card-body">
        <div class="card-tags">
          ${p.tags.map(t => `<span class="tag">${t}</span>`).join("")}
        </div>
        <h3 class="card-title">${p.title}</h3>
        <p class="card-desc">${p.desc}</p>
        <div class="card-footer">
          <a class="card-github" href="${p.github}" target="_blank" rel="noopener" onclick="event.stopPropagation()">
            ${githubIcon()} View repo
          </a>
          ${p.video ? `<span class="card-video-badge">▶ demo video</span>` : ""}
        </div>
      </div>
    </article>
  `).join("");

  // Click handlers for cards with video
  grid.querySelectorAll(".card").forEach(card => {
    const i = parseInt(card.dataset.index);
    card.addEventListener("click", () => openModal(i));
    card.addEventListener("keydown", e => { if (e.key === "Enter") openModal(i); });
  });
}

/* ─── MODAL ────────────────────────────────────────────────────── */
const overlay  = document.getElementById("modal-overlay");
const iframe   = document.getElementById("modal-iframe");
const modalTit = document.getElementById("modal-title");
const modalDes = document.getElementById("modal-desc");
const modalRep = document.getElementById("modal-repo");
const modalLiv = document.getElementById("modal-live");
const closeBtn = document.getElementById("modal-close");

function openModal(index) {
  const p = PROJECTS[index];
  if (!p.video) {
    // No video — just open GitHub
    window.open(p.github, "_blank");
    return;
  }
  iframe.src = p.video + "?autoplay=1";
  modalTit.textContent = p.title;
  modalDes.textContent = p.desc;
  modalRep.href = p.github;
  if (p.live) {
    modalLiv.href = p.live;
    modalLiv.style.display = "inline-flex";
  } else {
    modalLiv.style.display = "none";
  }
  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  overlay.classList.remove("open");
  iframe.src = "";
  document.body.style.overflow = "";
}

closeBtn.addEventListener("click", closeModal);
overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ─── CONTACT FORM ─────────────────────────────────────────────── */
const form       = document.getElementById("contact-form");
const submitBtn  = document.getElementById("submit-btn");
const statusEl   = document.getElementById("form-status");

form.addEventListener("submit", async e => {
  e.preventDefault();
  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    statusEl.textContent = "Please fill in all fields.";
    statusEl.className = "form-status err";
    return;
  }

  submitBtn.textContent = "Sending…";
  submitBtn.disabled = true;
  statusEl.textContent = "";
  statusEl.className = "form-status";

  try {
    await saveContact(name, email, message);
    statusEl.textContent = "Message sent! I'll get back to you soon.";
    statusEl.className = "form-status ok";
    form.reset();
  } catch {
    statusEl.textContent = "Something went wrong. Try emailing me directly.";
    statusEl.className = "form-status err";
  } finally {
    submitBtn.textContent = "Send message";
    submitBtn.disabled = false;
  }
});

/* ─── SCROLL REVEAL ────────────────────────────────────────────── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add("visible");
      observer.unobserve(el.target);
    }
  });
}, { threshold: 0.1 });

function observeReveal() {
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

/* ─── FOOTER YEAR ──────────────────────────────────────────────── */
document.getElementById("year").textContent = new Date().getFullYear();

/* ─── INIT ──────────────────────────────────────────────────────── */
renderCards();
observeReveal();