/* ===== Menú móvil simple ===== */
const btn = document.querySelector('.hamburger');
const drawer = document.querySelector('#mobile-drawer');
if (btn && drawer) {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    if (drawer.hasAttribute('hidden')) drawer.removeAttribute('hidden');
    else drawer.setAttribute('hidden', '');
  });
}

/* ===== Desbloqueo de autoplay silencioso en iOS/Android ===== */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('video[autoplay][muted]').forEach(v => {
    const tryPlay = () => v.play().catch(() => { });
    tryPlay();
    window.addEventListener('touchstart', tryPlay, { once: true, passive: true });
    window.addEventListener('pointerdown', tryPlay, { once: true });
  });
});

/* ===== Revelado al hacer scroll ===== */
const toReveal = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && toReveal.length) {
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  toReveal.forEach(el => io.observe(el));
}

/* ===== Scheduler (slots de 1 hora) ===== */
const openers = document.querySelectorAll('[data-open="scheduler"], a[href="#agendar"]');
const panel = document.querySelector('.scheduler-panel');
const backdrop = document.querySelector('.scheduler-backdrop');
const frame = document.querySelector('#video-hero');
const slotsEl = document.querySelector('#slots');

const closeBtn = document.querySelector('.scheduler-close');
const cancelBtn = document.querySelector('#cancel-scheduler');
const dateEl = document.querySelector('#meet-date');
let selectedBtn = null;

// inicia oculto
window.addEventListener('load', () => {
  if (panel) { panel.setAttribute('hidden', ''); panel.setAttribute('aria-hidden', 'true'); }
  if (backdrop) backdrop.setAttribute('hidden', '');
});

function minutes(h, m) { return h * 60 + m; }
function fmt(mins) {
  const h = Math.floor(mins / 60), m = mins % 60;
  const h12 = ((h + 11) % 12) + 1, ampm = h < 12 ? 'AM' : 'PM';
  return `${String(h12).padStart(2, '0')}:${m === 0 ? '00' : m} ${ampm}`;
}
function labelRange(start, step = 60) { return `${fmt(start)} – ${fmt(start + step)}`; }

function buildSlots() {
  if (!slotsEl) return;
  slotsEl.innerHTML = '';
  const step = 60; // 1 hora
  const start = minutes(8, 0), end = minutes(17, 0); // 08:00 - 17:00
  for (let t = start; t < end; t += step) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'slot-btn';
    b.textContent = labelRange(t, step);
    b.dataset.start = t;
    b.dataset.end = t + step;
    b.addEventListener('click', () => {
      if (selectedBtn) selectedBtn.classList.remove('is-selected');
      selectedBtn = b;
      b.classList.add('is-selected');
    });
    slotsEl.appendChild(b);
  }
}

function openScheduler(e) {
  if (!panel || !backdrop) return;
  if (e) e.preventDefault();
  if (panel.hasAttribute('hidden')) {
    frame?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    panel.removeAttribute('hidden');
    panel.setAttribute('aria-hidden', 'false');
    backdrop.removeAttribute('hidden');
    buildSlots();
    const today = new Date().toISOString().slice(0, 10);
    if (dateEl) {
      dateEl.value = today;
      dateEl.min = today;
    }
    document.body.classList.add('modal-open');
  }
}
function closeScheduler() {
  if (!panel || !backdrop) return;
  if (!panel.hasAttribute('hidden')) {
    panel.setAttribute('hidden', '');
    panel.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('hidden', '');
    selectedBtn = null;
    document.body.classList.remove('modal-open');
  }
}

openers.forEach(el => el.addEventListener('click', openScheduler));
closeBtn?.addEventListener('click', closeScheduler);
cancelBtn?.addEventListener('click', closeScheduler);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeScheduler(); });
backdrop?.addEventListener('click', closeScheduler);

// Enviar (demo)
document.querySelector('#schedule-form')?.addEventListener('submit', (ev) => {
  ev.preventDefault();
  if (!selectedBtn) { alert('Elige un horario.'); return; }
  const date = dateEl.value;
  const rango = selectedBtn.textContent;
  alert(`Reserva registrada:\n${date} — ${rango}`);
  closeScheduler();
});
