/* ========= portfolio script ========== */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

document.addEventListener('DOMContentLoaded', () => {
  initYear();
  initTheme();
  initMenu();
  initAOS();
  initTyping();
  initSkillsObserver();
  initProjectFilters();
  initModal();
  initLazyImages();
  initContactForm();
});

/* ========== Year ========== */
function initYear(){
  $('#current-year').textContent = new Date().getFullYear();
}

/* ========== Theme ========== */
function initTheme(){
  const toggle = $('#theme-toggle');
  const saved = localStorage.getItem('theme') || (window.matchMedia && window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark');
  setTheme(saved);
  toggle.addEventListener('click', () => {
    const t = document.documentElement.classList.contains('light') ? 'dark' : 'light';
    setTheme(t);
  });
}
function setTheme(name){
  if(name === 'light'){ document.documentElement.classList.add('light'); $('#theme-toggle').textContent = '🌞'; }
  else{ document.documentElement.classList.remove('light'); $('#theme-toggle').textContent = '🌙'; }
  localStorage.setItem('theme', name);
}

/* ========== Mobile menu ========== */
function initMenu(){
  const btn = $('#menu-btn');
  const nav = $('#main-nav');
  btn && btn.addEventListener('click', () => {
    const open = nav.style.display !== 'flex';
    nav.style.display = open ? 'flex' : 'none';
    nav.style.flexDirection = 'column';
    nav.style.gap = '0.6rem';
    nav.style.padding = '1rem';
  });

  // smooth scroll for nav anchors
  $$('#main-nav a, .back-top, .logo, .hero-ctas a').forEach(a => {
    a.addEventListener('click', (e) => {
      if(a.hash){
        e.preventDefault();
        document.querySelector(a.getAttribute('href')).scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });
}

/* ========== Basic AOS (animate on scroll) ========== */
function initAOS(){
  const elements = $$('.aos');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){ e.target.classList.add('show'); obs.unobserve(e.target); }
    });
  }, {threshold: 0.12});
  elements.forEach(el => obs.observe(el));
}

/* ========== typing effect ========== */
function initTyping(){
  const el = document.getElementById('typing');
  if(!el) return;
  const phrases = ['I build interactive web experiences for learning & projects.', 'Student | Frontend developer | Teacher-in-making'];
  let i=0, j=0, forward=true;
  function step(){
    el.textContent = phrases[i].slice(0,j) + (j % 2 ? '|' : '');
    if(forward) j++; else j--;
    if(j === phrases[i].length+1){ forward=false; setTimeout(step,900); } 
    else if(j === 0){ forward=true; i=(i+1)%phrases.length; }
    setTimeout(step, forward?80:30);
  }
  step();
}

/* ========== Skills animation when visible ========== */
function initSkillsObserver(){
  const bars = $$('.skill-bar > div');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if(en.isIntersecting){
        en.target.style.width = getComputedStyle(en.target).getPropertyValue('--skill');
        obs.unobserve(en.target);
      }
    });
  }, {threshold:0.2});
  bars.forEach(b => obs.observe(b));
}

/* ========== Project filtering + search ========== */
function initProjectFilters(){
  const buttons = $$('.filter-btn');
  const grid = $('#projects-grid');
  const search = $('#project-search');

  function filterProjects(filter){
    $$('.project-card', grid).forEach(card => {
      const tags = card.dataset.tags || '';
      const matches = filter === 'all' || tags.split(' ').includes(filter);
      card.style.display = matches ? '' : 'none';
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterProjects(btn.dataset.filter);
    });
  });

  search.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    $$('.project-card', grid).forEach(card => {
      const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const desc = (card.querySelector('p')?.textContent || '').toLowerCase();
      card.style.display = (title.includes(q) || desc.includes(q)) ? '' : 'none';
    });
  });
}

/* ========== Modal for quick preview ========== */
function initModal(){
  const modal = $('#modal');
  const modalTitle = $('#modal-title');
  const modalDesc = $('#modal-desc');
  const close = $('#modal-close');

  $$('.view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const t = btn.dataset.title || 'Project';
      const d = btn.dataset.desc || '';
      modalTitle.textContent = t;
      modalDesc.textContent = d;
      modal.setAttribute('aria-hidden', 'false');
    });
  });
  close.addEventListener('click', () => modal.setAttribute('aria-hidden','true'));
  modal.addEventListener('click', e => {
    if(e.target === modal) modal.setAttribute('aria-hidden','true');
  });
}

/* ========== Lazy load images ========== */
function initLazyImages(){
  const lazy = $$('.lazy');
  if('loading' in HTMLImageElement.prototype){
    lazy.forEach(img => img.src = img.dataset.src);
  } else {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          const img = e.target;
          img.src = img.dataset.src;
          obs.unobserve(img);
        }
      });
    }, {threshold:0.1});
    lazy.forEach(i => obs.observe(i));
  }
}

/* ========== Contact form: validation + localStorage draft ========== */
function initContactForm(){
  const form = $('#contact-form');
  const note = $('#form-note');
  const save = $('#save-draft');

  // load draft if exists
  const draft = localStorage.getItem('contact-draft');
  if(draft){
    try{
      const d = JSON.parse(draft);
      $('#name').value = d.name || '';
      $('#email').value = d.email || '';
      $('#message').value = d.message || '';
    }catch(e){}
  }

  save.addEventListener('click', () => {
    const d = {name:$('#name').value, email:$('#email').value, message:$('#message').value};
    localStorage.setItem('contact-draft', JSON.stringify(d));
    note.textContent = 'Draft saved locally.';
    setTimeout(()=>note.textContent='',2500);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // basic validation
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();
    if(!name || !email || !message){ note.textContent = 'Please fill all fields.'; return; }
    if(!/^\S+@\S+\.\S+$/.test(email)){ note.textContent = 'Provide a valid email.'; return; }

    // simulate send (in real app you'd POST to server)
    note.textContent = 'Message saved locally — thank you! (Demo)';
    // store to localStorage "sent messages" (demo only)
    const stored = JSON.parse(localStorage.getItem('sent-messages') || '[]');
    stored.push({name,email,message,ts:new Date().toISOString()});
    localStorage.setItem('sent-messages', JSON.stringify(stored));
    form.reset();
    localStorage.removeItem('contact-draft');
    setTimeout(()=>note.textContent='',3500);
  });
}
