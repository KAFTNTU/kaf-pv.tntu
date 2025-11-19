/*
================================================================
 SPA LOGIC (script.js)
 Перемикання вкладок замість модальних вікон
================================================================
*/

// --- 1. ГЛОБАЛЬНІ ФУНКЦІЇ (Визначені одразу, щоб HTML бачив їх) ---

// Функція перемикання основних вкладок
window.switchTab = function(tabId, scrollTargetId = null) {
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
        // Перезапуск анімації
        targetSection.classList.remove('fade-in');
        void targetSection.offsetWidth; // trigger reflow
        targetSection.classList.add('fade-in');
    } else {
        // Fallback: якщо секції немає, показуємо Home
         const homeSection = document.getElementById('tab-home');
         if (homeSection) homeSection.classList.remove('hidden');
    }

    // 4. Закрити мобільне меню (якщо відкрите)
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.remove('translate-x-0');
        mobileMenu.classList.add('translate-x-full');
    }

    // 5. Скрол
    if (scrollTargetId) {
        // Якщо є конкретний якір (наприклад контакти)
        setTimeout(() => {
            const el = document.getElementById(scrollTargetId);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } else {
        // Просто нагору
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Функція перемикання під-вкладок (Кафедра -> Історія/Персонал)
window.switchSubTab = function(subTabId) {
    const parentSection = document.getElementById('tab-kafedra'); 
    if (!parentSection) return;

    // Приховати всі sub-tab-content
    parentSection.querySelectorAll('.sub-tab-content').forEach(el => {
         el.classList.add('hidden');
    });
    
    // Деактивувати кнопки
    parentSection.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Показати потрібний контент
    const targetSub = document.getElementById(subTabId);
    if (targetSub) targetSub.classList.remove('hidden');
    
    // Активувати кнопку
    // Шукаємо кнопку, яка викликає цей subTabId
    const btns = parentSection.querySelectorAll('.sub-tab-btn');
    btns.forEach(btn => {
        const onClickAttr = btn.getAttribute('onclick');
        if (onClickAttr && onClickAttr.includes(subTabId)) {
            btn.classList.add('active');
        }
    });
};

// Функція відкриття модального вікна (Popups)
window.openModal = function(modalId) {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById(modalId);
    
    if (overlay && modal) {
        overlay.classList.remove('hidden');
        modal.classList.remove('hidden');
        // Анімація
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

// --- 2. ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ ---
document.addEventListener('DOMContentLoaded', function() {
    
    // Мобільне меню (кнопки)
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

    // Логіка карток персоналу (клік по картці)
    document.querySelectorAll('.staff-card').forEach(card => {
        card.addEventListener('click', () => {
            const staffId = card.dataset.staffId;
            // Перевірка наявності даних (з файлу staff_data.js)
            if (typeof staffDetailsData !== 'undefined' && staffDetailsData[staffId]) {
                const data = staffDetailsData[staffId];
                
                // Заповнення полів модального вікна
                const nameEl = document.getElementById('staff-detail-name');
                const titleEl = document.getElementById('staff-detail-title');
                const imgEl = document.getElementById('staff-detail-img');
                const detailsEl = document.getElementById('staff-detail-details');
                const discContainer = document.getElementById('staff-detail-disciplines');
                const linkContainer = document.getElementById('staff-detail-links');

                if(nameEl) nameEl.textContent = data.name;
                if(titleEl) titleEl.textContent = data.title;
                if(imgEl) {
                    imgEl.src = card.querySelector('img').src;
                    imgEl.alt = data.name;
                }
                if(detailsEl) detailsEl.innerHTML = data.details;
                
                // Списки дисциплін
                if(discContainer) {
                    discContainer.innerHTML = data.disciplines.length 
                        ? data.disciplines.map(d => `<div class="mb-1">• ${d}</div>`).join('') 
                        : 'Немає даних';
                }
                
                // Посилання
                if(linkContainer) {
                    linkContainer.innerHTML = data.links.length 
                        ? data.links.map(l => `<a href="${l.url}" target="_blank" class="block hover:underline mb-1 text-sky-400">${l.name}</a>`).join('') 
                        : 'Немає посилань';
                }

                openModal('staff-detail-modal');
            } else {
                console.warn('Staff data not found for:', staffId);
            }
        });
    });

    // Логіка "Читати далі" (Новини)
    document.querySelectorAll('.open-small-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const titleEl = document.getElementById('small-news-title');
            const dateEl = document.getElementById('small-news-date');
            const textEl = document.getElementById('small-news-modal-text');

            if(titleEl) titleEl.textContent = btn.dataset.title;
            if(dateEl) dateEl.textContent = btn.dataset.date;
            if(textEl) textEl.textContent = btn.dataset.text;
            
            openModal('small-news-modal');
        });
    });

    // Кнопка "Нагору"
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

    // Запуск: відкрити Home за замовчуванням
    switchTab('home');
});
