/*
================================================================
ОНОВЛЕНИЙ ГОЛОВНИЙ СКРИПТ САЙТУ (script.js)
================================================================
*/

document.addEventListener('DOMContentLoaded', function() {

  // === ГЛОБАЛЬНІ ===
  const htmlEl = document.documentElement;
  const overlay = document.getElementById('modal-overlay');
  const modals = document.querySelectorAll('.modal-base');
  const links = document.querySelectorAll('.nav-link-desktop, .nav-link-mobile, .dropdown-link');
  let neonTimer = null;

  // === ДОПОМІЖНІ ===
  const activateTab = (modal, tabId) => {
    if (!modal) return;
    modal.querySelectorAll('.modal-tab').forEach(b => b.classList.remove('active'));
    modal.querySelectorAll('.modal-tab-pane').forEach(p => p.classList.remove('active'));
    const btn = modal.querySelector(`.modal-tab[data-tab="${tabId}"]`);
    const pane = modal.querySelector(`#${tabId}`);
    if (btn) btn.classList.add('active');
    if (pane) pane.classList.add('active');
  };

  const resetKafedraTabs = () => {
    const m = document.getElementById('kafedra-modal');
    if (m) activateTab(m, 'tab-history');
  };

  // === МОБІЛЬНЕ МЕНЮ ===
  const btn = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('menu-open-icon');
  const iconClose = document.getElementById('menu-close-icon');

  if (btn) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
      iconOpen.classList.toggle('hidden');
      iconClose.classList.toggle('hidden');
    });
  }

  // === КНОПКА "НАГОРУ" ===
  const up = document.getElementById('scrollToTopBtn');
  if (up) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) up.classList.remove('hidden');
      else up.classList.add('hidden');
    });
    up.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
  }

  // === REVEAL АНІМАЦІЯ ===
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('visible');
    });
  },{threshold:0.1});
  reveals.forEach(el=>observer.observe(el));

  // === ПОКАЗАТИ ВСІХ ===
  const btnShow = document.getElementById('toggle-staff-btn');
  const hiddenStaff = document.getElementById('hidden-staff');
  if (btnShow && hiddenStaff) {
    btnShow.addEventListener('click',()=>{
      const isHidden = hiddenStaff.classList.toggle('hidden');
      document.getElementById('toggle-staff-text').textContent = isHidden ? 'Показати всіх' : 'Згорнути';
      document.getElementById('toggle-staff-icon').classList.toggle('rotate-180');
    });
  }

  // === МОДАЛЬНІ ВІКНА ===
  function openModal(id){
    const modal = document.getElementById(id);
    if(!modal || !overlay) return;
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    setTimeout(()=>{
      overlay.style.opacity='1';
      modal.classList.add('modal-visible');
    },10);
    htmlEl.classList.add('modal-open');
    if(id==='kafedra-modal') resetKafedraTabs();
  }

  function closeModal(modal){
    if(!modal) return;
    modal.classList.remove('modal-visible');
    setTimeout(()=>{
      modal.classList.add('hidden');
      const anyVisible=document.querySelector('.modal-base.modal-visible');
      if(!anyVisible && overlay){
        overlay.style.opacity='0';
        htmlEl.classList.remove('modal-open');
        setTimeout(()=>overlay.classList.add('hidden'),300);
      }
    },300);
  }

  document.querySelectorAll('.modal-close-btn').forEach(b=>{
    b.addEventListener('click',e=>closeModal(e.target.closest('.modal-base')));
  });
  if(overlay){
    overlay.addEventListener('click',()=>{
      document.querySelectorAll('.modal-base.modal-visible').forEach(m=>closeModal(m));
    });
  }
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')
      document.querySelectorAll('.modal-base.modal-visible').forEach(m=>closeModal(m));
  });

  // === НАВІГАЦІЯ ===
  links.forEach(a=>{
    a.addEventListener('click',function(e){
      const mid=this.dataset.modalId;
      const tid=this.dataset.targetId;
      const tab=this.dataset.tabTarget;
      if(mid){
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.modal-base.modal-visible').forEach(m=>{
          if(m.id!==mid) closeModal(m);
        });
        openModal(mid);
        if(tab){
          const m=document.getElementById(mid);
          if(m) activateTab(m,tab);
        }
      }
      if(tid){
        const target=document.getElementById(tid);
        const title=target?target.querySelector('.section-title'):null;
        if(title){
          if(neonTimer) clearTimeout(neonTimer);
          document.querySelectorAll('.section-title-active').forEach(el=>el.classList.remove('section-title-active'));
          title.classList.add('section-title-active');
          neonTimer=setTimeout(()=>title.classList.remove('section-title-active'),1500);
        }
      }
      if(menu && !menu.classList.contains('hidden')){
        menu.classList.add('hidden');
        iconOpen.classList.remove('hidden');
        iconClose.classList.add('hidden');
      }
    });
  });

  // === СЛАЙДЕР НОВИН ===
  const sc=document.getElementById('news-slider-container');
  const dc=document.getElementById('news-dots-container');
  if(sc && dc){
    const slides=sc.querySelectorAll('.news-slide');
    const per=window.innerWidth<640?1:2;
    const total=Math.ceil(slides.length/per);
    const dots=[];
    for(let i=0;i<total;i++){
      const d=document.createElement('button');
      d.className='news-dot w-3 h-3 rounded-full bg-slate-600 hover:bg-slate-500';
      d.addEventListener('click',e=>{
        e.preventDefault();
        e.stopPropagation();
        const s=slides[i*per];
        if(s) s.scrollIntoView({behavior:'smooth',inline:'start'});
      });
      dc.appendChild(d);
      dots.push(d);
    }
    const upd=()=>{
      const idx=Math.round(sc.scrollLeft/sc.clientWidth);
      dots.forEach((dot,i)=>dot.classList.toggle('active',i===idx));
    };
    if(dots.length>0) dots[0].classList.add('active');
    sc.addEventListener('scroll',upd,{passive:true});
  }

  // === ЧИТАТИ ДАЛІ (мале вікно) ===
  const smallModal=document.getElementById('small-news-modal');
  const btns=document.querySelectorAll('.open-small-modal-btn');
  if(smallModal && btns.length){
    const date=smallModal.querySelector('#small-news-date');
    const title=smallModal.querySelector('#small-news-title');
    const text=smallModal.querySelector('#small-news-modal-text');
    btns.forEach(b=>{
      b.addEventListener('click',e=>{
        e.preventDefault();
        date.textContent=b.dataset.date;
        title.textContent=b.dataset.title;
        text.textContent=b.dataset.text.replace(/\\n/g,'\n');
        openModal('small-news-modal');
      });
    });
  }

  // === ВКЛАДКИ КАФЕДРИ ===
  const kaf=document.getElementById('kafedra-modal');
  if(kaf){
    kaf.querySelectorAll('.modal-tab').forEach(t=>{
      t.addEventListener('click',()=>{
        activateTab(kaf,t.dataset.tab);
      });
    });
  }

  // === МОБІЛЬНІ ПІДМЕНЮ ===
  document.querySelectorAll('.mobile-dropdown-toggle').forEach(t=>{
    t.addEventListener('click',e=>{
      e.preventDefault();
      const id=t.dataset.dropdownId;
      const m=document.getElementById(id);
      if(m){
        m.classList.toggle('open');
        t.querySelector('svg').classList.toggle('rotate-180');
      }
    });
  });

  // === ДЕТАЛІ ВИКЛАДАЧІВ ===
  const detailModal=document.getElementById('staff-detail-modal');
  if(detailModal){
    const name=detailModal.querySelector('#staff-detail-name');
    const title=detailModal.querySelector('#staff-detail-title');
    const img=detailModal.querySelector('#staff-detail-img');
    const det=detailModal.querySelector('#staff-detail-details');
    const linksEl=detailModal.querySelector('#staff-detail-links');
    const disc=detailModal.querySelector('#staff-detail-disciplines');
    const bio=detailModal.querySelector('#staff-detail-bio');

    document.querySelectorAll('.staff-card').forEach(card=>{
      card.addEventListener('click',()=>{
        const id=card.dataset.staffId;
        if(window.staffDetailsData && staffDetailsData[id]){
          const d=staffDetailsData[id];
          name.textContent=d.name;
          title.textContent=d.title;
          img.src=card.querySelector('img').src;
          det.innerHTML=d.details||'';
          bio.innerHTML=d.bio||'';
          disc.innerHTML='';
          if(d.disciplines?.length)
            d.disciplines.forEach(x=>{
              const li=document.createElement('li');
              li.textContent=x;
              disc.appendChild(li);
            });
          linksEl.innerHTML='';
          if(d.links?.length)
            d.links.forEach(l=>{
              const a=document.createElement('a');
              a.href=l.url; a.target='_blank';
              a.textContent=l.name;
              a.className='text-sky-400 hover:text-sky-300 block truncate';
              linksEl.appendChild(a);
            });
        }else{
          name.textContent=card.querySelector('h3').textContent;
          title.textContent=card.querySelector('p').textContent;
          img.src=card.querySelector('img').src;
          det.innerHTML='<p>Деталі буде додано.</p>';
          bio.innerHTML='<p>Біографія буде додана.</p>';
          disc.innerHTML='<li>Інформація відсутня.</li>';
          linksEl.innerHTML='<p class="text-sm text-slate-400">Посилання відсутні.</p>';
        }
        openModal('staff-detail-modal');
      });
    });
  }

  // === СПЕЦІАЛЬНА ЛОГІКА ДЛЯ "НАВЧАЛЬНІ ДИСЦИПЛІНИ" ===
  const disciplineTriggers=document.querySelectorAll('[data-modal-id="discipline-modal"]');
  disciplineTriggers.forEach(btn=>{
    btn.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      openModal('discipline-modal');
    });
  });
});
