// script.js — оптимізована логіка для модалок, reveal, mobile меню, та простий слайдер
document.addEventListener('DOMContentLoaded', () => {
  // IntersectionObserver for reveal animations
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, {threshold: 0.12});
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // mobile menu toggle
  const mobileBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn) mobileBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

  // Modal open/close (delegated)
  function openModal(id){
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    document.documentElement.classList.add('modal-open');
  }
  function closeModal(modal){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    document.documentElement.classList.remove('modal-open');
  }

  document.addEventListener('click', (e) => {
    const target = e.target;
    // open by data-modal-id
    const modalId = target.closest('[data-modal-id]')?.dataset?.modalId;
    if (modalId) { e.preventDefault(); openModal(modalId); return; }

    // close buttons
    if (target.matches('.modal-close') || target.closest('.modal-close')) {
      const modal = target.closest('.modal-base');
      if (modal) closeModal(modal);
    }

    // click overlay to close
    if (target.matches('.modal-overlay')) {
      const modal = target.closest('.modal-base');
      if (modal) closeModal(modal);
    }
  });

  // Populate staff dynamically (keeps HTML small)
  const staffData = [
    {name:"Паламар Михайло Іванович", title:"д.р. техн. наук, завідувач кафедри"},
    {name:"Яворська Мирослава Іванівна", title:"к.т.н., доцент"},
    {name:"Зелінський Ігор Микитович", title:"к.ф.-м.н, доцент"},
    {name:"Наконечний Юрій Іванович", title:"старший викладач"},
    {name:"Апостол Юрій Орестович", title:"старший викладач"},
    {name:"Дубиняк Тарас Степанович", title:"к.т.н., доцент"}
  ];
  const staffList = document.getElementById('staff-list');
  function renderStaff(limit = 4){
    staffList.innerHTML = '';
    staffData.slice(0, limit).forEach(s => {
      const card = document.createElement('div');
      card.className = 'text-center';
      card.innerHTML = `<img class="mx-auto h-32 w-32 rounded-full object-cover border-4 border-slate-700" src="https://placehold.co/160x160/1e293b/ffffff?text=Фото" alt="Фото ${s.name}">
        <div class="mt-3"><h3 class="text-lg font-semibold text-white">${s.name}</h3><p class="text-sky-400">${s.title}</p></div>`;
      staffList.appendChild(card);
    });
  }
  renderStaff();

  // Toggle staff list
  const toggleBtn = document.getElementById('toggle-staff-btn');
  let showingAll = false;
  if (toggleBtn){
    toggleBtn.addEventListener('click', () => {
      showingAll = !showingAll;
      renderStaff(showingAll ? staffData.length : 4);
      toggleBtn.textContent = showingAll ? 'Приховати' : 'Показати всіх';
    });
  }

  // Simple news slider generation & dots
  const news = [
    {date:'05.10.2025', title:'Модернізація лабораторії', text:'Лабораторія поповнилась новим обладнанням.'},
    {date:'28.09.2025', title:'Партнерство з Техно-Індастрі', text:'Стажування та хакатони для студентів.'},
    {date:'20.09.2025', title:'День відкритих дверей', text:'Онлайн-зустріч для абітурієнтів.'}
  ];
  const newsSlider = document.getElementById('news-slider');
  const newsDots = document.getElementById('news-dots');
  if (newsSlider){
    news.forEach((n, i) => {
      const slide = document.createElement('div');
      slide.className = 'bg-slate-800 rounded-xl p-4';
      slide.innerHTML = `<p class="text-sm text-sky-400">${n.date}</p><h3 class="mt-1 text-xl font-semibold text-white">${n.title}</h3><p class="mt-2 text-slate-400 text-sm">${n.text}</p>`;
      newsSlider.appendChild(slide);

      const dot = document.createElement('button');
      dot.className = 'w-3 h-3 rounded-full bg-slate-700';
      dot.addEventListener('click', () => {
        // simple focus: scrollIntoView for chosen slide
        slide.scrollIntoView({behavior:'smooth', block:'nearest', inline:'start'});
      });
      newsDots.appendChild(dot);
    });
  }

  // Accessibility: close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-base:not(.hidden)').forEach(m => closeModal(m));
    }
  });
});
