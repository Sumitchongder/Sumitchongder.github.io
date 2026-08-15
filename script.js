// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// Scroll progress
const progressFill = document.getElementById('progressFill');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
  progressFill.style.width = scrolled + '%';
});

// Navbar background on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.style.borderBottomColor = window.scrollY > 40 ? 'rgba(232,236,241,0.14)' : 'rgba(232,236,241,0.09)';
});

// Reveal on scroll
const revealTargets = document.querySelectorAll('.section, .tl-item, .pub-card, .project-card, .ip-item');
revealTargets.forEach(el => {
  el.style.opacity = 0;
  el.style.transform = 'translateY(18px)';
  el.style.transition = 'opacity .7s ease, transform .7s ease';
});
function revealEl(el) {
  el.style.opacity = 1;
  el.style.transform = 'translateY(0)';
}
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        revealEl(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
  revealTargets.forEach(el => io.observe(el));
} else {
  revealTargets.forEach(revealEl);
}
// Safety net: never let content stay stuck invisible (e.g. odd layouts,
// nested elements that never cross the intersection threshold).
window.addEventListener('load', () => setTimeout(() => revealTargets.forEach(revealEl), 2500));

// --- Hero canvas: superposition interference wave, mouse-reactive ---
const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
let W, H, mouseX = 0.5;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resize() {
  W = canvas.width = canvas.offsetWidth * devicePixelRatio;
  H = canvas.height = canvas.offsetHeight * devicePixelRatio;
}
resize();
window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouseX = e.clientX / window.innerWidth; });

let t = 0;
function draw() {
  ctx.clearRect(0, 0, W, H);
  const midY = H * 0.55;
  const waves = [
    { amp: H * 0.05, freq: 0.006, speed: 0.018, color: '94,234,212', phaseOff: 0 },
    { amp: H * 0.035, freq: 0.009, speed: -0.014, color: '139,127,255', phaseOff: 1.4 },
    { amp: H * 0.02, freq: 0.013, speed: 0.022, color: '255,159,110', phaseOff: 2.7 }
  ];

  waves.forEach(w => {
    ctx.beginPath();
    for (let x = 0; x <= W; x += 4) {
      const interference = 1 + mouseX * 0.6;
      const y = midY + Math.sin(x * w.freq * interference + t * w.speed + w.phaseOff) * w.amp
                + Math.sin(x * w.freq * 2.3 + t * w.speed * 1.7) * w.amp * 0.25;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(${w.color},0.55)`;
    ctx.lineWidth = 1.4 * devicePixelRatio;
    ctx.stroke();
  });

  // combined interference (sum wave)
  ctx.beginPath();
  for (let x = 0; x <= W; x += 4) {
    let y = midY;
    waves.forEach(w => {
      y += Math.sin(x * w.freq * (1 + mouseX * 0.6) + t * w.speed + w.phaseOff) * w.amp * 0.4;
    });
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(232,236,241,0.9)';
  ctx.lineWidth = 1.6 * devicePixelRatio;
  ctx.stroke();

  t += 1;
  if (!prefersReduced) requestAnimationFrame(draw);
}
draw();

// --- Cursor glow ---
const cursorGlow = document.getElementById('cursorGlow');
if (cursorGlow) {
  window.addEventListener('pointermove', e => {
    cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
  });
}

// --- Magnetic buttons ---
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.25;
    const y = (e.clientY - r.top - r.height / 2) * 0.35;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = 'translate(0,0)'; });
});

// --- Project card tilt ---
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-3px)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

// --- Animated stat counters ---
const counters = document.querySelectorAll('.stat-num[data-count]');
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseFloat(el.dataset.count);
    const isDecimal = el.dataset.decimal === 'true';
    const duration = 1400;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = isDecimal ? val.toFixed(2) : Math.round(val);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = isDecimal ? target.toFixed(2) : target;
    }
    requestAnimationFrame(tick);
    counterIO.unobserve(el);
  });
}, { threshold: 0.4 });
counters.forEach(el => counterIO.observe(el));

// --- Scroll-spy active nav link ---
const sections = document.querySelectorAll('main section[id], header#top');
const navAnchors = document.querySelectorAll('.nav-links a');
const spyIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.classList.toggle('active-link', a.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-45% 0px -45% 0px' });
sections.forEach(s => spyIO.observe(s));

