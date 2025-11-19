/*
================================================================
 SPA LOGIC (script.js)
================================================================
*/

// --- 1. ГЛОБАЛЬНІ ФУНКЦІЇ ---

// Функція перемикання основних вкладок
window.switchTab = function(tabId, scrollTargetId = null, subTabTarget = null) {
    // 1. Приховати всі секції
    document.querySelectorAll('.tab-content').forEach(el => {
        el.classList.add('hidden');
    });

    // 2. Прибрати клас 'active' з усіх кнопок меню
    document.querySelectorAll('.nav-btn, .mobile-link').forEach(btn => {
        btn.classList.remove('active');
        // Якщо кнопка має data-tab, що збігається з tabId, активуємо її
        if (btn.dataset.tab === tabId) {
            btn.classList.add('active');
        }
    });

    // 3. Показати цільову секцію
    const targetSection = document.getElementById('tab-' + tabId);
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.remove('fade-in');
        void targetSection.offsetWidth; // trigger reflow
        targetSection.classList.add('fade-in');
    } else {
         const homeSection = document.getElementById('tab-home');
         if (homeSection) homeSection.classList.remove('hidden');
    }

    // 4. Якщо передано під-вкладку (наприклад, для кафедри)
    if (subTabTarget) {
        switchSubTab(subTabTarget);
    }

    // 5. Закрити мобільне меню
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
    }

    // 6. Скрол
    if (scrollTargetId) {
        setTimeout(() => {
            const el = document.getElementById(scrollTargetId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Функція перемикання під-вкладок
window.switchSubTab = function(subTabId) {
    const parentSection = document.getElementById('tab-kafedra'); 
    if (!parentSection) return;

    parentSection.querySelectorAll('.sub-tab-content').forEach(el => {
         el.classList.add('hidden');
    });
    
    parentSection.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const targetSub = document.getElementById(subTabId);
    if (targetSub) targetSub.classList.remove('hidden');
    
    const btns = parentSection.querySelectorAll('.sub-tab-btn');
    btns.forEach(btn => {
        const onClickAttr = btn.getAttribute('onclick');
        if (onClickAttr && onClickAttr.includes(subTabId)) {
            btn.classList.add('active');
        }
    });
};

// Функція розгортання підменю в мобільному (Аккордеон)
window.toggleMobileSubmenu = function(id) {
    const submenu = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    
    if (submenu) {
        if (submenu.classList.contains('hidden')) {
            submenu.classList.remove('hidden');
            submenu.classList.add('flex');
            if(icon) icon.classList.add('rotate-180');
        } else {
            submenu.classList.add('hidden');
            submenu.classList.remove('flex');
            if(icon) icon.classList.remove('rotate-180');
        }
    }
};

// Функція "Читати далі"
window.toggleReadMore = function(btn, targetId) {
    const container = document.getElementById(targetId);
    if (container) {
        container.classList.toggle('text-clamp');
        container.classList.toggle('text-expanded');
        
        if (container.classList.contains('text-expanded')) {
            btn.textContent = 'Згорнути';
        } else {
            btn.textContent = 'Читати далі';
        }
    }
};

// Функція відкриття модального вікна
window.openModal = function(modalId) {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById(modalId);
    
    if (overlay && modal) {
        overlay.classList.remove('hidden');
        modal.classList.remove('hidden');
        setTimeout(() => {
            overlay.classList.remove('opacity-0');
            modal.classList.remove('opacity-0', 'scale-95');
            modal.classList.add('scale-100');
        }, 10);
    }
};

// Функція закриття всіх модальних вікон
window.closeAllModals = function() {
    const overlay = document.getElementById('modal-overlay');
    const modals = document.querySelectorAll('#staff-detail-modal, #small-news-modal');
    
    modals.forEach(m => {
        m.classList.add('opacity-0', 'scale-95');
        m.classList.remove('scale-100');
        setTimeout(() => {
            m.classList.add('hidden');
        }, 300);
    });

    if (overlay) {
        overlay.classList.add('opacity-0');
        setTimeout(() => {
            overlay.classList.add('hidden');
        }, 300);
    }
};

// --- 2. ІНІЦІАЛІЗАЦІЯ ---
document.addEventListener('DOMContentLoaded', function() {
    
    const mobileMenuBtn = document.getElementById('mobile-menu-button');
    const closeMobileBtn = document.getElementById('close-mobile-menu');
    const mobileMenu = document.getElementById('mobile-menu');

    if(mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-full');
            mobileMenu.classList.add('translate-x-0');
        });
    }
    if(closeMobileBtn && mobileMenu) {
        closeMobileBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('translate-x-0');
            mobileMenu.classList.add('translate-x-full');
        });
    }

    // Staff Cards Logic
    document.querySelectorAll('.staff-card').forEach(card => {
        card.addEventListener('click', () => {
            const staffId = card.dataset.staffId;
            if (typeof staffDetailsData !== 'undefined' && staffDetailsData[staffId]) {
                const data = staffDetailsData[staffId];
                
                const nameEl = document.getElementById('staff-detail-name');
                const titleEl = document.getElementById('staff-detail-title');
                const imgEl = document.getElementById('staff-detail-img');
                const detailsEl = document.getElementById('staff-detail-details');
                const discContainer = document.getElementById('staff-detail-disciplines');
                const linkContainer = document.getElementById('staff-detail-links');
                const bioEl = document.getElementById('staff-detail-bio');

                if(nameEl) nameEl.textContent = data.name;
                if(titleEl) titleEl.textContent = data.title;
                if(imgEl) {
                    imgEl.src = card.querySelector('img').src;
                    imgEl.alt = data.name;
                }
                if(detailsEl) detailsEl.innerHTML = data.details;
                
                if(discContainer) {
                    discContainer.innerHTML = data.disciplines.length 
                        ? data.disciplines.map(d => `<div class="mb-1">• ${d}</div>`).join('') 
                        : 'Немає даних';
                }
                
                if(linkContainer) {
                    linkContainer.innerHTML = data.links.length 
                        ? data.links.map(l => `<a href="${l.url}" target="_blank" class="block hover:underline mb-1 text-sky-400">${l.name}</a>`).join('') 
                        : 'Немає посилань';
                }

                if(bioEl) {
                    bioEl.innerHTML = data.bio || '';
                }

                openModal('staff-detail-modal');
            }
        });
    });

    // Scroll Top
    const scrollBtn = document.getElementById('scrollToTopBtn');
    if(scrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollBtn.classList.remove('hidden');
            } else {
                scrollBtn.classList.add('hidden');
            }
        });
    }

    // Default open
    switchTab('home');
});
